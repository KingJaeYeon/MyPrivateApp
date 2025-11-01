// excel files schema define
type DBSchema = {
  channelHistory: ChannelHistory;
  channel: Channel;
  tag: Tag;
  result: Result;
  prompt: Prompt;
  reference: Reference;
  verbs: Verbs;
  patterns: Patterns;
  concepts: Concepts;
  expressions: Expressions;
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
  viewsPerSubscribers: 'number', // number | null
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
};

const PromptSchema = {
  idx: 'string',
  path: 'string',
  tag: 'string',
  title: 'string',
  prompt: 'string',
  memo: 'string',
  updatedAt: 'string',
  createdAt: 'number',
};

const ReferenceSchema = {
  idx: 'string',
  path: 'string',
  name: 'string',
  tag: 'string',
  link: 'string',
  memo: 'string',
  updatedAt: 'string',
  createdAt: 'number',
};

// --- English ---
//핵심 동사 정의 — ECM 등 문형을 가지는 중심 노드
const VerbsSchema = {
  id: 'string',
  word: 'string',
  meaning: 'string',
  memo: 'string',
  patternIds: 'string[]',
  conceptIds: 'string[]',
  createdAt: 'string',
};

//“문형(문장 구조)” 데이터
const PatternsSchema = {
  id: 'string',
  title: 'string',
  structure: 'string',
  examples: 'string[]',
  verbIds: 'string[]',
  conceptIds: 'string[]',
  description: 'string',
  createdAt: 'string',
};

// ECM, 조동사, 조건문, 비교구문 등 문법적 상위 개념
const ConceptsSchema = {
  id: 'string',
  name: 'string',
  description: 'string',
  relatedPatternIds: 'string[]',
  relatedVerbIds: 'string[]',
  createdAt: 'string',
};
// 실제 예문 - UI에서 필터링의 핵심 단위 (Expression 중심 뷰)
const ExpressionsSchema = {
  id: 'string',
  text: 'string',
  meaning: 'string',
  linkedPatterns: 'string[]',
  linkedVerbs: 'string[]',
  linkedConcepts: 'string[]',
  importance: 'string',
  memo: 'string',
  createdAt: 'string',
};
// --------

// ✅ 공통 유틸
type SchemaToType<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends 'number' ? number : T[K] extends 'string[]' ? string[] : string;
};
type ChannelHistory = SchemaToType<typeof ChannelHistorySchema>;
type Channel = SchemaToType<typeof ChannelSchema>;
type Tag = SchemaToType<typeof TagSchema>;
type Result = SchemaToType<typeof ResultSchema>;
type Prompt = SchemaToType<typeof PromptSchema>;
type Reference = SchemaToType<typeof ReferenceSchema>;
type Verbs = SchemaToType<typeof VerbsSchema>;
type Patterns = SchemaToType<typeof PatternsSchema>;
type Concepts = SchemaToType<typeof ConceptsSchema>;
type Expressions = SchemaToType<typeof ExpressionsSchema>;

const SheetKeys = {
  channelHistory: Object.keys(ChannelHistorySchema) as (keyof ChannelHistory)[],
  channel: Object.keys(ChannelSchema) as (keyof Channel)[],
  tag: Object.keys(TagSchema) as (keyof Tag)[],
  result: Object.keys(ResultSchema) as (keyof Result)[],
  prompt: Object.keys(PromptSchema) as (keyof Prompt)[],
  reference: Object.keys(ReferenceSchema) as (keyof Reference)[],
  verbs: Object.keys(VerbsSchema) as (keyof Verbs)[],
  patterns: Object.keys(PatternsSchema) as (keyof Patterns)[],
  concepts: Object.keys(ConceptsSchema) as (keyof Concepts)[],
  expressions: Object.keys(ExpressionsSchema) as (keyof Expressions)[],
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
