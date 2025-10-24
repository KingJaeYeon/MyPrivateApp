// src/store/useChannelHistoryStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import useSettingStore from '@/store/useSettingStore';
import { buildAoaFromObjects } from '@/lib/utils.ts';

export type ChannelHistory = {
  channelId: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  fetchedAt: string;
};

type State = {
  data: ChannelHistory[];
};

type Action = {
  init: (filePath: string) => Promise<void>;
  getByChannelId: (channelId: string) => ChannelHistory[];
  saved: () => Promise<void>;
  update: (data: ChannelHistory[] | []) => void;
  reset: () => void;
};

const useChannelHistoryStore = create(
  immer<State & Action>((set, get) => ({
    data: [],
    init: async (filePath) => {
      const result = await window.excelApi.read(filePath);

      // 시간순 정렬
      // const sorted = result.sort(
      //   (a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime()
      // );

      set({ data: result });
    },
    getByChannelId: (channelId: string) => {
      return get().data.filter((h) => h.channelId === channelId);
    },
    update: (data) => set({ data }),
    saved: async () => {
      const historySheet = useSettingStore.getState().data.excel.channelHistory;
      const { name, location } = useSettingStore.getState().data.folder;
      const aoa = buildAoaFromObjects(get().data, historySheet);
      await window.excelApi.overwrite(`${location}/${name.channelHistory}`, aoa, 'Sheet1');
    },
    reset: () => set({ data: [] }),
  }))
);

export default useChannelHistoryStore;
