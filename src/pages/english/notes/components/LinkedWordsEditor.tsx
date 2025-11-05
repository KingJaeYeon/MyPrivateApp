import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import useEnglishStore from '@/store/useEnglishStore.ts';
import { cn } from '@/lib/utils.ts';
import { IconCheck } from '@/assets/svg';

export function LinkedWordsEditor({
  linkedWordIds,
  onChange,
}: {
  linkedWordIds: string;
  onChange: (wordId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { engWords, jsonEngWords } = useEnglishStore();

  // 검색된 단어 목록 (이미 추가된 것 제외)
  const filteredWords = engWords.filter((word) =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 단어 추가
  const handleAdd = (wordId: string) => {
    const cur = linkedWordIds !== '' ? linkedWordIds.split(',') : [];
    if (cur.includes(wordId.toString())) {
      // 이미 있으면 제거
      const newIds = cur.filter((t) => t !== wordId.toString());
      onChange(newIds.join(','));
    } else {
      // 없으면 추가
      cur.push(wordId.toString());
      onChange(cur.join(','));
    }
  };

  // 단어 제거
  const handleRemove = (removeId: string) => {
    const cur = linkedWordIds !== '' ? linkedWordIds.split(',') : [];
    if (cur.includes(removeId)) {
      // 이미 있으면 제거
      const newIds = cur.filter((t) => t !== removeId);
      onChange(newIds.join(','));
    }
  };

  return (
    <div className="mt-4 space-y-2 border-t pt-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={'flex items-center gap-2'}>
          <p className="text-muted-foreground text-xs">🔗 관련 단어</p>
          <button className={'hover:bg-secondary cursor-pointer rounded-full p-0.5'}>
            <Plus className="h-3 w-3 stroke-2" />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관련 단어 추가</DialogTitle>
          </DialogHeader>

          {/* 검색 */}
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
                filteredWords.map((word) => {
                  const selected = linkedWordIds.split(',').includes(word.id.toString());
                  return (
                    <button
                      key={word.id}
                      onClick={() => handleAdd(word.id)}
                      className={cn(
                        'hover:bg-muted flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition',
                        selected && 'bg-secondary text-green-500'
                      )}
                    >
                      <span className="font-medium">{word.word}</span>
                      {selected ? (
                        <IconCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <Plus className="text-muted-foreground h-4 w-4" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  {searchTerm ? '검색 결과가 없습니다' : '추가 가능한 단어가 없습니다'}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 이미 추가된 단어들 */}
      <div className="flex flex-wrap gap-2">
        {linkedWordIds.length === 0 ? (
          <span className="text-muted-foreground text-xs">추가된 단어가 없습니다</span>
        ) : (
          linkedWordIds.split(',').map((id) => (
            <Badge key={'linkedWordId' + id} variant="secondary" className={'gap-1 px-3 py-1'}>
              {jsonEngWords[id]}
              <button
                onClick={() => handleRemove(id)}
                className="hover:text-destructive ml-1 transition"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
