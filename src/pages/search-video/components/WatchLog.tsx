import { useLogStore } from '@/store/useLogStore.ts';
import { Textarea } from '@/components/ui/textarea.tsx';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button.tsx';

export function WatchLog() {
  const { logs, clear } = useLogStore();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      scrollToTop(textareaRef.current.scrollHeight);
    }
  }, [logs]); // logs 바뀔 때마다 실행

  // const tempLog = '[12:00:00] [시작] 실행 중...\n' +
  //     '[12:00:00] [참고] 구독자 수 정도도 함꼐 수집합니다(API 호출이 약간 늘어감)\n' +
  //     '[12:00:00] [진행율] 0% 완료 (0/1380)\n' +
  //     '[12:00:00] [채널] 138개 채널 처리 시작\n' +
  //     '[12:00:01] [대기] API 키 쿼터 소진으로 30분 대기 시작...\n' +
  //     '[12:00:10] [중단 요청] 곧 정리됩니다.\n' +
  //     '[12:00:10] [대기] 대기를 스킵하고 다음 API키로 전환합니다.\n' +
  //     '[12:00:10] [대기] 사용자가 대기를 스킵했습니다.\n' +
  //     '[12:00:11] [채널 1/138] "@user-vsnjsek" - 0개 영상 수집완료 (남은 키: 11개)\n' +
  //     '[12:00:11] [진행률] 0% 완료\n' +
  //     '[12:00:11] [채널 완료] 1/138 채널 처리 완료\n' +
  //     '[12:00:11] [중단] 사용자 요청으로 중단되었습니다.\n' +
  //     '[12:00:12] [세션] 불러오기 완료 : (file document path...)'

  function scrollToTop(top: number) {
    if (textareaRef.current) {
      textareaRef.current.scrollTo({
        top,
        behavior: 'smooth', // ✅ 부드럽게 맨 위로
      });
    }
  }

  return (
    <div className={'flex max-h-[250px] w-full flex-1 flex-col gap-2'}>
      <div className={'flex justify-between'}>
        <p className={'text-foreground'}>로그 / 진행 상황</p>
        <div className={'flex gap-2'}>
          <Button size={'sm'} variant={'outline'} onClick={() => scrollToTop(0)}>
            상단
          </Button>
          <Button
            size={'sm'}
            variant={'outline'}
            onClick={() => {
              if (textareaRef.current) {
                scrollToTop(textareaRef.current.scrollHeight);
              }
            }}
          >
            하단
          </Button>
          <Button size={'sm'} variant={'outline'} onClick={clear}>
            지우기
          </Button>
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={logs.join('\n')}
        readOnly
        className={
          'scrollWidth3 bg-secondary/50 flex-1 resize-none overflow-y-auto rounded p-2 text-xs'
        }
      />
    </div>
  );
}
