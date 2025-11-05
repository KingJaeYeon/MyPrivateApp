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
  data: DBSchema['engNotes'];
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
          value={data.title}
          placeholder={'ex) ECM 동사'}
          readOnly={state === 'read'}
          onChange={(e) => onChange('title', e.target.value)}
        />
        <input
          className="text-muted-foreground text-sm outline-none"
          value={data.description}
          placeholder={'S가 V한다 O가 ToV하기를 의 뜻을 가지는 동사들'}
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
  data: DBSchema['engNotes'];
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
    navigate('/english/notes');
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
    const cur = getData('engNotes');

    const find = cur.find((item) => item.id === data.id);
    if (find) {
      const temp = cur.map((item) => {
        if (item.id === data.id) {
          return data;
        }
        return item;
      });
      update('engNotes', temp);
      setState('read');
      refetch && refetch();
      return;
    }

    const lastId = cur.length === 0 ? 1 : +cur[cur.length - 1].id + 1;
    push('engNotes', { ...data, id: lastId.toString() });
    navigate(`/english/notes/${lastId}`);
    toast.success('추가되었습니다.');
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={onSave} disabled={data.title === '' || !data.description}>
        저장
      </Button>
    </div>
  );
}
