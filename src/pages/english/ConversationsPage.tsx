import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ---- Mock Data ----
type Verb = { id: string; word: string; meaning: string };
type Pattern = { id: string; title: string; structure: string; description: string };
type Concept = {
  id: string;
  name: string;
  description: string;
  relatedPatternIds: string[];
  relatedVerbIds: string[];
  parentId?: string | null;
};

const verbs: Verb[] = [
  { id: "V001", word: "want", meaning: "원하다" },
  { id: "V002", word: "help", meaning: "돕다" },
  { id: "V003", word: "prepare", meaning: "준비하다" },
];
const patterns: Pattern[] = [
  { id: "P001", title: "I want to V", structure: "S + want + to V", description: "to 부정사 목적 구조" },
  { id: "P002", title: "I want you to V", structure: "S + want + O + to V", description: "ECM 구문" },
  { id: "P003", title: "Help (사람) to V", structure: "S + help + O + to V", description: "help 동사 목적격 구조" },
];
const concepts: Concept[] = [
  {
    id: "C001",
    name: "ECM",
    description: "Exceptional Case Marking — S + V + O + to V 구조. 목적어가 부정사의 주어 역할을 한다.",
    relatedPatternIds: ["P002", "P003"],
    relatedVerbIds: ["V001", "V002"],
  },
  {
    id: "C002",
    name: "Infinitive",
    description: "to 부정사 — 목적, 의도, 이유, 감정 등을 나타냄.",
    relatedPatternIds: ["P001", "P003"],
    relatedVerbIds: ["V001", "V003"],
  },
  {
    id: "C003",
    name: "Conditional",
    description: "if 절을 이용한 조건문 구조 — 현실/비현실 조건을 표현.",
    relatedPatternIds: [],
    relatedVerbIds: [],
  },
];

const getPatterns = (ids: string[]) => patterns.filter((p) => ids.includes(p.id));
const getVerbs = (ids: string[]) => verbs.filter((v) => ids.includes(v.id));

export default function ConceptsPage() {
  const [selected, setSelected] = useState<Concept | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return concepts.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower)
    );
  }, [query]);

  return (
    <div className="grid grid-cols-[280px_1fr] h-[calc(100vh-4rem)]">
      {/* Left Concept List */}
      <div className="border-r p-4">
        <Input
          placeholder="Search concept..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-sm mb-3"
        />
        <ScrollArea className="h-[85%] pr-2">
          {filtered.map((c) => (
            <Card
              key={c.id}
              onClick={() => setSelected(c)}
              className={`mb-2 cursor-pointer transition ${
                selected?.id === c.id ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">{c.name}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{c.description}</p>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* Right Detail */}
      <div className="p-6 overflow-y-auto">
        {selected ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <Button size="sm" variant="secondary">
                수정
              </Button>
            </div>
            <p className="text-sm whitespace-pre-wrap mb-4">{selected.description}</p>
            <Separator className="my-4" />

            {/* Patterns */}
            <div className="mb-5">
              <h3 className="font-semibold mb-2">📘 Related Patterns</h3>
              {selected.relatedPatternIds.length ? (
                <div className="space-y-2">
                  {getPatterns(selected.relatedPatternIds).map((p) => (
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

            {/* Verbs */}
            <div className="mb-5">
              <h3 className="font-semibold mb-2">🔹 Related Verbs</h3>
              <div className="flex flex-wrap gap-2">
                {getVerbs(selected.relatedVerbIds).map((v) => (
                  <Badge key={v.id} variant="outline">{v.word}</Badge>
                ))}
                {selected.relatedVerbIds.length === 0 && (
                  <p className="text-xs text-muted-foreground">관련 동사가 없습니다.</p>
                )}
              </div>
            </div>

            {/* Example Section */}
            <div>
              <h3 className="font-semibold mb-2">📖 Example Sentences</h3>
              {selected.relatedPatternIds.length ? (
                <ul className="list-disc list-inside text-sm space-y-1">
                  {getPatterns(selected.relatedPatternIds).map((p, i) => (
                    <li key={i}>
                      {p.title.includes("want you")
                        ? "I want you to go home."
                        : p.title.includes("help")
                          ? "He helped me to clean up."
                          : "I want to learn English."}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">예문이 없습니다.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm mt-10">
            왼쪽에서 문법 개념을 선택하세요.
          </p>
        )}
      </div>
    </div>
  );
}
