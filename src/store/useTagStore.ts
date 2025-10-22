import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TagColumns } from '@/components/data-table-columns/tag-columns.tsx';
import { buildAoaFromObjects } from '@/lib/utils.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { toast } from 'sonner';
import useChannelStore from '@/store/useChannelStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { useVideoSearchStore } from '@/store/useVideoSearchStore.ts';
import usePromptsStore from '@/store/usePromptsStore';

type TagsKey = 'channel' | 'reference' | 'prompt';

/** 전체 앱 설정 */
export type State = {
  data: TagColumns[];
  jsonData: Record<string, any>;
  isChanged?: boolean;
};

type Action = {
  init: (filePath: string) => Promise<void>;
  push: (arr: TagColumns[]) => boolean;
  remove: (removeArr: TagColumns[]) => void;
  saved: () => Promise<void>;
  updateCounter: (type: TagsKey | 'all') => void;
  reset: () => void;
};

const useTagStore = create(
  immer<State & Action>((set, get) => ({
    data: [],
    jsonData: {},
    isChanged: false,
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
      const result = await window.excelApi.read(filePath);
      const jsonData = result.reduce(
        (acc, cur) => {
          acc[cur.idx] = cur.name;
          return acc;
        },
        {} as Record<string, any>
      );

      set({ data: result, jsonData });

      // 파일로드되서 init은 세팅되서 필요없음
      // get().updateCounter('all');
    },
    updateCounter: (type) => {
      const tags = [...get().data];
      const countTagsFromStore = (
        storeData: any[],
        countField: keyof Omit<TagColumns, 'idx' | 'name'>
      ) => {
        const localCountMap: Record<string, number> = {};

        for (let i = 0; i < storeData.length; i++) {
          const tagArr = storeData[i].tag.toString().split(',');
          for (let j = 0; j < tagArr.length; j++) {
            const tag = tagArr[j].trim();
            if (tag) {
              localCountMap[tag] = (localCountMap[tag] || 0) + 1;
            }
          }
        }

        tags.forEach((tag) => {
          tag[countField] = localCountMap[tag.idx] || 0;
        });
      };

      if (type === 'all') {
        const channels = useChannelStore.getState().data;
        const references = useReferenceStore.getState().data;
        const prompts = usePromptsStore.getState().data;

        countTagsFromStore(channels, 'usedChannels');
        countTagsFromStore(references, 'usedReference');
        countTagsFromStore(prompts, 'usedPrompts');

        // total 계산
        tags.forEach((tag) => {
          tag.total = (tag.usedChannels || 0) + (tag.usedReference || 0) + (tag.usedPrompts || 0);
        });
      } else if (type === 'channel') {
        const channels = useChannelStore.getState().data;
        countTagsFromStore(channels, 'usedChannels');

        tags.forEach((tag) => {
          tag.total = (tag.usedChannels || 0) + (tag.usedReference || 0) + (tag.usedPrompts || 0);
        });
      } else if (type === 'reference') {
        const references = useReferenceStore.getState().data;
        countTagsFromStore(references, 'usedReference');

        tags.forEach((tag) => {
          tag.total = (tag.usedChannels || 0) + (tag.usedReference || 0) + (tag.usedPrompts || 0);
        });
      } else if (type === 'prompt') {
        const prompts = usePromptsStore.getState().data;
        countTagsFromStore(prompts, 'usedPrompts');

        tags.forEach((tag) => {
          tag.total = (tag.usedChannels || 0) + (tag.usedReference || 0) + (tag.usedPrompts || 0);
        });
      }

      set({ data: tags });
      get().saved();
    },
    push: (arr) => {
      const temp = get().data;
      const newArr = [...temp, ...arr];

      const nameArr = newArr.map((r) => r.name);
      const hasDuplicateName = new Set(nameArr).size !== nameArr.length;
      if (hasDuplicateName) {
        toast.error('태그명 중복값이 있습니다.');
        return false; // 중복이 있으면 false
      }

      const idxArr = newArr.map((r) => r.idx);
      const hasDuplicateIdx = new Set(idxArr).size !== idxArr.length;
      if (hasDuplicateIdx) {
        toast.error('idx중복값이 있습니다.');
        return false; // 중복이 있으면 false
      }
      set({ data: newArr, isChanged: true });
      return true;
    },
    remove: (removeArr) => {
      const tags = get().data;
      let isUsed = false;
      const newArr = [];
      const deleteArr = [];
      const removeTags = removeArr.map((d) => d.name);

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const verify = removeTags.includes(tag.name);
        if (verify && tag.total > 0) {
          isUsed = true;
        }
        if (verify) {
          deleteArr.push(tag.name);
        } else {
          newArr.push(tag);
        }
      }
      if (isUsed) {
        toast.error('사용중인 태그는 삭제할 수 없습니다.');
        return;
      }
      set({ data: newArr, isChanged: true });
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async () => {
      const tagSheet = useSettingStore.getState().data.excel.tag;
      const { name, location } = useSettingStore.getState().data.folder;
      const { setTags } = useVideoSearchStore.getState();
      const aoa = buildAoaFromObjects(get().data, tagSheet);

      const jsonData = get().data.reduce(
        (acc, cur) => {
          acc[cur.idx] = cur.name;
          return acc;
        },
        {} as Record<string, any>
      );

      await window.excelApi.overwrite(`${location}/${name.tag}`, aoa, 'Sheet1');
      set({ jsonData, isChanged: false });
      setTags('tagKey', []);
    },
    reset: () => {
      set({ data: [], jsonData: {} });
    },
  }))
);

export default useTagStore;
