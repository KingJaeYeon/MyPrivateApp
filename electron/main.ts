import {app, BrowserWindow} from 'electron'
import {createRequire} from 'node:module'
import {fileURLToPath, pathToFileURL} from 'node:url'
import path from 'node:path'

import {setupConfigHandlers} from './config-service.ts'
const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
const isDev = !app.isPackaged;
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
let win: BrowserWindow | null


function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        show: false,
        width: 1100,
        height: 800,
        trafficLightPosition: { x: 12, y: 10 },
        titleBarStyle: 'hidden',
        frame: false,
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        backgroundColor: "#0b0b0e",
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: true,
            sandbox: false,
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (isDev) {
        win.loadURL("http://localhost:5173/#/");
    } else {
        const indexHtml = path.join(__dirname, "../renderer/dist/index.html");
        const fileUrl = pathToFileURL(indexHtml).toString();
        win.loadURL(`${fileUrl}#/`);
    }


    win.once("ready-to-show", () => {
        win?.show()
    });

    // 전체화면 상태 브로드캐스트
    win.on("enter-full-screen", () => win?.webContents.send("fullscreen-changed", true));
    win.on("leave-full-screen", () => win?.webContents.send("fullscreen-changed", false));

}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    createWindow()
    setupConfigHandlers()
})
