import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useModalStore } from '@/store/modalStore.ts';

// 임시 데이터
const mockResults = [
  {
    id: 'lsy748',
    filename: '[2025-10-19 20:54] lsy748',
    date: '2025-10-19 20:54',
    totalCount: 50,
    filters: {
      searchMode: 'keywords',
      keyword: '컴보디아',
      publishedAfter: '2025-10-09',
      minViews: 400,
      maxResults: 1000,
    },
  },
  {
    id: 'yqjfh4',
    filename: '[2025-10-19 20:54] yqjfh4',
    date: '2025-10-19 20:54',
    totalCount: 32,
    filters: {
      searchMode: 'keywords',
      keyword: 'React',
      publishedAfter: '2025-10-01',
    },
  },
  {
    id: 'o9dluw',
    filename: '[2025-10-19 21:03] o9dluw',
    date: '2025-10-19 21:03',
    totalCount: 127,
    filters: {
      searchMode: 'channel',
      channelId: 'UCxxxxxx',
    },
    isActive: true,
  },
];

export function ResultsSettings() {
  const [results, setResults] = useState(mockResults);
  const [selectedId, setSelectedId] = useState(mockResults[2].id);
  const { openModal } = useModalStore();

  const selectedResult = results.find((r) => r.id === selectedId);

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setResults(results.filter((r) => r.id !== id));
      if (selectedId === id) {
        setSelectedId(results[0]?.id || '');
      }
    }
  };

  const handleOpenFile = (filename: string) => {
    openModal('alert', `${filename}.xlsx 파일을 엽니다`);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* 왼쪽: 결과 목록 */}
      <Card className="flex w-80 flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">저장된 결과</CardTitle>
            <Button size="icon" variant="ghost" onClick={() => toast('새로고침')}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="space-y-2 p-4">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedId(result.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedId === result.id ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground mb-1 text-xs">{result.date}</p>
                      <p className="truncate font-mono text-sm font-medium">{result.id}</p>
                    </div>
                    {result.isActive && (
                      <Badge variant="default" className="text-xs">
                        활성
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 오른쪽: 상세 정보 */}
      {selectedResult ? (
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-mono">{selectedResult.filename}</CardTitle>
                  <CardDescription className="mt-1">
                    총 {selectedResult.totalCount}개 결과
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenFile(selectedResult.filename)}
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    파일 열기
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(selectedResult.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">검색 필터</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">검색모드</span>
                  <p className="mt-1 font-medium">{selectedResult.filters.searchMode}</p>
                </div>
                {selectedResult.filters.keyword && (
                  <div>
                    <span className="text-muted-foreground">키워드</span>
                    <p className="mt-1 font-medium">{selectedResult.filters.keyword}</p>
                  </div>
                )}
                {selectedResult.filters.publishedAfter && (
                  <div>
                    <span className="text-muted-foreground">업로드일</span>
                    <p className="mt-1 font-medium">{selectedResult.filters.publishedAfter}</p>
                  </div>
                )}
                {selectedResult.filters.minViews && (
                  <div>
                    <span className="text-muted-foreground">최소 조회수</span>
                    <p className="mt-1 font-medium">
                      {selectedResult.filters.minViews.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedResult.filters.maxResults && (
                  <div>
                    <span className="text-muted-foreground">최대 조회수</span>
                    <p className="mt-1 font-medium">
                      {selectedResult.filters.maxResults.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-muted-foreground flex flex-1 items-center justify-center">
          결과를 선택하세요
        </div>
      )}
    </div>
  );
}
