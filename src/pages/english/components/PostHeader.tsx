import { Button } from '@/components/ui/button.tsx';
import { State } from '@/pages/english/words/WordPage.tsx';
import { DBSchema } from '../../../../electron/docs.schema.ts';

export default function PostHeader({
  editData,
  state,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: {
  editData: DBSchema['engWords'];
  state: State;
  onCancel?: () => void;
  onEdit: (type: string, value: string) => void;
  onDelete?: () => void;
  onSave?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-20">
      <div className={'flex flex-1 flex-col'}>
        <input
          className="placeholder:text-muted-foreground text-2xl font-bold outline-none"
          value={editData.word}
          placeholder={'ex) look at'}
          readOnly={state === 'read'}
          onChange={(e) => onEdit('word', e.target.value)}
        />
        <input
          className="text-muted-foreground text-sm outline-none"
          value={editData.description}
          placeholder={'보다 - 주어가 주체적으로 본다.'}
          readOnly={state === 'read'}
          onChange={(e) => onEdit('description', e.target.value)}
        />
      </div>
      <ButtonRenderer state={state} onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

function ButtonRenderer({ state }: { state: State }) {
  if (state === 'read')
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary">
          Edit
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    );

  return (
    <div className="flex items-center gap-2">
      <Button size="sm">저장</Button>
    </div>
  );
}
