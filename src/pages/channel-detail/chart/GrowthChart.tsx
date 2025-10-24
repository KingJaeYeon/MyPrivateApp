import { Line, LineChart, CartesianGrid, XAxis, YAxis, AreaChart, Area } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { ChannelMetrics } from '@/pages/channel-detail/chart/channelMetrics.ts';
import { format } from 'date-fns';
import { formatCompactNumber } from '@/lib/utils';

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
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const videoConfig = {
  value: {
    label: '영상 수',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

export function GrowthChart({ data }: Props) {
  const chartData = data.reduce(
    (prev, cur) => {
      const date = format(new Date(cur.fetchedAt), 'MM/dd HH:mm');
      prev.subscriberCount.push({ date: date, value: cur.subscriberCount });
      prev.viewCount.push({ date: date, value: cur.viewCount });
      prev.videoCount.push({ date: date, value: cur.videoCount });

      return prev;
    },
    {
      subscriberCount: [] as { date: string; value: number }[],
      viewCount: [] as { date: string; value: number }[],
      videoCount: [] as { date: string; value: number }[],
    }
  );

  return (
    <div className={'flex flex-wrap gap-y-5'}>
      <ChartContainer config={videoConfig} className="aspect-auto h-[300px] w-[50%]">
        <AreaChart data={chartData.videoCount}>
          <defs>
            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickMargin={8} minTickGap={32} />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="value"
            type="natural"
            fill="url(#fillValue)"
            stroke="var(--color-value)"
            stackId="a"
          />
          <ChartLegend content={<ChartLegendContent />} verticalAlign="top" height={1} />
        </AreaChart>
      </ChartContainer>
      <ChartContainer config={subConfig} className="h-[200px] w-[50%]">
        <LineChart data={chartData.subscriberCount}>
          <ChartLegend
            content={<ChartLegendContent />}
            verticalAlign="top"
            align={'left'}
            iconType={'circle'}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatCompactNumber(value)} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px]"
                nameKey="value"
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                }}
              />
            }
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      <ChartContainer config={viewConfig} className="h-[200px] w-[50%]">
        <LineChart data={chartData.viewCount}>
          <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatCompactNumber(value)} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px]"
                nameKey="date"
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
