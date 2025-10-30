import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Calendar,
  Edit,
  GripVertical,
  MessageSquare,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== 타입 정의 ====================
type Pattern = {
  id: string;
  text: string;
  explanation: string;
  importance: boolean;
  order: number;
};

type Example = {
  id: string;
  text: string;
  translation: string;
  patterns: string[]; // pattern id 배열
  importance: 1 | 2 | 3; // 1: 높음, 2: 중간, 3: 낮음
  createdAt: string;
};

type JournalEntry = {
  id: string;
  date: string;
  title: string;
  content: string;
  memo: string;
  patterns: string[];
  vocabulary: string[];
  importance: number;
};

type Dialogue = {
  id: string;
  situation: string;
  lines: { speaker: string; text: string }[];
};

// ==================== Mock 데이터 ====================
const mockPatterns: Pattern[] = [
  { id: '1', text: 'have to', explanation: '~해야 한다 (의무)', importance: true, order: 1 },
  { id: '2', text: 'used to', explanation: '~하곤 했다 (과거 습관)', importance: true, order: 2 },
  { id: '3', text: 'be going to', explanation: '~할 것이다 (계획)', importance: false, order: 3 },
  { id: '4', text: 'would rather', explanation: '차라리 ~하고 싶다', importance: true, order: 4 },
  { id: '5', text: 'in order to', explanation: '~하기 위해', importance: false, order: 5 },
];

const mockExamples: Example[] = [
  {
    id: '1',
    text: 'I have to finish this report by tomorrow.',
    translation: '나는 내일까지 이 보고서를 끝내야 한다.',
    patterns: ['1'],
    importance: 1,
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    text: 'I used to play basketball every weekend.',
    translation: '나는 매주 주말에 농구를 하곤 했다.',
    patterns: ['2'],
    importance: 2,
    createdAt: '2025-01-14',
  },
  {
    id: '3',
    text: 'I have to wake up early, but I would rather sleep in.',
    translation: '일찍 일어나야 하지만, 차라리 늦잠을 자고 싶다.',
    patterns: ['1', '4'],
    importance: 1,
    createdAt: '2025-01-13',
  },
  {
    id: '4',
    text: 'I studied hard in order to pass the exam.',
    translation: '시험에 합격하기 위해 열심히 공부했다.',
    patterns: ['5'],
    importance: 3,
    createdAt: '2025-01-12',
  },
  {
    id: '4',
    text: 'I studied hard in order to pass the exam.',
    translation: '시험에 합격하기 위해 열심히 공부했다.',
    patterns: ['5'],
    importance: 3,
    createdAt: '2025-01-12',
  },
  {
    id: '4',
    text: 'I studied hard in order to pass the exam.',
    translation: '시험에 합격하기 위해 열심히 공부했다.',
    patterns: ['5'],
    importance: 3,
    createdAt: '2025-01-12',
  },
];

const mockJournals: JournalEntry[] = [
  {
    id: '1',
    date: '2025-01-15',
    title: 'My Daily Routine',
    content:
      'I have to wake up early every morning. I used to hate mornings, but now I enjoy them.',
    memo: 'have to: 의무를 나타냄\nused to: 과거 습관',
    patterns: ['1', '2'],
    vocabulary: ['routine', 'morning', 'enjoy'],
    importance: 5,
  },
];

const mockDialogues: Dialogue[] = [
  {
    id: '1',
    situation: '카페에서 주문하기',
    lines: [
      { speaker: 'Customer', text: 'Hi, I would like a cappuccino, please.' },
      { speaker: 'Barista', text: 'Sure! What size would you like?' },
      { speaker: 'Customer', text: "I'll have a medium, please." },
    ],
  },
  {
    id: '2',
    situation: '면접에서 자기소개',
    lines: [
      { speaker: 'Interviewer', text: 'Tell me about yourself.' },
      { speaker: 'Candidate', text: 'I have 5 years of experience in software development...' },
    ],
  },
];

