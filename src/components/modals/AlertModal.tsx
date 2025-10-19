import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface AlertModalProps {
  onClose: () => void;
  data?: {
    title?: string;
    message?: string;
    buttonText?: string;
  };
}

/**
 * @deprecated
 * @param onClose
 * @param data
 * @constructor
 */
export default function AlertModal({ onClose, data }: AlertModalProps) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{data?.title || '알림'}</AlertDialogTitle>
          <AlertDialogDescription>{data?.message}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-end">
          <Button onClick={onClose}>{data?.buttonText || '확인'}</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
