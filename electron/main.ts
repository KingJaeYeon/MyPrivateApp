import { app, BrowserWindow, dialog, ipcMain } from 'electron';
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
    minWidth: 1400,
    minHeight: 600,
    trafficLightPosition: { x: 12, y: 10 },
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : undefined,
    frame: false,
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    backgroundColor: '#0b0b0e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      webviewTag: true,
    },
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

app.whenReady().then(async () => {
  const isAllowed = await _fn_auth_c12();

  if (!isAllowed) {
    // 2. 차단된 경우 사용자에게 알림 후 즉시 종료
    dialog.showMessageBoxSync({
      type: 'error',
      title: '서비스 종료',
      message: '앱 서비스가 종료되어 더 이상 사용할 수 없습니다.',
    });
    app.quit(); // 앱 전체 종료
    return; // 윈도우 생성 방지
  }
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

const _fn_auth_c12 = async () => {
  try {
    const response = await fetch(
      'https://myprivateapp-license-server-1030446705369.asia-northeast3.run.app/api/status'
    );
    const data = await response.json();
    return data.allowed; // true 또는 false 반환
  } catch (error) {
    console.error('서버 접속 실패:', error);
    // 서버 접속 실패 시 오프라인 모드 처리를 위해 로컬 백업 로직을 사용합니다.
    // 여기서는 간단하게 **임시로 true를 반환**하거나, **하드코딩된 MAX_OFFLINE_DATE**를 확인합니다.
    // 복잡성을 피하기 위해 여기서는 임시 true를 가정하지만, 실제로는 오프라인 정책이 필요합니다.

    // (대안: 로컬에서 MAX_OFFLINE_DATE 확인 후 반환)
    const MAX_OFFLINE_DATE = new Date('2026-03-31');
    return new Date() < MAX_OFFLINE_DATE;
  }
};
