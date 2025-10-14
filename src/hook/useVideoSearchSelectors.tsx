import { useVideoSearchStore } from '@/store/videoFilterV2.ts';
import { useShallow } from 'zustand/react/shallow';

export const useCommonPair = () =>
  useVideoSearchStore(
    useShallow((s) => ({
      mode: s.filter.common.mode,
      videoDuration: s.filter.common.videoDuration,
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
      days: s.filter.channel.days,
      maxChannels: s.filter.channel.maxChannels,
      isPopularVideosOnly: s.filter.channel.isPopularVideosOnly,
      channelIds: s.filter.channel.channelIds,
    }))
  );

export const useKeywordPair = () =>
  useVideoSearchStore(
    useShallow((s) => ({
      days: s.filter.keyword.days,
      keyword: s.filter.keyword.keyword,
      maxResults: s.filter.keyword.maxResults,
    }))
  );

export const useTagsPair = () =>
  useVideoSearchStore(
    useShallow((s) => ({
      key: s.filter.tags.key,
      logic: s.filter.tags.logic,
    }))
  );
