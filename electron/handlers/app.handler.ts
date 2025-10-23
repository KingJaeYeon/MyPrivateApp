// main/main.ts
import { app, dialog, ipcMain, shell } from 'electron';
import OpenDialogOptions = Electron.OpenDialogOptions;
import * as os from 'node:os';
import pidusage from 'pidusage';

export type AppPathKey =
  | 'home'
  | 'appData'
  | 'userData'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos';

export function setupAppHandlers() {
  // 폴더 선택 - single folder path 반환 또는 null
  ipcMain.handle('dialog:openDirectory', async (_e, opts?: OpenDialogOptions) => {
    // 윈도우 인자 없이 옵션만 전달
    const res = await dialog.showOpenDialog({
      // 기본값 + 호출자가 덮어쓸 수 있게 머지
      properties: ['openDirectory', 'createDirectory', ...(opts?.properties ?? [])],
      defaultPath: opts?.defaultPath,
      title: opts?.title ?? 'Select folder',
      buttonLabel: opts?.buttonLabel,
    });
    return res.canceled || res.filePaths.length === 0 ? null : res.filePaths[0];
  });

  // app.getPath 노출 (허용된 키만)
  const ALLOWED_APP_PATH_KEYS = new Set([
    'home',
    'appData',
    'userData',
    'temp',
    'exe',
    'module',
    'desktop',
    'documents',
    'downloads',
    'music',
    'pictures',
    'videos',
  ]);

  ipcMain.handle('app:getPath', (_event, key: AppPathKey) => {
    if (!ALLOWED_APP_PATH_KEYS.has(key)) {
      throw new Error('app:getPath: key not allowed');
    }
    return app.getPath(key);
  });

  ipcMain.handle('app:openFolder', async (_event, folderPath: string) => {
    if (!folderPath) return false;
    await shell.openPath(folderPath); // mac은 Finder, win은 Explorer에서 열림
    return true;
  });

  ipcMain.handle('app:openExternal', async (_e, url: string) => {
    if (!/^https?:\/\//i.test(url) && !/^mailto:|^file:\/\//i.test(url)) {
      throw new Error('Invalid URL scheme');
    }
    await shell.openExternal(url);
    return true;
  });

  ipcMain.handle('app:getMemoryInfo', async (_e) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const { cpu, memory, pid } = await pidusage(process.pid);
    return {
      totalMem,
      freeMem,
      appMem: memory, // bytes
      cpu, // percent (0–100)
      pid,
    };
  });
}
