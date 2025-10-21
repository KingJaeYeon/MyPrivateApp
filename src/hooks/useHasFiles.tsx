import { useEffect } from 'react';
import useSettingStore from '@/store/useSettingStore.ts';
import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';

export default function useHasFiles() {
  const { location, name } = useSettingStore((r) => r.data.folder);
  const { updateIn } = useSettingStore();
  const { init: initT, reset: resetT } = useTagStore();
  const { init: initC, reset: resetC } = useChannelStore();
  const { init: initR, reset: resetR } = useReferenceStore();

  useEffect(() => {
    async function start() {
      if (location) {
        try {
          await initC(`${location}/${name.channel}`);
          await initT(`${location}/${name.tag}`);
          await initR(`${location}/${name.reference}`);
          await window.fsApi.listExcel(`${location}/${name.result.split('/')[0]}`);
          await updateIn('hasFile', true);
          console.log('API Store initialized');
        } catch (e) {
          resetC();
          resetT();
          resetR();
          await updateIn('hasFile', false);
        }
      }
    }
    start();
  }, [location, name.channel, name.tag]);
  return;
}
