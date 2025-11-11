import PostHeader from '@/pages/english/notes/components/PostHeader.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/providers/theme-provider.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { useEffect, useState } from 'react';
import NotFound from '@/pages/NotFound.tsx';
import { DBSchema } from '../../../../electron/docs.schema.ts';
import MarkdownPreview from '@/components/MarkdownPreview.tsx';
import MarkdownEditor from '@/components/MarkdownEditor.tsx';
import { LinkedWordsEditor } from '@/pages/english/notes/components/LinkedWordsEditor.tsx';

const seed: DBSchema['engNotes'] = {
  content: '',
  description: '',
  title: '',
  linkedWordIds: '',
  updatedAt: new Date().toLocaleString(),
  createdAt: new Date().getTime(),
  id: '',
};

export default function NoteDetailPage() {
  const { noteId } = useParams();
  const { theme } = useTheme();
  const { getData, setState, state, jsonEngWords } = useEnglishStore();
  const [edit, setEdit] = useState<DBSchema['engNotes']>(seed);
  const navigate = useNavigate();

  const data = getData('engNotes').find((w) => w.id.toString() === noteId?.toString()) as
    | DBSchema['engNotes']
    | undefined;

  useEffect(() => {
    setState('read');
  }, [noteId]);

  if (!data) {
    return <NotFound />;
  }

  const onChangeValues = (type: string, value: string) => {
    setEdit((prev) => ({ ...prev, [type]: value }));
  };

  const onEditLinkedWords = (linkedWordIds: string) => {
    setEdit((prev) => ({ ...prev, ['linkedWordIds']: linkedWordIds }));
  };

  const onEdit = () => {
    setEdit(data);
    setState('edit');
  };

  return (
    <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className={'h-full space-y-4'}>
      {/* 헤더 */}
      <PostHeader data={state === 'edit' ? edit : data} onEdit={onEdit} onChange={onChangeValues} />
      <div className="prose prose-sm dark:prose-invert flex h-[calc(100%-130px)] w-full max-w-none flex-1 border-t pt-2">
        {state === 'read' ? (
          <MarkdownPreview value={data.content} />
        ) : (
          <MarkdownEditor
            value={edit.content}
            onChange={(value) => onChangeValues('content', value)}
          />
        )}
      </div>
      {state === 'read' ? (
        <div className="mt-4 border-t pt-3">
          <p className="text-muted-foreground mb-1 text-xs">🔗 관련 단어</p>
          <div className="flex flex-wrap gap-2">
            {data.linkedWordIds.split(',').map((id) => (
              <span
                onClick={() => navigate(`/english/words/${id}`)}
                key={'readedit' + id}
                className="bg-muted hover:bg-primary/20 cursor-pointer rounded-md px-2 py-1 text-xs"
              >
                {jsonEngWords[id]}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <LinkedWordsEditor linkedWordIds={edit.linkedWordIds} onChange={onEditLinkedWords} />
      )}
    </div>
  );
}
