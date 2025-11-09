import { useTheme } from '@/providers/theme-provider.tsx';
import RobotSkinned, { RobotSkinnedRef } from './RobotSkinned';
import { useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

export function Home() {
  const [ref1, { width }] = useMeasure();
  const [isShow, setIsShow] = useState(true);
  return (
    <div
      ref={ref1}
      className={'relative flex h-full w-full flex-1 flex-col items-center justify-center gap-6'}
    >
      <Renderer width={width} />
      <div className={'absolute font-mono text-3xl text-green-500'}>WELCOME TO PRIVATE APP!!</div>
      <div className={'absolute top-0 left-0 font-mono'}>
        <div className={'text-2xl text-red-700'}>TODO:</div>
        <p>English 게시물 삭제시 관련이미지 추적삭제</p>
        <p>
          비디오 페이지 - 좋아요 목록이랑 비슷한데 태그를 가지고 있고 체크된 비디오 리스트 원하는
          구글계정에 바로 재생목록생성 되게
        </p>
        <p>Task 페이지 - 할일 목록 정리/ 완료율 / 타이머 / 알림</p>
        <div className={cn('flex w-[200px] flex-col', isShow ? 'flex' : 'hidden')}>
          <img src={'./AQR.png'} alt={'aqr.png'} width={'200px'} />
          <Button
            variant={'ghost'}
            className={'btn-submit cursor-pointer text-sm'}
            onClick={() => window.electronAPI.openExternal('https://aq.gy/f/lcX5G')}
          >
            커피 한잔만 기부하로가기 😍
          </Button>
          <Button
            onClick={() => setIsShow(false)}
            variant={'secondary'}
            className={'w-full cursor-pointer text-sm hover:underline'}
          >
            뭔놈의 커피야. 꺼지쇼 😱
          </Button>
        </div>
      </div>
    </div>
  );
}

function Renderer({ width }: { width: number }) {
  const { theme } = useTheme();
  const robotRef = useRef<RobotSkinnedRef>(null);
  if (!width) return null;

  return (
    <>
      <RobotSkinned
        modelUrl="./RobotExpressive.glb"
        initialState="Walking"
        background={theme === 'dark' ? '#0b0b0e' : '#ffffff'}
        showGround
        width={width}
        ref={robotRef}
      />
      <div className="controls absolute bottom-10 w-full">
        <div className={'flex items-center justify-end gap-4 pr-10'}>
          <Button onClick={() => robotRef.current?.playState('Walking')}>Walking</Button>
          <Button onClick={() => robotRef.current?.playState('Running')}>Run</Button>
          <Button onClick={() => robotRef.current?.playEmote('Wave')}>Wave</Button>
        </div>
      </div>
    </>
  );
}
