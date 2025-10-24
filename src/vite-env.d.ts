/// <reference types="vite/client" />
import { AppPathKey } from '../electron/handlers';

interface Config {
  settings: State['data'];
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
      openExternal: (url: string) => void;
      pickFolder: (opts?: { defaultPath?: string }) => Promise<string | null>;
      getAppPath: (key: AppPathKey) => Promise<string>;
      openFolder: (path: string) => Promise<boolean>;
      getMemoryInfo: () => Promise<{
        totalMem: number;
        freeMem: number;
        appMem: number; // bytes
        cpu: number; // percent (0–100)
        pid: number;
      }>;
    };
    fsApi: {
      // existence & directory
      exists: (p: string) => Promise<boolean>;
      ensureDir: (dir: string) => Promise<boolean>;
      list: (
        dir: string,
        opts?: {
          exts?: string[];
          excludeHidden?: boolean;
          includeDirs?: boolean;
          sortBy?: 'name' | 'mtime' | 'size';
          desc?: boolean;
        }
      ) => Promise<
        Array<{
          name: string;
          fullPath: string;
          isDir: boolean;
          size: number;
          mtimeMs: number;
          ext: string;
        }>
      >;
      listExcel: (dir: string) => Promise<string[]>;
      // text/binary IO
      readText: (p: string, encoding?: BufferEncoding) => Promise<string>;
      writeText: (p: string, content: string, encoding?: BufferEncoding) => Promise<boolean>;
      readBinary: (p: string) => Promise<Uint8Array>;
      writeBinary: (p: string, data: Uint8Array) => Promise<boolean>;

      // file ops
      rm: (p: string, opts?: { recursive?: boolean; force?: boolean }) => Promise<boolean>;
      rename: (fromPath: string, toPath: string) => Promise<boolean>;

      // safe write inside baseDir
      safeWriteText: (baseDir: string, relativePath: string, content: string) => Promise<string>;
    };
    excelApi: {
      create: (filePath: string, data: any[][]) => Promise<boolean>;
      read: (filePath: string) => Promise<any[]>;
      overwrite: (filePath: string, data: any[][], sheetName?: string) => Promise<boolean>;
      append: (filePath: string, rows: any[], sheetName?: string) => Promise<boolean>;
      delete: (filePath: string) => Promise<boolean>;
    };
    ipcRenderer: import('electron').IpcRenderer;

    schedulerApi: {
      start: (rule?: string) => Promise<{ success: boolean; error?: string }>;
      stop: () => Promise<{ success: boolean }>;
      runNow: () => Promise<{ success: boolean; count?: number; total?: number; message?: string }>;
      getStatus: () => Promise<{
        isRunning: boolean;
        isEnabled: boolean;
        rule: string;
      }>;
      onChannelsUpdated: (
        callback: (data: { count: number; total: number; timestamp: string }) => void
      ) => () => void;
      onChannelsError: (callback: (error: { message: string }) => void) => () => void;
    };
  }
}

export {}; // 👈 이 줄이 매우 중요!
