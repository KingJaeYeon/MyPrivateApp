import { Button } from '@/components/ui/button.tsx';
import { DBSchema } from '../../../../../electron/docs.schema.ts';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function PostHeader({
  data,
  onEdit,
  onChange,
  refetch,
}: {
  data: DBSchema['engWords'];
  onEdit?: () => void;
  onChange: (type: string, value: string) => void;
  refetch?: () => void;
}) {
  const { state } = useEnglishStore();
  return (
    <div className="flex items-start justify-between gap-20">
      <div className={'flex flex-1 flex-col'}>
        <input
          className="placeholder:text-muted-foreground text-2xl font-bold outline-none"
          value={data.word}
          placeholder={'ex) look at'}
          readOnly={state === 'read'}
          onChange={(e) => onChange('word', e.target.value)}
        />
        <input
          className="text-muted-foreground text-sm outline-none"
          value={data.description}
          placeholder={'보다 - 주어가 주체적으로 본다.'}
          readOnly={state === 'read'}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <ButtonRenderer data={data} onEdit={onEdit} refetch={refetch} />
    </div>
  );
}

function ButtonRenderer({
  data,
  onEdit,
  refetch,
}: {
  data: DBSchema['engWords'];
  onEdit?: () => void;
  refetch?: () => void;
}) {
  const { push, getData, remove, update, state, setState } = useEnglishStore();
  const navigate = useNavigate();

  const onRemove = () => {
    if (!confirm('삭제하시겠습니까?')) {
      return;
    }
    remove('engWords', [data.id]);
    toast.success('삭제되었습니다.');
    navigate('/english/words');
  };

  if (state === 'read')
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onEdit}>
          수정
        </Button>
        <Button size="sm" variant="destructive" onClick={onRemove}>
          삭제
        </Button>
      </div>
    );

  const onSave = () => {
    if (!confirm('저장하시겠습니까?')) {
      return;
    }
    const cur = getData('engWords');

    const find = cur.find((item) => item.id === data.id);
    if (find) {
      const temp = cur.map((item) => {
        if (item.id === data.id) {
          return data;
        }
        return item;
      });
      update('engWords', temp);
      setState('read');
      refetch && refetch();
      return;
    }

    const lastId = cur.length === 0 ? 1 : +cur[cur.length - 1].id + 1;
    push('engWords', { ...data, id: lastId.toString() });
    navigate(`/english/words/${lastId}`);
    toast.success('추가되었습니다.');
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={onSave} disabled={data.word === '' || !data.description}>
        저장
      </Button>
    </div>
  );
}
