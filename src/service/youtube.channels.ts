// src/service/youtube.channel.ts
import { request_youtube } from '@/service/axios';
import { isoAfterNDays, parseISODurationToSec, formatDuration } from '@/lib/date';
import { differenceInHours, parseISO } from 'date-fns';
import { chunk } from '@/lib/utils';

import {VideoRow} from "@/components/data-table-columns/result-columns.tsx";

// ── 유틸: 채널 입력 정규화 (URL/핸들 → id)
// - 지금은 이미 id 라고 가정. 나중에 필요하면 search.list(type=channel)로 보강.
export function normalizeChannelInputs(inputs: string[]): string[] {
  return inputs
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // https://www.youtube.com/channel/UCxxx → UCxxx
      const m1 = s.match(/youtube\.com\/channel\/([A-Za-z0-9_-]+)/i);
      if (m1) return m1[1];
      // @handle → 그대로 search.list 로 ID resolve 가능 (여기선 생략)
      return s;
    });
}

type Params = {
  apiKey: string;
  channelIds: string[]; // ← UI에서 붙여줄 예정
  days: number;
  perChannelMax: number; // 채널당 최대로 가져올 영상 수 (<= 50 권장)
  order: 'date' | 'viewCount'; // "채널별 인기영상 보기" 체크 → viewCount, 아니면 date
  videoDuration: 'any' | 'short' | 'medium' | 'long';
  minViews: number; // 최소 조회수 (1차 필터)
  minViewsPerHour: number; // 시간당 조회수 (2차 필터)
  regionCode?: string;
  relevanceLanguage?: string;
};

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

// ── videos.list (50개 배치)
async function fetchVideosByIds(apiKey: string, videoIds: string[]) {
  const out: any[] = [];
  for (const batch of chunk(videoIds, 50)) {
    const v = await request_youtube.get('videos', {
      params: { key: apiKey, part: 'snippet,statistics,contentDetails', id: batch.join(',') },
    });
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
async function toRowsWithSubscribers(items: any[], apiKey: string): Promise<VideoRow[]> {
  // 채널 통계 (저쿼터: 1/call 배치)
  const ids = Array.from(new Set(items.map((v) => v?.snippet?.channelId).filter(Boolean)));
  const subsMap: Record<string, number | null> = {};
  for (const batch of chunk(ids, 50)) {
    const c = await request_youtube.get('channels', {
      params: { key: apiKey, part: 'statistics', id: batch.join(',') },
    });
    for (const ch of c.data?.items ?? []) {
      const cid = ch?.id;
      const hidden = ch?.statistics?.hiddenSubscriberCount;
      const subs = hidden ? null : Number(ch?.statistics?.subscriberCount ?? 0);
      if (cid) subsMap[cid] = Number.isFinite(subs as number) ? subs : null;
    }
  }

  const now = new Date();
  let no = 1;
  return items.map((v) => {
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

// ── 메인: 채널 모드
export async function getVideosByChannels(p: Params): Promise<VideoRow[]> {
  const {
    apiKey,
    channelIds,
    days,
    perChannelMax,
    order,
    videoDuration,
    minViews,
    minViewsPerHour,
    regionCode,
    relevanceLanguage,
  } = p;

  const normalized = normalizeChannelInputs(channelIds);
  const allVideoIds: string[] = [];

  // 1) 채널별 videoId 모으기 (order=“viewCount” 체크박스면 인기영상)
  for (const cid of normalized) {
    const ids = await fetchChannelVideoIds({
      apiKey,
      channelId: cid,
      days,
      perChannelMax,
      order,
      videoDuration,
      regionCode,
      relevanceLanguage,
    });
    allVideoIds.push(...ids);
  }

  if (!allVideoIds.length) return [];

  // 2) videos.list 상세 조회(저쿼터)
  const videos = await fetchVideosByIds(apiKey, allVideoIds);

  // 3) 최소 조회수 → 시간당 조회수 순으로 필터
  const minViewsPassed = videos.filter((v) => Number(v?.statistics?.viewCount ?? 0) >= minViews);
  const vphPassed = filterByVph(minViewsPassed, minViewsPerHour);

  // 4) 구독자 + VideoRow 매핑
  return await toRowsWithSubscribers(vphPassed, apiKey);
}
