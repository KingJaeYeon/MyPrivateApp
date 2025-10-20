// import { Link, useLocation } from 'react-router-dom';
// import useTagStore from '@/store/useTagStore.ts';
// import useChannelStore from '@/store/useChannelStore.ts';
//
// export default function Navigator() {
//   const { pathname } = useLocation();
//   const { isChanged } = useTagStore();
//   const { isChanged: isChangedC } = useChannelStore();
//   const routes = [
//     { path: '/', label: 'Home' },
//     { path: '/tags', label: 'Tags' },
//     { path: '/channels', label: 'Channels' },
//     { path: '/search-videos', label: 'Search Videos' },
//     { path: '/search-videos/result', label: 'Result' },
//     { path: '/prompt', label: 'Prompt' },
//     { path: '/reference', label: 'Reference' },
//   ];
//   return (
//     <div className={'flex w-full justify-start gap-4 px-4 py-3 text-lg'}>
//       {routes.map((route) => (
//         <Link
//           key={route.path}
//           to={route.path}
//           className={pathname === route.path ? 'text-blue-500' : ''}
//           onClick={(e) => {
//             if (isChanged) {
//               alert('태그 저장 후 이동하세요.');
//               e.preventDefault();
//             }
//             if (isChangedC) {
//               alert('채널 저장 후 이동하세요.');
//               e.preventDefault();
//             }
//           }}
//         >
//           {route.label}
//         </Link>
//       ))}
//     </div>
//   );
// }
import { Link, useLocation, useBlocker } from 'react-router-dom';
import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import { navigationRoutes } from '@/routes';

export default function Navigator() {
  const { pathname } = useLocation();
  const { isChanged: isChangedT } = useTagStore();
  const { isChanged: isChangedC } = useChannelStore();

  // 네비게이션 차단
  useBlocker(({ currentLocation, nextLocation }) => {
    const isChange = isChangedT || isChangedC;
    if (isChange && currentLocation.pathname !== nextLocation.pathname) {
      const message = isChangedT ? '태그 저장 후 이동하세요.' : '채널 저장 후 이동하세요.';
      alert(message);
      return true;
    }
    return false;
  });

  return (
    <div className={'flex w-full justify-start gap-4 px-4 py-3 text-lg'}>
      {navigationRoutes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          className={
            pathname === route.path ? 'text-blue-500' : 'cursor-pointer hover:text-gray-400'
          }
        >
          {route.label}
        </Link>
      ))}
    </div>
  );
}
