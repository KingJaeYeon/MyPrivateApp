/// <reference types="vite/client" />
import type { FilterData } from '@/store/search-video.ts';
import type { VideoRow } from '@/service/youtube.ts';

interface Config {
    // 앱 설정
    youtubeApiKey?: string;
    youtubeApiKeyQuota?: number;
    youtubeApiKeyPending?: { apiKey: string; usedQuota: number }[];
    youtubeHistory?: { data: FilterData; result: VideoRow[]; searchedAt: number }[];
}

declare global {
    interface Window {
        pref: {
            get: <K extends keyof Config>(key: K) => Promise<Config[K]>;
            set: <K extends keyof Config>(key: K, value: Config[K]) => Promise<boolean>;
            clear: () => Promise<boolean>;
            deleteKey: (key: keyof Config) => Promise<boolean>;
        };
        electronAPI: {
            winMinimize: () => void;
            winMaxToggle: () => void; // mac은 full screen, win은 maximize 토글
            winClose: () => void;
            onFullscreenChange: (cb: (isFullscreen: boolean) => void) => () => void;
            openExternal: (url: string) => void;
        };
    }
}

export {}; // 👈 이 줄이 매우 중요!
