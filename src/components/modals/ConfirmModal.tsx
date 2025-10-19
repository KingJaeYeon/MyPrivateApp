import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  onClose: () => void;
  data?: {
    title?: string;
    message?: string;
    onConfirm?: () => void;
    cancelText?: string;
    confirmText?: string;
  };
}

/**
 * @param onClose
 * @param data
 * @constructor
 */
export default function ConfirmModal({ onClose, data }: ConfirmModalProps) {
  const handleConfirm = () => {
    data?.onConfirm?.();
    onClose();
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{data?.title || '확인'}</AlertDialogTitle>
          <AlertDialogDescription>{data?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {data?.cancelText || '취소'}
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            {data?.confirmText || '확인'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
