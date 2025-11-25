import { Button } from '@/components/ui/button';
import { Bold, Heading3, Image as ImageIcon, List } from 'lucide-react';
import { Loading2 } from '@/assets/svg';
import { cn } from '@/lib/utils.ts';
import * as React from 'react';

type MarkdownToolbarProps = {
  isImageLoading: boolean;
  preview: boolean;
  onTogglePreview: (v: boolean) => void;
  onInsertText: (before: string, after?: string) => void;
  onUpload: () => void;
};

export default function MarkdownToolbar({
  isImageLoading,
  preview,
  onTogglePreview,
  onInsertText,
  onUpload,
}: MarkdownToolbarProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (preview) {
        return;
      }
      if (e.key === '1' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onInsertText('### ');
      }
      if (e.key === '2' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onInsertText('**', '**');
      }
      if (e.key === '3' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onInsertText('- ');
      }
      if (e.key === '4' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onInsertText('<span class="md-primary">', '</span>');
      }
      if (e.key === '5' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onInsertText('<span class="md-secondary">', '</span>');
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="flex items-center gap-2 pb-2">
      {/* Markdown 포맷팅 */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onInsertText('### ')}
        title="제목 (H3)"
        disabled={preview}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onInsertText('**', '**')}
        title="굵게"
        disabled={preview}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onInsertText('- ')}
        title="리스트"
        disabled={preview}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onInsertText('<span class="md-primary">', '</span>')}
        title="초록색 텍스트"
        disabled={preview}
      >
        <span className="md-primary">A</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onInsertText('<span class="md-secondary">', '</span>')}
        title="빨간색 텍스트"
        disabled={preview}
      >
        <span className="md-secondary">A</span>
      </Button>

      {/* 이미지 업로드 */}
      <Button
        size="sm"
        variant="outline"
        onClick={onUpload}
        title="이미지 삽입"
        className={cn(
          'flex items-center gap-1',
          isImageLoading && 'pointer-events-none opacity-50'
        )}
        disabled={isImageLoading || preview}
      >
        {isImageLoading ? (
          <Loading2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
      <kbd className="bg-muted/70 text-foreground/80 border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold shadow-sm">
        Ctrl/⌘ + 1 ~ 5
      </kbd>
      <kbd className="bg-muted/70 text-foreground/80 border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold shadow-sm">
        Ctrl/⌘ + shift + w
      </kbd>
      {/* 우측 프리뷰 버튼 */}
      <div className="ml-auto flex gap-2">
        <Button
          size="sm"
          variant={preview ? 'outline' : 'default'}
          onClick={() => onTogglePreview(false)}
        >
          편집
        </Button>
        <Button
          size="sm"
          variant={preview ? 'default' : 'outline'}
          onClick={() => onTogglePreview(true)}
        >
          미리보기
        </Button>
      </div>
    </div>
  );
}
