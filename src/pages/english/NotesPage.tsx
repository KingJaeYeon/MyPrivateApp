import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Card, CardHeader } from '@/components/ui/card.tsx';

type Note = {
  id: string;
  title: string;
  description?: string;
  content?: string; // Markdown 본문
  linkedWords?: { id: string; title: string }[];
  createdAt: string;
  updatedAt: string;
};

const mockNotes: Note[] = [
  {
    id: 'N001',
    title: 'ECM 구조 복습',
    description: 'I want you to V 문형 중심',
    content: `오늘 ECM 문형을 복습했다.  

"I want you to go home"에서 'you'가 to부정사의 주어 역할을 한다.  

### 📘 문형 구조  
\`\`\`
S + V + O + to V
\`\`\`

> ECM은 목적어가 부정사 주어 역할을 하는 구조다.  

**관련 동사:** want, help, prepare  

![ECM Structure](https://i.imgur.com/0q9Bv9d.png)
`,
    linkedWords: [
      { id: 'W001', title: 'want' },
      { id: 'W002', title: 'prepare' },
    ],
    createdAt: '2025-10-31T00:00:00Z',
    updatedAt: '2025-10-31T00:00:00Z',
  },
  {
    id: 'N002',
    title: '전치사 for의 쓰임',
    description: '목적, 수혜자 표현',
    content: `I cooked dinner **for** my family.  
‘for’은 목적이나 수혜자를 나타낼 때 사용된다.  

![for example](https://i.imgur.com/xL1G7id.png)
`,
    linkedWords: [{ id: 'W003', title: 'for' }],
    createdAt: '2025-10-31T00:00:00Z',
    updatedAt: '2025-10-31T00:00:00Z',
  },
];

export default function NotesPage() {
  const [selected, setSelected] = useState<Note | null>(mockNotes[0]);
  const { theme } = useTheme();

  return (
    <div className="flex h-full w-full gap-5 px-4 pb-4">
      {/* 좌측 리스트 */}
      <NoteList onSelect={setSelected} selected={selected} />
      {/* 우측 내용 */}
      <div className="flex-1 overflow-y-auto px-4">
        {selected ? (
          <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{selected.title}</h1>
                <p className="text-muted-foreground text-sm">{selected.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </div>
            </div>

            {/* 날짜 */}
            <div className="text-muted-foreground flex justify-between border-b pb-2 text-xs">
              <div>Created: {new Date(selected.createdAt).toLocaleDateString('ko-KR')}</div>
              <div>Updated: {new Date(selected.updatedAt).toLocaleDateString('ko-KR')}</div>
            </div>

            {/* Markdown 본문 */}
            <div className="pt-3">
              <ReactMarkdown>{selected.content}</ReactMarkdown>
            </div>

            {/* 연관된 단어 */}
            {selected.linkedWords && selected.linkedWords.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <p className="text-muted-foreground mb-1 text-xs">🔗 관련 단어</p>
                <div className="flex flex-wrap gap-2">
                  {selected.linkedWords.map((w) => (
                    <span
                      key={w.id}
                      className="bg-muted hover:bg-primary/20 cursor-pointer rounded-md px-2 py-1 text-xs"
                    >
                      {w.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            노트를 선택하세요.
          </div>
        )}
      </div>
    </div>
  );
}

function NoteList({ onSelect, selected }: { onSelect: (value: any) => void; selected: any }) {
  return (
    <div className="w-[300px] overflow-y-auto border-r pr-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">📝 Notes</h2>
        <Button size="sm" variant="outline">
          + New
        </Button>
      </div>
      <ScrollArea className="h-[85%] gap-4 pr-2">
        {mockNotes.map((p) => (
          <Card
            key={p.id}
            onClick={() => onSelect(p)}
            className={`hover:bg-muted mb-2 cursor-pointer rounded-lg border p-3 transition ${
              selected?.id === p.id ? 'bg-muted border-primary' : ''
            }`}
          >
            <CardHeader className="p-3">
              <div className="font-semibold">{p.title}</div>
              <div className="text-muted-foreground text-xs">{p.description}</div>
            </CardHeader>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}
