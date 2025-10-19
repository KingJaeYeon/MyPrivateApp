import { DataTable } from '@/components/data-table';
import { RESULT_COLUMNS, VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { useVideoSearchStore } from '@/store/useVideoSearchStore.ts';
import { useChannelPair, useCommonPair, useKeywordPair } from '@/hooks/useVideoSearchSelectors.tsx';
import { useState } from 'react';
import useChannelStore from '@/store/useChannelStore.ts';
import { Button } from '@/components/ui/button.tsx';
import { Table } from '@tanstack/react-table';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import { useModalStore } from '@/store/modalStore.ts';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const { openModal } = useModalStore();
  const { data: channels } = useChannelStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const columns = RESULT_COLUMNS(
    isEdit,
    channels.map((r) => r.channelId)
  );

  const handleAddChannels = (_table: Table<VideoRow>) => {
    if (!confirm('정말 추가하시겠습니까?')) {
      return;
    }
    // 선택된 행들 가져오기
    const selectedRows = _table.getSelectedRowModel().rows;
    // VideoRow를 ChannelColumns로 변환
    const transformToChannel = (video: VideoRow): ChannelColumns => ({
      channelId: video.channelId,
      handle: video.chHandle,
      icon: video.chIcon,
      fetchedAt: video.chFetchAt,
      videoCount: video.chVideoCount,
      name: video.channelTitle,
      viewCount: video.chViewCount,
      regionCode: video.chRegionCode,
      publishedAt: video.chPublishAt,
      link: video.chLink,
      subscriberCount: video.subscriberCount,
      tag: '',
      memo: '',
      platform: 'youtube',
    });

    // 중복 제거하며 필터링
    const filtered = selectedRows.reduce<ChannelColumns[]>((acc, row) => {
      const channelId = row.original.channelId;

      // 이미 추가됐으면 스킵
      if (acc.some((ch) => ch.channelId === channelId)) {
        return acc;
      }

      // 새로운 채널이면 추가
      return [...acc, transformToChannel(row.original)];
    }, []);

    // API 호출 또는 데이터 저장
    openModal('channel', { data: filtered });
    if (location.pathname !== '/channels') {
      navigate('/channels');
    }
  };
  const dataInfo = `Total ${data.length}/ ${mode === 'keywords' ? maxResults : Number(maxChannels) * channelIds.length}개 | 검색모드: ${mode} | 키워드: ${keyword} | 기간: ${mode === 'keywords' ? publishedAfterK : publishedAfterC}일 | 국가: ${regionCode}`;
  return (
    <div className="flex w-full flex-1 px-4 pb-4">
      <DataTable<VideoRow, unknown>
        columns={columns}
        hasNo={true}
        isFixHeader={true}
        data={data}
        isEdit={isEdit}
        fontSize={{ head: 'text-0.5xs', cell: 'text-1.5xs' }}
        tableControls={(_table) => {
          return (
            <div className={'flex items-center justify-between gap-2'}>
              <div className="text-muted-foreground text-sm">{dataInfo}</div>
              <div className={'flex gap-2'}>
                {isEdit && (
                  <Button
                    className={'text-sm'}
                    variant={'default'}
                    size={'sm'}
                    onClick={() => handleAddChannels(_table)}
                    disabled={_table.getSelectedRowModel().rows.length === 0}
                  >
                    Add Channels
                  </Button>
                )}
                <Button
                  className={'text-sm'}
                  variant={'secondary'}
                  size={'sm'}
                  onClick={() => setIsEdit((prev) => !prev)}
                >
                  {isEdit ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
