import { useVideoSearchStore } from '@/store/useVideoSearchStore.ts';
import { Label } from '@/components/ui/label.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Input } from '@/components/ui/input.tsx';
import Tip from '@/components/Tip.tsx';
import IconMoreInfo from '@/assets/svg/IconMoreInfo.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import React from 'react';
import { TagFilterRow } from '@/pages/search-video/components/TagFilterRow.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { useChannelPair, useCommonPair, useKeywordPair } from '@/hooks/useVideoSearchSelectors.tsx';
import { cn } from '@/lib/utils.ts';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import flag from '../../../../public/flag.json';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx';
import { IconCheck, IconLinearCopy } from '@/assets/svg';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard.ts';

export function FilterOptions() {
  const flags = Object.keys(flag) as (keyof typeof flag)[];
  const { fieldErrorsKeys, setMode, setChannel, setCommon, setKeyword } = useVideoSearchStore();
  const { mode, minViews, minViewsPerHour, shortsDuration, videoDuration } = useCommonPair();
  const {
    relevanceLanguage,
    regionCode,
    keyword,
    maxResults,
    days: publishedAfterK,
  } = useKeywordPair();
  const { isPopularVideosOnly, maxChannels, days: publishedAfterC } = useChannelPair();
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const days = mode === 'channels' ? publishedAfterC : publishedAfterK;

  return (
    <>
      {mode === 'channels' ? (
        <TagFilterRow />
      ) : (
        <div
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows] duration-300',
            'grid-rows-[1fr] border-b pb-3'
          )}
        >
          <div className="flex min-h-0 flex-wrap items-center gap-2">
            <div className={'flex h-9 items-center justify-between gap-4'}>
              <Label htmlFor="keyword" className="min-w-fit">
                키워드
                <Tip
                  txt={
                    '검색 범위: 제목(title), 설명(description), 태그(tags)\n' +
                    '연산자: \n' +
                    '  • OR → | (cat|dog)\n' +
                    '  • AND → , (cat,dog)\n' +
                    '  • NOT → - ( -fish )\n' +
                    '예시: cat|dog -fish / cat,dog -fish'
                  }
                  className={'whitespace-pre-wrap'}
                >
                  <IconMoreInfo />
                </Tip>
              </Label>
              <InputGroup className="h-8 w-[270px]">
                <InputGroupInput
                  id="keyword"
                  value={keyword}
                  placeholder="입력해주세요."
                  onChange={(e) => setKeyword('keyword', e.target.value)}
                  aria-invalid={fieldErrorsKeys.includes('keyword')}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label="Copy"
                    title="Copy"
                    size="icon-xs"
                    onClick={() => copyToClipboard(keyword)}
                  >
                    {isCopied ? <IconCheck /> : <IconLinearCopy />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
      )}
      <div className={'grid w-full grid-cols-3 gap-x-6'}>
        <div className="flex flex-col gap-2">
          <div className="flex w-full max-w-sm items-center justify-between gap-2">
            <Label htmlFor="mode" className="min-w-fit">
              실행모드
            </Label>
            <Select value={mode} onValueChange={(v) => setMode(v as 'channels' | 'keywords')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="channels">채널</SelectItem>
                  <SelectItem value="keywords">키워드</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {mode === 'keywords' && (
            <React.Fragment>
              <div className="flex h-8 w-full max-w-sm items-center justify-between gap-4">
                <Label htmlFor="maxResults" className="min-w-fit">
                  최대 검색 개수 ({maxResults})
                </Label>
                <Slider
                  max={300}
                  step={10}
                  className={'max-w-[200px]'}
                  value={[Number(maxResults)]}
                  onValueChange={(value) => {
                    if (value[0] <= 50) {
                      value = [50];
                    }
                    setKeyword('maxResults', value[0].toString());
                  }}
                />
              </div>
            </React.Fragment>
          )}
          {mode === 'channels' && (
            <React.Fragment>
              <div className="flex h-8 w-full max-w-sm items-center justify-between gap-4">
                <Label htmlFor="maxChannels" className="min-w-fit">
                  채널당 최대 검색 수 ({maxChannels})
                </Label>
                <Slider
                  max={50}
                  step={5}
                  className={'max-w-[200px]'}
                  value={[Number(maxChannels)]}
                  onValueChange={(value) => {
                    if (value[0] <= 15) {
                      value = [15];
                    }
                    setChannel('maxChannels', value[0].toString());
                  }}
                />
              </div>
              <div className="flex h-8 w-full max-w-sm items-center justify-between gap-2">
                <Label htmlFor="language" className="min-w-fit">
                  채널별 인기영상 보기
                  <Tip txt={'off : 최신순으로 수집 \non: 최근 N일 내 모든 영상내에서 인기순\n'}>
                    <IconMoreInfo />
                  </Tip>
                </Label>
                <Checkbox
                  checked={isPopularVideosOnly}
                  onCheckedChange={(c) => setChannel('isPopularVideosOnly', !!c)}
                />
              </div>
            </React.Fragment>
          )}
        </div>

        {/* 컬럼 2 */}
        <div className="flex flex-col gap-2">
          <div className="flex w-full max-w-sm items-center justify-between gap-2">
            <Label htmlFor="minViews" className={'min-w-fit'}>
              최소 조회수
            </Label>
            <Input
              id="minViews"
              value={minViews}
              onChange={(e) => setCommon('minViews', e.target.value)}
              className="h-8 w-[70px]"
              aria-invalid={fieldErrorsKeys.includes('minViews')}
            />
          </div>
          <div className="flex w-full max-w-sm items-center justify-between gap-2">
            <Label htmlFor="MinimumViewsPerHour" className={'min-w-fit'}>
              최소 시간당 조회수(vph)
            </Label>
            <Input
              id="MinimumViewsPerHour"
              value={minViewsPerHour}
              onChange={(e) => setCommon('minViewsPerHour', e.target.value)}
              className="h-8 w-[70px]"
              aria-invalid={fieldErrorsKeys.includes('minViewsPerHour')}
            />
          </div>
          <div className="flex w-full max-w-sm items-center justify-between gap-2">
            <Label htmlFor="day" className={'min-w-fit'}>
              최근 {Number(days) > 0 ? days : 'N'}일 이내 업로드된 영상 분석
              <Tip txt={'채널검색: 최대 360\n키워드검색: 최대 50'}>
                <IconMoreInfo />
              </Tip>
            </Label>
            <Input
              id="day"
              value={days}
              onChange={(e) => {
                let value = e.target.value;
                if (value.length >= 3) {
                  value = value.substring(0, 3);
                }

                if (mode === 'channels') {
                  setChannel('days', value);
                } else {
                  setKeyword('days', value);
                }
              }}
              className="h-8 w-[70px]"
              aria-invalid={fieldErrorsKeys.includes('days')}
            />
          </div>
        </div>

        {/* 컬럼 3 */}
        <div className="flex flex-col gap-2">
          <div className="flex w-full max-w-sm items-center justify-between gap-2">
            <Label htmlFor="videoDuration" className="min-w-fit">
              영상 유형
              <Tip txt="롱폼(20분이상), 일반(4~20분), 쇼츠(4분미만)">
                <IconMoreInfo />
              </Tip>
            </Label>
            <Select
              value={videoDuration}
              onValueChange={(v) => setCommon('videoDuration', v as any)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[100px]">
                <SelectGroup>
                  <SelectItem value="any">전체</SelectItem>
                  <SelectItem value="short">쇼츠</SelectItem>
                  <SelectItem value="medium">일반</SelectItem>
                  <SelectItem value="long">롱폼</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full max-w-sm items-center justify-between gap-2">
            <Label htmlFor="shortsDuration" className="min-w-fit">
              쇼츠 기준(s)(준비중)
            </Label>
            <Input
              id="shortsDuration"
              value={shortsDuration}
              onChange={(e) => setCommon('shortsDuration', e.target.value)}
              className="h-8 w-[100px]"
              aria-invalid={fieldErrorsKeys.includes('shortsDuration')}
            />
          </div>
          {mode === 'keywords' && (
            <div className="flex w-full max-w-sm items-center justify-between gap-2">
              <Label htmlFor="country" className="min-w-fit">
                대상 국가 / 언어
                <Tip
                  txt={
                    '대상 국가: 지역별 인기 차트(소비 위치 기준)\n언어: 이 언어로 된 콘텐츠를 우선적으로 보여 달라\n(예: ko → 한국어 제목/설명이 많은 영상이 우선 노출될 가능성이 높음)'
                  }
                >
                  <IconMoreInfo />
                </Tip>
              </Label>
              <ButtonGroup>
                <Select
                  value={regionCode}
                  onValueChange={(v) => setKeyword('regionCode', v as any)}
                >
                  <SelectTrigger className="w-14 px-2" size={'sm'}>
                    <img src={`/flag/${regionCode}.svg`} alt={'test'} />
                  </SelectTrigger>
                  <SelectContent className="min-w-40" align={'center'}>
                    <SelectGroup>
                      {flags.map((v) => {
                        const val = flag[v];
                        return (
                          <SelectItem key={val.slug} value={v}>
                            <img src={`/flag/${v}.svg`} alt={val.language} className={'mr-1'} />{' '}
                            <span className="text-muted-foreground">{val['translation-ko']}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input
                  id="relevanceLanguage"
                  value={relevanceLanguage}
                  onChange={(e) => setKeyword('relevanceLanguage', e.target.value)}
                  className="h-8 w-[90px]"
                />
              </ButtonGroup>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
