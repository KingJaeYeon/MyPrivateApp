import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer'
import {TagColumns} from "@/components/data-table-columns/tag-columns.tsx";
import {buildAoaFromObjects} from "@/lib/utils.ts";
import useSettingStore from "@/store/setting.ts";

/** 전체 앱 설정 */
export type State = {
    data: TagColumns[]
}

type Action = {
    init: (filePath: string) => Promise<void>
    push: (arr: TagColumns[]) => void
    removeTags: (removeArr: TagColumns[]) => void
    saved: () => Promise<void>
};

const useTagStore = create(immer<State & Action>((set, get) => ({
    data: [],
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
        const result = await window.excelApi.read(filePath)
        set({data: result})
    },
    push: (arr) => {
        const temp = get().data;
        const hasTags = get().data.map(d => d.name)
        const filterArr = arr.filter(data => !hasTags.includes(data.name))
        const newArr = [...temp, ...filterArr]
        set({data: newArr})
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
        await window.excelApi.overwrite(`${location}/${name.tag}`, aoa, "Sheet1");
    },

})));

export default useTagStore;
