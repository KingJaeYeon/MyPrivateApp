// src/store/log.store.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

type Tag =
  | '시작'
  | '참고'
  | '진행율'
  | '진행률'
  | '채널'
  | '대기'
  | '중단 요청'
  | '채널 완료'
  | '중단'
  | '세션'
  | '완료';

type LogState = {
  running: boolean;
  logs: string[];
  // 진행 상태(선택): 진행률 업데이트 시 마지막 줄 덮어쓰기용
  _lastProgressIndex: number | null;

  clear: () => void;
  append: (line: string) => void;
  log: (tag: Tag, message: string) => void;

  start: () => void;
  requestStop: () => void;
  stopped: () => void;
  completed: () => void;

  // 편의 메서드들
  note: (msg: string) => void; // [참고]
  waitStart: (mins: number) => void; // [대기]
  waitSkipToNextKey: () => void; // [대기] 스킵
  userSkippedWait: () => void; // [대기] 사용자가 스킵
  channelBatchStart: (total: number) => void; // [채널] N개 채널 처리 시작
  channelDone: (
    idx: number,
    total: number,
    name: string,
    videoCount: number,
    keysLeft: number
  ) => void; // [채널]/[채널 완료]
  progress: (done: number, total: number) => void; // [진행률] x% (done/total)
  sessionLoaded: (path: string) => void; // [세션]
};

function ts(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export const useLogStore = create<LogState>()(
  devtools(
    persist(
      (set, get) => ({
        running: false,
        logs: [],
        _lastProgressIndex: null,

        clear: () => set({ logs: [], _lastProgressIndex: null }, false, 'log:clear'),

        append: (line) => set((s) => ({ logs: [...s.logs, line] }), false, 'log:append'),

        log: (tag, message) => {
          const line = `[${ts()}] [${tag}] ${message}`;
          set((s) => ({ logs: [...s.logs, line] }), false, `log:${tag}`);
        },

        start: () => {
          set({ running: true }, false, 'log:start');
          get().log('시작', '실행 중...');
        },

        requestStop: () => {
          get().log('중단 요청', '곧 정리됩니다.');
        },

        stopped: () => {
          set({ running: false }, false, 'log:stopped');
          get().log('중단', '사용자 요청으로 중단되었습니다.');
        },
        completed: () => {
          set({ running: false }, false, 'log:completed');
          get().log('완료', '모든 작업이 완료되었습니다.');
        },

        note: (msg) => get().log('참고', msg),

        waitStart: (mins) => get().log('대기', `API 키 쿼터 소진으로 ${mins}분 대기 시작...`),

        waitSkipToNextKey: () => get().log('대기', '대기를 스킵하고 다음 API키로 전환합니다.'),

        userSkippedWait: () => get().log('대기', '사용자가 대기를 스킵했습니다.'),

        channelBatchStart: (total) => get().log('채널', `${total}개 채널 처리 시작`),

        channelDone: (idx, total, name, videoCount, keysLeft) => {
          get().log(
            '채널',
            `${idx}/${total} "${name}" - ${videoCount}개 영상 수집완료 (남은 키: ${keysLeft}개)`
          );
          get().log('채널 완료', `${idx}/${total} 채널 처리 완료`);
        },

        progress: (done, total) => {
          const pct = total > 0 ? Math.floor((done / total) * 100) : 0;
          const line = `[${ts()}] [진행률] ${pct}% 완료 (${done}/${total})`;

          const { _lastProgressIndex, logs } = get();
          if (_lastProgressIndex != null) {
            // 마지막 진행률 줄을 대체(로그 과다 누적 방지)
            const next = logs.slice();
            next[_lastProgressIndex] = line;
            set({ logs: next }, false, 'log:progress:update');
          } else {
            set(
              (s) => ({
                logs: [...s.logs, line],
                _lastProgressIndex: s.logs.length, // 새 줄 인덱스 기억
              }),
              false,
              'log:progress:first'
            );
          }
        },

        sessionLoaded: (path) => get().log('세션', `불러오기 완료 : (${path})`),
      }),
      {
        name: 'yt-finder:logs',
        storage: createJSONStorage(() => sessionStorage), // 세션 유지 (앱 재시작 시 초기화)
        partialize: (s) => ({ logs: s.logs, running: s.running }), // 내부 인덱스는 저장 불필요
      }
    )
  )
);
