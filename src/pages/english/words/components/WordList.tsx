import { Button } from '@/components/ui/button.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Card, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { DBSchema } from '../../../../../electron/docs.schema.ts';
import useEnglishStore from '@/store/useEnglishStore.ts';

export function WordList({
  onSelect,
  selected,
  onCreate,
}: {
  onSelect: (value: any) => void;
  selected: DBSchema['engWords'] | null;
  onCreate: () => void;
}) {
  return (
    <div className="w-[300px] overflow-y-auto border-r pr-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">📘 Word List</h2>
        <Button size="sm" variant="outline" onClick={onCreate}>
          + New
        </Button>
      </div>
      <ScrollArea className="h-[85%] gap-4 pr-2">
        <RenderList selected={selected} onSelect={onSelect} />
      </ScrollArea>
    </div>
  );
}

function RenderList({
  selected,
  onSelect,
}: {
  selected: DBSchema['engWords'] | null;
  onSelect: (value: any) => void;
}) {
  const { engWords } = useEnglishStore();

  if (!engWords.length || !selected) {
    return <div className={'text-muted-foreground text-sm'}>새로운 Word를 등록해주세요.</div>;
  }

  return (
    <ScrollArea className="h-[85%] gap-4 pr-2">
      {engWords.map((p) => (
        <Card
          key={p.id}
          onClick={() => onSelect(p)}
          className={`hover:bg-muted mb-2 cursor-pointer rounded-lg border p-3 transition ${
            selected?.id === p.id ? 'bg-muted border-primary' : ''
          }`}
        >
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">{p.word}</CardTitle>
            <p className="text-muted-foreground truncate text-xs">{p.description}</p>
          </CardHeader>
        </Card>
      ))}
    </ScrollArea>
  );
}
