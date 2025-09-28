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
contextBridge.exposeInMainWorld('pref', {
  get: (key: string) => ipcRenderer.invoke('config:get', key),
  set: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),
  clear: () => ipcRenderer.invoke('config:clear'),
  deleteKey: (key: string) => ipcRenderer.invoke('config:deleteKey', key),
})

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url: string) => shell.openExternal(url),
})



contextBridge.exposeInMainWorld('api', {
  // 폴더 선택 다이얼로그를 띄우고 절대경로(string|null) 반환
  pickFolder: async (opts?: { defaultPath?: string }) => {
    const path = await ipcRenderer.invoke('dialog:openDirectory', { defaultPath: opts?.defaultPath })
    return path as string | null
  },

  // app.getPath - 허용된 키만 main에서 검증하여 반환
  getAppPath: async (key: string) => {
    const p = await ipcRenderer.invoke('app:getPath', key)
    return p as string
  },
})