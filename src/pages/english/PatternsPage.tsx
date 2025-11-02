import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MultiSelect } from "@/components/ui/multi-select.tsx"; // 👈 다중 선택용 커스텀 컴포넌트 (shadcn 확장)

type Verb = { id: string; word: string; meaning: string };
type Concept = { id: string; name: string; description: string };
type Pattern = {
  id: string;
  title: string;
  structure: string;
  description: string;
  examples: string[];
  verbIds: string[];
  conceptIds: string[];
  createdAt: string;
};

// ---- Mock Data ----
const verbs: Verb[] = [
  { id: "V001", word: "want", meaning: "원하다" },
  { id: "V002", word: "help", meaning: "돕다" },
  { id: "V003", word: "prepare", meaning: "준비하다" },
];
const concepts: Concept[] = [
  { id: "C001", name: "ECM", description: "S + V + O + to V 구조" },
  { id: "C002", name: "Infinitive", description: "to 부정사: 목적/의도 표현" },
];
const initialPatterns: Pattern[] = [
  {
    id: "P001",
    title: "I want to V",
    structure: "S + want + to V",
    description: "to 부정사 목적 구조",
    examples: ["I want to learn English.", "I want to go home."],
    verbIds: ["V001"],
    conceptIds: ["C002"],
    createdAt: "2025-10-31",
  },
  {
    id: "P002",
    title: "I want you to V",
    structure: "S + want + O + to V",
    description: "ECM 구문 (목적어가 부정사 주어 역할)",
    examples: ["I want you to go home.", "I want you to help me."],
    verbIds: ["V001"],
    conceptIds: ["C001", "C002"],
    createdAt: "2025-10-31",
  },
];

export default function PatternsPage() {
  const [patterns, setPatterns] = useState(initialPatterns);
  const [selected, setSelected] = useState<Pattern | null>(null);
  const [query, setQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<Pattern | null>(null);

  // --- 필터링 ---
  const filteredPatterns = useMemo(() => {
    const lower = query.toLowerCase();
    return patterns.filter((p) => {
      const linkedVerbs = verbs.filter((v) => p.verbIds.includes(v.id));
      const linkedConcepts = concepts.filter((c) => p.conceptIds.includes(c.id));
      return (
        p.title.toLowerCase().includes(lower) ||
        linkedVerbs.some((v) => v.word.toLowerCase().includes(lower)) ||
        linkedConcepts.some((c) => c.name.toLowerCase().includes(lower))
      );
    });
  }, [query, patterns]);

  // --- 저장 ---
  const handleSave = () => {
    if (!editData) return;
    setPatterns((prev) => {
      const idx = prev.findIndex((p) => p.id === editData.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = editData;
        return copy;
      }
      return [...prev, { ...editData, id: `P${prev.length + 1}` }];
    });
    setEditOpen(false);
  };

  return (
    <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-4rem)]">
      {/* 왼쪽 패턴 리스트 */}
      <div className="border-r p-4">
        <div className="flex items-center gap-2 mb-3">
          <Input
            placeholder="Search pattern / verb / concept..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-sm"
          />
          <Button variant="outline" size="sm" onClick={() => { setEditData(null); setEditOpen(true); }}>
            +
          </Button>
        </div>

        <ScrollArea className="h-[85%] pr-2">
          {filteredPatterns.map((p) => (
            <Card
              key={p.id}
              onClick={() => setSelected(p)}
              className={`mb-2 cursor-pointer transition ${
                selected?.id === p.id ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">{p.title}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{p.structure}</p>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* 오른쪽 상세 보기 */}
      <div className="p-6 overflow-y-auto">
        {selected ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{selected.title}</h2>
              <Button size="sm" variant="secondary" onClick={() => { setEditData(selected); setEditOpen(true); }}>
                수정
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-1">구조: {selected.structure}</p>
            <p className="text-sm mb-4">{selected.description}</p>
            <Separator className="my-3" />

            <div className="mb-4">
              <h3 className="font-semibold mb-1">🔹 Verbs</h3>
              <div className="flex flex-wrap gap-2">
                {verbs.filter((v) => selected.verbIds.includes(v.id)).map((v) => (
                  <Badge key={v.id} variant="outline">{v.word}</Badge>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1">🔹 Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {concepts.filter((c) => selected.conceptIds.includes(c.id)).map((c) => (
                  <Badge key={c.id} variant="secondary">{c.name}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📖 Examples</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {selected.examples.map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm mt-10">왼쪽에서 패턴을 선택하세요.</p>
        )}
      </div>

      {/* ✏️ 수정 다이얼로그 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editData ? "패턴 수정" : "새 패턴 추가"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Title</Label>
              <Input
                value={editData?.title ?? ""}
                onChange={(e) => setEditData((p) => ({ ...(p ?? {}), title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Structure</Label>
              <Input
                value={editData?.structure ?? ""}
                onChange={(e) => setEditData((p) => ({ ...(p ?? {}), structure: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={editData?.description ?? ""}
                onChange={(e) => setEditData((p) => ({ ...(p ?? {}), description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Examples (쉼표로 구분)</Label>
              <Input
                value={editData?.examples?.join(", ") ?? ""}
                onChange={(e) =>
                  setEditData((p) => ({ ...(p ?? {}), examples: e.target.value.split(",").map((x) => x.trim()) }))
                }
              />
            </div>

            {/* ✅ Verb 선택 */}
            <div>
              <Label>Linked Verbs</Label>
              <MultiSelect
                options={verbs.map((v) => ({ label: `${v.word} (${v.meaning})`, value: v.id }))}
                value={editData?.verbIds ?? []}
                onChange={(v) => setEditData((p) => ({ ...(p ?? {}), verbIds: v }))}
              />
            </div>

            {/* ✅ Concept 선택 */}
            <div>
              <Label>Linked Concepts</Label>
              <MultiSelect
                options={concepts.map((c) => ({ label: c.name, value: c.id }))}
                value={editData?.conceptIds ?? []}
                onChange={(v) => setEditData((p) => ({ ...(p ?? {}), conceptIds: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
