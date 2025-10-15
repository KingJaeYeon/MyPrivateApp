// src/service/youtube.channel.ts
import { request_youtube } from '@/service/axios';
import { isoAfterNDays, parseISODurationToSec, formatDuration } from '@/lib/date';
import { differenceInHours, parseISO } from 'date-fns';

import { VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { ChannelPayload } from '@/schemas/filter.schema.ts';
import { useLogStore } from '@/store/search-video-log.ts';
import useSettingStore from '@/store/setting.ts';
import useChannelStore from '@/store/channels.ts';

// ── 시간당 조회수 필터
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

function toRowsWithSubscribers(vItems: any[]): VideoRow[] {
  const subsMap: Record<string, number | null> = {};

  const { data } = useChannelStore.getState();
  for (const item of vItems) {
    const cid = item.snippet.channelId;
    for (const channel of data) {
      if (channel.channelId === cid) {
        subsMap[cid] = channel.subscriberCount;
      }
    }
  }

  // 2) VideoRow로 가공
  const now = new Date();
  let no = 1;
  return vItems.map((v) => {
    const id = v?.id;
    const sn = v?.snippet,
      st = v?.statistics,
      cd = v?.contentDetails;
    const publishedAt = sn?.publishedAt ?? '';
    const ageH = Math.max(differenceInHours(now, parseISO(publishedAt)), 1);
    const views = Number(st?.viewCount ?? 0);
    const vph = views / ageH;
    const durSec = parseISODurationToSec(cd?.duration ?? 'PT0S');
    const subs = subsMap[sn?.channelId ?? ''] ?? null;
    const vps = subs && subs > 0 ? views / subs : null;

    return {
      no: no++,
      channelId: sn.channelId,
      tags: sn.tags,
      defaultLanguage: sn.defaultLanguage,
      defaultAudioLanguage: sn.defaultAudioLanguage,
      commentCount: st.commentCount,
      likeCount: st.likeCount,
      channelTitle: sn.channelTitle ?? '',
      title: sn.title ?? '',
      publishedAt,
      viewCount: views,
      viewsPerHour: vph,
      viewsPerSubscriber: vps,
      duration: formatDuration(durSec),
      link: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: sn?.thumbnails?.medium?.url || sn?.thumbnails?.default?.url || '',
      subscriberCount: subs,
    } as VideoRow;
  });
}

async function fetchPlaylistIds({ apiKey, channelIds }: { apiKey: string; channelIds: string[] }) {
  const cResp = await request_youtube.get('channels', {
    params: {
      key: apiKey,
      part: 'statistics,contentDetails,brandingSettings',
      id: channelIds.join(','),
    },
  });

  // TODO: 추후에 channel 정보가져온김에 channels 리스트 갱신추가할지말지

  const uploads: string[] = [];
  for (const channel of cResp.data?.items ?? []) {
    const upload = channel.contentDetails.relatedPlaylists.uploads;
    uploads.push(upload);
  }

  return uploads;
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
  const Log = useLogStore.getState(); // 훅 호출 아님 (정적 접근)
  const settingStore = useSettingStore.getState(); // 훅 호출 아님 (정적 접근)
  const vIds: string[] = [];
  let newPageToken: string | undefined = undefined;

  const searchParams: Record<string, any> = {
    key: apiKey,
    part: 'snippet,contentDetails',
    playlistId: upload,
    maxResults: 50,
  };
  if (pageToken) searchParams.pageToken = pageToken;

  const pResp = await request_youtube.get('playlistItems', { params: searchParams });
  const url = `${request_youtube.defaults.baseURL}/playlistItems?${new URLSearchParams(searchParams).toString()}`;
  await settingStore.updateIn('youtube', {
    apiKey: settingStore.data.youtube.apiKey,
    usedQuota: settingStore.data.youtube.usedQuota + 1,
  }); // playlistItems.list 1 쿼터
  Log.note(`[API 요청] ${url}`);

  const pItem = pResp.data?.items ?? [];

  if (pItem.length === 0) return { newPageToken: undefined, vIds: [], total: 0 };

  newPageToken = pResp.data.nextPageToken as string;

  for (const it of pItem) {
    const { videoId, videoPublishedAt } = it.contentDetails;
    if (videoPublishedAt <= publishedAfter) {
      newPageToken = undefined;
      break;
    }
    vIds.push(videoId);
  }

  return {
    newPageToken,
    total: pResp.data.pageInfo.totalResults as number,
    vIds,
  };
}

async function fetchVideos({ apiKey, vIds }: { apiKey: string; vIds: string[] }) {
  const vItems: any[] = [];
  const settingStore = useSettingStore.getState(); // 훅 호출 아님 (정적 접근)
  const vResp = await request_youtube.get('videos', {
    params: {
      key: apiKey,
      part: 'id,snippet,contentDetails,statistics',
      id: vIds.join(','),
    },
  });
  await settingStore.updateIn('youtube', {
    apiKey: settingStore.data.youtube.apiKey,
    usedQuota: settingStore.data.youtube.usedQuota + 1,
  }); // videos.list 1회 카운트

  vItems.push(...(vResp.data?.items ?? []));
  return vItems;
}

// ── 메인: 채널 모드
export async function getVideosByChannels({
  apiKey,
  isPopularVideosOnly,
  ...payload
}: ChannelPayload & { apiKey: string }): Promise<VideoRow[]> {
  const { channelIds, minViews, maxChannels, videoDuration, minViewsPerHour, days } = payload;

  const publishedAfter = isoAfterNDays(days);
  let pageToken: string | undefined = undefined;

  const uploads = await fetchPlaylistIds({ apiKey, channelIds });

  const collected: VideoRow[] = []; // videos items

  // isPopularVideosOnly ture
  // videoId videoPublishedAt 가 days 이내가 아닐때까지 계속요청
  // videoId 전부모아서 video 전부 요청
  // -> videoDuration 필터  any 전체 long 20분이상 medium 4~20분 short 4분이하.
  // -> minViewsPerHour, minViews 필터
  // -> video length >= maxChannels 종료
  if (isPopularVideosOnly) {
    for (const upload of uploads) {
      const temp = [];

      do {
        const { vIds, newPageToken } = await fetchVideoIds({
          apiKey,
          upload,
          pageToken,
          publishedAfter,
        });
        pageToken = newPageToken;

        const result = await fetchVideos({ apiKey, vIds });
        temp.push(...result);
      } while (pageToken !== undefined);
      const vItems = filterByVph(temp, minViewsPerHour);

      const temp2 = [];
      for (const v of vItems) {
        const viewCount = Number(v?.statistics?.viewCount ?? 0);
        const durSec = parseISODurationToSec(v.contentDetails.duration ?? 'PT0S');

        if (viewCount < minViews) continue; // 최소 조회수 필터

        // videoDuration 필터
        if (videoDuration === 'long' && durSec < 20 * 60) continue; // long인데 20분 미만이면 제외
        if (videoDuration === 'medium' && (durSec < 4 * 60 || durSec >= 20 * 60)) continue; // medium인데 4분 미만 또는 20분 이상이면 제외
        if (videoDuration === 'short' && durSec >= 4 * 60) continue; // short인데 4분 이상이면 제외
        temp2.push(v);
      }

      const temp3 = toRowsWithSubscribers(temp2);
      const sortArr = temp3.sort((a, b) => b.viewsPerHour - a.viewsPerHour);
      collected.push(...sortArr.slice(0, maxChannels));
    }

    return collected
      .sort((a, b) => b.viewsPerHour - a.viewsPerHour)
      .map((v, i) => {
        return { ...v, no: i + 1 };
      });
  }
  // isPopularVideosOnly false
  // videoId 50개씩 요청
  // video 조회수 필터 minViews,minViewsPerHour
  // -> videoDuration 필터  any 전체 long 20분이상 medium 4~20분 short 4분이하.
  // -> video length >= maxChannels 종료
  // -> 50개 전부 확인했는데 video length >= maxChannels가 아니면 videoId 50개 재요청
  // -> token 없으면 종료
  for (const upload of uploads) {
    let i = 0;
    const GUARD = 30;
    const temp = [];
    while (true) {
      const { vIds, newPageToken } = await fetchVideoIds({
        apiKey,
        upload,
        pageToken,
        publishedAfter,
      });
      pageToken = newPageToken;

      const result = await fetchVideos({ apiKey, vIds });

      // vph 필터
      const vItems = filterByVph(result, minViewsPerHour);

      for (const v of vItems) {
        const viewCount = Number(v?.statistics?.viewCount ?? 0);
        const durSec = parseISODurationToSec(v.contentDetails.duration ?? 'PT0S');

        if (viewCount < minViews) continue; // 최소 조회수 필터

        // videoDuration 필터
        if (videoDuration === 'long' && durSec < 20 * 60) continue; // long인데 20분 미만이면 제외
        if (videoDuration === 'medium' && (durSec < 4 * 60 || durSec >= 20 * 60)) continue; // medium인데 4분 미만 또는 20분 이상이면 제외
        if (videoDuration === 'short' && durSec >= 4 * 60) continue; // short인데 4분 이상이면 제외

        temp.push(v);
      }

      if (temp.length >= maxChannels) {
        collected.push(...temp.slice(0, maxChannels));
        break;
      }

      if (!pageToken) {
        collected.push(...temp);
        break;
      }

      if (i++ >= GUARD) {
        collected.push(...temp);
        break;
      }
    }
  }

  return toRowsWithSubscribers(collected);
}

// video
const res = {
  kind: 'youtube#video',
  etag: '9QWJt_ea1TRtRv-ytoz5Jrnm1O4',
  id: 'OYqHIHaURyE',
  snippet: {
    publishedAt: '2025-10-14T10:57:16Z',
    channelId: 'UCUbOogiD-4PKDqaJfSOTC0g',
    title: '귀멸의칼날 승률 100% 전세계 1위의 실력 ㅎㄷㄷ.. 귤대장 장인초대석 [테스터훈]',
    description:
      '🔥 방송 참여 & 비즈니스 문의\n▶tester_hoon@naver.com\n\n👍 채널에 가입하여 멤버십 혜택을 누려보세요.\nhttps://www.youtube.com/channel/UCUbOogiD-4PKDqaJfSOTC0g/join\n\n📷 테스터훈 인스타 바로가기\n▶https://www.instagram.com/testerhoon/\n\n---------------------------------------------------\nCOPYRIGHT ⓒ TESTER HOON ALL RIGHTS RESERVED.\n---------------------------------------------------\n\n#테스터훈 #장인초대석 #귀멸의칼날',
    thumbnails: {
      default: {
        url: 'https://i.ytimg.com/vi/OYqHIHaURyE/default.jpg',
        width: 120,
        height: 90,
      },
      medium: {
        url: 'https://i.ytimg.com/vi/OYqHIHaURyE/mqdefault.jpg',
        width: 320,
        height: 180,
      },
      high: {
        url: 'https://i.ytimg.com/vi/OYqHIHaURyE/hqdefault.jpg',
        width: 480,
        height: 360,
      },
      standard: {
        url: 'https://i.ytimg.com/vi/OYqHIHaURyE/sddefault.jpg',
        width: 640,
        height: 480,
      },
      maxres: {
        url: 'https://i.ytimg.com/vi/OYqHIHaURyE/maxresdefault.jpg',
        width: 1280,
        height: 720,
      },
    },
    channelTitle: '테스터훈 TesterHoon',
    tags: [
      '테스터훈',
      '게임',
      'game',
      '리그오브레전드',
      'league of legends',
      '장인초대석',
      '초대석',
      '뉴메타',
    ],
    categoryId: '20',
    liveBroadcastContent: 'none',
    defaultLanguage: 'ko',
    localized: {
      title: '귀멸의칼날 승률 100% 전세계 1위의 실력 ㅎㄷㄷ.. 귤대장 장인초대석 [테스터훈]',
      description:
        '🔥 방송 참여 & 비즈니스 문의\n▶tester_hoon@naver.com\n\n👍 채널에 가입하여 멤버십 혜택을 누려보세요.\nhttps://www.youtube.com/channel/UCUbOogiD-4PKDqaJfSOTC0g/join\n\n📷 테스터훈 인스타 바로가기\n▶https://www.instagram.com/testerhoon/\n\n---------------------------------------------------\nCOPYRIGHT ⓒ TESTER HOON ALL RIGHTS RESERVED.\n---------------------------------------------------\n\n#테스터훈 #장인초대석 #귀멸의칼날',
    },
    defaultAudioLanguage: 'ko',
  },
  contentDetails: {
    duration: 'PT21M52S',
    dimension: '2d',
    definition: 'hd',
    caption: 'false',
    licensedContent: true,
    contentRating: {},
    projection: 'rectangular',
  },
  statistics: {
    viewCount: '22503',
    likeCount: '342',
    favoriteCount: '0',
    commentCount: '26',
  },
};
