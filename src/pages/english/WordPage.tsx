import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/card.tsx';

type WordBase = {
  id: string;
  word: string;
  meaning: string;
  description?: string;
  content?: string; // Markdown 본문
  createdAt: string;
  updatedAt: string;
};

const mockWords: WordBase[] = [
  {
    id: 'W001',
    word: 'want',
    meaning: '원하다',
    description: 'ECM 구조에서 목적어가 to부정사를 취함.',
    content: `### ECM 패턴 예시  
I want you to go home.  

- **구조:** S + V + O + to V  
- **설명:** 목적어가 to부정사 구문의 주어 역할을 함.  

![ECM Diagram](https://i.imgur.com/0q9Bv9d.png)`,
    createdAt: '2025-10-30T00:00:00Z',
    updatedAt: '2025-10-31T09:30:00Z',
  },
  {
    id: 'W002',
    word: 'prepare',
    meaning: '준비하다',
    description: '전치사 for와 자주 함께 쓰임.',
    content: `### 사용 예시  
I prepared dinner for you.  

- **Note:** for + 사람 구조로 자주 사용.  
![Dinner](https://i.imgur.com/xL1G7id.png)`,
    createdAt: '2025-10-30T00:00:00Z',
    updatedAt: '2025-10-31T09:45:00Z',
  },
];

export default function WordPage() {
  const [selected, setSelected] = useState<WordBase | null>(mockWords[0]);
  const { theme } = useTheme();

  return (
    <div className="flex h-full gap-4 p-4">
      {/* 좌측 리스트 */}
      <div className="w-[300px] overflow-y-auto border-r pr-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">📘 Word List</h2>
          <Button size="sm" variant="outline">
            + New
          </Button>
        </div>
        <ScrollArea className="h-[85%] gap-4 pr-2">
          {mockWords.map((p) => (
            <Card
              key={p.id}
              onClick={() => setSelected(p)}
              className={`hover:bg-muted mb-2 cursor-pointer rounded-lg border p-3 transition ${
                selected?.id === p.id ? 'bg-muted border-primary' : ''
              }`}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">{p.word}</CardTitle>
                <p className="text-muted-foreground truncate text-xs">{p.meaning}</p>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* 우측 상세 뷰 */}
      <div className="flex-1 overflow-y-auto px-4">
        {selected ? (
          <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{selected.word}</h1>
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

            {/* 마지막 수정일만 표시 */}
            <div className="text-muted-foreground border-b pb-2 text-xs">
              {new Date(selected.updatedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>

            {/* Markdown 본문 */}
            <div className="pt-3">
              <MDEditor.Markdown
                source={selected.content ?? ''}
                className="prose prose-sm max-w-none rounded-lg p-4"
                style={{
                  backgroundColor: theme === 'dark' ? 'oklch(0.145 0 0)' : 'oklch(1 0 0)', // ✅ 마크다운 배경
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            단어를 선택하세요.
          </div>
        )}
      </div>
    </div>
  );
}
