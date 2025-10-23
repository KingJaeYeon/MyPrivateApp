import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ChannelMetrics } from '@/pages/channel-detail/chart/channelMetrics.ts';
import { format } from 'date-fns';

const chartConfig = {
  subscriberGrowthRate: {
    label: '구독자 증가율',
    color: 'hsl(var(--chart-1))',
  },
  viewGrowthRate: {
    label: '조회수 증가율',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

export function GrowthRateChart({ data }: Props) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.fetchedAt), 'MM/dd'),
    구독자증가율: item.subscriberGrowthRate,
    조회수증가율: item.viewGrowthRate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>증가율</CardTitle>
        <CardDescription>구독자 & 조회수 증가율 (%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Area
              type="monotone"
              dataKey="구독자증가율"
              stackId="1"
              stroke="var(--color-subscriberGrowthRate)"
              fill="var(--color-subscriberGrowthRate)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="조회수증가율"
              stackId="2"
              stroke="var(--color-viewGrowthRate)"
              fill="var(--color-viewGrowthRate)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
