"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("pref", {
  get: (key) => electron.ipcRenderer.invoke("config:get", key),
  set: (key, value) => electron.ipcRenderer.invoke("config:set", key, value),
  clear: () => electron.ipcRenderer.invoke("config:clear"),
  deleteKey: (key) => electron.ipcRenderer.invoke("config:deleteKey", key)
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url) => electron.shell.openExternal(url)
});
