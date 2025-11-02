import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ---- Mock Data ----
type Verb = {
  id: string;
  word: string;
  meaning: string;
  memo?: string;
  patternIds: string[];
  conceptIds: string[];
};
type Pattern = { id: string; title: string; structure: string; description: string };
type Concept = { id: string; name: string; description: string };

const patterns: Pattern[] = [
  { id: "P001", title: "I want to V", structure: "S + want + to V", description: "to 부정사 목적 구조" },
  { id: "P002", title: "I want you to V", structure: "S + want + O + to V", description: "ECM 구문" },
  { id: "P003", title: "Help (사람) to V", structure: "S + help + O + to V", description: "help 동사의 목적격 구조" },
];
const concepts: Concept[] = [
  { id: "C001", name: "ECM", description: "S + V + O + to V 구조" },
  { id: "C002", name: "Infinitive", description: "to 부정사 — 목적, 의도 표현" },
];
const verbs: Verb[] = [
  {
    id: "V001",
    word: "want",
    meaning: "원하다",
    memo: "ECM 구조 가능 (want + O + to V)",
    patternIds: ["P001", "P002"],
    conceptIds: ["C001", "C002"],
  },
  {
    id: "V002",
    word: "help",
    meaning: "돕다",
    memo: "목적어 뒤 to부정사 생략 가능",
    patternIds: ["P003"],
    conceptIds: ["C002"],
  },
  {
    id: "V003",
    word: "prepare",
    meaning: "준비하다",
    memo: "ECM 가능하지 않음. 전치사 for과 자주 함께 쓰임.",
    patternIds: [],
    conceptIds: ["C002"],
  },
];

// ---- Helper ----
const getPatterns = (ids: string[]) => patterns.filter((p) => ids.includes(p.id));
const getConcepts = (ids: string[]) => concepts.filter((c) => ids.includes(c.id));

export default function VocabularyPage() {
  const [selected, setSelected] = useState<Verb | null>(null);
  const [query, setQuery] = useState("");

  // 검색 필터링
  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return verbs.filter(
      (v) =>
        v.word.toLowerCase().includes(lower) ||
        v.meaning.toLowerCase().includes(lower) ||
        v.memo?.toLowerCase().includes(lower)
    );
  }, [query]);

  return (
    <div className="grid grid-cols-[280px_1fr] h-[calc(100vh-4rem)]">
      {/* Left List */}
      <div className="border-r p-4">
        <Input
          placeholder="Search word or meaning..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-sm mb-3"
        />
        <ScrollArea className="h-[85%] pr-2">
          {filtered.map((v) => (
            <Card
              key={v.id}
              onClick={() => setSelected(v)}
              className={`mb-2 cursor-pointer transition ${
                selected?.id === v.id ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm">{v.word}</CardTitle>
                <p className="text-xs text-muted-foreground">{v.meaning}</p>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* Right Detail */}
      <div className="p-6 overflow-y-auto">
        {selected ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{selected.word}</h2>
              <Button size="sm" variant="outline">
                수정
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {selected.meaning}
            </p>
            <p className="text-sm mb-4 whitespace-pre-wrap">{selected.memo}</p>
            <Separator className="my-4" />

            {/* Patterns */}
            <div className="mb-5">
              <h3 className="font-semibold mb-2">🔹 Related Patterns</h3>
              {selected.patternIds.length ? (
                <div className="space-y-2">
                  {getPatterns(selected.patternIds).map((p) => (
                    <Card key={p.id} className="p-3">
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.structure}</p>
                      <p className="text-xs mt-1">{p.description}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">연결된 패턴이 없습니다.</p>
              )}
            </div>

            {/* Concepts */}
            <div className="mb-5">
              <h3 className="font-semibold mb-2">🧩 Related Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {getConcepts(selected.conceptIds).map((c) => (
                  <Badge key={c.id} variant="secondary">
                    {c.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Example Section */}
            <div>
              <h3 className="font-semibold mb-2">📖 Example Sentences</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {selected.patternIds.length
                  ? getPatterns(selected.patternIds)
                    .flatMap((p) => p.description.includes("ECM")
                      ? [`${selected.word} you to go home.`]
                      : [`${selected.word} to learn English.`])
                    .map((ex, i) => <li key={i}>{ex}</li>)
                  : <li className="text-muted-foreground">예문이 없습니다.</li>}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm mt-10">
            왼쪽에서 단어를 선택하세요.
          </p>
        )}
      </div>
    </div>
  );
}
