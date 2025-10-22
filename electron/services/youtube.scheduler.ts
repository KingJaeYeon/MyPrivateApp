import type { ScheduledTask } from 'node-cron';
import cron from 'node-cron';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';
import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';

const configStore = new Store();

type SchedulerJob = {
  task: ScheduledTask;
  schedule: string;
  lastRun?: Date;
  isRunning: boolean;
};

class YoutubeScheduler {
  private jobs: Map<string, SchedulerJob> = new Map();
  private baseURL: string = 'https://www.googleapis.com/youtube/v3';

  private getAPIKey(): string {
    return configStore.get('youtubeApiKey', '') as string;
  }

  // Excel 읽기 (xlsx 사용)
  private async readExcel(filePath: string): Promise<any[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      return data;
    } catch (error) {
      console.error('Excel 읽기 실패:', error);
      return [];
    }
  }

  // Excel 쓰기 (xlsx 사용)
  private async writeExcel(filePath: string, data: any[]): Promise<void> {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, filePath);
    } catch (error) {
      console.error('Excel 쓰기 실패:', error);
      throw error;
    }
  }

  // 채널 데이터 가져오기 (YouTube API)
  async fetchChannelData(channelIds: string[]): Promise<any[]> {
    const apiKey = this.getAPIKey();

    if (!apiKey) {
      throw new Error('YouTube API Key가 설정되지 않았습니다.');
    }

    const batchSize = 50;
    const results = [];

    for (let i = 0; i < channelIds.length; i += batchSize) {
      const batch = channelIds.slice(i, i + batchSize);

      const params = new URLSearchParams({
        part: 'snippet,statistics',
        id: batch.join(','),
        key: apiKey,
      });

      const url = `${this.baseURL}/channels?${params}`;
      console.log(
        `📡 YouTube API 호출 (${i + 1}-${Math.min(i + batchSize, channelIds.length)}/${channelIds.length})`
      );

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `YouTube API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        results.push(...data.items);
      }

      // API rate limit 방지
      if (i + batchSize < channelIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // 채널 데이터 수집 메인 로직
  async collectChannelData(): Promise<{
    success: boolean;
    count?: number;
    total?: number;
    message?: string;
  }> {
    console.log('🔄 채널 데이터 수집 시작...');

    try {
      // 1. 설정에서 경로 가져오기
      const folderLocation = configStore.get('folder.location', '') as string;
      const channelFileName = configStore.get('folder.name.channel', 'channels.xlsx') as string;
      const channelsPath = path.join(folderLocation, channelFileName);

      if (!folderLocation) {
        throw new Error('폴더 경로가 설정되지 않았습니다.');
      }

      if (!fs.existsSync(channelsPath)) {
        throw new Error('channels.xlsx 파일을 찾을 수 없습니다.');
      }

      // 2. channels.xlsx에서 기존 데이터 읽기
      const existingChannels: ChannelColumns[] = await this.readExcel(channelsPath);

      if (!existingChannels || existingChannels.length === 0) {
        console.log('❌ 수집할 채널이 없습니다.');
        return { success: false, message: '채널이 없습니다' };
      }

      const channelIds = existingChannels.map((c) => c.channelId).filter(Boolean);

      if (channelIds.length === 0) {
        return { success: false, message: '유효한 채널 ID가 없습니다' };
      }

      console.log(`📊 수집 대상: ${channelIds.length}개 채널`);

      // 3. YouTube API 호출
      const results = await this.fetchChannelData(channelIds);

      console.log(`✅ API 응답: ${results.length}개 채널`);

      // 4. API 응답을 Map으로 변환
      const apiDataMap = new Map(
        results.map((item) => [
          item.id,
          {
            viewCount: parseInt(item.statistics?.viewCount || '0'),
            subscriberCount: parseInt(item.statistics?.subscriberCount || '0'),
            videoCount: parseInt(item.statistics?.videoCount || '0'),
            icon: item.snippet?.thumbnails?.default?.url || '',
            name: item.snippet?.title || '',
          },
        ])
      );

      // 5. 기존 데이터와 병합
      const timestamp = new Date().toISOString();
      const updatedChannels = existingChannels.map((channel) => {
        const apiData = apiDataMap.get(channel.channelId);

        if (apiData) {
          return {
            ...channel,
            viewCount: apiData.viewCount,
            subscriberCount: apiData.subscriberCount,
            videoCount: apiData.videoCount,
            icon: apiData.icon || channel.icon,
            name: apiData.name || channel.name,
            fetchedAt: timestamp,
          };
        }

        return channel;
      });

      // 6. channels.xlsx 덮어쓰기
      await this.writeExcel(channelsPath, updatedChannels);
      console.log('💾 channels.xlsx 업데이트 완료');

      // 7. channels-history.xlsx에 추가
      const historyData = updatedChannels
        .filter((c) => apiDataMap.has(c.channelId))
        .map((c) => ({
          timestamp,
          channelId: c.channelId,
          name: c.name,
          subscriberCount: c.subscriberCount,
          videoCount: c.videoCount,
          viewCount: c.viewCount,
        }));

      await this.appendToHistory(historyData);

      console.log('✅ 채널 데이터 수집 완료:', results.length);

      // 8. Renderer에 알림
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('channels:updated', {
          count: results.length,
          total: existingChannels.length,
          timestamp,
        });
      }

      return {
        success: true,
        count: results.length,
        total: existingChannels.length,
      };
    } catch (error: any) {
      console.error('❌ 채널 데이터 수집 실패:', error);

      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('channels:error', {
          message: error.message,
        });
      }

      return { success: false, message: error.message };
    }
  }

  // channels-history.xlsx에 히스토리 추가
  async appendToHistory(historyData: any[]): Promise<void> {
    const folderLocation = configStore.get('folder.location', '') as string;
    const historyPath = path.join(folderLocation, 'channels-history.xlsx');

    let existingHistory: any[] = [];

    // 기존 히스토리 읽기
    if (fs.existsSync(historyPath)) {
      try {
        existingHistory = await this.readExcel(historyPath);
      } catch (e) {
        console.log('히스토리 읽기 실패, 새로 생성');
      }
    }

    const allHistory = [...existingHistory, ...historyData];

    await this.writeExcel(historyPath, allHistory);
    console.log('📊 히스토리 추가:', historyData.length);
  }

  // 스케줄러 시작
  startScheduler(schedule: string = '0 */6 * * *'): boolean {
    if (this.jobs.has('channelSync')) {
      console.log('⚠️ 스케줄러가 이미 실행 중입니다.');
      return false;
    }

    if (!cron.validate(schedule)) {
      console.error('❌ 잘못된 cron 표현식:', schedule);
      return false;
    }

    const task: ScheduledTask = cron.schedule(
      schedule,
      async () => {
        const job = this.jobs.get('channelSync');
        if (job) {
          job.lastRun = new Date();
          job.isRunning = true;
        }

        try {
          await this.collectChannelData();
        } catch (error) {
          console.error('스케줄러 작업 실패:', error);
        } finally {
          if (job) {
            job.isRunning = false;
          }
        }
      },
      {
        // scheduled: false,
      }
    );

    this.jobs.set('channelSync', {
      task,
      schedule,
      isRunning: false,
    });

    task.start();
    console.log('✅ 스케줄러 시작:', schedule);

    configStore.set('scheduler.schedule', schedule);
    configStore.set('scheduler.enabled', true);

    return true;
  }

  // 스케줄러 중지
  stopScheduler(): boolean {
    const job = this.jobs.get('channelSync');
    if (job) {
      job.task.stop();
      this.jobs.delete('channelSync');
      console.log('⏹️ 스케줄러 중지');

      configStore.set('scheduler.enabled', false);
      return true;
    }
    return false;
  }

  // 즉시 실행
  async runNow(): Promise<any> {
    console.log('▶️ 수동 실행...');
    return await this.collectChannelData();
  }

  // 상태 조회
  getStatus(): any {
    const job = this.jobs.get('channelSync');
    const schedule = configStore.get('scheduler.schedule', '0 */6 * * *') as string;

    return {
      isRunning: job?.isRunning || false,
      isEnabled: !!job,
      schedule: job?.schedule || schedule,
      lastRun: job?.lastRun || null,
    };
  }

  // API Key 설정
  setAPIKey(apiKey: string): void {
    configStore.set('youtubeApiKey', apiKey);
    console.log('✅ YouTube API Key 저장됨');
  }

  getAPIKeyStatus(): boolean {
    const apiKey = this.getAPIKey();
    return !!apiKey && apiKey.length > 0;
  }
}

export const youtubeScheduler = new YoutubeScheduler();
