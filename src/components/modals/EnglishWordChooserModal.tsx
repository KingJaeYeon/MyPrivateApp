import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { useMemo, useState } from 'react';
import useEnglishStore from '@/store/useEnglishStore.ts';
import useDebounce from '@/hooks/use-debounce.ts';

interface EnglishWordChooserModalProps {
  onClose: () => void;
  data?: {
    select: { id: string; title: string }[];
    setSelect: (words: { id: string; title: string }[]) => void;
  };
}

export default function EnglishWordChooserModal({ onClose, data }: EnglishWordChooserModalProps) {
  if (!data) return null;
  const { select, setSelect } = data;
  const { engWords } = useEnglishStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debounce = useDebounce(searchTerm);

  // 검색된 단어 목록 (이미 추가된 것 제외)
  const filteredWords = useMemo(() => {
    return engWords.filter(
      (word) =>
        word.word.toLowerCase().includes(debounce.toLowerCase()) &&
        !select.some((linked) => linked.id === word.id)
    );
  }, [select]);

  // 단어 추가
  const handleAdd = (word: { id: string; word: string }) => {
    setSelect([...select, { id: word.id, title: word.word }]);
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
      <DialogContent>
        {JSON.stringify(select)}
        <DialogHeader>
          <DialogTitle>관련 단어 추가</DialogTitle>
        </DialogHeader>
        {/* 검색 */}
        {JSON.stringify(select)}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="단어 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 단어 목록 */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 pr-4">
            {filteredWords.length > 0 ? (
              filteredWords.map((word) => (
                <button
                  key={'word' + word.id}
                  onClick={() => handleAdd(word)}
                  className="hover:bg-muted flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition"
                >
                  <span className="font-medium">{word.word}</span>
                  <Plus className="text-muted-foreground h-4 w-4" />
                </button>
              ))
            ) : (
              <div className="text-muted-foreground py-8 text-center text-sm">
                {debounce ? '검색 결과가 없습니다' : '추가 가능한 단어가 없습니다'}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
