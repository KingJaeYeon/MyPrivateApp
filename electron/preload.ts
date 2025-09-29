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



contextBridge.exposeInMainWorld('fsApi', {
  exists: (p: string) => ipcRenderer.invoke('fs:exists', p),
  ensureDir: (dir: string) => ipcRenderer.invoke('fs:ensureDir', dir),
  list: (dir: string, opts?: any) => ipcRenderer.invoke('fs:list', dir, opts),
  listExcel: (dir: string) => ipcRenderer.invoke('fs:listExcel', dir),
  readText: (p: string, enc?: string) => ipcRenderer.invoke('fs:readText', p, enc),
  writeText: (p: string, c: string, enc?: string) => ipcRenderer.invoke('fs:writeText', p, c, enc),
  readBinary: (p: string) => ipcRenderer.invoke('fs:readBinary', p),
  writeBinary: (p: string, data: Uint8Array) => ipcRenderer.invoke('fs:writeBinary', p, data),
  rm: (p: string, opts?: { recursive?: boolean; force?: boolean }) => ipcRenderer.invoke('fs:rm', p, opts),
  rename: (from: string, to: string) => ipcRenderer.invoke('fs:rename', from, to),
  safeWriteText: (base: string, rel: string, c: string) => ipcRenderer.invoke('fs:safeWriteText', base, rel, c),
})