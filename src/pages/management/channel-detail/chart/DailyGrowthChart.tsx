import { ChartConfig } from '@/components/ui/chart.tsx';
import { ChannelMetrics } from '@/pages/management/channel-detail/chart/channelMetrics.ts';
import { Label } from '@/components/ui/label.tsx';
import { useMemo } from 'react';
import LineChartRenderer from '@/pages/management/channel-detail/chart/LineChartRenderer.tsx';
import {
  calculateSmartScale,
  calculateXAxisTicks,
  getDataMinMax,
  getOptimalDateFormat,
} from '@/lib/chartUtils.ts';

const subsConfig = {
  value: {
    label: '구독자 증가량',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;
const viewConfig = {
  value: {
    label: '조회수 증가량',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;
const videoConfig = {
  value: {
    label: '영상수 증가량',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

type ChartProps = {
  data: { date: string; value: number }[];
  date: Date[];
  value: number[];
  config: ChartConfig;
  name: string;
  id: string;
};

export function DailyGrowthChart({ data }: Props) {
  const { videoGrowth, viewGrowth, subscriberGrowth } = useMemo(() => {
    return data.slice(1).reduce(
      (prev, cur) => {
        const date = new Date(cur.fetchedAt);
        prev.subscriberGrowth.data.push({ date: cur.fetchedAt, value: cur.subscriberGrowth });
        prev.subscriberGrowth.date.push(date);
        prev.subscriberGrowth.value.push(cur.subscriberGrowth);

        prev.viewGrowth.data.push({ date: cur.fetchedAt, value: cur.viewGrowth });
        prev.viewGrowth.date.push(date);
        prev.viewGrowth.value.push(cur.viewGrowth);

        prev.videoGrowth.data.push({ date: cur.fetchedAt, value: cur.videoGrowth });
        prev.videoGrowth.date.push(date);
        prev.videoGrowth.value.push(cur.videoGrowth);

        return prev;
      },
      {
        subscriberGrowth: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
        viewGrowth: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
        videoGrowth: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
      }
    );
  }, [data]);

  return (
    <div className={'flex flex-wrap px-5 py-2'}>
      <div className={'flex flex-wrap gap-5 px-5 py-2'}>
        <SubscriberGrowthTitle />
        <AdaptiveGrowthChart
          {...subscriberGrowth}
          config={subsConfig}
          name={'구독자 증가량'}
          id={'dailyGrowthChart'}
        />
      </div>
      <div className={'flex flex-wrap gap-5 px-5 py-2'}>
        <ViewGrowthTitle />
        <AdaptiveGrowthChart
          {...viewGrowth}
          config={viewConfig}
          name={'조회수 증가량'}
          id={'dailyGrowthChart2'}
        />
      </div>
      <div className={'flex flex-wrap gap-5 px-5 py-2'}>
        <VideoGrowthTitle />
        <AdaptiveGrowthChart
          {...videoGrowth}
          config={videoConfig}
          name={'영상수 증가량'}
          id={'dailyGrowthChart'}
        />
      </div>
    </div>
  );
}

export function AdaptiveGrowthChart({ date, value, data, ...props }: ChartProps) {
  const { format: dateFormat } = getOptimalDateFormat(date);
  const xTicks = calculateXAxisTicks(data.length, 7);
  const { min, max } = getDataMinMax(value);
  const scale = calculateSmartScale(min, max);

  return (
    <LineChartRenderer
      scale={scale}
      dateFormat={dateFormat}
      xTicks={xTicks}
      data={data}
      min={min}
      max={max}
      {...props}
    />
  );
}

function SubscriberGrowthTitle() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">구독자 증가량 추이</Label>
          {/*<Tip txt="30일 이내 데이터는 막대로, 이 이상 데이터는 선형으로 표시됩니다." side="right">*/}
          {/*  <IconMoreInfo className="text-muted-foreground h-4 w-4" />*/}
          {/*</Tip>*/}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          일별 증가 강도와 장기 추세를 함께 해석할 수 있는 유연형 차트
        </p>
      </div>
    </div>
  );
}

function ViewGrowthTitle() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">조회수 증가량 추이</Label>
          {/*<Tip txt="30일 이내 데이터는 막대로, 이 이상 데이터는 선형으로 표시됩니다." side="right">*/}
          {/*  <IconMoreInfo className="text-muted-foreground h-4 w-4" />*/}
          {/*</Tip>*/}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          일별 증가 강도와 장기 추세를 함께 해석할 수 있는 유연형 차트
        </p>
      </div>
    </div>
  );
}

function VideoGrowthTitle() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">영상수 증가량 추이</Label>
          {/*<Tip txt="30일 이내 데이터는 막대로, 이 이상 데이터는 선형으로 표시됩니다." side="right">*/}
          {/*  <IconMoreInfo className="text-muted-foreground h-4 w-4" />*/}
          {/*</Tip>*/}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          일별 증가 강도와 장기 추세를 함께 해석할 수 있는 유연형 차트
        </p>
      </div>
    </div>
  );
}
