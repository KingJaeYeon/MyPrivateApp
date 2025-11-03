import { useEffect, useState } from 'react';
import { useTheme } from '@/providers/theme-provider.tsx';
import { DBSchema, SheetKeys, SheetKeyType } from '../../../../electron/docs.schema.ts';
import { WordList } from '@/pages/english/words/components/WordList.tsx';
import PostHeader from '@/pages/english/components/PostHeader.tsx';
import MarkdownEditor from '@/components/MarkdownEditor.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';

const seed: DBSchema['engWords'] = {
  content: '',
  description: '',
  word: '',
  updatedAt: new Date().toLocaleString(),
  createdAt: new Date().toLocaleString(),
  id: '',
};

export type State = 'read' | 'edit' | 'create';

export default function WordPage() {
  const [selected, setSelected] = useState<DBSchema['engWords'] | null>(null);
  const [state, setState] = useState<State>('read');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<DBSchema['engWords']>(seed);
  const { engWords } = useEnglishStore();

  useEffect(() => {
    if (engWords.length >= 1) {
      setSelected(engWords[engWords.length - 1]);
    }
  }, [engWords]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...selected! });
  };

  const handleCreate = () => {
    setEditData({ ...seed });
    setState('create');
  };

  const handleSave = async () => {
    try {
      // Excel 저장
      // await window.fsApi.updateWord(editData);

      setIsEditing(false);
      setSelected(editData);

      // 리스트 새로고침
      // await refreshWordList();
    } catch (err) {
      console.error('Save failed:', err);
      alert('저장 실패');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const onEdit = (type: string, value: string) => {
    setEditData((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <div className="flex h-full w-full gap-5 px-4 pb-4">
      {/* 좌측 리스트 */}
      <WordList selected={selected} onSelect={setSelected} onCreate={handleCreate} />
      {/* 우측 상세 뷰 */}
      <div className="h-full flex-1">
        <RendererView state={state} onEdit={onEdit} editData={editData} selected={selected} />
      </div>
    </div>
  );
}

function RendererView({
  state,
  editData,
  onEdit,
  selected,
}: {
  state: State;
  editData: DBSchema['engWords'];
  onEdit: (type: string, value: string) => void;
  selected: DBSchema['engWords'] | null;
}) {
  const { theme } = useTheme();

  if (state === 'create') {
    return (
      <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className={'h-full space-y-4'}>
        {/* 헤더 */}
        <PostHeader state={state} editData={editData} onEdit={onEdit} />
        {/* Markdown 본문 */}
        <div className="prose prose-sm dark:prose-invert flex h-[calc(100%-52px)] w-full max-w-none flex-1 border-t pt-2">
          <MarkdownEditor onChange={(value) => onEdit('content', value)} value={editData.content} />
        </div>
      </div>
    );
  }

  if (state === 'read' || !selected) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center">
        단어를 선택하세요.
      </div>
    );
  }

  return (
    <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className={'space-y-4'}>
      {/* 헤더 */}
      <PostHeader state={state} editData={editData} onEdit={onEdit} />
      {/* Markdown 본문 */}
      <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-2">
        <MarkdownEditor onChange={(value) => onEdit('content', value)} value={selected.content} />
      </div>
    </div>
  );
}
