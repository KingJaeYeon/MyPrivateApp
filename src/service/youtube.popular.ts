import { isoAfterNDays, formatDuration, parseISODurationToSec } from '@/lib/date.ts';
import { request_youtube } from '@/service/axios.ts';
import { differenceInHours, parseISO } from 'date-fns';
import { chunk } from '@/lib/utils.ts';
import useSettingStore from '@/store/setting.ts';
import { useLogStore } from '@/store/search-video-log.ts';
import {VideoRow} from "@/components/data-table-columns/result-columns.tsx";

export type FetchPopularParams = {
  apiKey: string;
  days: number;
  maxResults?: number; // 기본 50, 최대 50 (여러 페이지 필요시 루프)
  regionCode?: string; // chart=mostPopular 는 지역코드가 중요
  relevanceLanguage?: string; // 응답 자체 필터는 아니지만 로깅용으로 보관
  videoDuration: 'any' | 'short' | 'medium' | 'long';
  minViews?: number; // 최소 조회수(1차 필터)
  minViewsPerHour?: number; // 시간당 조회수(2차 필터)
};

export async function getPopularVideos(params: FetchPopularParams): Promise<VideoRow[]> {
  const {
    apiKey,
    days,
    maxResults = 50,
    regionCode,
    // relevanceLanguage, // (직접 필터 불가, 참고 파라미터)
    videoDuration,
    minViews = 0,
    minViewsPerHour = 0,
  } = params;

  const want = Math.max(1, maxResults);
  const publishedAfterISO = isoAfterNDays(days); // 기준일
  const publishedAfter = new Date(publishedAfterISO);

  const Log = useLogStore.getState();
  const settingStore = useSettingStore.getState();

  const collected: any[] = [];
  let pageToken: string | undefined = undefined;
  const MAX_PAGES = 20; // 안전 가드
  let pages = 0;

  // ── 1) videos.list (chart=mostPopular) 로 트렌딩 영상 수집 ─────────────
  // publishedAfter 조건은 응답값(snippet.publishedAt)을 보고 사후 필터링
  while (collected.length < want && pages++ < MAX_PAGES) {
    const paramsObj: Record<string, any> = {
      key: apiKey,
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      maxResults: 50, // 페이지 당 최대
    };
    if (regionCode) paramsObj.regionCode = regionCode;
    if (pageToken) paramsObj.pageToken = pageToken;
    if (videoDuration && videoDuration !== 'any') paramsObj.videoDuration = videoDuration;

    const url = `${request_youtube.defaults.baseURL}videos?${new URLSearchParams(paramsObj).toString()}`;
    Log.note(`[API 요청] ${url}`);
    await settingStore.updateIn(
        'youtube',{
          apiKey: settingStore.data.youtube.apiKey,
          usedQuota: settingStore.data.youtube.usedQuota + 1
        }
    ); // videos.list 1회 카운트

    const resp = await request_youtube.get('videos', { params: paramsObj });
    const items: any[] = resp.data?.items ?? [];
    pageToken = resp.data?.nextPageToken;

    if (!items.length) break;

    for (const v of items) {
      const sn = v?.snippet;
      const st = v?.statistics;
      const cd = v?.contentDetails;
      if (!sn || !st || !cd) continue;

      // 날짜/조회수 1차 필터
      const publishedAtStr = String(sn.publishedAt ?? '');
      const publishedAt = publishedAtStr ? parseISO(publishedAtStr) : new Date(0);
      if (publishedAt < publishedAfter) continue;

      const viewCount = Number(st.viewCount ?? 0);
      if (viewCount < minViews) continue;

      collected.push(v);
      if (collected.length >= want) break;
    }

    if (!pageToken) break; // 더 이상 페이지 없음
  }

  if (!collected.length) return [];

  // ── 2) 시간당 조회수(VPH) 2차 필터 ────────────────────────────────────
  const now = new Date();
  const vphPassed =
    minViewsPerHour > 0
      ? collected.filter((v) => {
          const sn = v?.snippet,
            st = v?.statistics;
          if (!sn || !st) return false;
          const ageH = Math.max(differenceInHours(now, parseISO(sn.publishedAt ?? '')), 1);
          const views = Number(st.viewCount ?? 0);
          return views / ageH >= minViewsPerHour;
        })
      : collected;

  const picked = vphPassed.slice(0, want);

  // ── 3) channels.list 로 채널 구독자 수 가져오기 ──────────────────────
  const channelIdSet = new Set<string>();
  for (const v of picked) {
    const cid = v?.snippet?.channelId;
    if (cid) channelIdSet.add(cid);
  }

  const channelStats: Record<string, number | null> = {};
  for (const batch of chunk(Array.from(channelIdSet), 50)) {
    const cParams = { key: apiKey, part: 'statistics', id: batch.join(',') };
    const curl = `${request_youtube.defaults.baseURL}channels?${new URLSearchParams(cParams).toString()}`;
    Log.note(`[API 요청] ${curl}`);
    await settingStore.updateIn(
        'youtube',{
          apiKey: settingStore.data.youtube.apiKey,
          usedQuota: settingStore.data.youtube.usedQuota + 1
        }
    ); // vid

    const cResp = await request_youtube.get('channels', { params: cParams });
    for (const ch of cResp.data?.items ?? []) {
      const cid = ch?.id;
      const hidden = ch?.statistics?.hiddenSubscriberCount;
      const subs = hidden ? null : Number(ch?.statistics?.subscriberCount ?? 0);
      if (cid) channelStats[cid] = Number.isFinite(subs as number) ? subs : null;
    }
  }

  // ── 4) VideoRow 로 가공하여 반환 ─────────────────────────────────────
  let no = 1;
  const rows: VideoRow[] = [];

  for (const v of picked) {
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
