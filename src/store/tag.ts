import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer'
import {TagColumns} from "@/components/data-table-columns/tag-columns.tsx";
import {buildAoaFromObjects} from "@/lib/utils.ts";
import useSettingStore from "@/store/setting.ts";
import {toast} from "sonner";

/** 전체 앱 설정 */
export type State = {
    data: TagColumns[]
    JSONData: Record<string, any>
}

type Action = {
    init: (filePath: string) => Promise<void>
    push: (arr: TagColumns[]) => boolean
    removeTags: (removeArr: TagColumns[]) => void
    saved: () => Promise<void>
};

const useTagStore = create(immer<State & Action>((set, get) => ({
    data: [],
    JSONData: {},
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
        const result = await window.excelApi.read(filePath)
        const JSONData = result.reduce((acc, cur) => {
            acc[cur.idx] = cur.name;
            return acc;
        }, {} as Record<string, any>);

        set({data: result, JSONData})
    },
    push: (arr) => {
        const temp = get().data;
        const newArr = [...temp, ...arr]

        const nameArr = newArr.map(r=>r.name)
        const hasDuplicateName = new Set(nameArr).size !== nameArr.length;
        if (hasDuplicateName) {
            toast.error('태그명 중복값이 있습니다.')
            return false; // 중복이 있으면 false
        }

        const idxArr = newArr.map(r=>r.idx)
        const hasDuplicateIdx = new Set(idxArr).size !== idxArr.length;
        if (hasDuplicateIdx) {
            toast.error('idx중복값이 있습니다.')
            return false; // 중복이 있으면 false
        }

        set({data: newArr})
        return true
    },
    removeTags: (removeArr) => {
        const hasTags = get().data;
        const removeTags = removeArr.map(d => d.name)
        const filterArr = hasTags.filter(data => !removeTags.includes(data.name))
        set({data: filterArr})
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async () => {
        const tagSheet = useSettingStore.getState().data.excel.tag
        const {name, location} = useSettingStore.getState().data.folder
        const aoa = buildAoaFromObjects(get().data, tagSheet)

        const JSONData = get().data.reduce((acc, cur) => {
            acc[cur.idx] = cur.name;
            return acc;
        }, {} as Record<string, any>);

        await window.excelApi.overwrite(`${location}/${name.tag}`, aoa, "Sheet1");
        set({JSONData});
    },

})));

export default useTagStore;
