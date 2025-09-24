import { Link, useLocation } from 'react-router-dom';

export default function Navigator() {
  const { pathname } = useLocation();
  const routes = [
    { path: '/', label: 'Home' },
    { path: '/channels', label: 'Channels' },
    { path: '/search-videos', label: 'Search Videos' },
    { path: '/search-videos/result', label: 'Result' },
    { path: '/no-api', label: 'No API' },
    { path: '/about', label: 'About' },
  ];
  return (
    <div className={'text-lg flex gap-4 w-full justify-start px-4 py-3'}>
      {routes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          className={pathname === route.path ? 'text-blue-500' : ''}
        >
          {route.label}
        </Link>
      ))}
    </div>
  );
}
