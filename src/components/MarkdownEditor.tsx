import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils.ts';
import MarkdownPreview from '@/components/MarkdownPreview.tsx';
import useSettingStore from '@/store/useSettingStore.ts';
import useUpload from '@/hooks/use-upload.tsx';
import { Loading2 } from '@/assets/svg';
import MarkdownToolbar from '@/components/MarkdownToolbar.tsx';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(false);
  const { upload } = useUpload();
  const [isImageLoading, setIsImageLoading] = useState(false);
  const folder = useSettingStore((r) => r.data.folder);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setPreview((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const insertToTextArea = (insertString: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    const sentence = textarea.value;
    const pos = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selected = sentence.slice(pos, end);
    let updatedSentence = '';

    if (selected.trim() === '') {
      updatedSentence = sentence.slice(0, pos) + insertString + sentence.slice(pos);
    } else {
      updatedSentence =
        sentence.slice(0, pos) + insertString + sentence.slice(pos + selected.length);
    }

    textarea.value = updatedSentence;
    textarea.selectionEnd = end + insertString.length;
    return updatedSentence;
  };

  // 텍스트 삽입 헬퍼
  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const insertString = before + selectedText + after;
    const updatedSentence = insertToTextArea(insertString);

    if (!updatedSentence) return;
    onChange(updatedSentence);

    // 포커싱 및 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleUpload = async () => {
    upload(async (file) => {
      if (!file) return;
      setIsImageLoading(true);
      await handleImageUpload(file);
      setIsImageLoading(false);
    });
  };

  // 이미지 드롭 처리
  const handlePasteOrDrop = async (data: DataTransfer) => {
    const files = data.files;
    if (!files || !files.length) return;
    const image = files.item(0) as File;
    await handleImageUpload(image);
  };

  // 파일 선택으로 이미지 업로드
  const handleImageUpload = async (image: File) => {
    const imageName = image?.name || '이미지.png';
    const loadingText = `<!-- Uploading "${imageName}"... -->`;

    const insertMarkdown = insertToTextArea(loadingText);
    if (!insertMarkdown) return;
    onChange(insertMarkdown);

    const arrayBuffer = await image.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 로컬 저장 (선택)
    const savedFolderPath = `${folder.location}/english/image`;
    const timestamp = Date.now();
    const ext = image.name.split('.').pop();
    const filename = `img_${timestamp}.${ext}`;
    const targetPath = `${savedFolderPath}/${filename}`;
    await window.fsApi.writeBinary(targetPath, buffer);

    // 서버 업로드
    // const { path } = await ExamAPI.uploadImage({ examId, image });
    const finalMarkdown = insertMarkdown.replace(loadingText, `![](${encodeURI(targetPath)})`);
    onChange(finalMarkdown);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {/* 툴바 */}
      <MarkdownToolbar
        isImageLoading={isImageLoading}
        preview={preview}
        onTogglePreview={setPreview}
        onInsertText={insertText}
        onUpload={handleUpload}
      />

      {/* 에디터 / 미리보기 */}

      <div className={'relative flex w-full flex-1 overflow-hidden rounded-lg border-2'}>
        {!preview ? (
          <div
            onDrop={async (e) => {
              setIsImageLoading(true);
              await handlePasteOrDrop(e.dataTransfer);
              setIsImageLoading(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onPaste={async (e) => {
              setIsImageLoading(true);
              await handlePasteOrDrop(e.clipboardData);
              setIsImageLoading(false);
            }}
            className={cn(
              `absolute z-20 w-full transition`,
              isDragging ? 'border-primary bg-primary/10' : 'border-border'
            )}
          >
            <Textarea
              value={value}
              variant={'none'}
              maxLength={10000}
              onChange={(e) => onChange(e.target.value)}
              placeholder="마크다운을 입력하세요... (이미지를 드래그해서 추가할 수 있습니다)"
              className="scrollWidth3 min-h-svw resize-none border-0 focus-visible:ring-0"
            />
          </div>
        ) : (
          <MarkdownPreview value={value} />
        )}
      </div>

      {/* 하단 안내 */}
      {!preview && (
        <div className="text-muted-foreground text-xs">
          {isImageLoading ? (
            <Loading2 className={'h-4 w-4 animate-spin'} />
          ) : (
            ' 💡 이미지를 드래그해서 놓거나 📷 버튼을 클릭하세요'
          )}
        </div>
      )}
    </div>
  );
}
