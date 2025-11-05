import PostHeader from '@/pages/english/components/PostHeader.tsx';
import { useParams } from 'react-router-dom';
import { useTheme } from '@/providers/theme-provider.tsx';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { useEffect, useState } from 'react';
import NotFound from '@/pages/NotFound.tsx';
import { DBSchema } from '../../../../electron/docs.schema.ts';
import MarkdownPreview from '@/components/MarkdownPreview.tsx';
import MarkdownEditor from '@/components/MarkdownEditor.tsx';
import { useQuery } from '@tanstack/react-query';

const seed: DBSchema['engWords'] = {
  content: '',
  description: '',
  word: '',
  updatedAt: new Date().toLocaleString(),
  createdAt: new Date().toLocaleString(),
  id: '',
};

export default function DetailPage() {
  const { wordId } = useParams();
  const { theme } = useTheme();
  const { getData, setState, state } = useEnglishStore();
  const [edit, setEdit] = useState<DBSchema['engWords']>(seed);

  const { data, isPending, refetch } = useQuery({
    queryKey: ['engWords', wordId],
    queryFn: async () => {
      return getData('engWords').find((w) => w.id.toString() === wordId?.toString()) as
        | DBSchema['engWords']
        | undefined;
    },
  });

  useEffect(() => {
    setState('read');
  }, [wordId]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <NotFound />;
  }

  const onChangeValues = (type: string, value: string) => {
    setEdit((prev) => ({ ...prev, [type]: value }));
  };

  const onEdit = () => {
    setEdit(data);
    setState('edit');
  };

  return (
    <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className={'h-full space-y-4'}>
      {/* 헤더 */}
      <PostHeader
        data={state === 'edit' ? edit : data}
        onEdit={onEdit}
        onChange={onChangeValues}
        refetch={refetch}
      />
      <div className="prose prose-sm dark:prose-invert flex h-[calc(100%-52px)] w-full max-w-none flex-1 border-t pt-2">
        {state === 'read' ? (
          <MarkdownPreview value={data.content} />
        ) : (
          <MarkdownEditor
            value={edit.content}
            onChange={(value) => onChangeValues('content', value)}
          />
        )}
      </div>
    </div>
  );
}
