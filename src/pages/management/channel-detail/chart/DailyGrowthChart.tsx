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
} from '@/components/ui/chart.tsx';
import { ChannelMetrics } from '@/pages/management/channel-detail/chart/channelMetrics.ts';
import { format } from 'date-fns';
import { formatCompactNumber } from '@/lib/utils.ts';

const chartConfig = {
  subscriberGrowth: {
    label: '구독자 증가',
    color: 'hsl(var(--chart-1))',
  },
  viewGrowth: {
    label: '조회수 증가',
    color: 'hsl(var(--chart-2))',
  },
  videoGrowth: {
    label: '영상 증가',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

export function DailyGrowthChart({ data }: Props) {
  const chartData = data.slice(1).map((item) => ({
    date: format(new Date(item.fetchedAt), 'MM/dd'),
    subscriberGrowth: item.subscriberGrowth,
    viewGrowth: item.viewGrowth,
    videoGrowth: item.videoGrowth,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>일일 증가량</CardTitle>
        <CardDescription>기간별 증가 수치</CardDescription>
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
            <Bar dataKey="subscriberGrowth" fill="var(--color-subscriberGrowth)" />
            <Bar dataKey="viewGrowth" fill="var(--color-viewGrowth)" />
            <Bar dataKey="videoGrowth" fill="var(--color-videoGrowth)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
