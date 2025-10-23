import ButtonSwitcher from '@/components/ButtonSwitcher.tsx';
import { useEffect, useState } from 'react';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import useSettingStore from '@/store/useSettingStore.ts';
import { ChannelHistory } from '@/pages/channel-detail/chart/types.ts';
import { calculateMetrics, ChannelMetrics } from '@/pages/channel-detail/chart/channelMetrics';
import { GrowthChart } from '@/pages/channel-detail/chart/GrowthChart.tsx';
import { GrowthRateChart } from '@/pages/channel-detail/chart/GrowthRateChart.tsx';
import { EfficiencyChart } from '@/pages/channel-detail/chart/EfficiencyChart.tsx';
import { DailyGrowthChart } from '@/pages/channel-detail/chart/DailyGrowthChart.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';

const chartList = [
  { value: 'growth', label: '성장 추이' },
  { value: 'rate', label: '증가율' },
  { value: 'efficiency', label: '효율성' },
  { value: 'daily', label: '일일 증가' },
  { value: 'memo', label: '메모' },
];

export default function ChartRender({ channel }: { channel: ChannelColumns }) {
  const [select, setSelect] = useState<string>('growth');
  const [historyData, setHistoryData] = useState<ChannelHistory[]>([]);
  const [metrics, setMetrics] = useState<ChannelMetrics[]>([]);
  const { location, name } = useSettingStore.getState().data.folder;
  const historyPath = `${location}/${name.channelHistory}`;

  // 히스토리 데이터 로드
  useEffect(() => {
    if (!channel) return;

    async function loadHistory() {
      try {
        const allHistory = await window.excelApi.read(historyPath);
        // 해당 채널 데이터만 필터링
        const channelHistory = allHistory
          .filter((h: ChannelHistory) => h.channelId === channel.channelId)
          .sort((a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime());

        setHistoryData(channelHistory);

        // 메트릭 계산
        if (channelHistory.length > 0) {
          const calculatedMetrics = calculateMetrics(channelHistory);
          setMetrics(calculatedMetrics);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }

    loadHistory();
  }, [channel]);

  const renderChart = () => {
    if (metrics.length === 0) {
      return (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
          히스토리 데이터가 없습니다
        </div>
      );
    }

    switch (select) {
      case 'growth':
        return <GrowthChart data={metrics} />;
      case 'rate':
        return <GrowthRateChart data={metrics} />;
      case 'efficiency':
        return <EfficiencyChart data={metrics} />;
      case 'daily':
        return <DailyGrowthChart data={metrics} />;
      case 'memo':
        return <Textarea value={channel.memo} readOnly className={'h-[300px]'} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={'w-fit'}>
        <ButtonSwitcher state={select} setState={setSelect} list={chartList} />
      </div>
      {renderChart()}
    </>
  );
}
