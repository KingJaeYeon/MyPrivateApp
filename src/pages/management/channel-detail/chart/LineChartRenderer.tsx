import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart.tsx';
import { ScaleResult } from '@/lib/chartUtils.ts';
import { useTheme } from '@/providers/theme-provider.tsx';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
  id: string;
};

export default function LineChartRenderer({
  xTicks,
  scale,
  dateFormat,
  data,
  config,
  name,
  min,
  max,
  id,
}: Props) {
  const { theme } = useTheme();
  return (
    <div className="h-[350px] w-[100%]">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={config}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          >
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
              tickLine={false}
              ticks={xTicks.map((i) => data[i].date)}
              tickFormatter={(date) => format(new Date(date), dateFormat)}
            />
            <YAxis
              axisLine={false}
              domain={[min, max]}
              ticks={scale.ticks}
              tickFormatter={(value) => formatCompactNumber(value)}
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
              dataKey="value"
              name={name}
              fill={`url(#${id})`}
              stroke="oklch(0.68 0.14 250)"
              strokeWidth={2.2}
            />
          </LineChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
