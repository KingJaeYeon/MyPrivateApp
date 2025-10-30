import schedule, { Job } from 'node-schedule';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';
import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import { addHours, isSameDay } from 'date-fns';

const configStore = new Store();

type SchedulerJob = {
  job: Job;
  rule: string;
  isRunning: boolean;
};
class YouTubeScheduler {
  private jobs: Map<string, SchedulerJob> = new Map();
  private baseURL: string = 'https://www.googleapis.com/youtube/v3';

  private getAPIKey(): string {
    const settings = configStore.get('settings') as any;
    return settings?.youtube?.apiKey || '';
  }

  // Excel 읽기 (xlsx 사용)
  private async readExcel(filePath: string): Promise<any[]> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      // XLSX.read 로 워크북 파싱
      const wb = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } catch (error) {
      console.error('Excel 읽기 실패:', error);
      return [];
    }
  }

  // Excel 쓰기 (xlsx 사용)
  private async overWriteExcel(filePath: string, data: any[]): Promise<void> {
    try {
      const parsed = path.parse(filePath);

      // 0) 상위 폴더 보장
      if (!fs.existsSync(parsed.dir)) {
        fs.mkdirSync(parsed.dir, { recursive: true });
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      // 3) 원자적 저장 (tmp → rename)
      const tmp = path.join(parsed.dir, `${parsed.name}.tmp${parsed.ext}`);
      fs.writeFileSync(tmp, wbout);
      fs.renameSync(tmp, filePath);
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

    let usedQuota = 0;
    for (let i = 0; i < channelIds.length; i += batchSize) {
      const batch = channelIds.slice(i, i + batchSize);
      usedQuota += 1;
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

    const quota = configStore.get('settings.youtube.usedQuota', 0);
    configStore.set('settings.youtube.usedQuota', Number(quota) + usedQuota);

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
      const folderLocation = configStore.get('settings.folder.location', '') as string;
      const channelFileName = configStore.get(
        'settings.folder.name.channel',
        'channels.xlsx'
      ) as string;
      const channelsPath = `${folderLocation}/${channelFileName}`;

      if (!folderLocation) {
        new Error('폴더 경로가 설정되지 않았습니다.');
      }

      if (!fs.existsSync(channelsPath)) {
        new Error(`${channelFileName} 파일을 찾을 수 없습니다.`);
      }

      // 2. channels.xlsx에서 기존 데이터 읽기
      const existingChannels: ChannelColumns[] = await this.readExcel(channelsPath);

      if (!existingChannels || existingChannels.length === 0) {
        console.log('❌ 수집할 채널이 없습니다.');
        return { success: false, message: '수집할 채널이 없습니다.' };
      }

      // 3. 같은날짜 갱신기록 있으면 패스
      const channelIds = existingChannels.map((c) => c.channelId).filter(Boolean);
      const fetchedAtMaps = Object.fromEntries(
        existingChannels.map((c) => [c.channelId, c.fetchedAt])
      );

      const channelIdsToFetch = channelIds.filter((channelId) => {
        const fetchedAt = fetchedAtMaps[channelId];

        if (!fetchedAt) return true;

        const fetchedDateInKorea = addHours(new Date(fetchedAt), 9);
        const nowInKorea = addHours(new Date(), 9);

        return !isSameDay(fetchedDateInKorea, nowInKorea);
      });

      if (channelIdsToFetch.length === 0) {
        console.log('❌이미 갱신이 완료된 상태입니다.');
        return { success: false, message: '이미 갱신이 완료된 상태입니다.' };
      }

      console.log(`📊 수집 대상: ${channelIdsToFetch.length}개 채널`);

      // 4. YouTube API 호출
      const results = await this.fetchChannelData(channelIdsToFetch);

      console.log(`✅ API 응답: ${results.length}개 채널`);

      // 5. API 응답을 Map으로 변환
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
        // 오늘 fetch 안 한 채널만 업데이트
        if (channelIdsToFetch.includes(channel.channelId)) {
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
        }

        return channel; // 오늘 이미 fetch했거나 API 응답 없으면 기존 데이터 유지
      });

      // 6. channels.xlsx 덮어쓰기
      const channelsSheet: any = configStore.get('settings.excel.channel', seedChannelHistory);
      const aoa = buildAoaFromObjects(updatedChannels, channelsSheet);
      await this.overWriteExcel(channelsPath, aoa);
      console.log('💾 channels.xlsx 업데이트 완료');

      // 7. channels-history.xlsx에 추가
      const historyData = updatedChannels
        .filter((c) => apiDataMap.has(c.channelId))
        .map((c) => ({
          fetchedAt: timestamp,
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
          total: channelIdsToFetch.length,
          timestamp,
        });
      }

      return {
        success: true,
        count: results.length,
        total: channelIdsToFetch.length,
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
    const folderLocation = configStore.get('settings.folder.location', '') as string;
    const historyFileName = configStore.get(
      'settings.folder.name.channelHistory',
      'channels-history.xlsx'
    ) as string;
    const historyPath = `${folderLocation}/${historyFileName}`;

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

    const historySheet: any = configStore.get('settings.excel.channelHistory', seedChannelHistory);
    const aoa = buildAoaFromObjects(allHistory, historySheet);
    await this.overWriteExcel(historyPath, aoa);
    console.log('📊 히스토리 추가:', historyData.length);
  }

  // 스케줄러 시작
  startScheduler(rule: string | schedule.RecurrenceRule = '0 0 * * *'): boolean {
    if (this.jobs.has('channelSync')) {
      console.log('⚠️ 스케줄러가 이미 실행 중입니다.');
      return false;
    }

    try {
      const job = schedule.scheduleJob('channelSync', rule, async (fireDate) => {
        const schedulerJob = this.jobs.get('channelSync');
        if (schedulerJob) {
          schedulerJob.isRunning = true;
        }

        console.log(`⏰ 스케줄 실행: ${fireDate}`);

        try {
          await this.collectChannelData();
        } catch (error) {
          console.error('스케줄러 작업 실패:', error);
        } finally {
          if (schedulerJob) {
            schedulerJob.isRunning = false;
          }
        }
      });

      if (!job) {
        console.error('❌ 스케줄러 생성 실패');
        return false;
      }

      this.jobs.set('channelSync', {
        job,
        rule: typeof rule === 'string' ? rule : 'RecurrenceRule',
        isRunning: false,
      });

      console.log('✅ 스케줄러 시작:', rule);
      console.log('📅 다음 실행:', job.nextInvocation()); // .toDate() 제거

      configStore.set('settings.scheduler.rule', rule);

      return true;
    } catch (error) {
      console.error('❌ 스케줄러 시작 실패:', error);
      return false;
    }
  }

  // 스케줄러 중지
  stopScheduler(): boolean {
    const schedulerJob = this.jobs.get('channelSync');
    if (schedulerJob) {
      schedulerJob.job.cancel();
      this.jobs.delete('channelSync');
      console.log('⏹️ 스케줄러 중지');

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
    const schedulerJob = this.jobs.get('channelSync');
    const rule = configStore.get('settings.scheduler.rule', '0 0 * * *') as string;
    return {
      isRunning: schedulerJob?.isRunning || false,
      isEnabled: !!schedulerJob,
      rule: schedulerJob?.rule || rule,
    };
  }

  // 모든 스케줄 정리
  cancelAllJobs(): void {
    this.jobs.forEach((schedulerJob, name) => {
      schedulerJob.job.cancel();
      console.log(`🗑️ 스케줄 취소: ${name}`);
    });
    this.jobs.clear();
  }
}

export const youtubeScheduler = new YouTubeScheduler();

function buildAoaFromObjects(
  rows: Record<string, any>[], // 앱 내부 column기반 데이터 배열
  sheet: SheetConfig // 해당 시트 설정
): any[][] {
  // id → def
  const defsMap = new Map([...sheet.essentialDefs, ...sheet.optional].map((d) => [d.id, d]));
  // order 순서대로 defs
  const orderedDefs = sheet.order.map((id) => defsMap.get(id)).filter((d): d is ExcelColumn => !!d);

  // 헤더(label)
  const header = orderedDefs.map((d) => d.column);

  // 바디(column 키로 값 추출)
  const body = rows.map((obj) => orderedDefs.map((d) => formatArrayValue(obj[d.column])));

  return [header, ...body];
}

function formatArrayValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join('_');
  }
  return value ?? '';
}

const seedChannelHistory = {
  essentialDefs: [
    { id: 1, label: '채널ID', column: 'channelId' },
    { id: 2, label: '구독자 수', column: 'subscriberCount' },
    { id: 3, label: '총 조회수', column: 'viewCount' },
    { id: 4, label: '동영상 수', column: 'videoCount' },
    { id: 5, label: '갱신일', column: 'fetchedAt' },
  ],
  order: [1, 2, 3, 4, 5],
  optional: [],
};

type ExcelColumn = {
  id: number;
  label: string;
  column: string;
  children?: any[];
};

type SheetConfig = {
  /** essential 컬럼의 ‘정의’. 앱 코드/설정에서만 바뀜. UI 수정 불가 */
  essentialDefs: ExcelColumn[];
  /** essential 컬럼의 ‘순서’. UI에서 드래그 등으로 바꾸는 대상 */
  order: number[]; // = essentialDefs의 id 배열

  /** optional 컬럼은 자유롭게 추가/삭제/편집 */
  optional: ExcelColumn[];
};
