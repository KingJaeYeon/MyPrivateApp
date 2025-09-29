import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer'
import {FilterData} from './search-video';
import {VideoRow} from "@/service/youtube.ts";

type ExcelFiles =
    | 'tag'
    | 'channel'
    | 'result'
    | 'prompt'
    | 'reference'
    | 'english'
    | 'progress'

type ExcelColumn = {
    id: number
    label: string
    column: string
    children?: any[]
}

type SheetConfig = {
    /** essential 컬럼의 ‘정의’. 앱 코드/설정에서만 바뀜. UI 수정 불가 */
    essentialDefs: ExcelColumn[];
    /** essential 컬럼의 ‘순서’. UI에서 드래그 등으로 바꾸는 대상 */
    essentialOrder: number[]; // = essentialDefs의 id 배열

    /** optional 컬럼은 자유롭게 추가/삭제/편집 */
    optional: ExcelColumn[];
};


// const orderedEssential = essentialOrder
//     .map(id => essentialDefs.find(c => c.id === id)!)
//     .filter(Boolean);
//
// // 순서 바꾸기
// function reorderEssential(sheet: ExcelFiles, newOrder: number[]) { /* 검증 후 저장 */ }
//
// // optional 추가
// function addOptional(sheet: ExcelFiles, col: Omit<ExcelColumn, 'id'>) { /* id 발급 + push + 저장 */ }
//
// // optional 수정
// function updateOptional(sheet: ExcelFiles, id: number, patch: Partial<ExcelColumn>) { /* find+merge */ }
//
// // optional 삭제
// function removeOptional(sheet: ExcelFiles, id: number) { /* filter */ }
//
// // 순서 초기화(정의 순서로 되돌리기)
// function resetEssentialOrder(sheet: ExcelFiles) { /* order = essentialDefs.map(x=>x.id) */ }


// type State = {
//     youtube: { apiKey: string; usedQuota: number; },
//     folder: {
//         location: string
//         name: Record<ExcelFiles, string>
//     },
//     excel: Record<ExcelFiles, Record<'essential' | 'optional', ExcelColumn>>
//     youtubeApiKey: string;
//     isOutOfQuota: boolean;
//     usedQuota: number;
//     pendingKeys: { apiKey: string; usedQuota: number }[];
// };

/** 전체 앱 설정 */
export type State = {
    data: {
        excel: Record<ExcelFiles, SheetConfig>;
        folder: {
            location: string;
            name: Record<ExcelFiles, string>;
        };
        youtube: {
            apiKey: string;
            usedQuota: number;
        };
        youtubeHistory: { data: FilterData; result: VideoRow[]; searchedAt: number }[];
    }
}

type Action = {
    // updateApiKey: (type: 'youtubeApiKey', apiKey: string) => Promise<void>;
    // init: () => Promise<void>;
    // deleteApiKey: (type: 'youtubeApiKey') => Promise<void>;
    // updateQuota: (used: number) => void;

    init: () => Promise<void>
    updateIn: <K extends keyof State['data']>(key: K, value: State['data'][K]) => Promise<void>
};


const seed: State['data'] = {
    excel: {
        tag: {
            essentialDefs: [
                {id: 1, label: '태그명', column: 'name'},
                {id: 2, label: '사용중인 채널', column: 'channels'},
                {id: 3, label: '사용중인 영상', column: 'videos'},
                {id: 4, label: '전체수', column: 'total'},
            ],
            essentialOrder: [1, 2, 3, 4],
            optional: [],
        },
        channel: {essentialDefs: [], essentialOrder: [], optional: []},
        result: {essentialDefs: [], essentialOrder: [], optional: []},
        prompt: {essentialDefs: [], essentialOrder: [], optional: []},
        reference: {essentialDefs: [], essentialOrder: [], optional: []},
        english: {essentialDefs: [], essentialOrder: [], optional: []},
        progress: {essentialDefs: [], essentialOrder: [], optional: []},
    },
    folder: {
        location: '',
        name: {
            tag: '', channel: '', result: '', prompt: '',
            reference: '', english: '', progress: ''
        }
    },
    youtube: {apiKey: '', usedQuota: 0},
    youtubeHistory: []
};

const useSettingStore = create(immer<State & Action>((set, get) => ({
    data: seed,

    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async () => {
        try {
            const stored = await window.pref.get('settings')
            if (stored) {
                set({data: stored}) // 저장된 값으로 state 덮어쓰기
            } else {
                // 저장된 값이 없다면 seed를 electron-store에 기록
                await window.pref.set('settings', seed)
            }
        } catch (err) {
            console.error('init error', err)
        }
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    updateIn: async (key, value) => {
        set(draft => {
            draft.data[key] = value as State['data'][typeof key]
        })
        await window.pref.set('settings', get().data)
    },

})));

export default useSettingStore;