// ==================== 메인 컴포넌트 ====================
export default function EnglishPage() {
  const [view, setView] = useState<'examples' | 'journal' | 'dialogues'>('examples');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [sortBy, setSortBy] = useState<'importance' | 'date'>('importance');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  // 패턴 선택/해제
  const togglePattern = (patternId: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId]
    );
  };

  // 필터링된 예문 (OR 로직)
  const filteredExamples = useMemo(() => {
    let result = mockExamples;

    // 패턴 필터 (OR)
    if (selectedPatterns.length > 0) {
      result = result.filter((ex) =>
        selectedPatterns.some((patternId) => ex.patterns.includes(patternId))
      );
    }

    // 검색
    if (searchQuery) {
      result = result.filter(
        (ex) =>
          ex.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.translation.includes(searchQuery)
      );
    }

    // 정렬
    if (sortBy === 'importance') {
      result.sort((a, b) => a.importance - b.importance);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [selectedPatterns, searchQuery, sortBy]);

  const getImportanceColor = (importance: 1 | 2 | 3) => {
    switch (importance) {
      case 1:
        return 'bg-amber-500';
      case 2:
        return 'bg-blue-500';
      case 3:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex h-full w-full gap-4 p-4">
      {/* ==================== 좌측: 패턴 리스트 ==================== */}
      <aside className="flex w-64 flex-col gap-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">패턴 필터</h3>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {mockPatterns
                  .sort((a, b) => a.order - b.order)
                  .map((pattern) => (
                    <label
                      key={pattern.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors',
                        selectedPatterns.includes(pattern.id)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-accent'
                      )}
                    >
                      <GripVertical className="text-muted-foreground h-4 w-4" />
                      <Checkbox
                        checked={selectedPatterns.includes(pattern.id)}
                        onCheckedChange={() => togglePattern(pattern.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{pattern.text}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {pattern.explanation}
                        </p>
                      </div>
                      {pattern.importance && (
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      )}
                    </label>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      {/* ==================== 중앙: 콘텐츠 영역 ==================== */}
      <main className="flex flex-1 flex-col gap-4">
        {/* 상단 컨트롤 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* 뷰 선택 */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={view === 'examples' ? 'default' : 'outline'}
                  onClick={() => setView('examples')}
                >
                  <BookOpen className="mr-1 h-4 w-4" />
                  예문
                </Button>
                <Button
                  size="sm"
                  variant={view === 'journal' ? 'default' : 'outline'}
                  onClick={() => setView('journal')}
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  일기
                </Button>
                <Button
                  size="sm"
                  variant={view === 'dialogues' ? 'default' : 'outline'}
                  onClick={() => setView('dialogues')}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  대화문
                </Button>
              </div>

              {/* 검색 & 정렬 */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                  <Input
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px] pl-8"
                  />
                </div>

                {view === 'examples' && (
                  <>
                    <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="importance">중요도순</SelectItem>
                        <SelectItem value="date">최신순</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">카드</SelectItem>
                        <SelectItem value="table">테이블</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  추가
                </Button>
              </div>
            </div>

            {/* 선택된 패턴 표시 */}
            {selectedPatterns.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-xs">필터:</span>
                {selectedPatterns.map((patternId) => {
                  const pattern = mockPatterns.find((p) => p.id === patternId);
                  return (
                    <Badge key={patternId} variant="secondary" className="gap-1">
                      {pattern?.text}
                      <button
                        onClick={() => togglePattern(patternId)}
                        className="hover:text-destructive ml-1"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatterns([])}
                  className="h-6 text-xs"
                >
                  전체 해제
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 콘텐츠 리스트 */}
        <ScrollArea className="flex-1">
          {view === 'examples' && (
            <div className={cn(viewMode === 'card' ? 'grid grid-cols-2 gap-4' : 'space-y-2')}>
              {filteredExamples.map((example) => (
                <Card
                  key={example.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedExample?.id === example.id && 'ring-primary ring-2'
                  )}
                  onClick={() => setSelectedExample(example)}
                >
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-relaxed font-medium">{example.text}</p>
                        <p className="text-muted-foreground text-xs">{example.translation}</p>
                      </div>
                      <div
                        className={cn(
                          'h-3 w-3 flex-shrink-0 rounded-full',
                          getImportanceColor(example.importance)
                        )}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {example.patterns.map((patternId) => {
                        const pattern = mockPatterns.find((p) => p.id === patternId);
                        return (
                          <Badge key={patternId} variant="outline" className="text-[10px]">
                            {pattern?.text}
                          </Badge>
                        );
                      })}
                    </div>

                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>{example.createdAt}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredExamples.length === 0 && (
                <div className="text-muted-foreground col-span-2 py-12 text-center">
                  선택한 패턴에 해당하는 예문이 없습니다
                </div>
              )}
            </div>
          )}

          {view === 'journal' && (
            <div className="space-y-4">
              {mockJournals.map((journal) => (
                <Card
                  key={journal.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => setSelectedJournal(journal)}
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{journal.title}</h4>
                        <p className="text-muted-foreground text-xs">{journal.date}</p>
                      </div>
                      <div className="flex">
                        {Array.from({ length: journal.importance }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="line-clamp-3 text-sm">{journal.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {view === 'dialogues' && (
            <div className="space-y-4">
              {mockDialogues.map((dialogue) => (
                <Card key={dialogue.id}>
                  <CardContent className="space-y-3 p-4">
                    <h4 className="text-sm font-semibold">{dialogue.situation}</h4>
                    <div className="space-y-2">
                      {dialogue.lines.map((line, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-muted-foreground min-w-[80px] text-xs font-medium">
                            {line.speaker}:
                          </span>
                          <span className="text-sm">{line.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>

      {/* ==================== 우측: 상세 패널 ==================== */}
      <aside className="flex w-80 flex-col gap-4">
        {selectedExample && (
          <Card className="flex-1">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold">예문 상세</h3>
                <button onClick={() => setSelectedExample(null)}>
                  <span className="text-muted-foreground text-xl">×</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">원문</p>
                  <p className="text-sm leading-relaxed font-medium">{selectedExample.text}</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-xs">해석</p>
                  <p className="text-sm">{selectedExample.translation}</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-2 text-xs">관련 패턴</p>
                  <div className="space-y-2">
                    {selectedExample.patterns.map((patternId) => {
                      const pattern = mockPatterns.find((p) => p.id === patternId);
                      return (
                        <div key={patternId} className="bg-muted/50 space-y-1 rounded-lg p-2">
                          <p className="text-sm font-medium">{pattern?.text}</p>
                          <p className="text-muted-foreground text-xs">{pattern?.explanation}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-xs">중요도</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full',
                        getImportanceColor(selectedExample.importance)
                      )}
                    />
                    <span className="text-xs">
                      {selectedExample.importance === 1
                        ? '높음'
                        : selectedExample.importance === 2
                          ? '중간'
                          : '낮음'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Edit className="mr-1 h-4 w-4" />
                  수정
                </Button>
                <Button variant="destructive" size="sm" className="w-full">
                  <Trash2 className="mr-1 h-4 w-4" />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedJournal && (
          <Card className="flex-1">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold">일기 상세</h3>
                <button onClick={() => setSelectedJournal(null)}>
                  <span className="text-muted-foreground text-xl">×</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">제목</p>
                  <p className="font-semibold">{selectedJournal.title}</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-xs">내용</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedJournal.content}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-xs">문법/단어 메모</p>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs whitespace-pre-wrap">{selectedJournal.memo}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-2 text-xs">주요 단어</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedJournal.vocabulary.map((word) => (
                      <Badge key={word} variant="secondary">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedExample && !selectedJournal && (
          <Card className="flex-1">
            <CardContent className="flex h-full items-center justify-center p-4">
              <p className="text-muted-foreground text-center text-sm">
                항목을 선택하면
                <br />
                상세 정보가 표시됩니다
              </p>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
