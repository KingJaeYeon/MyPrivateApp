import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import {
  setupConfigHandlers,
  setupAppHandlers,
  setupFsHandlers,
  setupExcelHandlers,
} from './handlers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
    titleBarStyle: 'hidden',
    frame: false,
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    backgroundColor: '#0b0b0e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
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

ipcMain.handle('app:openExternal', async (_e, url: string) => {
  if (!/^https?:\/\//i.test(url) && !/^mailto:|^file:\/\//i.test(url)) {
    throw new Error('Invalid URL scheme');
  }
  await shell.openExternal(url);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  setupConfigHandlers();
  setupAppHandlers();
  setupFsHandlers();
  setupExcelHandlers();
});
