import PostHeader from '@/pages/english/words/components/PostHeader.tsx';
import { useTheme } from '@/providers/theme-provider.tsx';
import { DBSchema } from '../../../../electron/docs.schema.ts';
import { useEffect, useState } from 'react';
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

export default function WordCreatePage() {
  const { theme } = useTheme();
  const [data, setData] = useState<DBSchema['engWords']>(seed);
  const { setState } = useEnglishStore();
  const onEdit = (type: string, value: string) => {
    setData((prev) => ({ ...prev, [type]: value }));
  };

  useEffect(() => {
    setState('create');
  }, []);

  return (
    <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className={'h-full space-y-4'}>
      {/* 헤더 */}
      <PostHeader data={data} onChange={onEdit} />
      <div className="prose prose-sm dark:prose-invert flex h-[calc(100%-52px)] w-full max-w-none flex-1 border-t pt-2">
        <MarkdownEditor onChange={(value) => onEdit('content', value)} value={data.content} />
      </div>
    </div>
  );
}
