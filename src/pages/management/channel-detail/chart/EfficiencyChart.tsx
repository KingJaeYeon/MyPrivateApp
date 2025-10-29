import { ChartConfig } from '@/components/ui/chart.tsx';
import { ChannelMetrics } from '@/pages/management/channel-detail/chart/channelMetrics.ts';
import { useMemo } from 'react';
import { Label } from '@/components/ui/label.tsx';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';
import Tip from '@/components/Tip';
import AreaChartRenderer from '@/pages/management/channel-detail/chart/AreaChartRenderer.tsx';

const vpvConfig = {
  value: {
    label: '영상당 조회수',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const vpsConfig = {
  value: {
    label: '구독자당 조회수',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

const spvConfig = {
  value: {
    label: '영상당 구독자',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

type Props = {
  data: ChannelMetrics[];
};

/**
 * @deprecated 다른 채널이랑 비교할때 의미있는 차트임
 * @param data
 * @constructor
 */
export function EfficiencyChart({ data }: Props) {
  const { vpv, vps, spv } = useMemo(() => {
    return data.reduce(
      (prev, cur) => {
        const date = new Date(cur.fetchedAt);
        prev.vpv.data.push({ date: cur.fetchedAt, value: cur.vpv });
        prev.vpv.date.push(date);
        prev.vpv.value.push(cur.vpv);

        prev.vps.data.push({ date: cur.fetchedAt, value: cur.vps });
        prev.vps.date.push(date);
        prev.vps.value.push(cur.vps);

        prev.spv.data.push({ date: cur.fetchedAt, value: cur.spv });
        prev.spv.date.push(date);
        prev.spv.value.push(cur.spv);

        return prev;
      },
      {
        vpv: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
        vps: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
        spv: {
          data: [] as { date: string; value: number }[],
          date: [] as Date[],
          value: [] as number[],
        },
      }
    );
  }, [data]);

  return (
    <div className={'flex flex-wrap gap-5 px-5 py-2'}>
      <div className="flex w-full flex-col gap-5">
        <ChartTitleVPV />
        <AreaChartRenderer {...vps} config={vpsConfig} id={'fillValue'} />
        <ChartGuideVPV />
      </div>
      <div className="flex w-full flex-col gap-5">
        <ChartTitleVPS />
        <AreaChartRenderer {...vpv} config={vpvConfig} id={'fillValue3'} />
        <ChartGuideVPS />
      </div>
      <div className="flex w-full flex-col gap-5">
        <ChartTitleSPV />
        <AreaChartRenderer {...spv} config={spvConfig} id={'fillValue2'} />
        <ChartGuideSPV />
      </div>
    </div>
  );
}

function ChartTitleVPV() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">조회수 / 영상 (VPV)</Label>
          <Tip
            txt="영상 1개당 평균 조회수를 의미하며, 콘텐츠 노출력과 영상 품질을 보여줍니다."
            side="right"
          >
            <IconMoreInfo className="text-muted-foreground h-4 w-4" />
          </Tip>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          한 편의 영상이 얼마나 많은 시청을 얻고 있는지 판단할 수 있는 지표
        </p>
      </div>
    </div>
  );
}

function ChartGuideVPV() {
  return (
    <div className="bg-muted/50 w-full space-y-2 rounded-lg p-3">
      <p className="text-xs font-medium">📊 차트 해석</p>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-green-600">✓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">그래프가 꾸준히 상승:</span> 영상당 평균 조회수가 증가 —
            콘텐츠 노출 또는 품질 개선
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-orange-600">⚡</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">단기 급등:</span> 특정 영상이 일시적으로 높은 조회수를
            견인한 경우
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-red-600">↓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">하락세 지속:</span> 최근 업로드 영상의 조회 유지력이
            떨어지는 중
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartTitleVPS() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">조회수 / 구독자 (VPS)</Label>
          <Tip
            txt="구독자 1명이 평균적으로 몇 회의 조회를 발생시키는지를 나타내며, 구독자의 시청 충성도를 반영합니다."
            side="right"
          >
            <IconMoreInfo className="text-muted-foreground h-4 w-4" />
          </Tip>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          구독자들이 얼마나 자주 콘텐츠를 시청하는지를 보여주는 지표
        </p>
      </div>
    </div>
  );
}

function ChartGuideVPS() {
  return (
    <div className="bg-muted/50 w-full space-y-2 rounded-lg p-3">
      <p className="text-xs font-medium">📊 차트 해석</p>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-green-600">✓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">그래프가 상승:</span> 구독자들이 더 자주 시청 — 구독자
            참여도 향상
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-purple-600">👀</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">안정적 유지:</span> 구독자 대비 조회수가 일정 — 꾸준한
            관심 유지
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-red-600">↓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">하락:</span> 신규 구독자는 늘지만 실제 시청률은 낮아짐 —
            콘텐츠 흥미도 점검 필요
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartTitleSPV() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="text-base font-semibold">구독자 / 영상 (SPV)</Label>
          <Tip
            txt="영상 1편이 평균적으로 몇 명의 신규 구독자를 유도하는지를 의미하며, 콘텐츠 전환 효율을 나타냅니다."
            side="right"
          >
            <IconMoreInfo className="text-muted-foreground h-4 w-4" />
          </Tip>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          업로드된 영상이 구독 전환에 얼마나 효과적인지 판단할 수 있는 지표
        </p>
      </div>
    </div>
  );
}

function ChartGuideSPV() {
  return (
    <div className="bg-muted/50 w-full space-y-2 rounded-lg p-3">
      <p className="text-xs font-medium">📊 차트 해석</p>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-green-600">✓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">상승:</span> 영상당 신규 구독자 수가 늘고 있음 — 전환 효율
            향상
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-blue-600">📈</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">급등 구간:</span> 특정 콘텐츠가 구독 유입을 폭발적으로
            유도함
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 text-xs text-red-600">↓</span>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">하락:</span> 영상 업로드는 늘지만 구독 전환율은 낮아짐 —
            콘텐츠 방향 점검 필요
          </p>
        </div>
      </div>
    </div>
  );
}
