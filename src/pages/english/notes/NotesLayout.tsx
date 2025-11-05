import { Outlet } from 'react-router-dom';
import { NoteList } from '@/pages/english/notes/components/NoteList.tsx';

export default function NotesLayout() {
  return (
    <div className="flex h-full w-full gap-5 px-4 pb-4">
      {/* 좌측 리스트 */}
      <NoteList />
      <div className="h-full flex-1">
        <Outlet />
      </div>
    </div>
  );
}
