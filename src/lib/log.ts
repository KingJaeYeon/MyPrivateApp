import { useLogStore } from '@/store/search-video-log.ts';
import useSettingStore from '@/store/setting.ts';

const logApiRequest = (url: string) => {
  useLogStore.getState().note(`[API 요청] ${url}`);
};

const incrementQuota = async (amount: number) => {
  const settingStore = useSettingStore.getState();
  await settingStore.updateIn('youtube', {
    apiKey: settingStore.data.youtube.apiKey,
    usedQuota: settingStore.data.youtube.usedQuota + amount,
    quotaUpdatedAt: settingStore.data.youtube.quotaUpdatedAt,
  });
};

export { incrementQuota, logApiRequest };
