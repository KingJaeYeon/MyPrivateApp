// main/services/config-service.ts
import {ipcMain} from 'electron';

const storePromise = import("electron-store").then(m => new m.default({name: "config"}));

function setupConfigHandlers() {
    ipcMain.handle("config:get", async (_e: any, key: any) => {
        const store = await storePromise;
        return key ? store.get(key) : store.store;
    });

    ipcMain.handle("config:set", async (_e: any, key: any, value: unknown) => {
        const store = await storePromise;
        store.set(key, value);
        return true;
    });

    ipcMain.handle("config:clear", async () => {
        const store = await storePromise;
        store.clear();
        return true;
    });

    ipcMain.handle("config:deleteKey", async (_e: any, key: any) => {
        const store = await storePromise;
        store.delete(key);
        return true;
    });
}

export {setupConfigHandlers}