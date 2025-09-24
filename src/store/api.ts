import { create } from 'zustand';

type State = {
  youtubeApiKey: string;
  isOutOfQuota: boolean;
  usedQuota: number;
  pendingKeys: { apiKey: string; usedQuota: number }[];
};

type Action = {
  updateApiKey: (type: 'youtubeApiKey', apiKey: string) => Promise<void>;
  init: () => Promise<void>;
  deleteApiKey: (type: 'youtubeApiKey') => Promise<void>;
  updateQuota: (used: number) => void;
};

const useApiStore = create<State & Action>((set, get) => ({
  youtubeApiKey: '',
  isOutOfQuota: false,
  usedQuota: 0,
  pendingKeys: [],
  updateQuota: async (used) => {
    const quota = get().usedQuota;
    const nowUsed = used + quota;
    await window.pref.set('youtubeApiKeyQuota', nowUsed);
    set({ usedQuota: nowUsed });
  },
  updateApiKey: async (type, apiKey) => {
    if (type === 'youtubeApiKey') {
      await window.pref.set('youtubeApiKey', apiKey);
      set(() => ({ youtubeApiKey: apiKey }));
    }
  },
  init: async () => {
    const hasYoutubeApiKey = await window?.pref?.get('youtubeApiKey');
    if (hasYoutubeApiKey) {
      set(() => ({ youtubeApiKey: hasYoutubeApiKey }));
    }
    const usedQuota = (await window?.pref?.get('youtubeApiKeyQuota')) || 0;
    if (usedQuota) {
      set(() => ({ usedQuota }));
    }
  },
  deleteApiKey: async (type) => {
    if (type === 'youtubeApiKey') {
      await window.pref.deleteKey('youtubeApiKey');
      await window.pref.deleteKey('youtubeApiKeyQuota');
      set(() => ({ youtubeApiKey: '', usedQuota: 0 }));
    }
  },
}));

export default useApiStore;
