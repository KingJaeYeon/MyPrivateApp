/// <reference types="vite-plugin-electron/electron-env" />

import {AppPathKey} from "./app-service.ts";

declare namespace NodeJS {
    interface ProcessEnv {
        /**
         * The built directory structure
         *
         * ```tree
         * ├─┬─┬ dist
         * │ │ └── index.html
         * │ │
         * │ ├─┬ dist-electron
         * │ │ ├── main.js
         * │ │ └── preload.js
         * │
         * ```
         */
        APP_ROOT: string
        /** /dist/ or /public/ */
        VITE_PUBLIC: string
    }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
    ipcRenderer: import('electron').IpcRenderer
    pref: {
        get: <K extends keyof Config>(key: K) => Promise<Config[K]>
        set: <K extends keyof Config>(key: K, value: Config[K]) => Promise<boolean>
        clear: () => Promise<boolean>
        deleteKey: (key: keyof Config) => Promise<boolean>
    }
    electronAPI: {
        winMinimize: () => void
        winMaxToggle: () => void // mac은 full screen, win은 maximize 토글
        winClose: () => void
        onFullscreenChange: (cb: (isFullscreen: boolean) => void) => () => void
        openExternal: (url: string) => void
    }
    api: {
        pickFolder: (opts?: { defaultPath?: string }) => Promise<string | null>
        getAppPath: (key: AppPathKey) => Promise<string>
    }
}
