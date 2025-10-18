import { Link, useLocation } from 'react-router-dom';
import useTagStore from '@/store/tag.ts';

export default function Navigator() {
  const { pathname } = useLocation();
  const isChanged = useTagStore((state) => state.isChanged);
  const routes = [
    { path: '/', label: 'Home' },
    { path: '/tags', label: 'Tags' },
    { path: '/channels', label: 'Channels' },
    { path: '/search-videos', label: 'Search Videos' },
    { path: '/search-videos/result', label: 'Result' },
    { path: '/prompt', label: 'Prompt' },
    { path: '/reference', label: 'Reference' },
  ];
  return (
    <div className={'flex w-full justify-start gap-4 px-4 py-3 text-lg'}>
      {routes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          className={pathname === route.path ? 'text-blue-500' : ''}
          onClick={(e) => {
            if (isChanged) {
              alert('태그 저장 후 이동하세요.');
              e.preventDefault();
            }
          }}
        >
          {route.label}
        </Link>
      ))}
    </div>
  );
}
