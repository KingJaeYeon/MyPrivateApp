import { ChannelHistory } from './types.ts';

export type ChannelMetrics = {
  fetchedAt: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  subscriberGrowth: number;
  viewGrowth: number;
  videoGrowth: number;
  subscriberGrowthRate: number;
  viewGrowthRate: number;
  vpv: number; // Views Per Video
  vps: number; // Views Per Subscriber
  spv: number; // Subscribers Per Video
};

export function calculateMetrics(history: ChannelHistory[]): ChannelMetrics[] {
  const sorted = [...history].sort(
    (a, b) => new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime()
  );

  return sorted.map((current, index) => {
    if (index === 0) {
      return {
        fetchedAt: current.fetchedAt,
        subscriberCount: current.subscriberCount,
        viewCount: current.viewCount,
        videoCount: current.videoCount,
        subscriberGrowth: 0,
        viewGrowth: 0,
        videoGrowth: 0,
        subscriberGrowthRate: 0,
        viewGrowthRate: 0,
        vpv: current.videoCount > 0 ? current.viewCount / current.videoCount : 0,
        vps: current.subscriberCount > 0 ? current.viewCount / current.subscriberCount : 0,
        spv: current.videoCount > 0 ? current.subscriberCount / current.videoCount : 0,
      };
    }

    const previous = sorted[index - 1];

    const subscriberGrowth = current.subscriberCount - previous.subscriberCount;
    const viewGrowth = current.viewCount - previous.viewCount;
    const videoGrowth = current.videoCount - previous.videoCount;

    const subscriberGrowthRate =
      previous.subscriberCount > 0 ? (subscriberGrowth / previous.subscriberCount) * 100 : 0;
    const viewGrowthRate = previous.viewCount > 0 ? (viewGrowth / previous.viewCount) * 100 : 0;

    const vpv = current.videoCount > 0 ? current.viewCount / current.videoCount : 0;
    const vps = current.subscriberCount > 0 ? current.viewCount / current.subscriberCount : 0;
    const spv = current.videoCount > 0 ? current.subscriberCount / current.videoCount : 0;

    return {
      fetchedAt: current.fetchedAt,
      subscriberCount: current.subscriberCount,
      viewCount: current.viewCount,
      videoCount: current.videoCount,
      subscriberGrowth,
      viewGrowth,
      videoGrowth,
      subscriberGrowthRate,
      viewGrowthRate,
      vpv,
      vps,
      spv,
    };
  });
}
