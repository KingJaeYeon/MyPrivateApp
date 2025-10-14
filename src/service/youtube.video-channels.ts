// src/service/youtube.channel.ts
import { request_youtube } from '@/service/axios';
import { isoAfterNDays, parseISODurationToSec, formatDuration } from '@/lib/date';
import { differenceInHours, parseISO } from 'date-fns';
import { chunk } from '@/lib/utils';

import { VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { ChannelPayload } from '@/schemas/filter.schema.ts';
import { useLogStore } from '@/store/search-video-log.ts';
import useSettingStore from '@/store/setting.ts';
import useChannelStore from '@/store/channels.ts';

// ── videos.list (50개 배치)
async function fetchVideosByIds(apiKey: string, videoIds: string[]) {
  const settingStore = useSettingStore.getState(); // 훅 호출 아님 (정적 접근)
  const out: any[] = [];
  for (const batch of chunk(videoIds, 50)) {
    const v = await request_youtube.get('videos', {
      params: { key: apiKey, part: 'snippet,statistics,contentDetails', id: batch.join(',') },
    });
    await settingStore.updateIn('youtube', {
      apiKey: settingStore.data.youtube.apiKey,
      usedQuota: settingStore.data.youtube.usedQuota + 100,
    }); // videos.list 1회 카운트

    out.push(...(v.data?.items ?? []));
  }
  return out;
}

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

// ── 최종 rows 로 매핑(구독자 포함)
async function toRowsWithSubscribers(vItems: any[]): Promise<VideoRow[]> {
  // 채널 통계 (저쿼터: 1/call 배치)
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
      channelTitle: sn?.channelTitle ?? '',
      title: sn?.title ?? '',
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

// ── 채널 하나: search.list 로 videoId 수집 (페이징 최소화)
async function fetchChannelVideoIds(opts: {
  apiKey: string;
  channelId: string;
  days: number;
  perChannelMax: number;
  order: 'date' | 'viewCount';
  videoDuration: 'any' | 'short' | 'medium' | 'long';
  regionCode?: string;
  relevanceLanguage?: string;
}) {
  const {
    apiKey,
    channelId,
    days,
    perChannelMax,
    order,
    videoDuration,
    regionCode,
    relevanceLanguage,
  } = opts;

  const ids: string[] = [];
  const publishedAfter = isoAfterNDays(days);
  let pageToken: string | undefined;

  while (ids.length < perChannelMax) {
    const params: Record<string, any> = {
      key: apiKey,
      part: 'id',
      type: 'video',
      channelId,
      maxResults: Math.min(50, perChannelMax - ids.length),
      order,
      publishedAfter,
    };
    if (videoDuration !== 'any') params.videoDuration = videoDuration;
    if (regionCode) params.regionCode = regionCode;
    if (relevanceLanguage) params.relevanceLanguage = relevanceLanguage;
    if (pageToken) params.pageToken = pageToken;

    const s = await request_youtube.get('search', { params });
    const items = s.data?.items ?? [];
    if (!items.length) break;

    for (const it of items) {
      const vid = it?.id?.videoId;
      if (vid) ids.push(vid);
    }
    pageToken = s.data?.nextPageToken;
    if (!pageToken) break;
  }
  return ids;
}

// ── 메인: 채널 모드
export async function getVideosByChannels({
  apiKey,
  isPopularVideosOnly,
  ...payload
}: ChannelPayload & { apiKey: string }): Promise<VideoRow[]> {
  const { channelIds, maxChannels, videoDuration, regionCode, relevanceLanguage, ...rest } =
    payload;
  const Log = useLogStore.getState(); // 훅 호출 아님 (정적 접근)
  const settingStore = useSettingStore.getState(); // 훅 호출 아님 (정적 접근)

  // relatedPlaylists.uploads 추출
  const cResp = await request_youtube.get('channels', {
    params: {
      key: apiKey,
      part: 'statistics,contentDetails,brandingSettings',
      id: channelIds.join(','),
    },
  });

  // TODO: 추후에 channel 정보가져온김에 channels 리스트 갱신추가할지말지

  const uploads = [];
  for (const channel of cResp.data?.items ?? []) {
    const upload = channel.contentDetails.relatedPlaylists.uploads;
    uploads.push(upload);
  }

  const vIds = []; //search videoIds
  for (const upload of uploads) {
    const pResp = await request_youtube.get('playlistItems', {
      params: {
        key: apiKey,
        part: 'snippet,contentDetails',
        playlistId: upload,
        maxResults: 50,
      },
    });

    for (const element of pResp.data?.items ?? []) {
      const { videoId, videoPublishedAt } = element.contentDetails;
      console.log(videoId, videoPublishedAt);
      vIds.push(videoId);
    }
  }
  console.log(vIds);

  return '';

  const collected: VideoRow[] = []; // videos items

  let searchParams: Record<string, any> = {
    key: apiKey,
    part: 'id',
    type: 'video',
    maxResults: maxChannels,
    // regionCode,
    // relevanceLanguage,
    videoDuration,
    order: 'viewCount',
  };

  // isPopularVideosOnly = true -> 전체인기동영상
  if (!isPopularVideosOnly) {
    searchParams = { ...searchParams, publishedAfter: isoAfterNDays(rest.days) };
  } else {
    // sIds 수집
    for (const channelId of channelIds) {
      const sResp = await request_youtube.get('search', { params: { ...searchParams, channelId } });

      const url = `${request_youtube.defaults.baseURL}/search?${new URLSearchParams({
        ...searchParams,
        channelId,
      }).toString()}`;
      await settingStore.updateIn('youtube', {
        apiKey: settingStore.data.youtube.apiKey,
        usedQuota: settingStore.data.youtube.usedQuota + 100,
      }); // videos.list 100회 카운트
      Log.note(`[API 요청] ${url}`);
      const sItems = sResp.data?.items ?? [];
      if (!sItems.length) continue;

      for (const it of sItems) {
        const vid = it?.id?.videoId;
        if (vid) vIds.push(vid);
      }
    }

    // fetchVideos 50개씩 끊어서
    const videos = await fetchVideosByIds(apiKey, vIds);
    const result = await toRowsWithSubscribers(videos);
    collected.push(...result);
  }

  // fetchVideo

  // const allVideoIds: string[] = [];
  //
  // // 1) 채널별 videoId 모으기 (order=“viewCount” 체크박스면 인기영상)
  // for (const channelId of channelIds) {
  //   const ids = await fetchChannelVideoIds({
  //     apiKey,
  //     channelId,
  //     days,
  //     perChannelMax,
  //     order,
  //     videoDuration,
  //     regionCode,
  //     relevanceLanguage,
  //   });
  //   allVideoIds.push(...ids);
  // }
  //
  // if (!allVideoIds.length) return [];
  //
  // // 2) videos.list 상세 조회(저쿼터)
  // const videos = await fetchVideosByIds(apiKey, allVideoIds);
  //
  // // 3) 최소 조회수 → 시간당 조회수 순으로 필터
  // const minViewsPassed = videos.filter((v) => Number(v?.statistics?.viewCount ?? 0) >= minViews);
  // const vphPassed = filterByVph(minViewsPassed, minViewsPerHour);
  //
  // // 4) 구독자 + VideoRow 매핑
  // return await toRowsWithSubscribers(vphPassed, apiKey);

  return collected;
}
