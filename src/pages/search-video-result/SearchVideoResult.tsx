import { DataTable } from '@/components/data-table';
import { RESULT_COLUMNS, VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { useVideoSearchStore } from '@/store/videoFilterV2.ts';
import { useChannelPair, useCommonPair, useKeywordPair } from '@/hook/useVideoSearchSelectors.tsx';

export default function SearchVideoResult() {
  const { data } = useVideoSearchStore((s) => s.result);
  const {
    mode,
    minViews,
    minViewsPerHour,
    relevanceLanguage,
    shortsDuration,
    videoDuration,
    days,
    regionCode,
  } = useCommonPair();
  const { keyword, maxResults } = useKeywordPair();
  const { isPopularVideosOnly, maxChannels } = useChannelPair();
  const dataInfo = `Total ${data.length}/ ${maxResults}개 | 검색모드: ${mode} | 키워드: ${keyword} | 기간: ${days}일 | 국가: ${regionCode}`;
  return (
    <div className="flex flex-1 px-4 w-full">
      <DataTable<VideoRow, unknown>
        columns={RESULT_COLUMNS}
        data={data}
        tableControls={(_) => {
          return <div className="text-sm text-muted-foreground">{dataInfo}</div>;
        }}
      />
    </div>
  );
}
