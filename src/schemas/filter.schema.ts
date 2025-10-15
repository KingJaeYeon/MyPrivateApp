// src/schemas/filter.schema.ts
import { z } from 'zod';

/** 공통 스키마 (UI는 string, 제출 시 coerce로 number/boolean 정규화) */
export const CommonFilterSchema = z.object({
  mode: z.enum(['channels', 'keywords']),
  videoDuration: z.enum(['any', 'short', 'medium', 'long']),
  minViews: z.coerce.number().min(0, '최소 조회수는 0 이상'),
  minViewsPerHour: z.coerce.number().min(0, '최소 시간당 조회수(vph)는 0 이상'),
  shortsDuration: z.coerce.number().int().min(1, '쇼츠 기준은 1초 이상'),
});

/** 키워드 모드 전용 */
export const KeywordFilterSchema = z.object({
  mode: z.literal('keywords'),
  // 최신 트렌트 영상 찾을려고 키워드검색 때리는거라 옛날 영상은 필요X / 검색한번당 쿼터 100
  days: z.coerce
    .number({ error: '숫자를 입력해주세요' })
    .int()
    .min(1, '최근 N일은 1 이상')
    .max(50, '최근 N일은 50 이하'),
  keyword: z.string().trim().min(1, '키워드를 입력해주세요'),
  maxResults: z.coerce.number().int().min(1, '검색어당 최대 검색 개수는 1 이상'),
  regionCode: z.string().min(2, '국가를 선택해주세요'),
  relevanceLanguage: z.string().min(2, '언어 코드를 입력해주세요'),
});
/** 채널 모드 전용 */
export const ChannelFilterSchema = z.object({
  mode: z.literal('channels'),
  // 단일 채널에 한정해서 검색, 너무 옛날건 안되니까 1년 제한 / 50개당 쿼터 1소모
  days: z.coerce
    .number({ error: '숫자를 입력해주세요' })
    .int()
    .min(1, '최근 N일은 1 이상')
    .max(360, '최근 N일은 360 이하'),
  maxChannels: z.coerce.number().int().min(15, '채널당 최대 검색 수는 10 이상').max(50, '50 이하'),
  channelIds: z.array(z.string().min(1)).min(1, '선택된 채널이 없습니다.'),
  isPopularVideosOnly: z.boolean(), // 누적 인기 모드 전용
});

export const TagSchema = z.object({
  key: z.array(z.string()),
  logic: z.enum(['AND', 'OR']),
});

/** UI 타입(파싱 전, 문자열 위주) / 제출 페이로드 타입(파싱 후, 숫자/불리언 정규화) */
export type CommonFilterUI = ReplaceUnknownWithString<z.input<typeof CommonFilterSchema>>;
export type KeywordFilterUI = ReplaceUnknownWithString<z.input<typeof KeywordFilterSchema>>;
export type ChannelFilterUI = ReplaceUnknownWithString<z.input<typeof ChannelFilterSchema>>;
export type TagsFilterUI = ReplaceUnknownWithString<z.input<typeof TagSchema>>;

export type ChannelPayload = z.infer<typeof ChannelFilterSchema> &
  z.infer<typeof CommonFilterSchema>;
export type KeywordPayload = z.infer<typeof KeywordFilterSchema> &
  z.infer<typeof CommonFilterSchema>;

type ReplaceUnknownWithString<T> = {
  [K in keyof T]: unknown extends T[K] ? string : T[K];
};

/** 기본값(UI용) */
export const defaultCommonUI: CommonFilterUI = {
  mode: 'keywords',
  videoDuration: 'any',
  minViews: '1000',
  minViewsPerHour: '600',
  shortsDuration: '60',
};

export const defaultChannelUI: ChannelFilterUI = {
  mode: 'channels',
  days: '10',
  channelIds: [] as string[],
  maxChannels: '15',
  isPopularVideosOnly: false,
};

export const defaultKeywordUI: KeywordFilterUI = {
  mode: 'keywords',
  days: '7',
  keyword: '',
  maxResults: '50',
  regionCode: 'KR',
  relevanceLanguage: 'ko',
};

export const defaultTagsUI: TagsFilterUI = {
  key: [],
  logic: 'AND',
};
