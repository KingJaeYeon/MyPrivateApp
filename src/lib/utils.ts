import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExcelColumn, ExcelConfig, SheetConfig } from '@/store/useSettingStore.ts';

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
  const body = rows.map((obj) => orderedDefs.map((d) => obj[d.column]));

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

  return `${sign}${absNum.toString()}`;
}

export { getOrderedColumns, buildAoaFromObjects, formatCompactNumber };
