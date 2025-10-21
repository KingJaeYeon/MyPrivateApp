import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '@/lib/utils.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';
import useTagStore from '@/store/useTagStore.ts';
import { format } from 'date-fns';
import { PromptsColumns } from '@/components/data-table-columns/prompts-columns.tsx';

/** 전체 앱 설정 */
export type State = {
  data: PromptsColumns[];
  isChanged?: boolean;
};

type Action = {
  init: (filePath: string) => Promise<void>;
  push: (obj: PromptsColumns) => boolean;
  saved: () => Promise<void>;
  update: (row: PromptsColumns) => void;
  remove: (rows: PromptsColumns[]) => void;
  reset: () => void;
};

const usePromptsStore = create(
  immer<State & Action>((set, get) => ({
    data: [],
    isChanged: false,
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
      const result = await window.excelApi.read(filePath);
      set({ data: result });
    },
    update: (row) => {
      const cur = get().data;
      const data = cur.map((v) => {
        if (v.idx === row?.idx) {
          return { ...row, updatedAt: format(new Date().toISOString(), 'yyyy.MM.dd') };
        }
        return v;
      });
      set({ data, isChanged: true });
      toast.success('변경되었습니다.');
    },
    remove: (rows) => {
      const cur = get().data;
      const removeIds = rows.map((d) => d.idx);
      const filtered = cur.filter((r) => !removeIds.includes(r.idx));

      set({ data: filtered, isChanged: true });
    },
    push: (obj) => {
      const temp = get().data;
      const newArr = [...temp, obj];
      set({ data: newArr, isChanged: true });
      return true;
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async () => {
      const sheetP = useSettingStore.getState().data.excel.prompt;
      const { name, location } = useSettingStore.getState().data.folder;
      const aoa = buildAoaFromObjects(get().data, sheetP);
      await window.excelApi.overwrite(`${location}/${name.prompt}`, aoa, 'Sheet1');
      set({ isChanged: false });
      useTagStore.getState().updateCounter('prompt');
    },
    reset: () => {
      set({ data: [] });
    },
  }))
);

export default usePromptsStore;
