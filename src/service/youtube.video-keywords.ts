import { formatDuration, isoAfterNDays, parseISODurationToSec } from '@/lib/date.ts';
import { request_youtube } from '@/service/axios.ts';
import { chunk } from '@/lib/utils.ts';
import { differenceInHours, parseISO } from 'date-fns';
import { useLogStore } from '@/store/search-video-log.ts';
import useSettingStore from '@/store/setting.ts';

import { VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { KeywordPayload } from '@/schemas/filter.schema.ts';

/**
 * /search
 * fetchVideosByKeyword
 * - 역할: 키워드 검색으로 비디오 반환
 * - 입력: apiKey, maxResults(최대 50, 50이상이면 나눠서 호출),
 * order("date"|"viewCount"), publishedAfter
 *  p(keyword) not - , or | , ex) cat|dog -fish
 *  regionCode (어느 국가에서 보고 있냐?)
 *  relevanceLanguage (어느 언어와 관련된 영상이냐?) https://www.loc.gov/standards/iso639-2/php/code_list.php
 *  videoDuration (any, long(20분이상), medium(4~20분), short(4분미만))
 *  videoLicense (any, creativeCommon, youtube) creativeCommon: 재 사용 가능
 * - 반환: data.items
 * - 프로세스: axios로 youtube search API 호출
 */

type fetchVideosParams = {
  apiKey: string;
  keyword: string;
  publishedAfter: string;
  videoDuration: 'any' | 'short' | 'medium' | 'long';
  regionCode?: string;
  relevanceLanguage?: string;
  pageToken?: string;
};

const fetchVideoByKeywords = async (params: fetchVideosParams) => {
  const {
    apiKey,
    keyword,
    publishedAfter,
    regionCode,
    relevanceLanguage,
    pageToken,
    videoDuration,
  } = params;
  const Log = useLogStore.getState(); // 훅 호출 아님 (정적 접근)
  const settingStore = useSettingStore.getState(); // 훅 호출 아님 (정적 접근)
  const sIds: string[] = [];

  const searchParams: Record<string, any> = {
    key: apiKey,
    part: 'id',
    type: 'video',
    q: keyword,
    maxResults: 50,
    order: 'viewCount',
    publishedAfter,
    videoDuration,
  };
  if (regionCode) searchParams.regionCode = regionCode;
  if (relevanceLanguage) searchParams.relevanceLanguage = relevanceLanguage;
  if (pageToken) searchParams.pageToken = pageToken;

  const sResp = await request_youtube.get('search', { params: searchParams });

  const url = `${request_youtube.defaults.baseURL}search?${new URLSearchParams(searchParams).toString()}`;
  await settingStore.updateIn('youtube', {
    apiKey: settingStore.data.youtube.apiKey,
    usedQuota: settingStore.data.youtube.usedQuota + 100,
  }); // videos.list 100회 카운트
  Log.note(`[API 요청] ${url}`);

  const sItems = sResp.data?.items ?? [];
  if (sItems.length === 0) return { pageToken: undefined, sIds: [] };

  for (const it of sItems) {
    const vid = it?.id?.videoId;
    if (vid) sIds.push(vid);
  }

  return { newPageToken: sResp.data?.nextPageToken, sIds };
};

export const fetchVideoByIds = async (apiKey: string, ids: string[]) => {
  const vItems: any[] = [];
  const settingStore = useSettingStore.getState(); // 훅 호출 아님 (정적 접근)
  const vResp = await request_youtube.get('videos', {
    params: {
      key: apiKey,
      part: 'snippet,statistics,contentDetails',
      id: ids.join(','),
    },
  });
  await settingStore.updateIn('youtube', {
    apiKey: settingStore.data.youtube.apiKey,
    usedQuota: settingStore.data.youtube.usedQuota + 100,
  }); // videos.list 1회 카운트

  vItems.push(...(vResp.data?.items ?? []));
  return { vItems };
};

/**
 * 현재 후보에서 “시간당 조회수(vph)” 하한을 통과하는 영상만 빠르게 추려서 반환.
 * - want 개를 채우면 조기 종료 → 불필요 계산 최소화
 */
function quickVphPass(list: any[], minVph: number, want: number): any[] {
  if (minVph <= 0) return list;
  const now = new Date();
  const out: any[] = [];
  for (const v of list) {
    const sn = v?.snippet,
      st = v?.statistics,
      cd = v?.contentDetails;
    if (!sn || !st || !cd) continue;
    const ageH = Math.max(differenceInHours(now, parseISO(sn.publishedAt ?? '')), 1);
    const viewCount = Number(st.viewCount ?? 0);
    const vph = viewCount / ageH;
    if (vph >= minVph) {
      out.push(v);
      if (out.length >= want) break; // ✅ 조기 종료
    }
  }
  return out;
}

/**
 * 최종 통과 리스트에 대해 channels.list(구독자 수) 조회 후 VideoRow로 변환
 * - 통과분의 channelId만 조회 → 쿼터 절약
 */
async function toRowsWithSubscribers(items: any[], apiKey: string): Promise<VideoRow[]> {
  const settingStore = useSettingStore.getState(); // 훅 호출 아님 (정적 접근)
  // 1) 채널 통계 수집
  const channelIdSet = new Set<string>();
  for (const v of items) {
    const cid = v?.snippet?.channelId;
    if (cid) channelIdSet.add(cid);
  }

  const channelStats: Record<string, number | null> = {};
  for (const batch of chunk(Array.from(channelIdSet), 50)) {
    const cResp = await request_youtube.get('channels', {
      params: {
        key: apiKey,
        part: 'statistics,contentDetails,brandingSettings',
        id: batch.join(','),
      },
    });

    await settingStore.updateIn('youtube', {
      apiKey: settingStore.data.youtube.apiKey,
      usedQuota: settingStore.data.youtube.usedQuota + 1,
    }); // videos.list 1회 카운트
    for (const ch of cResp.data?.items ?? []) {
      const cid = ch?.id;
      const hidden = ch?.statistics?.hiddenSubscriberCount;
      const subs = hidden ? null : Number(ch?.statistics?.subscriberCount ?? 0);
      if (cid) channelStats[cid] = Number.isFinite(subs as number) ? subs : null;
    }
  }

  // 2) VideoRow로 가공
  const now = new Date();
  let no = 1;
  const rows: VideoRow[] = [];

  for (const v of items) {
    const id = v?.id;
    const sn = v?.snippet,
      st = v?.statistics,
      cd = v?.contentDetails;
    if (!id || !sn || !st || !cd) continue;

    const publishedAt = sn.publishedAt ?? '';
    const ageH = Math.max(differenceInHours(now, parseISO(publishedAt)), 1);
    const viewCount = Number(st.viewCount ?? 0);
    const vph = viewCount / ageH;

    const durSec = parseISODurationToSec(cd.duration ?? 'PT0S');
    const subs = channelStats[sn.channelId ?? ''] ?? null;
    const vps = subs && subs > 0 ? viewCount / subs : null;

    rows.push({
      no: no++,
      channelTitle: sn.channelTitle ?? '',
      title: sn.title ?? '',
      publishedAt,
      viewCount,
      viewsPerHour: vph,
      viewsPerSubscriber: vps,
      duration: formatDuration(durSec),
      link: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: sn?.thumbnails?.medium?.url || sn?.thumbnails?.default?.url || '',
      subscriberCount: subs,
    });
  }

  return rows;
}

export async function getVideoByKeywords({
  apiKey,
  ...payload
}: KeywordPayload & { apiKey: string }): Promise<VideoRow[]> {
  const {
    keyword,
    days,
    maxResults = 50,
    regionCode,
    relevanceLanguage,
    videoDuration,
    minViews = 0,
    minViewsPerHour = 0,
  } = payload;
  const want = Math.max(1, maxResults); // 사용자가 입력한 동영상 수
  const publishedAfter = isoAfterNDays(days); // N일 전 ISO 문자열
  const collected: any[] = []; // 1차 후보(최소 조회수 통과)
  let pageToken: string | undefined = undefined;
  let isFoundMinViewsUnder = false; // 최소 조회수 미달 등장 여부
  const seen = new Set<string>(); // 중복 방지
  const MAX_PAGES = 20; // 안전 가드
  let pages = 0;
  // ─────────────────────────────────────────────────────────────
  // 루프: 수집 → (필요시) VPH 빠른검사 → 부족하면 다음 페이지
  // ─────────────────────────────────────────────────────────────
  while (true) {
    // 0) 현재 후보로 VPH “빠른검사” (원할 때만)
    if (minViewsPerHour > 0 && collected.length > 0) {
      const quick = quickVphPass(collected, minViewsPerHour, want);
      if (quick.length >= want) {
        // 바로 확정 가능 → channels.list 단계로 이동
        const finalRows = await toRowsWithSubscribers(quick.slice(0, want), apiKey);
        return finalRows;
      }
      // 부족하면 계속 수집
    } else if (collected.length >= want) {
      // VPH 조건이 없으면 후보만으로 충분 → 확정
      const finalRows = await toRowsWithSubscribers(collected.slice(0, want), apiKey);
      return finalRows;
    }

    // 수집을 더 해야 하는데, 더 볼 수 없는 상황이면 종료
    if (isFoundMinViewsUnder) break; // 이후는 더 낮은 조회수
    if (pages++ >= MAX_PAGES) break; // 안전 가드

    // 1) search.list
    const { newPageToken, sIds } = await fetchVideoByKeywords({
      apiKey,
      keyword,
      publishedAfter,
      videoDuration,
      pageToken,
      regionCode,
      relevanceLanguage,
    });

    if (sIds.length === 0) break;
    pageToken = newPageToken;

    // 중복 제거
    const ids = sIds.filter((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        return true;
      }
      return false;
    });
    if (ids.length === 0) {
      if (!pageToken) break;
      else continue;
    }

    // 2) videos.list
    const { vItems } = await fetchVideoByIds(apiKey, ids);
    if (vItems.length === 0) {
      if (!pageToken) break;
      else continue;
    }

    // 3) 최소 조회수(minViews) 필터 (배치 전원 통과 여부 확인)
    let batchAllPass = true;
    for (const v of vItems) {
      const viewCount = Number(v?.statistics?.viewCount ?? 0);
      if (viewCount < minViews) {
        batchAllPass = false;
        isFoundMinViewsUnder = true; // 한 건이라도 미달 → 이후는 더 낮음
        break;
      }
    }

    // 통과한 것만 후보 누적
    for (const v of vItems) {
      const viewCount = Number(v?.statistics?.viewCount ?? 0);
      if (viewCount >= minViews) {
        collected.push(v);
        // VPH 조건 없으면 want 채우자마자 확정 가능
        if (minViewsPerHour <= 0 && collected.length >= want) {
          const finalRows = await toRowsWithSubscribers(collected.slice(0, want), apiKey);
          return finalRows;
        }
      }
    }

    // 배치에서 미달을 봤으면 더 낮은 조회수만 남음 → 수집 종료
    if (!batchAllPass) break;
    // 다음 페이지 없으면 종료 (다음 루프에서 VPH 최종검사 후 반환)
    if (!pageToken) break;
  }

  // ─────────────────────────────────────────────────────────────
  // 루프 종료 후 최종 단계: VPH 필터 → 채널 구독자 → VideoRow 변환
  // ─────────────────────────────────────────────────────────────
  const pass = minViewsPerHour > 0 ? quickVphPass(collected, minViewsPerHour, want) : collected;

  const finalRows = await toRowsWithSubscribers(pass.slice(0, want), apiKey);
  return finalRows;
}
