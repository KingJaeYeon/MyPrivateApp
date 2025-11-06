import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FilterUI } from '@/store/useVideoSearchStore';
import { format, subDays } from 'date-fns';

export type FontSize =
  | 'text-2xs'
  | 'text-1.5xs'
  | 'text-xs'
  | 'text-0.5xs'
  | 'text-sm'
  | 'text-base'
  | 'text-lg'
  | 'text-xl'
  | 'text-2xl'
  | 'text-3xl'
  | 'text-4xl'
  | 'text-5xl'
  | 'text-6xl'
  | 'text-7xl'
  | 'text-8xl'
  | 'text-9xl';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const chunk = <T>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

/**
 * 숫자를 K, M, B, T 단위로 축약
 * @param num 숫자
 * @param decimals 소수점 자리수 (기본 1)
 */
function formatCompactNumber(num: number, decimals: number = 1): string {
  if (num === null || num === undefined || isNaN(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000_000)
    return `${sign}${(absNum / 1_000_000_000_000).toFixed(decimals)}T`;
  if (absNum >= 1_000_000_000) return `${sign}${(absNum / 1_000_000_000).toFixed(decimals)}B`;
  if (absNum >= 1_000_000) return `${sign}${(absNum / 1_000_000).toFixed(decimals)}M`;
  if (absNum >= 1_000) return `${sign}${(absNum / 1_000).toFixed(decimals)}K`;

  return `${sign}${absNum.toLocaleString()}`;
}

function makeExcelFilename(prefixDate: string, filter: FilterUI, count: number) {
  const parts: string[] = [`cid_${createCid()}`, `mode-${filter.mode}`, `data-${count}`];

  if (filter.mode === 'keywords') {
    parts.push(`kw-${filter.keyword.replace(/\s+/g, '-')}`);
    parts.push(`days-${filter.days}`);
    parts.push(`lang-${filter.relevanceLanguage}`);
    parts.push(`region-${filter.regionCode}`);
  }

  if (filter.mode === 'channels') {
    parts.push(`days-${filter.days}`);
    parts.push(`popular-${filter.isPopularVideosOnly ? 'true' : 'false'}`);
  }

  parts.push(`vph-${filter.minViewsPerHour}`);
  parts.push(`minV-${filter.minViews}`);
  parts.push(`dur-${filter.videoDuration}`);

  return `[${prefixDate}]` + parts.join('_') + '.xlsx';
}

function parsedExcelFileName(fileName: string) {
  const clean = fileName.replace(/\.xlsx$/, '').trim();

  // [2025-10-18] 형식의 날짜 추출
  const [date, rest] = clean?.split('cid');
  const cleanDate = date.replace(/[\[\]]/g, '');
  // 날짜 제외하고 나머지 부분 분리
  const parts = rest.split('_').slice(2);

  const result: Record<string, any> = {};
  let isPopularOnly = false;
  let count = 0;
  let dur = '전체';
  let lang = '';
  let keyword = '';
  let cid = '';

  for (const part of parts) {
    const [key, ...valueParts] = part.split('-');
    const value = valueParts.join('-'); // keyword 같은 경우 하이픈 포함 가능

    switch (key) {
      case 'cid':
        cid = value;
        break;
      case 'mode':
        result.mode = { value, label: '검색모드' };
        break;
      case 'data':
        count = Number(value);
        break;
      case 'vph':
        result.vph = { value, label: '최소 시간당 조회수(vph)' };
        break;
      case 'minV':
        result.minViews = { value, label: '최소 조회수' };
        break;
      case 'dur':
        if (value === 'any') dur = '전체';
        if (value === 'short') dur = '쇼츠';
        if (value === 'medium') dur = '일반';
        if (value === 'long') dur = '롱폼';
        break;
      case 'kw':
        keyword = value.replace(/-/g, ' ');
        break;
      case 'days':
        const res = format(subDays(new Date(cleanDate), Number(value)), 'yyyy-MM-dd');
        result.days = { value: res.toLocaleString(), label: '업로드일' };
        break;
      case 'lang':
        let langTemp = value;
        if (lang === '') {
          langTemp = value + '/';
        }
        lang = lang + langTemp;
        break;
      case 'region':
        let reTemp = value;
        if (lang === '') {
          reTemp = value + '/';
        }
        lang = lang + reTemp;
        break;
      case 'popular':
        isPopularOnly = true;
        break;
    }
  }

  return { result, date, isPopularOnly, count, dur, lang, keyword, cid };
}

function createCid(): string {
  return Math.random().toString(36).slice(2, 8);
}

function formatBytes(bytes: number) {
  if (!bytes || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

const nf = new Intl.NumberFormat();
function formatNumber(num: number) {
  return nf.format(num);
}

export {
  formatCompactNumber,
  makeExcelFilename,
  parsedExcelFileName,
  createCid,
  formatBytes,
  formatNumber,
};
