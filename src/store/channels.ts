import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer'
import {buildAoaFromObjects} from "@/lib/utils.ts";
import useSettingStore from "@/store/setting.ts";
import {toast} from "sonner";
import {ChannelColumns} from "@/components/data-table-columns/channel-columns.tsx";

/** 전체 앱 설정 */
export type State = {
    data: ChannelColumns[]
}

type Action = {
    init: (filePath: string) => Promise<void>
    push: (arr: ChannelColumns[]) => boolean
    removeTags: (removeArr: ChannelColumns[]) => void
    saved: () => Promise<void>
};

const useChannelStore = create(immer<State & Action>((set, get) => ({
    data: [],
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async (filePath) => {
        const result = await window.excelApi.read(filePath)
        set({data: result})
    },
    push: (arr) => {
        // const temp = get().data;
        // const newArr = [...temp, ...arr]
        //
        // const nameArr = newArr.map(r => r.name)
        // const hasDuplicateName = new Set(nameArr).size !== nameArr.length;
        // if (hasDuplicateName) {
        //     toast.error('태그명 중복값이 있습니다.')
        //     return false; // 중복이 있으면 false
        // }
        //
        // const idxArr = newArr.map(r => r.idx)
        // const hasDuplicateIdx = new Set(idxArr).size !== idxArr.length;
        // if (hasDuplicateIdx) {
        //     toast.error('idx중복값이 있습니다.')
        //     return false; // 중복이 있으면 false
        // }
        //
        // set({data: newArr})
        return true
    },
    removeTags: (removeArr) => {
        const tags = get().data;
        // const removeTags = removeArr.map(d => d.name)
        // const removeTotal = removeArr.filter(d => Number(d.total) > 0);
        // if (removeTotal.length >= 1) {
        //     toast.error('이용중인 태그가 있습니다.')
        //     return
        // }
        // const filterArr = tags.filter(data => !removeTags.includes(data.name))
        // set({data: filterArr})
        set({data: tags})
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    saved: async () => {
        const tagSheet = useSettingStore.getState().data.excel.tag
        const {name, location} = useSettingStore.getState().data.folder
        const aoa = buildAoaFromObjects(get().data, tagSheet)
        await window.excelApi.overwrite(`${location}/${name.tag}`, aoa, "Sheet1");
    },

})));

export default useChannelStore;
