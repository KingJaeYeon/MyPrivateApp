import {ipcRenderer, contextBridge, shell} from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Expose some config API to the Renderer process ---------
contextBridge.exposeInMainWorld("pref", {
  get: (key: any) => ipcRenderer.invoke("config:get", key),
  set: (key: any, value: any) => ipcRenderer.invoke("config:set", key, value),
  clear: () => ipcRenderer.invoke("config:clear"),
  deleteKey: (key: any) => ipcRenderer.invoke("config:deleteKey", key),
});

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) => shell.openExternal(url),
});