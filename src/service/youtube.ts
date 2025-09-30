export type VideoRow = {
  no: number;
  channelTitle: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  viewsPerHour: number;
  viewsPerSubscriber: number | null;
  duration: string; // 표시용 "mm:ss" or "hh:mm:ss"
  link: string;
  thumbnailUrl: string;
  subscriberCount: number | null; // ✅ 구독자 수
};
