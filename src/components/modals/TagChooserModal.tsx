import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import useTagStore from '@/store/useTagStore';
import { toast } from 'sonner';

interface TagChooserModalProps {
  onClose: () => void;
  data?: {
    select: string;
    setSelect: (tags: string) => void;
  };
}

export default function TagChooserModal({ onClose, data }: TagChooserModalProps) {
  if (!data) return null;

  const { select: initialSelect, setSelect } = data;
  const { jsonData, data: tags } = useTagStore.getState();

  // 모달 내부에서 선택 상태를 배열로 관리
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    return initialSelect !== '' ? initialSelect.toString().split(',').filter(Boolean) : [];
  });

  // 외부에서 select가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    const tagsArray =
      initialSelect !== '' ? initialSelect.toString().split(',').filter(Boolean) : [];
    setSelectedTags(tagsArray);
  }, [initialSelect]);

  const handleTagClick = (tagIdx: string, e?: React.MouseEvent) => {
    // 이벤트 전파 방지로 모달이 닫히지 않도록
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const isSelected = selectedTags.includes(tagIdx);

    if (isSelected) {
      // filter로 제거
      const newTags = selectedTags.filter((t) => t !== tagIdx);
      setSelectedTags(newTags);
      setSelect(newTags.join(','));
    } else {
      // push로 추가
      if (selectedTags.length >= 5) {
        toast.error('최대 5개까지 선택가능합니다.');
        return;
      }
      const newTags = [...selectedTags, tagIdx];
      setSelectedTags(newTags);
      setSelect(newTags.join(','));
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        // ESC 키나 외부 클릭으로만 닫히도록 (태그 클릭 시에는 닫히지 않음)
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>태그 선택</DialogTitle>
          <DialogDescription>최대 5개까지 선택 가능합니다</DialogDescription>
        </DialogHeader>

        <div
          className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-semibold">선택된 태그:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagIdx) => (
                  <Badge
                    key={tagIdx}
                    variant="green"
                    className="cursor-pointer"
                    onClick={(e) => handleTagClick(tagIdx, e)}
                  >
                    {jsonData[tagIdx]} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-semibold">전체 태그:</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.idx.toString());
                return (
                  <Badge
                    key={tag.idx}
                    variant={isSelected ? 'green' : 'secondary'}
                    className="cursor-pointer"
                    onClick={(e) => handleTagClick(tag.idx.toString(), e)}
                  >
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
