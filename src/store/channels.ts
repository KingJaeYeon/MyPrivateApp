import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '@/lib/utils.ts';
import useSettingStore from '@/store/setting.ts';
import { toast } from 'sonner';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import useTagStore from '@/store/tag.ts';

/** 전체 앱 설정 */
export type State = {
  data: ChannelColumns[];
  isChanged?: boolean;
};

type Action = {
  init: (filePath: string) => Promise<void>;
  saved: () => Promise<void>;
  update: (data: ChannelColumns[] | []) => void;
};

const useChannelStore = create(
  immer<State & Action>((set, get) => ({
    data: [],
    isChanged: false,
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
      const result = await window.excelApi.read(filePath);
      set({ data: result });
    },
    update: (data) => {
      set({ data, isChanged: true });
      toast.success('변경되었습니다.');
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async () => {
      const channelSheet = useSettingStore.getState().data.excel.channel;
      const { name, location } = useSettingStore.getState().data.folder;
      const aoa = buildAoaFromObjects(get().data, channelSheet);
      await window.excelApi.overwrite(`${location}/${name.channel}`, aoa, 'Sheet1');
      set({ isChanged: false });
      useTagStore.getState().updateCounter('channel');
    },
  }))
);

export default useChannelStore;
