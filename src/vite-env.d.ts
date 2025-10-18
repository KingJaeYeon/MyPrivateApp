/// <reference types="vite/client" />
import { AppPathKey } from '../electron/app-service.ts';

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
  }
}

export {}; // 👈 이 줄이 매우 중요!
