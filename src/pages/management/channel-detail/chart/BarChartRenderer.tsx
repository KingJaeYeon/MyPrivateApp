import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart.tsx';
import { ScaleResult } from '@/lib/chartUtils.ts';
import { useTheme } from '@/providers/theme-provider.tsx';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { formatCompactNumber } from '@/lib/utils.ts';

type Props = {
  data: { date: string; value: number }[];
  scale: ScaleResult;
  config: ChartConfig;
  name: string;
  dateFormat: string;
  xTicks: number[];
  min: number;
  max: number;
};

export default function BarChartRenderer({
  xTicks,
  scale,
  dateFormat,
  data,
  config,
  name,
  min,
  max,
}: Props) {
  const { theme } = useTheme();

  return (
    <div className="h-[350px] w-[100%]">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={config}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid
              stroke={theme === 'dark' ? '#e4e4e7' : 'oklch(80.8% 0.114 19.571)'}
              strokeOpacity={0.3}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              ticks={xTicks.map((i) => data[i].date)}
              tickFormatter={(date) => format(new Date(date), dateFormat)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="value"
              domain={[min, max]}
              ticks={scale.ticks}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="value"
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  hideIndicator={true}
                />
              }
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              barSize={24}
              name={name}
              fill="var(--color-value)"
            />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
