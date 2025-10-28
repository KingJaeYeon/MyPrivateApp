import { useTheme } from '@/providers/theme-provider.tsx';
import RobotSkinned, { RobotSkinnedRef } from './RobotSkinned';
import { useRef } from 'react';
import useMeasure from 'react-use-measure';
import { Button } from '@/components/ui/button.tsx';

export function Home() {
  const [ref1, { width }] = useMeasure();
  return (
    <div
      ref={ref1}
      className={'relative flex h-full w-full flex-1 flex-col items-center justify-center gap-6'}
    >
      <Renderer width={width} />
      <div className={'absolute font-mono text-3xl text-green-500'}>WELCOME TO PRIVATE APP!!</div>
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
