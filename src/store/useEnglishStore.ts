import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '../../electron/docs.schema.ts';
import type { DBSchema } from '../../electron/docs.schema.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';

export type EnglishDataType = DBSchema['verbs'] | DBSchema['patterns'] | DBSchema['concepts'] | DBSchema['expressions'];
export type EnglishSheetName = 'verbs' | 'patterns' | 'concepts' | 'expressions';

/** 전체 앱 설정 */
export type State = {
  verbs: DBSchema['verbs'][];
  patterns: DBSchema['patterns'][];
  concepts: DBSchema['concepts'][];
  expressions: DBSchema['expressions'][];
  currentType: EnglishSheetName;
  isChanged?: boolean;
};

type Action = {
  init: (type: EnglishSheetName, filePath: string) => Promise<void>;
  push: (type: EnglishSheetName, obj: EnglishDataType) => boolean;
  saved: (type: EnglishSheetName) => Promise<void>;
  update: (type: EnglishSheetName, data: EnglishDataType[]) => void;
  remove: (type: EnglishSheetName, ids: string[]) => void;
  reset: (type: EnglishSheetName) => void;
  setCurrentType: (type: EnglishSheetName) => void;
  getData: (type: EnglishSheetName) => EnglishDataType[];
};

const useEnglishStore = create(
  immer<State & Action>((set, get) => ({
    verbs: [],
    patterns: [],
    concepts: [],
    expressions: [],
    currentType: 'verbs',
    isChanged: false,

    setCurrentType: (type) => {
      set({ currentType: type });
    },

    getData: (type) => {
      return get()[type];
    },

    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (type, filePath) => {
      const result = await window.excelApi.read(filePath);
      set({ [type]: result });
    },

    update: (type, data) => {
      set({ [type]: data, isChanged: true });
      toast.success('변경되었습니다.');
    },

    push: (type, obj) => {
      const currentData = get()[type];
      const newArr = [...currentData, obj as any];
      set({ [type]: newArr, isChanged: true });
      return true;
    },

    remove: (type, ids) => {
      const currentData = get()[type];
      const filtered = currentData.filter((item: any) => !ids.includes(item.id));
      set({ [type]: filtered, isChanged: true });
    },

    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async (type) => {
      const { name, location } = useSettingStore.getState().data.folder;
      const data = get()[type];
      const aoa = buildAoaFromObjects(data, type);
      const fileName = name[type];
      await window.excelApi.overwrite(`${location}/${fileName}`, aoa, 'Sheet1');
      set({ isChanged: false });
    },

    reset: (type) => {
      set({ [type]: [] });
    },
  }))
);

export default useEnglishStore;
