import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { FilterUI } from '@/store/useVideoSearchStore.ts';

export type ExcelFiles =
  | 'tag'
  | 'channel'
  | 'result'
  | 'prompt'
  | 'reference'
  | 'english'
  | 'progress';

export type ExcelColumn = {
  id: number;
  label: string;
  column: string;
  children?: any[];
};

export type SheetConfig = {
  /** essential 컬럼의 ‘정의’. 앱 코드/설정에서만 바뀜. UI 수정 불가 */
  essentialDefs: ExcelColumn[];
  /** essential 컬럼의 ‘순서’. UI에서 드래그 등으로 바꾸는 대상 */
  order: number[]; // = essentialDefs의 id 배열

  /** optional 컬럼은 자유롭게 추가/삭제/편집 */
  optional: ExcelColumn[];
};

// const orderedEssential = order
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
// function resetorder(sheet: ExcelFiles) { /* order = essentialDefs.map(x=>x.id) */ }

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
      exportFile: {
        fileStampMode: 'date' | 'datetime';
      };
    };
    youtube: {
      apiKey: string;
      usedQuota: number;
      quotaUpdatedAt: string;
    };
    youtubeHistory: { data: FilterUI; result: VideoRow[]; searchedAt: number }[];
    hasFile?: boolean;
  };
};

type Action = {
  init: () => Promise<void>;
  updateIn: <K extends keyof State['data']>(key: K, value: State['data'][K]) => Promise<void>;
};

export type ExcelConfig = Record<string, SheetConfig>;

const seed: State['data'] = {
  excel: {
    tag: {
      essentialDefs: [
        { id: 1, label: 'idx', column: 'idx' },
        { id: 2, label: '태그명', column: 'name' },
        { id: 3, label: '채널', column: 'usedChannels' },
        { id: 4, label: '동영상', column: 'usedVideos' },
        { id: 5, label: '레퍼런스', column: 'usedReference' },
        { id: 6, label: '프롬프트', column: 'usedPrompt' },
        { id: 7, label: '영어', column: 'usedEnglish' },
        { id: 8, label: '전체수', column: 'total' },
      ],
      order: [1, 2, 3, 4, 5, 6, 7, 8],
      optional: [],
    },
    channel: {
      essentialDefs: [
        { id: 1, label: '채널명', column: 'name' },
        { id: 2, label: '채널ID', column: 'channelId' },
        { id: 3, label: '핸들', column: 'handle' },
        { id: 4, label: '태그', column: 'tag' },
        { id: 5, label: '국가', column: 'regionCode' },
        { id: 6, label: '구독자 수', column: 'subscriberCount' },
        { id: 7, label: '총 조회수', column: 'viewCount' },
        { id: 8, label: '동영상 수', column: 'videoCount' },
        { id: 9, label: '메모', column: 'memo' },
        { id: 10, label: '생성일', column: 'publishedAt' },
        { id: 12, label: '링크', column: 'link' },
        { id: 13, label: '갱신날짜', column: 'fetchedAt' },
        { id: 14, label: 'avatar', column: 'icon' },
      ],
      order: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      optional: [{ id: 11, label: '플렛폼', column: 'platform' }],
    },
    result: {
      essentialDefs: [
        { id: 1, label: '썸네일', column: 'thumbnailUrl' },
        { id: 2, label: '채널명', column: 'channelTitle' },
        { id: 3, label: '제목', column: 'title' },
        { id: 4, label: '업로드일', column: 'publishedAt' },
        { id: 5, label: '조회수', column: 'viewCount' },
        { id: 6, label: '시간당 조회수', column: 'viewsPerHour' },
        { id: 7, label: '구독자수', column: 'subscriberCount' },
        { id: 8, label: '조회수/구독자수', column: 'viewsPerSubscriber' },
        { id: 9, label: '영상길이', column: 'duration' },
        { id: 10, label: '링크', column: 'link' },
        { id: 11, label: '채널ID', column: 'channelId' },
        { id: 12, label: '태그', column: 'tags' },
        { id: 13, label: '기본언어', column: 'defaultLanguage' },
        { id: 14, label: '기본오디오', column: 'defaultAudioLanguage' },
        { id: 15, label: '좋아요', column: 'likeCount' },
        { id: 16, label: '댓글수', column: 'commentCount' },
      ],
      order: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
      ],
      optional: [
        { id: 17, label: '', column: '' },
        { id: 18, label: '핸들', column: 'chHandle' },
        { id: 19, label: '채널아이콘', column: 'chIcon' },
        { id: 20, label: '채널생성일', column: 'chPublishAt' },
        { id: 21, label: '채널조회수', column: 'chViewCount' },
        { id: 22, label: '채널영상수', column: 'chVideoCount' },
        { id: 23, label: '채널링크', column: 'chLink' },
        { id: 24, label: '갱신일', column: 'chFetchAt' },
        { id: 25, label: '국가', column: 'chRegionCode' },
      ],
    },
    prompt: {
      essentialDefs: [
        { id: 1, label: '태그', column: 'tag' },
        { id: 2, label: 'Prompt', column: 'prompt' },
        { id: 3, label: '메모', column: 'memo' },
      ],
      order: [1, 2, 3],
      optional: [],
    },
    reference: {
      essentialDefs: [
        { id: 1, label: '이름', column: 'name' },
        { id: 2, label: '태그', column: 'tag' },
        { id: 3, label: '링크', column: 'link' },
        { id: 4, label: '메모', column: 'memo' },
      ],
      order: [1, 2, 3, 4],
      optional: [],
    },
    english: {
      essentialDefs: [
        { id: 1, label: '패턴', column: 'patten' },
        { id: 2, label: '예문', column: 'example' },
        { id: 3, label: '메모(해석)', column: 'memo' },
        { id: 4, label: '중요도', column: 'isImportant' },
      ],
      order: [1, 2, 3, 4],
      optional: [],
    },
    progress: { essentialDefs: [], order: [], optional: [] },
  },
  folder: {
    location: '',
    name: {
      tag: 'tags.xlsx',
      channel: 'channel.xlsx',
      result: 'result',
      prompt: 'prompt.xlsx',
      reference: 'reference.xlsx',
      english: 'english.xlsx',
      progress: 'progress.xlsx',
    },
    exportFile: {
      fileStampMode: 'date',
    },
  },
  youtube: { apiKey: '', usedQuota: 0, quotaUpdatedAt: '' },
  youtubeHistory: [],
  hasFile: false,
};

const useSettingStore = create(
  immer<State & Action>((set, get) => ({
    data: seed,
    /** 앱 시작 시 호출: electron-store에서 값 불러와 zustand state 세팅 */
    init: async () => {
      try {
        const stored = await window.pref.get('settings');
        stored.excel = seed.excel;
        if (stored) {
          set({ data: stored }); // 저장된 값으로 state 덮어쓰기
        } else {
          // 저장된 값이 없다면 seed를 electron-store에 기록
          await window.pref.set('settings', seed);
        }
      } catch (err) {
        console.error('init error', err);
      }
    },
    /** 특정 key만 부분 업데이트 + electron-store 반영 */
    updateIn: async (key, value) => {
      set((draft) => {
        draft.data[key] = value as State['data'][typeof key];
      });
      await window.pref.set('settings', get().data);
    },
  }))
);

export default useSettingStore;
