import { formatDuration, isoAfterNDays, parseISODurationToSec } from '@/lib/date.ts';
import { request_youtube } from '@/service/axios.ts';
import { chunk } from '@/lib/utils.ts';
import { differenceInHours, parseISO } from 'date-fns';
import { VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { KeywordPayload } from '@/schemas/filter.schema.ts';
import { incrementQuota, logApiRequest } from '@/lib/log.ts';

type FetchVideosParams = {
  apiKey: string;
  keyword: string;
  publishedAfter: string;
  videoDuration: 'any' | 'short' | 'medium' | 'long';
  regionCode?: string;
  relevanceLanguage?: string;
  pageToken?: string;
};

// ── API 호출 함수들 ──
async function fetchVideoIds({
  keyword,
  pageToken,
  publishedAfter,
  apiKey,
  videoDuration,
  regionCode,
  relevanceLanguage,
}: FetchVideosParams) {
  const searchParams: Record<string, any> = {
    key: apiKey,
    part: 'id',
    type: 'video',
    q: keyword,
    maxResults: 50,
    order: 'viewCount',
    publishedAfter,
    videoDuration,
    ...(regionCode && { regionCode }),
    ...(relevanceLanguage && { relevanceLanguage }),
    ...(pageToken && { pageToken }),
  };

  const sResp = await request_youtube.get('search', { params: searchParams });

  const url = `${request_youtube.defaults.baseURL}/search?${new URLSearchParams(searchParams).toString()}`;
  logApiRequest(url);
  await incrementQuota(100);

  const items = sResp?.data?.items ?? [];
  if (items.length === 0) return { newPageToken: undefined, vIds: [] };

  const newPageToken = sResp.data?.nextPageToken as string | undefined;
  const vIds = items.map((s: any) => s?.id?.videoId) as string[];

  return { newPageToken, vIds };
}

async function fetchVideos({ apiKey, vIds }: { apiKey: string; vIds: string[] }) {
  const { data } = await request_youtube.get('videos', {
    params: {
      key: apiKey,
      part: 'snippet,statistics,contentDetails',
      id: vIds.join(','),
    },
  });

  await incrementQuota(1);
  return data?.items ?? [];
}

// ── 필터링 함수 ──
/**
 * 현재 후보에서 “시간당 조회수(vph)” 하한을 통과하는 영상만 빠르게 추려서 반환.
 * - want 개를 채우면 조기 종료 → 불필요 계산 최소화
 */
function quickVphPass({
  list,
  minVph,
  maxResults,
}: {
  list: any[];
  minVph: number;
  maxResults: number;
}): any[] {
  if (minVph <= 0) return list;

  const now = new Date();
  const result: any[] = [];

  for (const v of list) {
    const { snippet, statistics, contentDetails } = v;
    if (!snippet || !statistics || !contentDetails) continue;

    const ageH = Math.max(differenceInHours(now, parseISO(snippet.publishedAt ?? '')), 1);
    const views = Number(statistics.viewCount ?? 0);
    const vph = views / ageH;

    if (vph >= minVph) {
      result.push(v);
      if (result.length >= maxResults) break; // ✅ 조기 종료
    }
  }
  return result;
}

const isVideoValidViewCount = (video: any, minViews: number): boolean => {
  const viewCount = Number(video?.statistics?.viewCount ?? 0);
  return viewCount >= minViews;
};

// ── 채널 정보 조회 및 변환 ──
const fetchChannelStats = async ({
  apiKey,
  channelIds,
}: {
  apiKey: string;
  channelIds: string[];
}): Promise<Record<string, { subs: number | null; handle: string }>> => {
  const batches = chunk(channelIds, 50);
  const stats: Record<string, { subs: number | null; handle: string }> = {};

  for (const batch of batches) {
    const cResp = await request_youtube.get('channels', {
      params: {
        key: apiKey,
        part: 'snippet,statistics',
        id: batch.join(','),
      },
    });

    await incrementQuota(1);
    const channels = cResp.data?.items ?? [];

    for (const ch of channels) {
      const cid = ch?.id as string;
      const hidden = ch?.statistics?.hiddenSubscriberCount;
      const handle = (ch.snippet.customUrl as string) || '';
      const subs = hidden ? null : Number(ch?.statistics?.subscriberCount ?? 0);
      if (cid) {
        stats[cid] = { subs: Number.isFinite(subs as number) ? subs : null, handle };
      }
    }
  }

  return stats;
};

/**
 * 최종 통과 리스트에 대해 channels.list(구독자 수) 조회 후 VideoRow로 변환
 * - 통과분의 channelId만 조회 → 쿼터 절약
 */
async function toRowsWithSubscribers({
  items,
  apiKey,
}: {
  items: any[];
  apiKey: string;
}): Promise<VideoRow[]> {
  // 채널 정보 수집
  const channelIds = Array.from(
    new Set(items.map((v) => v?.snippet?.channelId).filter(Boolean))
  ) as string[];

  const channelStats = await fetchChannelStats({ apiKey, channelIds });

  // VideoRow 변환
  const now = new Date();
  let no = 1;

  return items.map((v) => {
    const { id, snippet, statistics, contentDetails } = v;
    const publishedAt = snippet.publishedAt ?? '';
    const ageH = Math.max(differenceInHours(now, parseISO(publishedAt)), 1);
    const views = Number(statistics.viewCount ?? 0);
    const vph = views / ageH;
    const durSec = parseISODurationToSec(contentDetails.duration ?? 'PT0S');
    const subs = channelStats[snippet.channelId].subs ?? null;
    const handle = channelStats[snippet.channelId].handle;
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
      handle,
      viewsPerHour: vph,
      viewsPerSubscriber: vps,
      duration: formatDuration(durSec),
      link: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.default?.url || '',
      subscriberCount: subs,
    };
  });
}
// ── 메인 함수 ──
export async function getVideoByKeywords({
  apiKey,
  keyword,
  days,
  maxResults = 50,
  regionCode,
  relevanceLanguage,
  videoDuration,
  minViews = 0,
  minViewsPerHour = 0,
}: KeywordPayload & { apiKey: string }): Promise<VideoRow[]> {
  const publishedAfter = isoAfterNDays(days); // N일 전 ISO 문자열
  const collected: any[] = [];
  const seen = new Set<string>(); // 중복 방지
  let pageToken: string | undefined = undefined;
  let isFoundMinViewsUnder = false; // 최소 조회수 미달 등장 여부
  const MAX_REQUESTS = 20; // 무한루프방지
  let requestCount = 0;

  while (requestCount < MAX_REQUESTS) {
    // VPH 빠른 검사 (있으면 조기 종료)
    if (minViewsPerHour > 0 && collected.length > 0) {
      const quick = quickVphPass({ list: collected, minVph: minViewsPerHour, maxResults });
      if (quick.length >= maxResults) {
        return await toRowsWithSubscribers({ items: quick.slice(0, maxResults), apiKey });
      }
    } else if (collected.length >= maxResults) {
      return await toRowsWithSubscribers({ items: collected.slice(0, maxResults), apiKey });
    }

    // 종료조건
    if (isFoundMinViewsUnder) break;

    // Search API 호출
    const { newPageToken, vIds } = await fetchVideoIds({
      apiKey,
      keyword,
      publishedAfter,
      videoDuration,
      pageToken,
      regionCode,
      relevanceLanguage,
    });
    pageToken = newPageToken;
    if (vIds.length === 0) break;

    // 중복 제거 -> YouTube API Search 버그로 이전페이지에 같은 vId가 포함될수도 있다고함.
    const uniqueIds = vIds.filter((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        return true;
      }
      return false;
    });

    if (uniqueIds.length === 0) {
      if (!pageToken) break;
      requestCount++;
      continue;
    }

    // Videos API 호출
    const videos = await fetchVideos({ apiKey, vIds: uniqueIds });
    if (videos.length === 0) {
      if (!pageToken) break;
      requestCount++;
      continue;
    }

    // 최소 조회수 필터링
    let batchAllPass = true;
    for (const video of videos) {
      if (!isVideoValidViewCount(video, minViews)) {
        batchAllPass = false;
        isFoundMinViewsUnder = true;
        break;
      }
    }

    // 통과한 것만 수집
    for (const video of videos) {
      if (isVideoValidViewCount(video, minViews)) {
        collected.push(video);

        // VPH 조건 없으면 want 채우자마자 반환
        if (minViewsPerHour <= 0 && collected.length >= maxResults) {
          return await toRowsWithSubscribers({ items: collected.slice(0, maxResults), apiKey });
        }
      }
    }
    if (!batchAllPass || !pageToken) break;

    requestCount++;
  }

  // 최종 VPH 필터링 및 반환
  const pass =
    minViewsPerHour > 0
      ? quickVphPass({ list: collected, minVph: minViewsPerHour, maxResults })
      : collected;

  return await toRowsWithSubscribers({ items: pass.slice(0, maxResults), apiKey });
}
// export async function getVideoByKeywords({
//   apiKey,
//   ...payload
// }: KeywordPayload & { apiKey: string }): Promise<VideoRow[]> {
//   const {
//     keyword,
//     days,
//     maxResults = 50,
//     regionCode,
//     relevanceLanguage,
//     videoDuration,
//     minViews = 0,
//     minViewsPerHour = 0,
//   } = payload;
//   const want = Math.max(1, maxResults); // 사용자가 입력한 동영상 수
//   const publishedAfter = isoAfterNDays(days); // N일 전 ISO 문자열
//   const collected: any[] = []; // 1차 후보(최소 조회수 통과)
//   let pageToken: string | undefined = undefined;
//   let isFoundMinViewsUnder = false; // 최소 조회수 미달 등장 여부
//   const seen = new Set<string>(); // 중복 방지
//   const MAX_PAGES = 20; // 안전 가드
//   let pages = 0;
//
//   // ─────────────────────────────────────────────────────────────
//   // 루프: 수집 → (필요시) VPH 빠른검사 → 부족하면 다음 페이지
//   // ─────────────────────────────────────────────────────────────
//   while (true) {
//     // 0) 현재 후보로 VPH “빠른검사” (원할 때만)
//     if (minViewsPerHour > 0 && collected.length > 0) {
//       const quick = quickVphPass({ list: collected, minVph: minViewsPerHour, want });
//       if (quick.length >= want) {
//         // 바로 확정 가능 → channels.list 단계로 이동
//         return await toRowsWithSubscribers({ items: quick.slice(0, want), apiKey });
//       }
//       // 부족하면 계속 수집
//     } else if (collected.length >= want) {
//       // VPH 조건이 없으면 후보만으로 충분 → 확정
//       return await toRowsWithSubscribers({ items: collected.slice(0, want), apiKey });
//     }
//
//     // 수집을 더 해야 하는데, 더 볼 수 없는 상황이면 종료
//     if (isFoundMinViewsUnder) break; // 이후는 더 낮은 조회수
//     if (pages++ >= MAX_PAGES) break; // 안전 가드
//
//     // 1) search.list
//     const { newPageToken, vIds } = await fetchVideoIds({
//       apiKey,
//       keyword,
//       publishedAfter,
//       videoDuration,
//       pageToken,
//       regionCode,
//       relevanceLanguage,
//     });
//
//     if (vIds.length === 0) break;
//     pageToken = newPageToken;
//
//     // 중복 제거
//     const ids = vIds.filter((id) => {
//       if (!seen.has(id)) {
//         seen.add(id);
//         return true;
//       }
//       return false;
//     });
//     if (ids.length === 0) {
//       if (!pageToken) break;
//       else continue;
//     }
//
//     // 2) videos.list
//     const vItems = await fetchVideos({ apiKey, vIds: ids });
//     if (vItems.length === 0) {
//       if (!pageToken) break;
//       else continue;
//     }
//
//     // 3) 최소 조회수(minViews) 필터 (배치 전원 통과 여부 확인)
//     let batchAllPass = true;
//     for (const v of vItems) {
//       const viewCount = Number(v?.statistics?.viewCount ?? 0);
//       if (viewCount < minViews) {
//         batchAllPass = false;
//         isFoundMinViewsUnder = true; // 한 건이라도 미달 → 이후는 더 낮음
//         break;
//       }
//     }
//
//     // 통과한 것만 후보 누적
//     for (const v of vItems) {
//       const viewCount = Number(v?.statistics?.viewCount ?? 0);
//       if (viewCount >= minViews) {
//         collected.push(v);
//         // VPH 조건 없으면 want 채우자마자 확정 가능
//         if (minViewsPerHour <= 0 && collected.length >= want) {
//           return await toRowsWithSubscribers({ items: collected.slice(0, want), apiKey });
//         }
//       }
//     }
//
//     // 배치에서 미달을 봤으면 더 낮은 조회수만 남음 → 수집 종료
//     if (!batchAllPass) break;
//     // 다음 페이지 없으면 종료 (다음 루프에서 VPH 최종검사 후 반환)
//     if (!pageToken) break;
//   }
//
//   // ─────────────────────────────────────────────────────────────
//   // 루프 종료 후 최종 단계: VPH 필터 → 채널 구독자 → VideoRow 변환
//   // ─────────────────────────────────────────────────────────────
//   const pass =
//     minViewsPerHour > 0
//       ? quickVphPass({ list: collected, minVph: minViewsPerHour, want })
//       : collected;
//
//   return await toRowsWithSubscribers({ items: pass.slice(0, want), apiKey });
// }
