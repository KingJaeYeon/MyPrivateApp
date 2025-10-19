import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog.tsx';
import { DataTable } from '@/components/data-table.tsx';
import { RESULT_COLUMNS, VideoRow } from '@/components/data-table-columns/result-columns.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconClose } from '@/assets/svg';

interface ModalProps {
  onClose: () => void;
  data?: VideoRow[];
}

export default function FileResultModal({ onClose, data = [] }: ModalProps) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className={'h-full min-w-full'}>
        <AlertDialogHeader>
          <div className="flex w-full flex-1 px-4">
            <DataTable<VideoRow, unknown>
              columns={RESULT_COLUMNS}
              hasNo={true}
              isFixHeader={true}
              data={data}
              fontSize={{ head: 'text-0.5xs', cell: 'text-1.5xs' }}
              tableControls={(_) => {
                return (
                  <div className={'flex w-full items-center justify-between gap-2 pt-4'}>
                    <div className={'text-muted-foreground text-sm'}>엑셀파일</div>
                    <Button
                      size={'icon-sm'}
                      variant={'outline'}
                      className={'text-sm'}
                      onClick={onClose}
                    >
                      <IconClose />
                    </Button>
                  </div>
                );
              }}
            />
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
