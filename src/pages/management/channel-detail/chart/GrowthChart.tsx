import { CartesianGrid, XAxis, YAxis, AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart.tsx';
import { ChannelMetrics } from '@/pages/management/channel-detail/chart/channelMetrics.ts';
import { format } from 'date-fns';
import { formatCompactNumber } from '@/lib/utils.ts';
import { useMemo } from 'react';
import {
  calculateSmartScale,
  calculateXAxisTicks,
  getDataMinMax,
  getOptimalDateFormat,
} from '@/lib/chartUtils';
import { useTheme } from '@/providers/theme-provider.tsx';

const subConfig = {
  value: {
    label: '구독자',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const viewConfig = {
  visitors: {
    label: 'Visitors',
  },
  value: {
    label: '조회수',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

const videoConfig = {
  value: {
    label: '영상 수',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

export function GrowthChart({ data }: Props) {
  const { view, video, subscriber } = useMemo(() => {
    return data.reduce(
      (prev, cur) => {
        const date = new Date(cur.fetchedAt);
        prev.subscriber.data.push({ date: cur.fetchedAt, value: cur.subscriberCount });
        prev.subscriber.date.push(date);
        prev.subscriber.value.push(cur.subscriberCount);

        prev.view.data.push({ date: cur.fetchedAt, value: cur.viewCount });
        prev.view.date.push(date);
        prev.view.value.push(cur.viewCount);

        prev.video.data.push({ date: cur.fetchedAt, value: cur.videoCount });
        prev.video.date.push(date);
        prev.video.value.push(cur.videoCount);

        return prev;
      },
      {
        subscriber: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
        view: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
        video: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
      }
    );
  }, [data]);

  return (
    <div className={'flex flex-wrap gap-5 px-5 py-2'}>
      <ChartRenderer {...video} config={videoConfig} id={'fillValue'} />
      <ChartRenderer {...view} config={viewConfig} id={'fillValue3'} />
      <ChartRenderer {...subscriber} config={subConfig} id={'fillValue2'} />
    </div>
  );
}

function ChartRenderer({
  data,
  value,
  date,
  config,
  id,
}: {
  data: { date: string; value: number }[];
  date: Date[];
  value: number[];
  config: ChartConfig;
  id: string;
}) {
  const { min, max } = getDataMinMax(value);
  const scale = calculateSmartScale(min, max);
  const { format: dateFormat } = getOptimalDateFormat(date);
  const xTicks = calculateXAxisTicks(data.length, 7);
  const { theme } = useTheme();
  return (
    <div className="h-[350px] w-[100%]">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={config}>
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke={theme === 'dark' ? '#e4e4e7' : 'oklch(80.8% 0.114 19.571)'}
              className={'stroke-1'}
              strokeDasharray="3 3"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              ticks={xTicks.map((i) => data[i].date)}
              tickFormatter={(date) => format(new Date(date), dateFormat)}
            />
            <YAxis
              dataKey={'value'}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              domain={[scale.min, scale.max]}
              ticks={scale.ticks}
              allowDataOverflow
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey="value"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('KR', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  hideIndicator={false}
                  indicator="line"
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              fill={`url(#${id})`}
              stroke="var(--color-value)"
              stackId="a"
              strokeWidth={2.2}
            />
            <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
          </AreaChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
