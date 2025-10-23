import { Link, useLocation, useBlocker } from 'react-router-dom';
import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import { navigationRoutes } from '@/routes';
import useSettingStore from '@/store/useSettingStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';
import usePromptsStore from '@/store/usePromptsStore.ts';

export default function Navigator() {
  const { pathname } = useLocation();
  const { isChanged: isChangedT } = useTagStore();
  const { isChanged: isChangedC } = useChannelStore();
  const { isChanged: isChangedR } = useReferenceStore();
  const { isChanged: isChangedP } = usePromptsStore();
  const { data } = useSettingStore();

  // 네비게이션 차단
  useBlocker(({ currentLocation, nextLocation }) => {
    const isChange = isChangedT || isChangedC || isChangedR || isChangedP;
    if (!data.hasFile && currentLocation.pathname !== nextLocation.pathname) {
      alert('Excel 생성버튼을 클릭해주세요.');
      return true;
    }

    if (isChange && currentLocation.pathname !== nextLocation.pathname) {
      alert('저장 후 이동해주세요');
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
