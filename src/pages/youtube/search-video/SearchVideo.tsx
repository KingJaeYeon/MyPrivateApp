import { WatchLog } from '@/pages/youtube/search-video/components/WatchLog.tsx';
import { ActionsButtons } from '@/pages/youtube/search-video/components/ActionsButtons.tsx';
import { FilterOptions } from '@/pages/youtube/search-video/components/FilterOptions.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router-dom';
import useSettingStore from '@/store/useSettingStore.ts';

export default function SearchVideo() {
  const usedQuota = useSettingStore((r) => r.data.youtube.usedQuota);
  return (
    <div className={'flex h-full w-full flex-1 flex-col p-4'}>
      <div className={'flex flex-1 flex-col gap-4'}>
        <FilterOptions />
        <div className={'flex justify-between'}>
          <ActionsButtons />
          <Link to={'/search-videos/result'}>
            <Button variant={'outline'}>결과 보기</Button>
          </Link>
        </div>
        <div>
          사용한 쿼터: <span className={'font-mono'}>{usedQuota.toLocaleString()} / 10000</span>
        </div>
      </div>
      <WatchLog />
    </div>
  );
}
