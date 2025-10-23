import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExcelColumn, ExcelConfig, SheetConfig } from '@/store/useSettingStore.ts';
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
 * order 순서에 맞춰 essential + optional 컬럼을 정렬한 배열 반환
 * @param excel 전체 ExcelConfig
 * @param key   시트 key (예: "tag")
 * @param mode  "label" | "column" | "full" (full은 ExcelColumn[])
 */
// 오버로드 선언부
function getOrderedColumns(excel: ExcelConfig, key: keyof ExcelConfig, mode: 'label'): string[];
function getOrderedColumns(excel: ExcelConfig, key: keyof ExcelConfig, mode: 'column'): string[];
function getOrderedColumns(excel: ExcelConfig, key: keyof ExcelConfig, mode: 'full'): ExcelColumn[];

// 실제 구현
function getOrderedColumns(
  excel: ExcelConfig,
  key: keyof ExcelConfig,
  mode: 'label' | 'column' | 'full' = 'label'
): string[] | ExcelColumn[] {
  const sheet = excel[key];
  if (!sheet) return [];

  // essential + optional 합치기
  const allDefs = [...sheet.essentialDefs, ...sheet.optional];
  // id -> ExcelColumn 매핑
  const idToDef = new Map(allDefs.map((def) => [def.id, def]));
  // order 기준 정렬
  const orderedDefs = sheet.order
    .map((id) => idToDef.get(id))
    .filter((def): def is ExcelColumn => !!def);

  if (mode === 'label') return orderedDefs.map((d) => d.label);
  if (mode === 'column') return orderedDefs.map((d) => d.column);
  return orderedDefs;
}

function formatArrayValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join('_');
  }
  return value ?? '';
}

function buildAoaFromObjects(
  rows: Record<string, any>[], // 앱 내부 column기반 데이터 배열
  sheet: SheetConfig // 해당 시트 설정
): any[][] {
  // id → def
  const defsMap = new Map([...sheet.essentialDefs, ...sheet.optional].map((d) => [d.id, d]));
  // order 순서대로 defs
  const orderedDefs = sheet.order.map((id) => defsMap.get(id)).filter((d): d is ExcelColumn => !!d);

  // 헤더(label)
  const header = orderedDefs.map((d) => d.column);

  // 바디(column 키로 값 추출)
  const body = rows.map((obj) => orderedDefs.map((d) => formatArrayValue(obj[d.column])));

  return [header, ...body];
}

/**
 * 숫자를 K, M, B, T 단위로 축약해서 반환
 * 예: 1500 → "1.5K", 2000000 → "2M"
 */
function formatCompactNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000_000) return `${sign}${(absNum / 1_000_000_000_000).toFixed(1)}T`;
  if (absNum >= 1_000_000_000) return `${sign}${(absNum / 1_000_000_000).toFixed(1)}B`;
  if (absNum >= 1_000_000) return `${sign}${(absNum / 1_000_000).toFixed(1)}M`;
  if (absNum >= 1_000) return `${sign}${(absNum / 1_000).toFixed(1)}K`;
  console.log({ sign }, { absNum });
  return `${sign}${absNum.toString()}`;
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
  getOrderedColumns,
  buildAoaFromObjects,
  formatCompactNumber,
  makeExcelFilename,
  parsedExcelFileName,
  createCid,
  formatBytes,
  formatNumber,
};
