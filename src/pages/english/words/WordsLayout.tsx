import { WordList } from '@/pages/english/words/components/WordList.tsx';
import { Outlet } from 'react-router-dom';

export default function WordsLayout() {
  return (
    <div className="flex h-full w-full gap-5 px-4 pb-4">
      {/* 좌측 리스트 */}
      <WordList />
      <div className="h-full flex-1">
        <Outlet />
      </div>
    </div>
  );
}
