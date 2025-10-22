import { ipcMain } from 'electron';
import { youtubeScheduler } from '../services/youtube.scheduler';

export function registerSchedulerHandlers() {
  ipcMain.handle('scheduler:start', async (_, rule?: string) => {
    try {
      const success = youtubeScheduler.startScheduler(rule);
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('scheduler:stop', async () => {
    try {
      const success = youtubeScheduler.stopScheduler();
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('scheduler:runNow', async () => {
    try {
      const result = await youtubeScheduler.runNow();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('scheduler:getStatus', async () => {
    return youtubeScheduler.getStatus();
  });
}
