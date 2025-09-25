import { DataTable } from '@/components/data-table';
import { columns } from '@/components/video-table-columns';
import { useFilterStore } from '@/store/search-video';

import type { VideoRow } from '@/service/youtube.ts';

export default function SearchVideoResult() {
  const rows = useFilterStore((s) => s.result);
  const searchOptions = useFilterStore((s) => s.data);
  const dataInfo = `Total ${rows.length}/ ${searchOptions.maxResults}개 | 검색모드: ${searchOptions.mode} | 키워드: ${searchOptions.keyword} | 기간: ${searchOptions.days}일 | 국가: ${searchOptions.regionCode}`;
  return (
    <div className="flex flex-1 px-4 w-full">
      <DataTable<VideoRow, unknown> columns={columns} data={rows} dataInfo={dataInfo} />
    </div>
  );
}
