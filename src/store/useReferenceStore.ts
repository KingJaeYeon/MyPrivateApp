import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '../../electron/docs.schema.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';
import useTagStore from '@/store/useTagStore.ts';
import { ReferenceColumns } from '@/components/data-table-columns/reference-columns.tsx';
import { format } from 'date-fns';

export const referenceSeed: ReferenceColumns = {
  idx: '',
  path: '',
  name: '',
  link: '',
  tag: '',
  memo: '',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().getTime(),
};

const getNextIdx = (data: ReferenceColumns[]) => {
  return data.length > 0 ? Number(data[data.length - 1].idx) + 1 : 1;
};

export const createNewInput = (data: ReferenceColumns[], path?: string): ReferenceColumns => {
  const idx = getNextIdx(data);
  const temp = path ? `${path}/${idx}` : idx.toString();
  return {
    ...referenceSeed,
    idx: idx.toString(),
    path: temp,
  };
};

/** 전체 앱 설정 */
export type State = {
  data: ReferenceColumns[];
  isChanged?: boolean;

  // side panel
  edit: ReferenceColumns;
  snapShot: ReferenceColumns;
  panelState: {
    isSub: boolean;
    isNew: boolean;
  };
};

type Action = {
  init: (filePath: string) => Promise<void>;
  push: (obj: ReferenceColumns) => void;
  getData: () => ReferenceColumns[];
  saved: () => Promise<void>;
  update: (row: ReferenceColumns) => void;
  remove: (rows: ReferenceColumns[]) => void;
  reset: () => void;

  // side panel
  setEdit: (edit: ReferenceColumns | 'initialize') => void;
  setPanelState: (key: 'isSub' | 'isNew', bool: boolean) => void;
};

const useReferenceStore = create(
  immer<State & Action>((set, get) => ({
    data: [],
    isChanged: false,

    // side panel
    edit: referenceSeed,
    snapShot: referenceSeed,
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

      const linkMap = new Map(copy.map((item) => [item.path, (item.link?.trim() ?? '') === '']));

      return copy.sort((a, b) => {
        const aParts = a.path.split('/').map(Number);
        const bParts = b.path.split('/').map(Number);

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i];
          const bVal = bParts[i];

          if (aVal === undefined) return -1;
          if (bVal === undefined) return 1;

          if (aVal !== bVal) {
            // 해당 레벨의 path 구성
            const aPath = aParts.slice(0, i + 1).join('/');
            const bPath = bParts.slice(0, i + 1).join('/');

            // Map에서 link 빈 값 여부 확인 (O(1))
            const aIsEmpty = linkMap.get(aPath) ?? false;
            const bIsEmpty = linkMap.get(bPath) ?? false;

            // link 빈 값 우선
            if (aIsEmpty && !bIsEmpty) return -1;
            if (!aIsEmpty && bIsEmpty) return 1;

            // 같으면 숫자 순서
            return aVal - bVal;
          }
        }

        return 0;
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
      const removePaths = rows.map((r) => r.path);

      // 자기 자신 + 모든 하위 항목
      const allRemoveIds = cur
        .filter(
          (item) =>
            removeIds.includes(item.idx) ||
            removePaths.some((path) => item.path.startsWith(path + '/'))
        )
        .map((item) => item.idx);

      // 하위 항목이 있으면 확인
      const extraCount = allRemoveIds.length - removeIds.length;
      if (extraCount > 0) {
        const confirmed = confirm(
          `선택한 항목과 하위 항목을 모두 삭제하시겠습니까?\n\n` +
            `- 선택 항목: ${removeIds.length}개\n` +
            `- 하위 항목: ${extraCount}개\n` +
            `- 총 삭제: ${allRemoveIds.length}개`
        );
        if (!confirmed) return;
      }

      const filtered = cur.filter((r) => !allRemoveIds.includes(r.idx));

      set({ data: filtered, isChanged: true });
      get().setEdit('initialize');
    },
    push: (obj) => {
      const temp = get().data;
      const tempObj = {
        ...obj,
        name: obj.name.trim(),
        link: obj.link.trim(),
        memo: obj.memo.trim(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().getTime(),
      };
      const newArr = [...temp, tempObj];
      set({ data: newArr, isChanged: true });
      get().setEdit('initialize');
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async () => {
      const { name, location } = useSettingStore.getState().data.folder;
      const aoa = buildAoaFromObjects(get().data, 'reference');
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
