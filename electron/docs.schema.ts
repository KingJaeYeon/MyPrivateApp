// excel files schema define
type DBSchema = {
  channelHistory: ChannelHistory;
  channel: Channel;
  tag: Tag;
  result: Result;
  prompt: Prompt;
  reference: Reference;
  engWords: EngWords;
  engNotes: EngNotes;
  // diary: Record<string, DiaryDoc>;
};

const ChannelHistorySchema = {
  channelId: 'string',
  subscriberCount: 'number',
  videoCount: 'number',
  viewCount: 'number',
  fetchedAt: 'string',
} as const;

const ChannelSchema = {
  name: 'string',
  channelId: 'string',
  handle: 'string',
  tag: 'string',
  regionCode: 'string',
  subscriberCount: 'number',
  viewCount: 'number',
  videoCount: 'number',
  memo: 'string',
  platform: 'string',
  publishedAt: 'string',
  link: 'string',
  fetchedAt: 'string',
  icon: 'string',
  createdAt: 'number',
  lastVideoPublishedAt: 'number',
} as const;

const TagSchema = {
  idx: 'string',
  name: 'string',
  usedChannels: 'number',
  usedVideos: 'number',
  usedReference: 'number',
  usedPrompts: 'number',
  total: 'number',
} as const;

const ResultSchema = {
  thumbnailUrl: 'string',
  channelTitle: 'string',
  title: 'string',
  publishedAt: 'string',
  viewCount: 'number',
  viewsPerHour: 'number',
  subscriberCount: 'number',
  viewsPerSubscriber: 'number', // number | null
  duration: 'string',
  link: 'string',
  channelId: 'string',
  tags: 'string[]',
  defaultLanguage: 'string',
  defaultAudioLanguage: 'string',
  likeCount: 'string',
  commentCount: 'string',
  chHandle: 'string',
  chIcon: 'string',
  chPublishAt: 'string',
  chViewCount: 'number',
  chVideoCount: 'number',
  chLink: 'string',
  chFetchAt: 'string',
  chRegionCode: 'string',
} as const;

const PromptSchema = {
  idx: 'string',
  path: 'string',
  tag: 'string',
  title: 'string',
  prompt: 'string',
  memo: 'string',
  updatedAt: 'string',
  createdAt: 'number',
} as const;

const ReferenceSchema = {
  idx: 'string',
  path: 'string',
  name: 'string',
  tag: 'string',
  link: 'string',
  memo: 'string',
  updatedAt: 'string',
  createdAt: 'number',
} as const;

// --- English ---
//핵심 동사 정의 — ECM 등 문형을 가지는 중심 노드
const EngWordsSchema = {
  id: 'string',
  word: 'string',
  description: 'string',
  content: 'string', // 마크다운
  createdAt: 'number',
  updatedAt: 'string',
} as const;

//“문형(문장 구조)” 데이터
const EngNotesSchema = {
  id: 'string',
  title: 'string',
  description: 'string',
  content: 'string', // 마크다운
  linkedWordIds: 'string',
  createdAt: 'number',
  updatedAt: 'string',
} as const;

// --------
// ✅ 공통 유틸
type SchemaToType<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends 'number' // 숫자
    ? number
    : // 문자열 배열
      T[K] extends 'string[]'
      ? string[]
      : // 객체 배열 (ex: '{id:string, title:string}[]')
        T[K] extends `${string}[]`
        ? T[K] extends `{${string}}[]`
          ? Record<string, string>[]
          : string[]
        : string;
};
type ChannelHistory = SchemaToType<typeof ChannelHistorySchema>;
type Channel = SchemaToType<typeof ChannelSchema>;
type Tag = SchemaToType<typeof TagSchema>;
type Result = SchemaToType<typeof ResultSchema>;
type Prompt = SchemaToType<typeof PromptSchema>;
type Reference = SchemaToType<typeof ReferenceSchema>;
type EngWords = SchemaToType<typeof EngWordsSchema>;
type EngNotes = SchemaToType<typeof EngNotesSchema>;

const SheetKeys = {
  channelHistory: Object.keys(ChannelHistorySchema) as (keyof ChannelHistory)[],
  channel: Object.keys(ChannelSchema) as (keyof Channel)[],
  tag: Object.keys(TagSchema) as (keyof Tag)[],
  result: Object.keys(ResultSchema) as (keyof Result)[],
  prompt: Object.keys(PromptSchema) as (keyof Prompt)[],
  reference: Object.keys(ReferenceSchema) as (keyof Reference)[],
  engWords: Object.keys(EngWordsSchema) as (keyof EngWords)[],
  engNotes: Object.keys(EngNotesSchema) as (keyof EngNotes)[],
};

type SheetKeyType<T extends keyof typeof SheetKeys> = (typeof SheetKeys)[T][number];
type SheetName = keyof typeof SheetKeys;

function buildAoaFromObjects<T extends SheetName>(
  rows: Record<string, any>[], //
  sheet: T
): any[][] {
  // 헤더(label)
  const header = SheetKeys[sheet];
  // 바디(column 키로 값 추출)
  const body = rows.map((obj) => header.map((d) => formatArrayValue(obj[d])));

  return [header, ...body];
}

function formatArrayValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join('_');
  }
  return value ?? '';
}

export { SheetKeys, buildAoaFromObjects };
export type { DBSchema, SheetKeyType, SheetName };
