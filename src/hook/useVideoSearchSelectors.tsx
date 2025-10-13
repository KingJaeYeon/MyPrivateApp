import { useVideoSearchStore } from '@/store/videoFilterV2.ts';
import { useShallow } from 'zustand/react/shallow';

export const useCommonPair = () =>
  useVideoSearchStore(
    useShallow((s) => ({
      mode: s.filter.common.mode,
      videoDuration: s.filter.common.videoDuration,
      days: s.filter.common.days,
      minViews: s.filter.common.minViews,
      minViewsPerHour: s.filter.common.minViewsPerHour,
      regionCode: s.filter.common.regionCode,
      relevanceLanguage: s.filter.common.relevanceLanguage,
      shortsDuration: s.filter.common.shortsDuration,
    }))
  );

export const useChannelPair = () =>
  useVideoSearchStore(
    useShallow((s) => ({
      maxChannels: s.filter.channel.maxChannels,
      isPopularVideosOnly: s.filter.channel.isPopularVideosOnly,
      channelIds: s.filter.channel.channelIds,
    }))
  );

export const useKeywordPair = () =>
  useVideoSearchStore(
    useShallow((s) => ({
      keyword: s.filter.keyword.keyword,
      maxResults: s.filter.keyword.maxResults,
    }))
  );
