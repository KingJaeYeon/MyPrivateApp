import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type Pattern = {
  id: string;
  title: string;
  description: string;
  isImportant: boolean;
  updatedAt: string;
};

const demoData: Pattern[] = [
  {
    id: 'P001',
    title: "I can't wait to ~",
    description: "무언가를 매우 기대할 때 사용. 예: I can't wait to see you again!",
    isImportant: true,
    updatedAt: '2025-10-27',
  },
  {
    id: 'P002',
    title: "I'm used to ~ing",
    description: "어떤 행동이 익숙해졌을 때. 예: I'm used to waking up early.",
    isImportant: false,
    updatedAt: '2025-10-25',
  },
  {
    id: 'P003',
    title: "It's better to ~",
    description: "무엇이 더 낫거나 추천될 때 사용. 예: It's better to stay calm.",
    isImportant: true,
    updatedAt: '2025-10-24',
  },
  {
    id: 'P004',
    title: 'How long does it take to ~',
    description: '어떤 일을 하는데 걸리는 시간 묻기. 예: How long does it take to get there?',
    isImportant: false,
    updatedAt: '2025-10-21',
  },
  {
    id: 'P005',
    title: "You're welcome to ~",
    description: "허락·초대의 의미로 사용. 예: You're welcome to join us anytime.",
    isImportant: false,
    updatedAt: '2025-10-19',
  },
  {
    id: 'P006',
    title: "I can't wait to ~",
    description: "무언가를 매우 기대할 때 사용. 예: I can't wait to see you again!",
    isImportant: true,
    updatedAt: '2025-10-27',
  },
  {
    id: 'P007',
    title: "I'm used to ~ing",
    description: "어떤 행동이 익숙해졌을 때. 예: I'm used to waking up early.",
    isImportant: false,
    updatedAt: '2025-10-25',
  },
  {
    id: 'P008',
    title: "It's better to ~",
    description: "무엇이 더 낫거나 추천될 때 사용. 예: It's better to stay calm.",
    isImportant: true,
    updatedAt: '2025-10-24',
  },
  {
    id: 'P009',
    title: 'How long does it take to ~',
    description: '어떤 일을 하는데 걸리는 시간 묻기. 예: How long does it take to get there?',
    isImportant: false,
    updatedAt: '2025-10-21',
  },
  {
    id: 'P010',
    title: "You're welcome to ~",
    description: "허락·초대의 의미로 사용. 예: You're welcome to join us anytime.",
    isImportant: false,
    updatedAt: '2025-10-19',
  },
  {
    id: 'P001',
    title: "I can't wait to ~",
    description: "무언가를 매우 기대할 때 사용. 예: I can't wait to see you again!",
    isImportant: true,
    updatedAt: '2025-10-27',
  },
  {
    id: 'P002',
    title: "I'm used to ~ing",
    description: "어떤 행동이 익숙해졌을 때. 예: I'm used to waking up early.",
    isImportant: false,
    updatedAt: '2025-10-25',
  },
  {
    id: 'P003',
    title: "It's better to ~",
    description: "무엇이 더 낫거나 추천될 때 사용. 예: It's better to stay calm.",
    isImportant: true,
    updatedAt: '2025-10-24',
  },
  {
    id: 'P004',
    title: 'How long does it take to ~',
    description: '어떤 일을 하는데 걸리는 시간 묻기. 예: How long does it take to get there?',
    isImportant: false,
    updatedAt: '2025-10-21',
  },
  {
    id: 'P005',
    title: "You're welcome to ~",
    description: "허락·초대의 의미로 사용. 예: You're welcome to join us anytime.",
    isImportant: false,
    updatedAt: '2025-10-19',
  },
];

export default function PatternsPage() {
  const [patterns] = useState<Pattern[]>(demoData);
  const [search, setSearch] = useState('');
  const [showImportant, setShowImportant] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    return patterns.filter((p) => {
      const match = p.title.toLowerCase().includes(search.toLowerCase());
      const imp = showImportant ? p.isImportant : true;
      return match && imp;
    });
  }, [patterns, search, showImportant]);

  const selectedPatterns = patterns.filter((p) => selected.includes(p.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const newSel = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setIsSheetOpen(newSel.length > 0);
      return newSel;
    });
  }

  return (
    <div className="space-y-5 p-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-lg font-semibold">Patterns</Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search pattern..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />
          <div className="flex items-center gap-1">
            <Switch checked={showImportant} onCheckedChange={setShowImportant} />
            <Label className="text-xs">⭐ Only Important</Label>
          </div>
          <Button variant="outline">+ Add</Button>
        </div>
      </div>

      {/* 패턴 리스트 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pattern) => (
          <Card
            key={pattern.id}
            className={`cursor-pointer transition ${
              selected.includes(pattern.id) ? 'border-primary shadow-md' : 'border-muted'
            }`}
            onClick={() => toggleSelect(pattern.id)}
          >
            <CardHeader className="flex items-center justify-between">
              <div className="font-semibold">{pattern.title}</div>
              {pattern.isImportant && <span className="text-sm text-yellow-500">⭐</span>}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2 text-sm">{pattern.description}</p>
              <p className="text-muted-foreground mt-2 text-xs">{pattern.updatedAt}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 우측 패널 (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[400px] space-y-3 p-5">
          <SheetHeader>
            <SheetTitle>Selected Patterns ({selected.length})</SheetTitle>
          </SheetHeader>
          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {selectedPatterns.map((p) => (
              <div key={p.id} className="border-b pb-2">
                <p className="font-medium">{p.title}</p>
                <p className="text-muted-foreground text-sm">{p.description}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-3">
            <p className="text-muted-foreground mb-2 text-sm font-medium">🔗 Related Examples</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>"I can't wait to see you again!"</li>
              <li>"It's better to stay calm."</li>
              <li>"You're welcome to join us anytime."</li>
            </ul>
            <Button variant="secondary" className="mt-3 w-full">
              View in Examples Page
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
