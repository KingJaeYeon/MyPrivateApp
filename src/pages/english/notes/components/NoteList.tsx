import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import { cn } from '@/lib/utils.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useDebounce from '@/hooks/use-debounce.ts';

export function NoteList() {
  const { saved, isChanged } = useEnglishStore();
  const { openModal } = useModalStore();
  const [search, setSearch] = useState('');
  const debounce = useDebounce(search);
  const navigate = useNavigate();

  const onSave = async () => {
    if (confirm('저장하시겠습니까?')) {
      await saved('engNotes');
      openModal('alert', '저장되었습니다.');
    }
  };

  return (
    <div className="w-[300px] overflow-y-auto border-r pr-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">📝 Notes</h2>
        <div className="flex gap-2">
          <Button size="sm" variant={isChanged ? 'destructive' : 'default'} onClick={onSave}>
            저장
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/english/notes')}>
            + New
          </Button>
        </div>
      </div>
      {/* 검색 인풋 추가 */}
      <div className="relative mb-3">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <ScrollArea className="h-[85%] gap-4">
        <RenderList search={debounce} />
      </ScrollArea>
    </div>
  );
}
function RenderList({ search }: { search: string }) {
  const { engNotes, state } = useEnglishStore();
  const navigate = useNavigate();
  const { noteId } = useParams();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredNotes = useMemo(() => {
    return [...engNotes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(
        (note) =>
          note.title.toLowerCase().includes(search.toLowerCase()) ||
          note.description?.toLowerCase().includes(search.toLowerCase())
      );
  }, [engNotes, search]);

  useEffect(() => {
    if (!noteId || !filteredNotes.length) {
      setSelectedIndex(-1);
      return;
    }
    const idx = filteredNotes.findIndex((w) => w.id.toString() === noteId);
    if (idx >= 0) setSelectedIndex(idx);
  }, [noteId, filteredNotes]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (state !== 'read') return;
      if (!filteredNotes.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (selectedIndex + 1) % filteredNotes.length;
        setSelectedIndex(nextIndex);
        navigate(`/english/notes/${filteredNotes[nextIndex].id}`);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (selectedIndex - 1 + filteredNotes.length) % filteredNotes.length;
        setSelectedIndex(prevIndex);
        navigate(`/english/notes/${filteredNotes[prevIndex].id}`);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [filteredNotes, selectedIndex, navigate, state]);

  useEffect(() => {
    const el = cardRefs.current[selectedIndex];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedIndex]);

  if (!filteredNotes.length) {
    return <div className="text-muted-foreground text-sm">새로운 Note를 등록해주세요.</div>;
  }

  return (
    <div className="space-y-2">
      {filteredNotes.map((p, i) => (
        <Card
          ref={(el) => (cardRefs.current[i] = el)}
          key={p.id}
          onClick={() => {
            setSelectedIndex(i);
            navigate(`/english/notes/${p.id}`);
          }}
          className={cn(
            'hover:bg-muted cursor-pointer border p-3 transition',
            i === selectedIndex ? 'border-primary bg-muted' : ''
          )}
        >
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">{p.title}</CardTitle>
            <p className="text-muted-foreground truncate text-xs">{p.description}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
