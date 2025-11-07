import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '../../electron/docs.schema.ts';
import type { DBSchema } from '../../electron/docs.schema.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';

export type EnglishDataType = DBSchema['engWords'] | DBSchema['engNotes'];
export type EnglishSheetName = 'engWords' | 'engNotes';
export type mdState = 'read' | 'edit' | 'create';
/** 전체 앱 설정 */
export type State = {
  engWords: DBSchema['engWords'][];
  jsonEngWords: Record<string, any>;
  engNotes: DBSchema['engNotes'][];
  state: mdState;
  currentType: EnglishSheetName;
  isChanged?: boolean;
};

type Action = {
  init: (type: EnglishSheetName, filePath: string) => Promise<void>;
  setState: (state: mdState) => void;
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
    engWords: [],
    engNotes: [],
    jsonEngWords: {},
    state: 'read',
    setState: (state: mdState) => set({ state }),
    currentType: 'engNotes',
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
      const jsonData = result.reduce(
        (acc, cur) => {
          acc[cur.id] = cur.word;
          return acc;
        },
        {} as Record<string, any>
      );

      set({ [type]: result, jsonEngWords: jsonData });
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
      await window.excelApi.overwrite(`${location}/english/${fileName}`, aoa, 'Sheet1');

      set({ isChanged: false });

      if (type === 'engWords') {
        const jsonData = get().engWords.reduce(
          (acc, cur) => {
            acc[cur.id] = cur.word;
            return acc;
          },
          {} as Record<string, any>
        );
        set({ jsonEngWords: jsonData });
      }
    },

    reset: (type) => {
      set({ [type]: [] });
    },
  }))
);

export default useEnglishStore;
