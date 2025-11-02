'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MultiSelect } from '@/components/ui/multi-select'; // 앞서 만든 멀티셀렉트 컴포넌트 사용

// ----- Mock Data -----
type Verb = { id: string; word: string };
type Pattern = { id: string; title: string; description: string };
type Concept = { id: string; name: string; description: string };
type Expression = {
  id: string;
  text: string;
  meaning: string;
  linkedPatterns: string[];
  linkedVerbs: string[];
  linkedConcepts: string[];
  importance: string;
  memo?: string;
};

const verbs: Verb[] = [
  { id: 'V001', word: 'want' },
  { id: 'V002', word: 'help' },
  { id: 'V003', word: 'prepare' },
];
const patterns: Pattern[] = [
  { id: 'P001', title: 'I want to V', description: 'to 부정사 목적 구조' },
  { id: 'P002', title: 'I want you to V', description: 'ECM 구조' },
  { id: 'P003', title: 'Help O to V', description: 'help 동사 목적격 구조' },
];
const concepts: Concept[] = [
  { id: 'C001', name: 'ECM', description: '목적어가 부정사의 주어 역할' },
  { id: 'C002', name: 'Infinitive', description: 'to 부정사' },
];
const expressions: Expression[] = [
  {
    id: 'E001',
    text: 'I want you to go home.',
    meaning: '나는 네가 집에 가길 원한다.',
    linkedPatterns: ['P002'],
    linkedVerbs: ['V001'],
    linkedConcepts: ['C001', 'C002'],
    importance: '★',
    memo: 'ECM 구조 예시',
  },
  {
    id: 'E002',
    text: 'I want to learn English.',
    meaning: '나는 영어를 배우고 싶다.',
    linkedPatterns: ['P001'],
    linkedVerbs: ['V001'],
    linkedConcepts: ['C002'],
    importance: '☆',
  },
  {
    id: 'E003',
    text: 'He helped me to clean up.',
    meaning: '그는 내가 청소하도록 도왔다.',
    linkedPatterns: ['P003'],
    linkedVerbs: ['V002'],
    linkedConcepts: ['C002'],
    importance: '★',
  },
];

// ----- Helper -----
const getByIds = (ids: string[], list: any[]) => list.filter((x) => ids.includes(x.id));

export default function ExpressionsPage() {
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [selectedVerbs, setSelectedVerbs] = useState<string[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [selectedExp, setSelectedExp] = useState<Expression | null>(null);

  // OR 조건 필터링
  const filtered = useMemo(() => {
    return expressions.filter((e) => {
      const matchPattern = selectedPatterns.length
        ? e.linkedPatterns.some((p) => selectedPatterns.includes(p))
        : true;
      const matchVerb = selectedVerbs.length
        ? e.linkedVerbs.some((v) => selectedVerbs.includes(v))
        : true;
      const matchConcept = selectedConcepts.length
        ? e.linkedConcepts.some((c) => selectedConcepts.includes(c))
        : true;
      return matchPattern && matchVerb && matchConcept;
    });
  }, [selectedPatterns, selectedVerbs, selectedConcepts]);

  const resetFilters = () => {
    setSelectedPatterns([]);
    setSelectedVerbs([]);
    setSelectedConcepts([]);
  };

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-[360px_1fr] gap-4 p-6">
      {/* Left Filters */}
      <div className="space-y-4 border-r pr-4">
        <h2 className="mb-2 text-lg font-semibold">🔍 Filter by</h2>

        <MultiSelect
          options={patterns.map((p) => ({ label: p.title, value: p.id }))}
          value={selectedPatterns}
          onChange={setSelectedPatterns}
          placeholder="Select patterns..."
        />

        <MultiSelect
          options={verbs.map((v) => ({ label: v.word, value: v.id }))}
          value={selectedVerbs}
          onChange={setSelectedVerbs}
          placeholder="Select verbs..."
        />

        <MultiSelect
          options={concepts.map((c) => ({ label: c.name, value: c.id }))}
          value={selectedConcepts}
          onChange={setSelectedConcepts}
          placeholder="Select concepts..."
        />

        <div className="mt-4 flex justify-between">
          <Button size="sm" variant="outline" onClick={resetFilters}>
            Reset
          </Button>
          <span className="text-muted-foreground text-xs">{filtered.length} results</span>
        </div>
      </div>

      {/* Right View */}
      <div className="grid grid-cols-2 gap-4 overflow-hidden">
        {/* Expressions Board */}
        <ScrollArea className="h-full rounded-md border p-3">
          <h3 className="mb-3 font-semibold">📘 Expression List</h3>
          <div className="space-y-3">
            {filtered.map((e) => (
              <Card
                key={e.id}
                className={`cursor-pointer p-3 transition ${
                  selectedExp?.id === e.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedExp(e)}
              >
                <CardHeader className="mb-1 p-0">
                  <CardTitle className="text-sm">{e.text}</CardTitle>
                  <p className="text-muted-foreground text-xs">{e.meaning}</p>
                </CardHeader>
                <div className="mt-1 flex flex-wrap gap-1">
                  {e.linkedPatterns.map((id) => {
                    const p = patterns.find((x) => x.id === id);
                    return (
                      <Badge key={id} variant="outline">
                        {p?.title}
                      </Badge>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Right Detail Panel */}
        <ScrollArea className="h-full rounded-md border p-3">
          {selectedExp ? (
            <>
              <h3 className="mb-2 text-lg font-semibold">{selectedExp.text}</h3>
              <p className="text-muted-foreground mb-3 text-sm">{selectedExp.meaning}</p>
              <Separator className="my-3" />
              <h4 className="mb-1 font-semibold">🧩 Linked Tags</h4>
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedExp.linkedPatterns.map((id) => {
                  const p = patterns.find((x) => x.id === id);
                  return <Badge key={id}>{p?.title}</Badge>;
                })}
                {selectedExp.linkedVerbs.map((id) => {
                  const v = verbs.find((x) => x.id === id);
                  return (
                    <Badge key={id} variant="secondary">
                      {v?.word}
                    </Badge>
                  );
                })}
                {selectedExp.linkedConcepts.map((id) => {
                  const c = concepts.find((x) => x.id === id);
                  return (
                    <Badge key={id} variant="outline">
                      {c?.name}
                    </Badge>
                  );
                })}
              </div>

              <h4 className="mb-2 font-semibold">📖 Tag Descriptions</h4>
              <div className="mb-3 space-y-1 text-xs">
                {[
                  ...getByIds(selectedExp.linkedPatterns, patterns).map(
                    (p) => `${p.title}: ${p.description}`
                  ),
                  ...getByIds(selectedExp.linkedConcepts, concepts).map(
                    (c) => `${c.name}: ${c.description}`
                  ),
                ].map((desc, i) => (
                  <p key={i}>• {desc}</p>
                ))}
              </div>

              {selectedExp.memo && (
                <>
                  <Separator className="my-3" />
                  <p className="text-muted-foreground text-xs">📝 {selectedExp.memo}</p>
                </>
              )}
            </>
          ) : (
            <p className="text-muted-foreground mt-10 text-sm">왼쪽에서 예문을 선택하세요.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
