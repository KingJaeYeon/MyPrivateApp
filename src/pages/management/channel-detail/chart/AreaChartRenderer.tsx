import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart.tsx';
import {
  calculateSmartScale,
  calculateXAxisTicks,
  formatWithDuplicateCheck,
  getDataMinMax,
  getOptimalDateFormat,
  getYAxisFormatStrategy,
} from '@/lib/chartUtils.ts';
import { useTheme } from '@/providers/theme-provider.tsx';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { formatCompactNumber } from '@/lib/utils.ts';

type Props = {
  data: { date: string; value: number }[];
  date: Date[];
  value: number[];
  config: ChartConfig;
  id: string;
};

export default function AreaChartRenderer({ data, value, date, config, id }: Props) {
  const { min, max } = getDataMinMax(value);
  const scale = calculateSmartScale(min, max);
  const { format: dateFormat } = getOptimalDateFormat(date);
  const xTicks = calculateXAxisTicks(data.length, 7);
  const { theme } = useTheme();

  // 🆕 포맷 전략 결정
  const formatStrategy = getYAxisFormatStrategy(min, max, 'viewCount'); // dataType 동적으로 전달

  // 🆕 Y축 라벨 생성
  const yAxisLabels = formatStrategy.useCompact
    ? formatWithDuplicateCheck(scale.ticks, formatCompactNumber)
    : scale.ticks.map((v) => v.toLocaleString());

  return (
    <div className="h-[300px] w-[100%]">
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
              tickFormatter={(value, index) => yAxisLabels[index] || value.toLocaleString()}
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
                  hideIndicator={true}
                  indicator="dot"
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
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
