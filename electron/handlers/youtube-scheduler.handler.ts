import { ipcMain } from 'electron';
import { youtubeScheduler } from '../services/youtube.scheduler';

export function registerSchedulerHandlers() {
  // 스케줄러 시작
  ipcMain.handle('scheduler:start', async (_, schedule?: string) => {
    try {
      const success = youtubeScheduler.startScheduler(schedule);
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 스케줄러 중지
  ipcMain.handle('scheduler:stop', async () => {
    try {
      const success = youtubeScheduler.stopScheduler();
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 즉시 실행
  ipcMain.handle('scheduler:runNow', async () => {
    try {
      const result = await youtubeScheduler.runNow();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 상태 조회
  ipcMain.handle('scheduler:getStatus', async () => {
    return youtubeScheduler.getStatus();
  });

  // YouTube API Key 설정
  ipcMain.handle('youtube:setApiKey', async (_, apiKey: string) => {
    try {
      youtubeScheduler.setAPIKey(apiKey);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // API Key 상태 확인
  ipcMain.handle('youtube:getApiKeyStatus', async () => {
    return youtubeScheduler.getAPIKeyStatus();
  });
}
