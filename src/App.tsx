import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import Navigator from '@/components/Navigator';
import ModalRenderer from '@/components/ModalRenderer';
import { useEffect } from 'react';
import useSettingStore from '@/store/useSettingStore';
import useTagStore from '@/store/useTagStore';
import useChannelStore from '@/store/useChannelStore';

export default function App() {
  const { location, name } = useSettingStore((r) => r.data.folder);
  const { init: tagInit } = useTagStore();
  const { init: channelInit } = useChannelStore();

  useEffect(() => {
    async function start() {
      if (location) {
        try {
          await channelInit(`${location}/${name.channel}`);
          await tagInit(`${location}/${name.tag}`);
          console.log('API Store initialized');
        } catch (e) {
          console.error(e);
        }
      }
    }
    start();
  }, [location, name.channel, name.tag, channelInit, tagInit]);

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
