import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/providers/theme-provider';

import { DBSchema } from '../../../../electron/docs.schema.ts';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

type Word = {
  id: string;
  word: string;
  type: 'verb' | 'preposition' | 'noun' | 'adjective' | 'adverb';
  meaning: string;
  description?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
};

type WordEditViewProps = {
  data: DBSchema['engWords'];
  onChange: (data: DBSchema['engWords']) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function WordEditView({ data, onChange, onSave, onCancel }: WordEditViewProps) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    for (const file of imageFiles) {
      try {
        // 파일을 Buffer로 변환
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // 파일명 생성
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const filename = `img_${timestamp}.${ext}`;
        const targetPath = `data/english/images/${filename}`;

        // Electron IPC로 저장
        const result = await window.fsApi.saveImage(buffer, targetPath);

        if (result.success) {
          // 마크다운에 이미지 삽입
          const imageMarkdown = `\n![${file.name}](./images/${filename})\n`;
          onChange({
            ...data,
            content: (data.content || '') + imageMarkdown,
          });
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('이미지 업로드 실패');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className="flex h-full w-full flex-col p-4"
      data-color-mode={theme === 'dark' ? 'dark' : 'light'}
    >
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">✏️ 단어 편집</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button size="sm" onClick={onSave}>
            저장
          </Button>
        </div>
      </div>

      {/* 폼 */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* 단어 */}
        <div>
          <Label htmlFor="word">단어 *</Label>
          <Input
            id="word"
            value={data.word}
            onChange={(e) => onChange({ ...data, word: e.target.value })}
            placeholder="예: want, prepare"
          />
        </div>

        {/* 뜻 */}
        <div>
          <Label htmlFor="meaning">뜻 *</Label>
        </div>

        {/* 간단 설명 */}
        <div>
          <Label htmlFor="description">간단 설명</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="예: ECM 구조에서 목적어가 to부정사를 취함"
            rows={2}
          />
        </div>

        {/* 마크다운 본문 */}
        <div className="flex-1">
          <Label>상세 설명 (Markdown)</Label>
          <div className="text-muted-foreground mb-2 text-xs">
            💡 이미지를 드래그해서 놓으면 자동으로 업로드됩니다
          </div>
          <div
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`rounded-lg border-2 transition ${
              isDragging ? 'border-primary bg-primary/10' : 'border-border'
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm]}>{data.content}</ReactMarkdown>
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="text-muted-foreground border-t pt-3 text-xs">
          <div>생성일: {new Date(data.createdAt).toLocaleString('ko-KR')}</div>
          <div>수정일: {new Date(data.updatedAt).toLocaleString('ko-KR')}</div>
        </div>
      </div>
    </div>
  );
}
