import { useFilterStore } from '@/store/search-video.ts';
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

export function FilterOptions() {
  const { data, set, isValidDays, fieldErrorsKeys } = useFilterStore();

  return (
    <div className={'grid-cols-3 grid w-full gap-x-6'}>
      <div className="flex flex-col gap-3">
        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="mode" className="min-w-fit">
            실행모드
          </Label>
          <Select value={data.mode} onValueChange={(v) => set('mode', v as any)}>
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
        {data.mode === 'keywords' && (
          <div className="flex w-full max-w-sm items-center gap-2 justify-between">
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
            <Input
              id="keyword"
              value={data.keyword}
              placeholder="입력해주세요."
              onChange={(e) => set('keyword', e.target.value)}
              className="w-[250px] h-8"
              aria-invalid={fieldErrorsKeys.includes('keyword')}
            />
          </div>
        )}
        {data.mode === 'channels' && (
          <div className="flex w-full max-w-sm items-center gap-2 justify-between">
            <Label htmlFor="maxChannels" className="min-w-fit">
              채널당 최대 검색 수
            </Label>
            <Input
              id="maxChannels"
              value={data.maxChannels}
              onChange={(e) => set('maxChannels', e.target.value)}
              className="w-[70px] h-8"
              aria-invalid={fieldErrorsKeys.includes('maxChannels')}
            />
          </div>
        )}
        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="day" className="min-w-fit">
            최근 {isValidDays() ? data.days : 'N'}일 이내 업로드된 영상 분석
            <Tip txt="최대: 50">
              <IconMoreInfo />
            </Tip>
          </Label>
          <Input
            id="day"
            value={data.days}
            onChange={(e) => set('days', e.target.value)}
            className="w-[70px] h-8"
            aria-invalid={fieldErrorsKeys.includes('days')}
          />
        </div>

        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="MinimumViewsPerHour" className="min-w-fit">
            최소 시간당 조회수(vph)
          </Label>
          <Input
            id="MinimumViewsPerHour"
            value={data.minViewsPerHour}
            onChange={(e) => set('minViewsPerHour', e.target.value)}
            className="w-[70px] h-8"
            aria-invalid={fieldErrorsKeys.includes('minViewsPerHour')}
          />
        </div>
      </div>

      {/* 컬럼 2 */}
      <div className="flex flex-col gap-3">
        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="videoDuration" className="min-w-fit">
            영상 유형
            <Tip txt="롱폼(20분이상), 일반(4~20분), 쇼츠(4분미만)">
              <IconMoreInfo />
            </Tip>
          </Label>
          <Select value={data.videoDuration} onValueChange={(v) => set('videoDuration', v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="any">전체</SelectItem>
                <SelectItem value="short">쇼츠</SelectItem>
                <SelectItem value="medium">일반</SelectItem>
                <SelectItem value="long">롱폼</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="country" className="min-w-fit">
            대상 국가
            <Tip txt="지역별 인기 차트(소비 위치 기준)">
              <IconMoreInfo />
            </Tip>
          </Label>
          <Select value={data.regionCode} onValueChange={(v) => set('regionCode', v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="KR">한국</SelectItem>
                <SelectItem value="US">미국</SelectItem>
                <SelectItem value="JP">일본</SelectItem>
                <SelectItem value="SE">스웨덴</SelectItem>
                <SelectItem value="DE">독일</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {data.mode === 'keywords' && (
          <div className="flex w-full max-w-sm items-center gap-2 justify-between">
            <Label htmlFor="maxResults" className="min-w-fit">
              최대 검색 개수
            </Label>
            <Input
              id="maxResults"
              value={data.maxResults}
              onChange={(e) => set('maxResults', e.target.value)}
              className="w-[70px] h-8"
              aria-invalid={fieldErrorsKeys.includes('maxResults')}
            />
          </div>
        )}
        {data.mode === 'channels' && (
          <div className="flex w-full max-w-sm items-center gap-2 justify-between">
            <Label htmlFor="language" className="min-w-fit">
              채널별 인기영상 보기
            </Label>
            <Checkbox
              checked={data.isPopularVideosOnly}
              onCheckedChange={(c) => set('isPopularVideosOnly', !!c)}
            />
          </div>
        )}
      </div>

      {/* 컬럼 3 */}
      <div className="flex flex-col gap-3">
        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="shortsDuration" className="min-w-fit">
            쇼츠 기준(s)(준비중)
          </Label>
          <Input
            id="shortsDuration"
            value={data.shortsDuration}
            onChange={(e) => set('shortsDuration', e.target.value)}
            className="w-[70px] h-8"
            aria-invalid={fieldErrorsKeys.includes('shortsDuration')}
          />
        </div>

        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="relevanceLanguage" className="min-w-fit">
            언어
            <Tip
              txt={`이 언어로 된 콘텐츠를 우선적으로 보여 달라\n (예: ko → 한국어 제목/설명이 많은 영상이 우선 노출될 가능성이 높음)`}
            >
              <IconMoreInfo />
            </Tip>
          </Label>
          <Input
            id="relevanceLanguage"
            value={data.relevanceLanguage}
            onChange={(e) => set('relevanceLanguage', e.target.value)}
            className="w-[70px] h-8"
          />
        </div>

        <div className="flex w-full max-w-sm items-center gap-2 justify-between">
          <Label htmlFor="minViews" className="min-w-fit">
            최소 조회수
          </Label>
          <Input
            id="minViews"
            value={data.minViews}
            onChange={(e) => set('minViews', e.target.value)}
            className="w-[70px] h-8"
            aria-invalid={fieldErrorsKeys.includes('minViews')}
          />
        </div>
      </div>
    </div>
  );
}
