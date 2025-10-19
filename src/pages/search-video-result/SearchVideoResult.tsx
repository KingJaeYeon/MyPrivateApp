import { DataTable } from '@/components/data-table';
import { RESULT_COLUMNS, VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { useVideoSearchStore } from '@/store/useVideoSearchStore.ts';
import { useChannelPair, useCommonPair, useKeywordPair } from '@/hooks/useVideoSearchSelectors.tsx';

export default function SearchVideoResult() {
  const { data } = useVideoSearchStore((s) => s.result);
  const { mode, minViews, minViewsPerHour, shortsDuration, videoDuration } = useCommonPair();
  const {
    keyword,
    maxResults,
    days: publishedAfterK,
    relevanceLanguage,
    regionCode,
  } = useKeywordPair();
  const { isPopularVideosOnly, maxChannels, days: publishedAfterC, channelIds } = useChannelPair();
  const dataInfo = `Total ${data.length}/ ${mode === 'keywords' ? maxResults : Number(maxChannels) * channelIds.length}개 | 검색모드: ${mode} | 키워드: ${keyword} | 기간: ${mode === 'keywords' ? publishedAfterK : publishedAfterC}일 | 국가: ${regionCode}`;
  return (
    <div className="flex w-full flex-1 px-4">
      <DataTable<VideoRow, unknown>
        columns={RESULT_COLUMNS}
        hasNo={true}
        isFixHeader={true}
        data={data}
        fontSize={{ head: 'text-0.5xs', cell: 'text-1.5xs' }}
        tableControls={(_) => {
          return <div className="text-muted-foreground text-sm">{dataInfo}</div>;
        }}
      />
    </div>
  );
}
