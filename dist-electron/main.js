import { ipcMain, app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
const storePromise = import("./index-BtDbqZmo.js").then((m) => new m.default({ name: "config" }));
function setupConfigHandlers() {
  ipcMain.handle("config:get", async (_e, key) => {
    const store = await storePromise;
    return key ? store.get(key) : store.store;
  });
  ipcMain.handle("config:set", async (_e, key, value) => {
    const store = await storePromise;
    store.set(key, value);
    return true;
  });
  ipcMain.handle("config:clear", async () => {
    const store = await storePromise;
    store.clear();
    return true;
  });
  ipcMain.handle("config:deleteKey", async (_e, key) => {
    const store = await storePromise;
    store.delete(key);
    return true;
  });
}
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const isDev = !app.isPackaged;
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    show: false,
    width: 1100,
    height: 800,
    trafficLightPosition: { x: 12, y: 10 },
    titleBarStyle: "hidden",
    frame: false,
    ...process.platform !== "darwin" ? { titleBarOverlay: true } : {},
    backgroundColor: "#0b0b0e",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      sandbox: false
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (isDev) {
    win.loadURL("http://localhost:5173/#/");
  } else {
    const indexHtml = path.join(__dirname, "../renderer/dist/index.html");
    const fileUrl = pathToFileURL(indexHtml).toString();
    win.loadURL(`${fileUrl}#/`);
  }
  win.once("ready-to-show", () => {
    win == null ? void 0 : win.show();
  });
  win.on("enter-full-screen", () => win == null ? void 0 : win.webContents.send("fullscreen-changed", true));
  win.on("leave-full-screen", () => win == null ? void 0 : win.webContents.send("fullscreen-changed", false));
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  setupConfigHandlers();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
