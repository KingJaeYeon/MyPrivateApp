// src/service/youtube.channel.ts
import { request_youtube } from '@/service/axios';
import { formatDuration, isoAfterNDays, parseISODurationToSec } from '@/lib/date';
import { differenceInHours, parseISO } from 'date-fns';

import { VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { ChannelPayload } from '@/schemas/filter.schema.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import { incrementQuota, logApiRequest } from '@/lib/log.ts';
import { chunk } from '@/lib/utils.ts';
import { youtubeAbort } from '@/lib/abortController.ts';

// ── 필터링 헬퍼 함수들 ──
function filterByVph(items: any[], minVph: number) {
  if (minVph <= 0) return items;
  const now = new Date();
  return items.filter((v) => {
    const sn = v?.snippet,
      st = v?.statistics;
    if (!sn || !st) return false;
    const ageH = Math.max(differenceInHours(now, parseISO(sn.publishedAt ?? '')), 1);
    const views = Number(st.viewCount ?? 0);
    return views / ageH >= minVph;
  });
}

const isVideoDurationValid = (durSec: number, videoDuration: string): boolean => {
  const LONG_MIN = 20 * 60;
  const MEDIUM_MIN = 4 * 60;
  const MEDIUM_MAX = 20 * 60;
  const SHORT_MAX = 4 * 60;

  switch (videoDuration) {
    case 'long':
      return durSec >= LONG_MIN;
    case 'medium':
      return durSec >= MEDIUM_MIN && durSec < MEDIUM_MAX;
    case 'short':
      return durSec < SHORT_MAX;
    default:
      return true;
  }
};

const isVideoValid = (video: any, minViews: number, videoDuration: string): boolean => {
  const viewCount = Number(video.statistics?.viewCount ?? 0);
  if (viewCount < minViews) return false;

  const durSec = parseISODurationToSec(video.contentDetails?.duration ?? 'PT0S');
  return isVideoDurationValid(durSec, videoDuration);
};

async function fetchPlaylistIds({ apiKey, channelIds }: { apiKey: string; channelIds: string[] }) {
  const batches = chunk(channelIds, 50);
  const result = [];

  for (const batch of batches) {
    const searchParams: Record<string, any> = {
      key: apiKey,
      part: 'contentDetails',
      id: batch.join(','),
    };

    const url = `${request_youtube.defaults.baseURL}/channels?${new URLSearchParams(searchParams).toString()}`;
    logApiRequest(url);

    const { data } = await request_youtube.get('channels', { params: searchParams });
    await incrementQuota(1);
    const channels = data?.items ?? [];
    result.push(...channels.map((channel: any) => channel.contentDetails.relatedPlaylists.uploads));
  }

  return result;
}

async function fetchVideoIds({
  apiKey,
  upload,
  pageToken,
  publishedAfter,
}: {
  apiKey: string;
  upload: string;
  pageToken?: string;
  publishedAfter: string;
}) {
  const searchParams: Record<string, any> = {
    key: apiKey,
    part: 'snippet,contentDetails',
    playlistId: upload,
    maxResults: 50,
    ...(pageToken && { pageToken }),
  };
  try {
    const url = `${request_youtube.defaults.baseURL}/playlistItems?${new URLSearchParams(searchParams).toString()}`;
    logApiRequest(url);
    const response = await request_youtube.get('playlistItems', { params: searchParams });
    const pItem = response?.data?.items ?? [];
    if (pItem.length === 0) return { newPageToken: undefined, vIds: [], total: 0 };

    let newPageToken = response?.data.nextPageToken as string | undefined;
    const vIds: string[] = [];

    for (const { contentDetails } of pItem) {
      if (contentDetails.videoPublishedAt <= publishedAfter) {
        newPageToken = undefined;
        break;
      }
      vIds.push(contentDetails.videoId);
    }

    return { newPageToken, vIds, total: response?.data.pageInfo.totalResults };
  } catch (error) {
    return { newPageToken: undefined, vIds: [], total: 0 };
  } finally {
    await incrementQuota(1);
  }
}

async function fetchVideos({ apiKey, vIds }: { apiKey: string; vIds: string[] }): Promise<any[]> {
  const { data } = await request_youtube.get('videos', {
    params: {
      key: apiKey,
      part: 'id,snippet,contentDetails,statistics',
      id: vIds.join(','),
    },
  });

  await incrementQuota(1);
  return data?.items ?? [];
}

// ── 데이터 변환 함수 ──
function toRowsWithSubscribers(vItems: any[]): VideoRow[] {
  const channels = useChannelStore.getState().data;

  // const pairs = [['ch1', 1000], ['ch2', { value:2000, meta:'text'}]];
  // const obj = Object.fromEntries(pairs);
  // ✅ { ch1: 1000, ch2: { value:2000, meta:'text'} } 배열 길이는 2개까지 동작됨
  const subsMap = Object.fromEntries(
    channels.map((ch) => [
      ch.channelId,
      {
        handle: ch.handle,
        platform: 'youtube',
        icon: ch.icon,
        subscriberCount: ch.subscriberCount,
        publishedAt: ch.publishedAt,
        viewCount: ch.viewCount,
        videoCount: ch.videoCount,
        link: `https://www.youtube.com/channel/${ch.channelId}`,
        fetchedAt: ch.fetchedAt,
        regionCode: ch.regionCode,
      },
    ])
  );

  // 2) VideoRow로 가공
  const now = new Date();
  let no = 1;

  return vItems.map((v) => {
    const { id, snippet, statistics, contentDetails } = v;
    const publishedAt = snippet.publishedAt ?? '';
    const ageH = Math.max(differenceInHours(now, parseISO(publishedAt)), 1);
    const views = Number(statistics.viewCount ?? 0);
    const vph = views / ageH;
    const durSec = parseISODurationToSec(contentDetails.duration ?? 'PT0S');
    const subs = subsMap[snippet.channelId].subscriberCount ?? null;
    const vps = subs && subs > 0 ? views / subs : null;

    return {
      no: no++,
      channelId: snippet.channelId,
      tags: snippet.tags,
      defaultLanguage: snippet.defaultLanguage,
      defaultAudioLanguage: snippet.defaultAudioLanguage,
      commentCount: statistics.commentCount,
      likeCount: statistics.likeCount,
      channelTitle: snippet.channelTitle ?? '',
      title: snippet.title ?? '',
      publishedAt,
      viewCount: views,
      viewsPerHour: vph,
      viewsPerSubscriber: vps,
      duration: formatDuration(durSec),
      link: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.default?.url || '',
      subscriberCount: subs,
      chVideoCount: subsMap[snippet.channelId].videoCount,
      chViewCount: subsMap[snippet.channelId].viewCount,
      chRegionCode: subsMap[snippet.channelId].regionCode,
      chLink: subsMap[snippet.channelId].link,
      chPublishAt: subsMap[snippet.channelId].publishedAt,
      chIcon: subsMap[snippet.channelId].icon,
      chFetchAt: subsMap[snippet.channelId].fetchedAt,
      chHandle: subsMap[snippet.channelId].handle,
    } as VideoRow;
  });
}

// ── 메인 함수 ──
export async function getVideosByChannels({
  apiKey,
  isPopularVideosOnly,
  channelIds,
  minViews,
  maxChannels,
  videoDuration,
  minViewsPerHour,
  days,
}: ChannelPayload & { apiKey: string }): Promise<VideoRow[]> {
  const publishedAfter = isoAfterNDays(days);
  const uploads = await fetchPlaylistIds({ apiKey, channelIds });
  const collected: VideoRow[] = [];

  youtubeAbort.reset(); // ✅ 추가

  for (const upload of uploads) {
    let pageToken: string | undefined = undefined;

    // ✅ 추가: 새 채널 요청 전 중단 체크
    if (youtubeAbort.isAborted()) {
      console.log('⏸️ 중단 신호 감지, 수집 중단');
      break;
    }

    if (isPopularVideosOnly) {
      // 모든 페이지 수집 후 필터링
      const allVideos: any[] = [];

      do {
        // ✅ 추가: 페이지 요청 전 중단 체크
        if (youtubeAbort.isAborted()) {
          console.log('⏸️ 중단됨, 현재까지 수집한 영상 처리 중...');
          break;
        }

        const { vIds, newPageToken } = await fetchVideoIds({
          apiKey,
          upload,
          pageToken,
          publishedAfter,
        });
        pageToken = newPageToken;

        const videos = await fetchVideos({ apiKey, vIds });
        allVideos.push(...videos);
      } while (pageToken);

      const filtered = filterByVph(allVideos, minViewsPerHour).filter((v) =>
        isVideoValid(v, minViews, videoDuration)
      );

      const rows = toRowsWithSubscribers(filtered);
      const sorted = rows.sort((a, b) => b.viewsPerHour - a.viewsPerHour);
      collected.push(...sorted.slice(0, maxChannels));
    } else {
      const allVideos: any[] = [];

      // ✅ 추가: 페이지 요청 전 중단 체크
      if (youtubeAbort.isAborted()) {
        console.log('⏸️ 중단됨, 현재까지 수집한 영상 처리 중...');
        break;
      }

      while (allVideos.length < maxChannels) {
        const { vIds, newPageToken } = await fetchVideoIds({
          apiKey,
          upload,
          pageToken,
          publishedAfter,
        });
        pageToken = newPageToken;

        const videos = await fetchVideos({ apiKey, vIds });
        const filtered = filterByVph(videos, minViewsPerHour).filter((v) =>
          isVideoValid(v, minViews, videoDuration)
        );

        allVideos.push(...filtered);

        if (!pageToken) break;
      }
      // ✅ allVideos에 있는 것은 마저 처리
      const rows = toRowsWithSubscribers(allVideos.slice(0, maxChannels));
      collected.push(...rows);
    }
  }

  return collected
    .sort((a, b) => b.viewsPerHour - a.viewsPerHour)
    .map((v, i) => ({ ...v, no: i + 1 }));
}

// video
// const res = {
//   kind: 'youtube#video',
//   etag: '9QWJt_ea1TRtRv-ytoz5Jrnm1O4',
//   id: 'OYqHIHaURyE',
//   snippet: {
//     publishedAt: '2025-10-14T10:57:16Z',
//     channelId: 'UCUbOogiD-4PKDqaJfSOTC0g',
//     title: '귀멸의칼날 승률 100% 전세계 1위의 실력 ㅎㄷㄷ.. 귤대장 장인초대석 [테스터훈]',
//     description:
//       '🔥 방송 참여 & 비즈니스 문의\n▶tester_hoon@naver.com\n\n👍 채널에 가입하여 멤버십 혜택을 누려보세요.\nhttps://www.youtube.com/channel/UCUbOogiD-4PKDqaJfSOTC0g/join\n\n📷 테스터훈 인스타 바로가기\n▶https://www.instagram.com/testerhoon/\n\n---------------------------------------------------\nCOPYRIGHT ⓒ TESTER HOON ALL RIGHTS RESERVED.\n---------------------------------------------------\n\n#테스터훈 #장인초대석 #귀멸의칼날',
//     thumbnails: {
//       default: {
//         url: 'https://i.ytimg.com/vi/OYqHIHaURyE/default.jpg',
//         width: 120,
//         height: 90,
//       },
//       medium: {
//         url: 'https://i.ytimg.com/vi/OYqHIHaURyE/mqdefault.jpg',
//         width: 320,
//         height: 180,
//       },
//       high: {
//         url: 'https://i.ytimg.com/vi/OYqHIHaURyE/hqdefault.jpg',
//         width: 480,
//         height: 360,
//       },
//       standard: {
//         url: 'https://i.ytimg.com/vi/OYqHIHaURyE/sddefault.jpg',
//         width: 640,
//         height: 480,
//       },
//       maxres: {
//         url: 'https://i.ytimg.com/vi/OYqHIHaURyE/maxresdefault.jpg',
//         width: 1280,
//         height: 720,
//       },
//     },
//     channelTitle: '테스터훈 TesterHoon',
//     tags: [
//       '테스터훈',
//       '게임',
//       'game',
//       '리그오브레전드',
//       'league of legends',
//       '장인초대석',
//       '초대석',
//       '뉴메타',
//     ],
//     categoryId: '20',
//     liveBroadcastContent: 'none',
//     defaultLanguage: 'ko',
//     localized: {
//       title: '귀멸의칼날 승률 100% 전세계 1위의 실력 ㅎㄷㄷ.. 귤대장 장인초대석 [테스터훈]',
//       description:
//         '🔥 방송 참여 & 비즈니스 문의\n▶tester_hoon@naver.com\n\n👍 채널에 가입하여 멤버십 혜택을 누려보세요.\nhttps://www.youtube.com/channel/UCUbOogiD-4PKDqaJfSOTC0g/join\n\n📷 테스터훈 인스타 바로가기\n▶https://www.instagram.com/testerhoon/\n\n---------------------------------------------------\nCOPYRIGHT ⓒ TESTER HOON ALL RIGHTS RESERVED.\n---------------------------------------------------\n\n#테스터훈 #장인초대석 #귀멸의칼날',
//     },
//     defaultAudioLanguage: 'ko',
//   },
//   contentDetails: {
//     duration: 'PT21M52S',
//     dimension: '2d',
//     definition: 'hd',
//     caption: 'false',
//     licensedContent: true,
//     contentRating: {},
//     projection: 'rectangular',
//   },
//   statistics: {
//     viewCount: '22503',
//     likeCount: '342',
//     favoriteCount: '0',
//     commentCount: '26',
//   },
// };
