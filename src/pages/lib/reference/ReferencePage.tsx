import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ExternalLink, Search, Tag, TagIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import useDebounce from '@/hooks/use-debounce.ts';
import useTagStore from '@/store/useTagStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card.tsx';
import ButtonSwitcher from '@/components/ButtonSwitcher.tsx';
import { useNavigate } from 'react-router-dom';

export default function ReferenceViewPage() {
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagLogic, setTagLogic] = useState<string>('OR');
  const { jsonData, data: tags } = useTagStore();
  const { getData } = useReferenceStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const debounceS = useDebounce(searchTerm);

  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const debounceT = useDebounce(tagSearchTerm);

  const curTags = useMemo(() => {
    const curTagIds = Array.from(
      new Set(
        getData()
          .flatMap((item) => item.tag.split(',')) // ',' 기준 분리 (단일, 여러개, 빈문자열 전부 OK)
          .map((t) => t.trim()) // 공백 제거
          .filter(Boolean) // '' 제거
      )
    );

    return tags
      .filter((tag) => curTagIds.includes(tag.idx))
      .filter((v) => v.name.toLowerCase().includes(debounceT.toLowerCase()));
  }, [getData, debounceT]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const reference = useMemo(() => {
    const data = getData().sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return db - da;
    });

    return data.filter((item) => {
      // 1. 검색어 필터 (name 또는 memo에 포함)
      const matchesSearch =
        !debounceS ||
        item.name.toLowerCase().includes(debounceS.toLowerCase()) ||
        (item.memo && item.memo.toLowerCase().includes(debounceS.toLowerCase()));

      // 2. 태그 필터 (선택된 태그가 있으면 해당 태그를 포함한 항목만)
      const matchesTags =
        selectedTags.length === 0 ||
        (tagLogic === 'AND'
          ? selectedTags.every((selectedTag) =>
              item.tag
                .split(',')
                .map((t) => t.trim())
                .includes(selectedTag)
            )
          : selectedTags.some((selectedTag) =>
              item.tag
                .split(',')
                .map((t) => t.trim())
                .includes(selectedTag)
            ));

      return matchesSearch && matchesTags;
    });
  }, [selectedTags, debounceS, getData, tagLogic]);

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-5 px-4">
      {/* 상단 필터 영역 */}
      <div className="bg-background space-y-3 border-b pb-4">
        {/* 검색바 + 태그 선택 + 버튼들 */}
        <div className="flex items-center gap-2">
          {/* 태그 선택 Popover */}
          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 w-[160px] justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="text-sm">
                    {selectedTags.length > 0 ? `${selectedTags.length}개` : '태그'}
                  </span>
                </div>
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-3" align="start">
              {/* 태그 검색 */}
              <div className="relative mb-3">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2" />
                <Input
                  placeholder="태그 검색..."
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                  className="h-8 pl-8 text-sm"
                />
              </div>

              {/* 태그 목록 */}
              <ScrollArea className="">
                <div className="flex flex-wrap gap-2 pr-2">
                  {curTags.length > 0 ? (
                    curTags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant={selectedTags.includes(tag.idx) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.idx)}
                      >
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">검색 결과가 없습니다</span>
                  )}
                </div>
              </ScrollArea>

              {/* Clear 버튼 */}

              <div className="mt-3 flex justify-between border-t pt-3">
                <ButtonSwitcher
                  state={tagLogic}
                  setState={setTagLogic}
                  size={'sm'}
                  list={[
                    { label: 'AND', value: 'AND' },
                    { label: 'OR', value: 'OR' },
                  ]}
                />
                {selectedTags.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearAllTags} className="text-xs">
                    모두 지우기
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* 검색바 */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="참조명 또는 메모로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9"
            />
          </div>

          {/* Add 버튼 */}
          <Button
            variant="default"
            className={'h-10'}
            onClick={() => navigate('/lib/reference/edit')}
          >
            Edit
          </Button>
        </div>

        {/* 선택된 태그 표시 */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge>{tagLogic.toUpperCase()}</Badge>
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1 text-xs"
                onClick={() => removeTag(tag)}
              >
                {jsonData[tag]}
                <button className="hover:bg-background/20 rounded-full p-0.5">
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="scrollWidth3 flex-1 overflow-auto pr-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {/*{JSON.stringify(reference.map((r) => r.name))}*/}
          {reference.map((reference) => (
            <Item reference={reference} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Item({ reference }: { reference: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { jsonData } = useTagStore();
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const calculatedScale = containerWidth / 1280;
        setScale(calculatedScale);
      }
    };

    updateScale();

    // ResizeObserver로 컨테이너 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const tags = reference.tag
    ? reference.tag
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <Card className="flex flex-1 flex-col overflow-hidden transition hover:shadow-lg">
      {/* 상단: 제목 + 링크 버튼 */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex flex-1 flex-col space-y-1">
          <h3 className="line-clamp-2 leading-tight font-semibold">
            {reference.name || '제목 없음'}
          </h3>
          {reference.memo && (
            <p className="text-muted-foreground line-clamp-2 text-xs">{reference.memo}</p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="ml-2 h-8 w-8 shrink-0 p-0"
          onClick={() => window.electronAPI.openExternal(reference.link)}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>

      {/* 중앙: 웹뷰 미리보기 */}
      <CardContent>
        <div
          ref={containerRef}
          className="bg-muted relative overflow-hidden"
          style={{ paddingTop: '56.4%' }}
        >
          <webview
            src={reference.link}
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)
               AppleWebKit/537.36 (KHTML, like Gecko)
               Chrome/123.0.0.0 Safari/537.36"
            className="h-full w-full"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '1280px',
              height: '720px',
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center center',
              border: 'none',
              pointerEvents: 'none', // 클릭 방지 (미리보기용)
            }}
          />
        </div>
      </CardContent>
      {/* 하단: 태그 */}
      {tags.length > 0 && (
        <CardFooter className="flex-wrap gap-1.5 border-t pt-3">
          <TagIcon className="text-muted-foreground h-3 w-3 shrink-0" />
          {tags.map((tag: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {jsonData[tag]}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
