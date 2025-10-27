import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import {
  setupConfigHandlers,
  setupAppHandlers,
  setupFsHandlers,
  setupExcelHandlers,
  registerSchedulerHandlers,
} from './handlers';
import Store from 'electron-store';
import { youtubeScheduler } from './services/youtube.scheduler.ts';

const configStore = new Store();
export const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 800,
    trafficLightPosition: { x: 12, y: 10 },
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
    frame: false,
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    backgroundColor: '#0b0b0e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // titleBarOverlay: {
    //   color: '#2f3241',
    //   symbolColor: '#74b1be',
    //   height: 36
    // },
    // acceptFirstMouse: true,
  });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const indexHtml = path.join(__dirname, '../dist/index.html');
    const fileUrl = pathToFileURL(indexHtml).toString();
    win.loadURL(`${fileUrl}#/`);
  }

  win.once('ready-to-show', () => {
    win?.show();
  });

  win.on('enter-full-screen', () => win?.webContents.send('fullscreen-changed', true));
  win.on('leave-full-screen', () => win?.webContents.send('fullscreen-changed', false));

  // 디버깅
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('did-fail-load:', { code, desc, url });
  });
  win.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    console.log('[renderer]', { level, message, line, sourceId });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
  setupConfigHandlers();
  setupAppHandlers();
  setupFsHandlers();
  setupExcelHandlers();
  // IPC 핸들러 등록
  registerSchedulerHandlers();
  // 앱 시작 시 저장된 설정으로 스케줄러 자동 시작 (선택사항)
  const schedulerEnabled = configStore.get('settings.scheduler.autoStart', false) as boolean;
  const rule = configStore.get('settings.scheduler.rule', '0 9 * * *') as string;

  if (schedulerEnabled) {
    youtubeScheduler.startScheduler(rule);
  }
});

// 앱 종료 시 스케줄러 정리
app.on('before-quit', () => {
  youtubeScheduler.stopScheduler();
});

ipcMain.handle('win:minimize', () => {
  if (win) win.minimize();
});
ipcMain.handle('win:maximize', () => {
  if (!win) return;
  if (process.platform === 'darwin') {
    // macOS는 보통 풀스크린 토글 선호
    win.setFullScreen(!win.isFullScreen());
  } else {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});
ipcMain.handle('win:close', () => {
  if (win) win.close();
});
