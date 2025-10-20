import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import Navigator from '@/components/Navigator';
import ModalRenderer from '@/components/ModalRenderer';
import useHasFiles from '@/hooks/useHasFiles.tsx';

export default function App() {
  useHasFiles();

  return (
    <>
      <div className="flex min-h-svh w-full flex-col items-center justify-center">
        <div
          className={
            'drag bg-secondary flex h-[36px] w-full items-center justify-between pr-[12px] pl-[80px] text-lg'
          }
        >
          <div className={'flex items-center gap-6'}>
            <p className={'text-sm'}>YouTube Searcher</p>
          </div>
          <ThemeToggle />
        </div>
        <Navigator />
        <Outlet />
      </div>
      <ModalRenderer />
    </>
  );
}
