// src/store/filter.store.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { VideoRow } from '@/components/data-table-columns/result-columns.tsx'; // 경로 확인 필요
import {
  ChannelFilterUI,
  CommonFilterUI,
  defaultChannelUI,
  defaultCommonUI,
  defaultKeywordUI,
  defaultTagsUI,
  KeywordFilterUI,
  TagsFilterUI,
} from '@/schemas/filter.schema';
import useSettingStore from '@/store/useSettingStore.ts';
import { buildAoaFromObjects } from '@/lib/utils.ts';
import useTagStore from '@/store/useTagStore.ts';
// V2 refactor
/** 슬라이스별 UI 타입 */

export type FilterUI = (CommonFilterUI & ChannelFilterUI) | (CommonFilterUI & KeywordFilterUI);

type FilterSlice = {
  filter: {
    common: CommonFilterUI;
    channel: ChannelFilterUI;
    keyword: KeywordFilterUI;
    tags: TagsFilterUI;
  };
  setCommon: <K extends keyof CommonFilterUI>(k: K, v: CommonFilterUI[K]) => void;
  setChannel: <K extends keyof ChannelFilterUI>(k: K, v: ChannelFilterUI[K]) => void;
  setKeyword: <K extends keyof KeywordFilterUI>(k: K, v: KeywordFilterUI[K]) => void;
  setTags: <K extends keyof TagsFilterUI>(k: K, v: TagsFilterUI[K]) => void;
  setMode: (mode: 'channels' | 'keywords') => void;
  resetFilter: () => void;
  /** 현재 모드에 맞는 UI 객체 반환 (제출 시 사용) */
  getFilterPayload: () => FilterUI;
};

type ResultSlice = {
  result: { data: VideoRow[]; meta?: any };
  setResult: (rows: VideoRow[]) => void;
  clearResult: () => void;
  saved: () => Promise<void>;
};

type ErrorSlice = {
  fieldErrorsKeys: string[];
  setErrors: (keys: string[]) => void;
  clearErrors: () => void;
};

type MetaSlice = {
  isChanged: boolean;
};

export type VideoSearchState = FilterSlice & ResultSlice & ErrorSlice & MetaSlice;

/** 기본 상태 */
const defaultState = {
  common: { ...defaultCommonUI },
  channel: { ...defaultChannelUI },
  keyword: { ...defaultKeywordUI },
  tags: { ...defaultTagsUI },
};

export const useVideoSearchStore = create<VideoSearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // -------- Filter
        filter: {
          common: defaultState.common,
          channel: defaultState.channel,
          keyword: defaultState.keyword,
          tags: defaultState.tags,
        },

        setCommon: (k, v) =>
          set(
            (s) => ({
              filter: { ...s.filter, common: { ...s.filter.common, [k]: v } },
              isChanged: true,
            }),
            false,
            `filter/common:${String(k)}`
          ),

        setChannel: (k, v) =>
          set(
            (s) => ({
              filter: { ...s.filter, channel: { ...s.filter.channel, [k]: v } },
              isChanged: true,
            }),
            false,
            `filter/channel:${String(k)}`
          ),

        setKeyword: (k, v) =>
          set(
            (s) => ({
              filter: { ...s.filter, keyword: { ...s.filter.keyword, [k]: v } },
              isChanged: true,
            }),
            false,
            `filter/keyword:${String(k)}`
          ),

        setTags: (k, v) =>
          set(
            (s) => ({
              filter: { ...s.filter, tags: { ...s.filter.tags, [k]: v } },
              isChanged: true,
            }),
            false,
            `filter/tags:${String(k)}`
          ),

        setMode: (mode) =>
          set(
            (s) => ({
              filter: {
                ...s.filter,
                common: { ...s.filter.common, mode },
                // 모드 전환 시 반대 모드 전용 필드 초기화(선택)
                channel: { ...s.filter.channel },
                keyword: { ...s.filter.keyword },
                tags: { ...s.filter.tags },
              },
              isChanged: true,
            }),
            false,
            `filter/mode:${mode}`
          ),

        resetFilter: () =>
          set(
            () => ({
              filter: {
                common: { ...defaultState.common },
                channel: { ...defaultState.channel },
                keyword: { ...defaultState.keyword },
                tags: { ...defaultState.tags },
              },
              isChanged: true,
            }),
            false,
            'filter/reset'
          ),

        getFilterPayload: () => {
          const s = get().filter;
          if (s.common.mode === 'keywords') {
            return { ...s.common, ...s.keyword } as FilterUI;
          }
          return { ...s.common, ...s.channel, ...s.tags } as FilterUI;
        },

        // -------- Result
        result: { data: [], meta: undefined },
        setResult: (rows) => set({ result: { data: rows }, isChanged: false }, false, 'result:set'),
        clearResult: () => set({ result: { data: [] } }, false, 'result:clear'),
        saved: async () => {
          const channelSheet = useSettingStore.getState().data.excel.channel;
          const { name, location } = useSettingStore.getState().data.folder;
          const aoa = buildAoaFromObjects(get().result.data, channelSheet);
          await window.excelApi.overwrite(`${location}/${name.result}`, aoa, 'Sheet1');
          set({ isChanged: false });
          useTagStore.getState().updateCounter('channel');
        },

        // -------- Error
        fieldErrorsKeys: [],
        setErrors: (keys) => set({ fieldErrorsKeys: keys }, false, 'error:set'),
        clearErrors: () => set({ fieldErrorsKeys: [] }, false, 'error:clear'),

        // -------- Meta
        isChanged: true,
      }),
      {
        name: 'yt-finder:video-search',
        version: 3,
        storage: createJSONStorage(() => localStorage),
        // 재시작 시 결과는 초기화하고, 필터만 복원
        partialize: (s) => ({ filter: s.filter }),
        migrate: (persisted: any) => {
          const f = persisted?.filter ?? {};
          return {
            filter: {
              common: { ...defaultCommonUI, ...(f.common ?? {}) },
              channel: { ...defaultChannelUI, ...(f.channel ?? {}) },
              keyword: { ...defaultKeywordUI, ...(f.keyword ?? {}) },
              tags: { ...defaultTagsUI, ...(f.tags ?? {}) },
            },
            // 필요하면 다른 slice 기본값도 여기서 채워줄 수 있음
          } as VideoSearchState;
        },
      }
    )
  )
);
