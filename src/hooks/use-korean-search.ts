// hooks/useKoreanSearch.ts
import { useMemo } from 'react';

// 한글 초성 추출
const CHO = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

function getChosung(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) {
      result += CHO[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

function koreanIncludes(text: string, search: string): boolean {
  if (!search) return true;

  const lowerText = text.toLowerCase();
  const lowerSearch = search.toLowerCase();

  // 1. 일반 텍스트 포함 검사
  if (lowerText.includes(lowerSearch)) return true;

  // 2. 초성 검사
  const chosung = getChosung(text);
  return chosung.includes(lowerSearch);
}

export function useKoreanSearch<T>(
  items: T[],
  searchTerm: string,
  getSearchFields: (item: T) => string[]
): T[] {
  return useMemo(() => {
    if (!searchTerm) return items;

    return items.filter((item) => {
      const fields = getSearchFields(item);
      return fields.some((field) => koreanIncludes(field, searchTerm));
    });
  }, [items, searchTerm]);
}
