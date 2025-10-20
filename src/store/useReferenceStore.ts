import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '@/lib/utils.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';
import useTagStore from '@/store/useTagStore.ts';
import { ReferenceColumns } from '@/components/data-table-columns/reference-columns.tsx';

/** 전체 앱 설정 */
export type State = {
  data: ReferenceColumns[];
  isChanged?: boolean;
};

type Action = {
  init: (filePath: string) => Promise<void>;
  saved: () => Promise<void>;
  update: (data: ReferenceColumns[] | []) => void;
  reset: () => void;
};

const useReferenceStore = create(
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
      const sheetR = useSettingStore.getState().data.excel.reference;
      const { name, location } = useSettingStore.getState().data.folder;
      const aoa = buildAoaFromObjects(get().data, sheetR);
      await window.excelApi.overwrite(`${location}/${name.reference}`, aoa, 'Sheet1');
      set({ isChanged: false });
      useTagStore.getState().updateCounter('reference');
    },
    reset: () => {
      set({ data: [] });
    },
  }))
);

export default useReferenceStore;
