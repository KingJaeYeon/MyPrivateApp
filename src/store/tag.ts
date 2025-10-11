import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TagColumns } from '@/components/data-table-columns/tag-columns.tsx';
import { buildAoaFromObjects } from '@/lib/utils.ts';
import useSettingStore from '@/store/setting.ts';
import { toast } from 'sonner';
import useChannelStore from '@/store/channels.ts';

/** 전체 앱 설정 */
export type State = {
  data: TagColumns[];
  JSONData: Record<string, any>;
  isChanged?: boolean;
};

type Action = {
  init: (filePath: string) => Promise<void>;
  push: (arr: TagColumns[]) => boolean;
  removeTags: (removeArr: TagColumns[]) => void;
  saved: () => Promise<void>;
  updateCounter: (type: string) => void;
};

const useTagStore = create(
  immer<State & Action>((set, get) => ({
    data: [],
    JSONData: {},
    isChanged: false,
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
      const result = await window.excelApi.read(filePath);
      const JSONData = result.reduce(
        (acc, cur) => {
          acc[cur.idx] = cur.name;
          return acc;
        },
        {} as Record<string, any>
      );

      set({ data: result, JSONData });
      get().updateCounter('channel');
    },
    updateCounter: (type: string) => {
      const channels = useChannelStore.getState().data;
      const tags = [...get().data];
      const tagCountMap: Record<string, number> = {};
      if (type === 'channel') {
        for (let i = 0; i < channels.length; i++) {
          const channelArr = channels[i].tag.split(',');
          for (let j = 0; j < channelArr.length; j++) {
            const tag = channelArr[j].trim();
            if (tag) {
              tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
            }
          }
        }

        tags.forEach((tag) => {
          tag.usedChannels = tagCountMap[tag.idx] || 0;
          tag.total = (tag.usedVideos || 0) + (tagCountMap[tag.idx] || 0);
        });
        set({ data: tags });
      }
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
    removeTags: (removeArr) => {
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
      const aoa = buildAoaFromObjects(get().data, tagSheet);

      const JSONData = get().data.reduce(
        (acc, cur) => {
          acc[cur.idx] = cur.name;
          return acc;
        },
        {} as Record<string, any>
      );

      await window.excelApi.overwrite(`${location}/${name.tag}`, aoa, 'Sheet1');
      set({ JSONData, isChanged: false });
    },
  }))
);

export default useTagStore;
