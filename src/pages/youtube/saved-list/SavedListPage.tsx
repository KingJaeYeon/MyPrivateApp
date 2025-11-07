import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSettingStore from '@/store/useSettingStore.ts';
import { cn } from '@/lib/utils.ts';
import DetailOption from '@/pages/youtube/saved-list/components/DetailOption.tsx';

const seed = { fileName: '', label: '' };

export default function SavedListPage() {
  const [select, setSelect] = useState<{ fileName: string; label: string }>(seed);
  const { name, location } = useSettingStore((r) => r.data.folder);
  const { hasFile } = useSettingStore((r) => r.data);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);

  async function getFiles() {
    try {
      const result = await window.fsApi.listExcel(`${location}/${name.result.split('/')[0]}`);
      setSavedFiles(result);
    } catch (_) {
      setSavedFiles([]);
    }
  }

  useEffect(() => {
    if (location) {
      getFiles();
    }
  }, [location]);

  useEffect(() => {
    getFiles();
  }, [hasFile]);
  return (
    <div className={'flex h-full w-full flex-1 gap-4 p-4'}>
      <DetailOption select={select} cancel={() => setSelect(seed)} reset={getFiles} />
      <div className="flex h-full w-[300px] flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b px-4 pt-12 pb-4">
          <h3 className="font-semibold">저장된 결과</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              getFiles();
              toast.success('새로고침');
              setSelect(seed);
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* 채널 리스트 */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {savedFiles === null
              ? null
              : savedFiles
                  .slice()
                  .reverse()
                  .map((fileName) => {
                    const display = fileName.split('cid');
                    const values = display[1].split('_');
                    return (
                      <button
                        key={values[1]}
                        onClick={() => setSelect({ fileName, label: values[1] })}
                        className={cn(
                          'flex flex-col gap-2 rounded-lg p-3 text-left transition-colors',
                          'hover:bg-accent/50 active:bg-accent',
                          fileName === select.fileName && 'text-destructive'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex-1 truncate text-sm font-medium">{values[1]}</span>
                        </div>

                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>{display[0].replace(/[\[\]]/g, '')}</span>
                        </div>
                      </button>
                    );
                  })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
