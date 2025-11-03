import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Heading3, Image as ImageIcon, List } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(false);

  // 텍스트 삽입 헬퍼
  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // H3 삽입
  const handleH3 = () => {
    insertText('### ');
  };

  // Bold 삽입
  const handleBold = () => {
    insertText('**', '**');
  };

  // 리스트 삽입
  const handleList = () => {
    insertText('- ');
  };

  // 초록색 텍스트 삽입
  const handleGreen = () => {
    insertText('```', '```');
  };

  // 이미지 드래그 앤 드롭
  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));

    for (const file of imageFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const filename = `img_${timestamp}.${ext}`;
        const targetPath = `data/english/images/${filename}`;

        // Electron IPC로 저장 (없으면 주석 처리)
        // const result = await window.electron.fs.saveImage(buffer, targetPath);

        // 임시로 로컬 URL 생성 (테스트용)
        const blob = new Blob([buffer], { type: file.type });
        const url = URL.createObjectURL(blob);

        // 마크다운에 이미지 삽입
        const imageMarkdown = `\n![${file.name}](${url})\n`;
        onChange(value + imageMarkdown);

        // 실제로는 이렇게
        // if (result.success) {
        //   const imageMarkdown = `\n![${file.name}](./images/${filename})\n`;
        //   onChange(value + imageMarkdown);
        // }
      } catch (err) {
        console.error('Image upload failed:', err);
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

  // 파일 선택으로 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const filename = `img_${timestamp}.${ext}`;

        // 임시로 로컬 URL 생성
        const blob = new Blob([buffer], { type: file.type });
        const url = URL.createObjectURL(blob);

        const imageMarkdown = `\n![${file.name}](${url})\n`;
        onChange(value + imageMarkdown);
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {/* 툴바 */}
      <div className="flex items-center gap-2 pb-2">
        <Button size="sm" variant="outline" onClick={handleH3} title="제목 (H3)">
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleBold} title="굵게">
          <Bold className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleList} title="리스트">
          <List className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleGreen} title="초록색 텍스트">
          <span className={'font-semibold text-green-500'}>A</span>
        </Button>
        <label>
          <Button size="sm" variant="outline">
            <span>
              <ImageIcon className="h-4 w-4" />
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant={preview ? 'outline' : 'default'}
            onClick={() => setPreview(false)}
          >
            편집
          </Button>
          <Button
            size="sm"
            variant={preview ? 'default' : 'outline'}
            onClick={() => setPreview(true)}
          >
            미리보기
          </Button>
        </div>
      </div>

      {/* 에디터 / 미리보기 */}

      <div className={'relative flex w-full flex-1 overflow-hidden rounded-lg border-2'}>
        {!preview ? (
          <div
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              `absolute z-20 w-full transition`,
              isDragging ? 'border-primary bg-primary/10' : 'border-border'
            )}
          >
            <Textarea
              value={value}
              variant={'none'}
              onChange={(e) => onChange(e.target.value)}
              placeholder="마크다운을 입력하세요... (이미지를 드래그해서 추가할 수 있습니다)"
              className="min-h-svw resize-none border-0 focus-visible:ring-0"
            />
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert w-full max-w-none overflow-y-auto rounded-lg p-4">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks, remarkGfm]}
              components={{
                // H3 스타일
                h3: ({ children }) => (
                  <h3 className="text-foreground text-lg font-bold">{children}</h3>
                ),
                // Bold 스타일
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                // 이미지 스타일
                img: ({ src, alt }) => (
                  <img src={src} alt={alt} className="max-w-full rounded-lg border" />
                ),
                // 리스트 스타일
                ul: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children }) => (
                  <span className={'font-semibold text-green-500'}>{children}</span>
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* 하단 안내 */}
      {!preview && (
        <div className="text-muted-foreground text-xs">
          💡 이미지를 드래그해서 놓거나 📷 버튼을 클릭하세요
        </div>
      )}
    </div>
  );
}
