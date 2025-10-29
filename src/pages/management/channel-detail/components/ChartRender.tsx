import ButtonSwitcher from '@/components/ButtonSwitcher.tsx';
import { useMemo, useState } from 'react';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import useChannelHistoryStore from '@/store/useChannelHistoryStore.ts';
import { calculateMetrics } from '@/pages/management/channel-detail/chart/channelMetrics.ts';
import { GrowthChart } from '@/pages/management/channel-detail/chart/GrowthChart.tsx';
import { GrowthRateChart } from '@/pages/management/channel-detail/chart/GrowthRateChart.tsx';
import { EfficiencyChart } from '@/pages/management/channel-detail/chart/EfficiencyChart.tsx';
import { DailyGrowthChart } from '@/pages/management/channel-detail/chart/DailyGrowthChart.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';

const chartList = [
  { value: 'growth', label: '성장 추이' },
  { value: 'rate', label: '증가율' },
  // { value: 'efficiency', label: '효율성' }, 다른 채널과 비교할때 의미있는 차트
  { value: 'daily', label: '일일 증가' },
  { value: 'memo', label: '메모' },
];

export default function ChartRender({ channel }: { channel: ChannelColumns }) {
  const [select, setSelect] = useState<string>('growth');
  const { getByChannelId } = useChannelHistoryStore();

  const history = useMemo(() => getByChannelId(channel.channelId), [channel.channelId]);

  const metrics = useMemo(() => calculateMetrics(history), [history]);

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
