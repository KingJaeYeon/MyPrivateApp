import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
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

const chartConfig = {
  vpv: {
    label: '영상당 조회수',
    color: 'hsl(var(--chart-1))',
  },
  vps: {
    label: '구독자당 조회수',
    color: 'hsl(var(--chart-2))',
  },
  spv: {
    label: '영상당 구독자',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

export function EfficiencyChart({ data }: Props) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.fetchedAt), 'MM/dd'),
    영상당조회수: Math.round(item.vpv),
    구독자당조회수: Math.round(item.vps),
    영상당구독자: Math.round(item.spv),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>효율성 지표</CardTitle>
        <CardDescription>채널 콘텐츠 효율성 분석</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCompactNumber(value)} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: number) => formatCompactNumber(value)}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="영상당조회수" fill="var(--color-vpv)" />
            <Bar dataKey="구독자당조회수" fill="var(--color-vps)" />
            <Bar dataKey="영상당구독자" fill="var(--color-spv)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
