import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildAoaFromObjects } from '../../electron/docs.schema.ts';
import type { DBSchema } from '../../electron/docs.schema.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';

export type EnglishDataType =
  | DBSchema['verbs']
  | DBSchema['patterns']
  | DBSchema['concepts']
  | DBSchema['expressions'];
export type EnglishSheetName = 'verbs' | 'patterns' | 'concepts' | 'expressions';

/** 전체 앱 설정 */
export type State = {
  verbs: DBSchema['verbs'][];
  patterns: DBSchema['patterns'][];
  concepts: DBSchema['concepts'][];
  expressions: DBSchema['expressions'][];
  currentType: EnglishSheetName;
  isChanged?: boolean;

  // side panel states
  patternsEdit: DBSchema['patterns'];
  patternsSnapShot: DBSchema['patterns'];
  patternsPanelState: { isNew: boolean };
  verbsEdit: DBSchema['verbs'];
  verbsSnapShot: DBSchema['verbs'];
  verbsPanelState: { isNew: boolean };
  expressionsEdit: DBSchema['expressions'];
  expressionsSnapShot: DBSchema['expressions'];
  expressionsPanelState: { isNew: boolean };
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

  // patterns side panel
  edit: DBSchema['patterns'];
  setEdit: (
    type: 'patterns' | 'verbs' | 'expressions',
    edit: DBSchema['patterns'] | DBSchema['verbs'] | DBSchema['expressions'] | 'initialize'
  ) => void;
  setPanelState: (type: 'patterns' | 'verbs' | 'expressions', key: 'isNew', bool: boolean) => void;
};

const createNewPattern = (): DBSchema['patterns'] => {
  const newId = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: newId,
    title: '',
    structure: '',
    examples: [] as string[],
    verbIds: [] as string[],
    conceptIds: [] as string[],
    description: '',
    createdAt: new Date().toISOString(),
  } as unknown as DBSchema['patterns'];
};

const createNewVerb = (): DBSchema['verbs'] => {
  const newId = `verb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: newId,
    word: '',
    meaning: '',
    memo: '',
    patternIds: [] as string[],
    conceptIds: [] as string[],
    createdAt: new Date().toISOString(),
  } as unknown as DBSchema['verbs'];
};

const createNewExpression = (): DBSchema['expressions'] => {
  const newId = `expression-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: newId,
    text: '',
    meaning: '',
    linkedPatterns: [] as string[],
    linkedVerbs: [] as string[],
    linkedConcepts: [] as string[],
    importance: 'none',
    memo: '',
    createdAt: new Date().toISOString(),
  } as unknown as DBSchema['expressions'];
};

const useEnglishStore = create(
  immer<State & Action>((set, get) => ({
    verbs: [],
    patterns: [],
    concepts: [],
    expressions: [],
    currentType: 'verbs',
    isChanged: false,

    // patterns side panel
    patternsEdit: createNewPattern(),
    patternsSnapShot: createNewPattern(),
    patternsPanelState: { isNew: false },
    edit: createNewPattern(),

    // verbs side panel
    verbsEdit: createNewVerb(),
    verbsSnapShot: createNewVerb(),
    verbsPanelState: { isNew: false },

    // expressions side panel
    expressionsEdit: createNewExpression(),
    expressionsSnapShot: createNewExpression(),
    expressionsPanelState: { isNew: false },

    setCurrentType: (type) => {
      set({ currentType: type });
    },

    getData: (type) => {
      return get()[type];
    },

    setEdit: (type, edit) => {
      if (type === 'patterns') {
        if (edit === 'initialize') {
          const newEdit = createNewPattern();
          set({
            patternsEdit: newEdit,
            patternsSnapShot: newEdit,
            patternsPanelState: { isNew: true },
            edit: newEdit,
          });
          return;
        }
        set({
          patternsEdit: edit as DBSchema['patterns'],
          patternsSnapShot: edit as DBSchema['patterns'],
          edit: edit as DBSchema['patterns'],
        });
      } else if (type === 'verbs') {
        if (edit === 'initialize') {
          const newEdit = createNewVerb();
          set({
            verbsEdit: newEdit,
            verbsSnapShot: newEdit,
            verbsPanelState: { isNew: true },
          });
          return;
        }
        set({ verbsEdit: edit as DBSchema['verbs'], verbsSnapShot: edit as DBSchema['verbs'] });
      } else if (type === 'expressions') {
        if (edit === 'initialize') {
          const newEdit = createNewExpression();
          set({
            expressionsEdit: newEdit,
            expressionsSnapShot: newEdit,
            expressionsPanelState: { isNew: true },
          });
          return;
        }
        set({
          expressionsEdit: edit as DBSchema['expressions'],
          expressionsSnapShot: edit as DBSchema['expressions'],
        });
      }
    },

    setPanelState: (type, key, bool) => {
      if (type === 'patterns') {
        set({ patternsPanelState: { ...get().patternsPanelState, [key]: bool } });
      } else if (type === 'verbs') {
        set({ verbsPanelState: { ...get().verbsPanelState, [key]: bool } });
      } else if (type === 'expressions') {
        set({ expressionsPanelState: { ...get().expressionsPanelState, [key]: bool } });
      }
    },

    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (type, filePath) => {
      const result = await window.excelApi.read(filePath);
      set({ [type]: result });
    },

    update: (type, data) => {
      if (type === 'patterns') {
        const cur = get().patterns;
        const updated = cur.map((v) => {
          if (v.id === (get().patternsEdit as DBSchema['patterns']).id) {
            return get().patternsEdit as DBSchema['patterns'];
          }
          return v;
        });
        set({ patterns: updated, isChanged: true });
        toast.success('변경되었습니다.');
      } else if (type === 'verbs') {
        const cur = get().verbs;
        const updated = cur.map((v) => {
          if (v.id === (get().verbsEdit as DBSchema['verbs']).id) {
            return get().verbsEdit as DBSchema['verbs'];
          }
          return v;
        });
        set({ verbs: updated, isChanged: true });
        toast.success('변경되었습니다.');
      } else if (type === 'expressions') {
        const cur = get().expressions;
        const updated = cur.map((v) => {
          if (v.id === (get().expressionsEdit as DBSchema['expressions']).id) {
            return get().expressionsEdit as DBSchema['expressions'];
          }
          return v;
        });
        set({ expressions: updated, isChanged: true });
        toast.success('변경되었습니다.');
      } else if (type === 'concepts') {
        // concepts는 나중에 구현
        set({ [type]: data as any, isChanged: true });
        toast.success('변경되었습니다.');
      } else {
        set({ [type]: data as any, isChanged: true });
        toast.success('변경되었습니다.');
      }
    },

    push: (type, obj) => {
      const currentData = get()[type];
      const newArr = [...currentData, obj as any];
      set({ [type]: newArr, isChanged: true });
      if (type === 'patterns') {
        get().setEdit('patterns', 'initialize');
      } else if (type === 'verbs') {
        get().setEdit('verbs', 'initialize');
      } else if (type === 'expressions') {
        get().setEdit('expressions', 'initialize');
      }
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
