import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '../../electron/docs.schema.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';
import useTagStore from '@/store/useTagStore.ts';
import { format } from 'date-fns';
import { PromptsColumns } from '@/components/data-table-columns/prompts-columns.tsx';

export const promptSeed: PromptsColumns = {
  idx: '',
  path: '',
  title: '',
  prompt: '',
  tag: '',
  memo: '',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().getTime(),
};

const getNextIdx = (data: PromptsColumns[]) => {
  return data.length > 0 ? Number(data[data.length - 1].idx) + 1 : 1;
};

export const createNewInput = (data: PromptsColumns[], path?: string): PromptsColumns => {
  const idx = getNextIdx(data);
  const temp = path ? `${path}/${idx}` : idx.toString();
  return {
    ...promptSeed,
    idx: idx.toString(),
    path: temp,
  };
};

/** 전체 앱 설정 */
export type State = {
  data: PromptsColumns[];
  isChanged?: boolean;

  // side panel
  edit: PromptsColumns;
  snapShot: PromptsColumns;
  panelState: {
    isSub: boolean;
    isNew: boolean;
  };
};

type Action = {
  init: (filePath: string) => Promise<void>;
  push: (obj: PromptsColumns) => void;
  saved: () => Promise<void>;
  getData: () => PromptsColumns[];
  update: (row: PromptsColumns) => void;
  remove: (rows: PromptsColumns[]) => void;
  reset: () => void;

  // side panel
  setEdit: (edit: PromptsColumns | 'initialize') => void;
  setPanelState: (key: 'isSub' | 'isNew', bool: boolean) => void;
};

const usePromptsStore = create(
  immer<State & Action>((set, get) => ({
    data: [],
    isChanged: false,

    // side panel
    edit: promptSeed,
    snapShot: promptSeed,
    setEdit: (edit) => {
      if (edit === 'initialize') {
        set({
          edit: createNewInput(get().data),
          snapShot: createNewInput(get().data),
          panelState: { isSub: false, isNew: true },
        });
        return;
      }
      set({ edit, snapShot: edit });
    },
    panelState: { isSub: false, isNew: false },
    setPanelState: (key, bool) => {
      const cur = get().edit;
      const snap = get().snapShot;
      if (key === 'isSub' && bool) {
        set({ snapShot: cur, edit: createNewInput(get().data, cur.path) });
      }
      if (key === 'isSub' && !bool) {
        set({ edit: snap, snapShot: createNewInput(get().data) });
      }

      set({ panelState: { ...get().panelState, [key]: bool } });
    },

    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
      const result = await window.excelApi.read(filePath);
      set({ data: result });
    },
    getData: () => {
      const copy = [...get().data];
      return copy.sort((a, b) => {
        const aParts = a.path.split('/').map(Number);
        const bParts = b.path.split('/').map(Number);

        // 각 계층의 숫자 비교
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i] ?? -1;
          const bVal = bParts[i] ?? -1;
          if (aVal !== bVal) return aVal - bVal;
        }

        // 완전히 동일하면 길이순 (상위가 먼저)
        return aParts.length - bParts.length;
      });
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
      get().setEdit('initialize');
    },
    push: (obj) => {
      const temp = get().data;
      const newArr = [...temp, obj];
      set({ data: newArr, isChanged: true });
      get().setEdit('initialize');
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async () => {
      const { name, location } = useSettingStore.getState().data.folder;
      const aoa = buildAoaFromObjects(get().data, 'prompt');
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
