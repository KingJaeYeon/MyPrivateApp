// src/store/filter.store.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import useSettingStore from '@/store/setting.ts';
import { VideoRow } from '@/components/data-table-columns/result-columns.tsx'; // 경로 확인 필요

// ✅ 검증/정규화용 Zod 스키마(숫자/불리언 타입)
export const FilterSchema = z
  .object({
    mode: z.enum(['channels', 'keywords']),
    keyword: z.string().trim(),
    days: z.coerce
      .number({ error: '숫자만 입력해 주세요' })
      .int()
      .min(1, '최근 N일은 1 이상로 입력해 주세요')
      .max(50, '최근 N일은 50 이하로 입력해 주세요'),
    maxChannels: z.coerce.string(),
    minViewsPerHour: z.coerce
      .number({ error: '숫자만 입력해 주세요' })
      .min(0, '최소 시간당 조회수는 0 이상로 입력해 주세요'),
    videoDuration: z.enum(['any', 'short', 'medium', 'long']),
    regionCode: z.string().nonempty('국가를 선택해주세요'),
    maxResults: z.coerce
      .number({ error: '숫자만 입력해 주세요' })
      .int()
      .min(1, '검색어당 최대 검색 개수는 1 이상로 입력해 주세요'),
    isPopularVideosOnly: z.boolean(),
    shortsDuration: z.coerce
      .number({ error: '숫자만 입력해 주세요' })
      .int()
      .min(1, '쇼츠 기준은 1초 이상로 입력해 주세요'),
    relevanceLanguage: z.string().min(2, '언어 코드를 입력해주세요'),
    minViews: z.coerce.number({ error: '숫자만 입력해 주세요' }).min(0, '최소 조회수는 0 이상'),
  })
  .superRefine((val, ctx) => {
    if (val.mode === 'keywords' && val.keyword.length < 1) {
      ctx.addIssue({
        code: 'custom',
        message: '키워드를 입력해주세요.',
        path: ['keyword'], // 어떤 필드 오류인지 지정
      });
    }

    const maxCh = Number(val.maxChannels);
    if (val.mode === 'channels' && (maxCh < 1 || isNaN(maxCh))) {
      console.log('maxChannels 오류발생');
      ctx.addIssue({
        code: 'custom',
        message: '채널당 최대 검색 수는 1 이상이어야 합니다.',
        path: ['maxChannels'],
      });
    }
  });

// ✅ UI 상태용 타입(문자열 보관)
export type FilterData = {
  mode: 'channels' | 'keywords';
  keyword: string;
  days: string;
  maxChannels: string;
  minViewsPerHour: string;
  videoDuration: 'any' | 'short' | 'medium' | 'long';
  regionCode: string;
  maxResults: string;
  isPopularVideosOnly: boolean;
  shortsDuration: string;
  relevanceLanguage: string;
  minViews: string;
  channelIds: string;
};

type FieldErrorKey = keyof FilterData;

export type FilterState = {
  data: FilterData;
  isChanged: boolean;
  result: VideoRow[];
  set: <K extends keyof FilterData>(k: K, v: FilterData[K]) => void;
  reset: () => void;
  isValidDays: () => boolean;
  savedHistory: () => Promise<void>;
  setResult: (rows: VideoRow[]) => void;
  clearResult: () => void;
  fieldErrorsKeys: FieldErrorKey[];
  setErrors: (errs: FieldErrorKey[]) => void;
};

// ✅ 스토어 초기값 (UI용 문자열)
const defaultData: FilterData = {
  mode: 'keywords',
  keyword: '',
  days: '7',
  maxChannels: '10',
  minViewsPerHour: '600',
  videoDuration: 'any',
  regionCode: 'KR',
  maxResults: '50',
  isPopularVideosOnly: true,
  shortsDuration: '60',
  relevanceLanguage: 'ko',
  minViews: '1000',
  channelIds: '',
};

export const useFilterStore = create<FilterState>()(
  devtools(
    persist(
      (set, get) => ({
        data: { ...defaultData },
        isChanged: true,
        result: [],

        set: (k, v) => {
          set(
            (s) => ({ data: { ...s.data, [k]: v }, isChanged: true }),
            false,
            `filter:set:${String(k)}`
          );
        },
        reset: () => set({ data: { ...defaultData } }, false, 'filter:reset'),

        isValidDays: () => {
          const n = Number(get().data.days);
          return !Number.isNaN(n) && n > 0;
        },
        setResult: (rows) => {
          set({ result: rows, isChanged: false }, false, 'result:set');
        },
        clearResult: () => set({ result: [] }, false, 'result:clear'),

        savedHistory: async () => {
          const data = get().data;
          const result = get().result;
          const entry = { data, result, searchedAt: Date.now() };
          const setting = useSettingStore.getState();

          const history = setting.data.youtubeHistory;
          const next = Array.isArray(history) ? [entry, ...history] : [entry];
          while (next.length > 20) next.pop();
          await setting.updateIn('youtubeHistory', next);
        },
        fieldErrorsKeys: [],
        setErrors: (errs) => {
          console.log('setErrors', errs);
          set({ fieldErrorsKeys: errs }, false, 'filter:setErrors');
        },
      }),
      {
        name: 'yt-finder:filters',
        version: 2,
        storage: createJSONStorage(() => localStorage),
        migrate: (persisted: any, fromVersion) => {
          if (!persisted) return { data: { ...defaultData } };
          if (fromVersion === 0 || fromVersion === 1 || persisted.data == null) {
            const flat = persisted as Partial<FilterData> & Record<string, any>;
            const next: FilterData = {
              ...defaultData,
              ...Object.fromEntries(
                Object.keys(defaultData).map((k) => [k, flat[k] ?? (defaultData as any)[k]])
              ),
            };
            return { data: next };
          }
          return persisted;
        },
        // result는 재시작 시 초기화
        partialize: (s) => ({ data: s.data }),
      }
    )
  )
);
