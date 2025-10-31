import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { FilterUI } from '@/store/useVideoSearchStore.ts';
export type ExcelFiles =
  | 'tag'
  | 'channel'
  | 'channelHistory'
  | 'result'
  | 'prompt'
  | 'reference'
  | 'english'
  | 'progress';

export type SchedulerConfig = {
  rule: SCHEDULES_RULE;
  autoStart: boolean;
  updatedAt: Date | null;
};
export type SCHEDULES_RULE = '0 9 * * *' | '0 0 * * *' | '0 9 * * 1' | '32 12 * * *';
export const SCHEDULES = [
  { label: '매일 오전 9시', value: '0 9 * * *' },
  { label: '매일 오후 12시 32분', value: '32 12 * * *' },
  { label: '매일 자정', value: '0 0 * * *' },
  { label: '매주 월요일 오전 9시', value: '0 9 * * 1' },
];

type YouTubeConfig = {
  apiKey: string;
  usedQuota: number;
  quotaUpdatedAt: string;
};

/** 전체 앱 설정 */
export type State = {
  data: {
    folder: {
      location: string;
      name: Record<ExcelFiles, string>;
      exportFile: {
        fileStampMode: 'date' | 'datetime';
      };
    };
    youtube: YouTubeConfig;
    youtubeHistory: { data: FilterUI; result: VideoRow[]; searchedAt: number }[];
    hasFile?: boolean;
    scheduler: SchedulerConfig;
  };
};

type Action = {
  init: () => Promise<void>;
  updateIn: <K extends keyof State['data']>(key: K, value: State['data'][K]) => Promise<void>;
  reset: () => Promise<void>;
};

const seed: State['data'] = {
  folder: {
    location: '',
    name: {
      tag: 'tags.xlsx',
      channel: 'channel.xlsx',
      result: 'result',
      prompt: 'prompt.xlsx',
      reference: 'reference.xlsx',
      channelHistory: 'channels-history.xlsx',
      english: 'english.xlsx',
      progress: 'progress.xlsx',
    },
    exportFile: {
      fileStampMode: 'date',
    },
  },
  youtube: { apiKey: '', usedQuota: 0, quotaUpdatedAt: '' },
  youtubeHistory: [],
  hasFile: false,
  scheduler: {
    rule: '0 0 * * *',
    autoStart: false,
    updatedAt: null,
  },
};

const useSettingStore = create(
  immer<State & Action>((set, get) => ({
    data: seed,
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async () => {
      try {
        const stored = await window.pref.get('settings');
        if (stored) {
          set({ data: stored }); // 저장된 값으로 state 덮어쓰기
        } else {
          // 저장된 값이 없다면 seed를 electron-store에 기록
          await window.pref.set('settings', seed);
        }
      } catch (err) {
        console.error('init error', err);
      }
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    updateIn: async (key, value) => {
      set((draft) => {
        draft.data[key] = value as State['data'][typeof key];
      });
      await window.pref.set('settings', get().data);
    },
    reset: async () => {
      await window.pref.clear();
      set({ data: seed });
    },
  }))
);

export default useSettingStore;
