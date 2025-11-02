import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ---- Mock Data ----
type Diary = {
  id: string;
  title: string;
  content: string;
  date: string;
  linkedPatterns: string[];
  linkedVerbs: string[];
  linkedConcepts: string[];
  importance: string;
  memo?: string;
};

const diaries: Diary[] = [
  {
    id: "D001",
    title: "A rainy Monday",
    content: "It was raining, so I stayed home and watched a movie. I wanted to go jogging, but I couldn’t help feeling lazy.",
    date: "2025-10-30",
    linkedPatterns: ["P001", "P002"],
    linkedVerbs: ["V001", "V003"],
    linkedConcepts: ["C001", "C002"],
    importance: "★",
    memo: "‘want to’, ‘can’t help -ing’ 구조 확인",
  },
  {
    id: "D002",
    title: "Morning routine",
    content: "I prepared breakfast and helped my mom to clean up the kitchen.",
    date: "2025-10-29",
    linkedPatterns: ["P003"],
    linkedVerbs: ["V002", "V003"],
    linkedConcepts: ["C002"],
    importance: "☆",
  },
];

const patterns = {
  P001: "I want to V",
  P002: "I can't help -ing",
  P003: "Help O to V",
};
const verbs = {
  V001: "want",
  V002: "help",
  V003: "prepare",
};
const concepts = {
  C001: "ECM",
  C002: "Infinitive",
};

export default function JournalPage() {
  const [selected, setSelected] = useState<Diary | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="grid grid-cols-[280px_1fr] h-[calc(100vh-4rem)]">
      {/* Left: Diary List */}
      <div className="border-r p-4">
        <div className="flex justify-between mb-3">
          <Button size="sm" onClick={() => setIsEditing(true)}>
            + 새 일기
          </Button>
          <Button variant="outline" size="sm">
            정렬 ▼
          </Button>
        </div>
        <ScrollArea className="h-[85%]">
          {diaries.map((d) => (
            <Card
              key={d.id}
              className={`mb-2 cursor-pointer transition ${
                selected?.id === d.id ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => {
                setSelected(d);
                setIsEditing(false);
              }}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">
                  {d.title} {d.importance}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{d.date}</p>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* Right: Detail or Editor */}
      <div className="p-6 overflow-y-auto">
        {isEditing ? (
          <DiaryEditor onSave={() => setIsEditing(false)} />
        ) : selected ? (
          <>
            <h2 className="text-xl font-semibold mb-2">{selected.title}</h2>
            <p className="text-xs text-muted-foreground mb-4">{selected.date}</p>
            <p className="text-sm whitespace-pre-wrap mb-4">{selected.content}</p>

            <Separator className="my-3" />
            <h4 className="font-semibold mb-1">🧩 Linked Elements</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {selected.linkedPatterns.map((id) => (
                <Badge key={id}>{patterns[id]}</Badge>
              ))}
              {selected.linkedVerbs.map((id) => (
                <Badge key={id} variant="secondary">
                  {verbs[id]}
                </Badge>
              ))}
              {selected.linkedConcepts.map((id) => (
                <Badge key={id} variant="outline">
                  {concepts[id]}
                </Badge>
              ))}
            </div>

            {selected.memo && (
              <>
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  📝 {selected.memo}
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm mt-10">
            왼쪽에서 일기를 선택하거나 새로 작성하세요.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Editor Component ---
function DiaryEditor({ onSave }: { onSave: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [memo, setMemo] = useState("");

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">✏️ 새 일기 작성</h2>
      <Input
        placeholder="제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="영어 일기를 작성하세요..."
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Textarea
        placeholder="메모 (패턴, 문법 노트)"
        rows={3}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSave}>
          취소
        </Button>
        <Button onClick={onSave}>저장</Button>
      </div>
    </div>
  );
}
