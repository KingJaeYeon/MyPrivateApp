import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart.tsx';
import { ChannelMetrics } from '@/pages/management/channel-detail/chart/channelMetrics.ts';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label.tsx';
import { useTheme } from '@/providers/theme-provider.tsx';
import {
  calculateSmartScale,
  calculateXAxisTicks,
  getDataMinMax,
  getOptimalDateFormat,
} from '@/lib/chartUtils.ts';
import { useMemo } from 'react';
import Tip from '@/components/Tip';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';

const chartConfig = {
  subscriberGrowthRate: {
    label: '구독자 증가율',
    color: 'var(--chart-1)',
  },
  viewGrowthRate: {
    label: '조회수 증가율',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

export function GrowthRateChart({ data }: Props) {
  const { theme } = useTheme();

  const { calc, dates, value } = useMemo(() => {
    return data.reduce(
      (prev, cur) => {
        const date = new Date(cur.fetchedAt);
        prev.calc.push({
          date: cur.fetchedAt,
          subscriberGrowthRate: cur.subscriberGrowthRate,
          viewGrowthRate: cur.viewGrowthRate,
        });
        prev.dates.push(date);
        prev.value.push(cur.subscriberGrowthRate);
        prev.value.push(cur.viewGrowthRate);
        return prev;
      },
      {
        calc: [] as { date: string; subscriberGrowthRate: number; viewGrowthRate: number }[],
        dates: [] as Date[],
        value: [] as number[],
      }
    );
  }, [data]);
  const { format: dateFormat } = getOptimalDateFormat(dates);
  const xTicks = calculateXAxisTicks(data.length, 7);
  const { min, max } = getDataMinMax(value);
  const scale = calculateSmartScale(min, max);

  return (
    <div className={'flex flex-wrap px-5 py-2'}>
      <ChartTitle />
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={calc}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
              <CartesianGrid
                vertical={false}
                stroke={theme === 'dark' ? '#e4e4e7' : 'oklch(80.8% 0.114 19.571)'}
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                ticks={xTicks.map((i) => calc[i].date)}
                tickFormatter={(date) => format(new Date(date), dateFormat)}
              />
              <YAxis
                axisLine={false}
                domain={[min, max]}
                ticks={scale.ticks}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideIndicator={true}
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('KR', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="subscriberGrowthRate"
                name="구독자 증가율"
                stroke="oklch(0.68 0.14 250)"
                strokeWidth={2.2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="viewGrowthRate"
                name="조회수 증가율"
                stroke="oklch(0.75 0.11 110)"
                strokeWidth={2.2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
        {/* 차트 해석 가이드 */}
      </div>
      <ChartGuide />
    </div>
  );
}

function ChartTitle() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">구독자 & 조회수 증가율</Label>
          <Tip
            txt="두 지표의 증가 속도를 비교하여 채널의 성장 균형을 파악할 수 있습니다"
            side="right"
          >
            <IconMoreInfo className="text-muted-foreground h-4 w-4" />
          </Tip>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          얼마나 빨리 성장하고 있는지 보여주는 지표
        </p>
      </div>
    </div>
  );
}

function ChartGuide() {
  return (
    <div className="bg-muted/50 w-full space-y-2 rounded-lg p-3">
      <p className="text-xs font-medium">📊 차트 해석</p>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-green-600">✓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">두 선이 붙어있음:</span> 조회수와 구독자가 균형있게 성장
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-blue-600">↑</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">조회수 선이 위:</span> 영상은 많이 보지만 구독 전환이 낮음
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-purple-600">↓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">구독자 선이 위:</span> 기존 구독자의 충성도가 높음
          </p>
        </div>
      </div>
    </div>
  );
}
