import { request_youtube } from '@/service/axios.ts';
import { ChannelColumns } from '@/components/data-table-columns/channel-columns.tsx';
import { format } from 'date-fns';

// ── 채널들: channels.list 로 채널 정보 수집
export async function fetchChannelsByHandle({
  apiKey,
  handles,
}: {
  apiKey: string;
  handles: string[];
}) {
  let result = [];

  try {
    const cResp = await request_youtube.get('channels', {
      params: {
        key: apiKey,
        part: 'snippet,statistics',
        forHandle: handles.join(','),
      },
    });
    result = cResp.data?.items ?? [];
  } catch (e) {
    throw new Error('channels.list API 요청 중 오류가 발생했습니다. API 키와 쿼터를 확인하세요.');
  }

  if (result.length === 0) {
    throw new Error('채널을 찾을 수 없습니다. 채널 핸들을 다시 확인하세요.');
  }
  const channels: ChannelColumns[] = result.map((item: any) => ({
    icon: item.snippet.thumbnails?.default?.url || '',
    name: item.snippet.title,
    channelId: item.id,
    handle: item.snippet.customUrl || '',
    tag: '',
    publishedAt: format(item.snippet.publishedAt, 'yyyy.MM.dd'),
    link: `https://www.youtube.com/channel/${item.id}`,
    regionCode: item.snippet.country || '',
    videoCount: parseInt(item.statistics.videoCount) || 0,
    viewCount: parseInt(item.statistics.viewCount) || 0,
    subscriberCount: parseInt(item.statistics.subscriberCount) || 0, // ✅ 구독자 수
    memo: '',
    fetchedAt: new Date().toISOString(),
    createdAt: new Date().getTime(),
    platform: 'youtube', //TODO: 하드코딩 임시 처리 && Enum 처리
  }));

  return channels;
}

// const statistics = {
//   viewCount: '708661464',
//   subscriberCount: '57200',
//   hiddenSubscriberCount: false,
//   videoCount: '410',
// };
// const snippet = {
//   title: '슴슴도치',
//   description:
//     '슴슴도치야 고마워!\n\n슴슴할때 보기좋은 꿀잼 유머 / 이슈 🦔 👍🏿\n영상을 재밌게 보셨다면 구독과 좋아요 부탁드려요 :)\n\n\n\n문의 사항 - ssdochi2@gmail.com\n',
//   customUrl: '@슴슴도치',
//   publishedAt: '2020-08-16T07:07:53.460477Z',
//   thumbnails: {
//     default: {
//       url: 'https://yt3.ggpht.com/_V7oiEfUjbxCnmhCpauZWSEDNq0-MPRPBlk7cNdNmhS4foyUH1TQqn6vk94kXCTu0saBI6wHPg=s88-c-k-c0x00ffffff-no-rj',
//       width: 88,
//       height: 88,
//     },
//     medium: {
//       url: 'https://yt3.ggpht.com/_V7oiEfUjbxCnmhCpauZWSEDNq0-MPRPBlk7cNdNmhS4foyUH1TQqn6vk94kXCTu0saBI6wHPg=s240-c-k-c0x00ffffff-no-rj',
//       width: 240,
//       height: 240,
//     },
//     high: {
//       url: 'https://yt3.ggpht.com/_V7oiEfUjbxCnmhCpauZWSEDNq0-MPRPBlk7cNdNmhS4foyUH1TQqn6vk94kXCTu0saBI6wHPg=s800-c-k-c0x00ffffff-no-rj',
//       width: 800,
//       height: 800,
//     },
//   },
//   localized: {
//     title: '슴슴도치',
//     description:
//       '슴슴도치야 고마워!\n\n슴슴할때 보기좋은 꿀잼 유머 / 이슈 🦔 👍🏿\n영상을 재밌게 보셨다면 구독과 좋아요 부탁드려요 :)\n\n\n\n문의 사항 - ssdochi2@gmail.com\n',
//   },
//   country: 'KR',
// };
