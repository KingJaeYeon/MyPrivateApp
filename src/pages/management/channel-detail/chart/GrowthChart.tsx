import { ChartConfig } from '@/components/ui/chart.tsx';
import { ChannelMetrics } from '@/pages/management/channel-detail/chart/channelMetrics.ts';
import { useMemo } from 'react';
import { Label } from '@/components/ui/label.tsx';
import Tip from '@/components/Tip.tsx';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';
import AreaChartRenderer from '@/pages/management/channel-detail/chart/AreaChartRenderer.tsx';

const subConfig = {
  value: {
    label: '구독자',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const viewConfig = {
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
      <ChartTitle />
      <AreaChartRenderer {...video} config={videoConfig} id={'fillValue'} />
      <AreaChartRenderer {...view} config={viewConfig} id={'fillValue3'} />
      <AreaChartRenderer {...subscriber} config={subConfig} id={'fillValue2'} />
    </div>
  );
}

function ChartTitle() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">영상 · 구독자 · 조회수 성장 추이</Label>
          <Tip
            txt="시간에 따라 채널의 전체 규모가 어떻게 확장되고 있는지를 보여줍니다"
            side="right"
          >
            <IconMoreInfo className="text-muted-foreground h-4 w-4" />
          </Tip>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          채널의 규모가 꾸준히 성장하고 있는지 확인할 수 있는 핵심 지표
        </p>
      </div>
    </div>
  );
}
