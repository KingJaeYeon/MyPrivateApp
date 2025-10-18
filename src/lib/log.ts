import { useLogStore } from '@/store/useLogStore.ts';
import useSettingStore from '@/store/useSettingStore.ts';

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
