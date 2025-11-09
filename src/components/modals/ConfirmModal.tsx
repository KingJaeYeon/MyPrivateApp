import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider.tsx';
import React from 'react';

interface ConfirmModalProps {
  onClose: () => void;
  data?: {
    title?: string;
    message?: string;
    content?: React.ElementType;
    onConfirm?: () => Promise<boolean>;
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
  const { theme } = useTheme();
  const handleConfirm = async () => {
    const res = await data?.onConfirm?.();
    console.log('res', res);
    if (!res) return;
    onClose();
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="bg-secondary max-w-[18rem] gap-0 border-2 p-4">
        <AlertDialogHeader>
          <AlertDialogTitle className={'flex justify-center'}>
            <img
              src={theme === 'dark' ? './logo-dark.png' : './logo.png'}
              className={'w-[100px]'}
              alt={'logo'}
            />
          </AlertDialogTitle>

          <AlertDialogDescription
            className={
              'text-0.5xs text-foreground mt-3 px-3 text-center font-semibold break-words whitespace-normal'
            }
          >
            {data?.message}
          </AlertDialogDescription>
          {data?.content !== undefined && (
            <div className={'py-2'}>
              <data.content />
            </div>
          )}
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className={'flex flex-1 px-0 text-xs'}
            size={'sm'}
            onClick={onClose}
          >
            {data?.cancelText || 'Cancel'}
          </Button>
          <Button
            onClick={handleConfirm}
            className={'btn-submit flex w-full flex-1 text-xs'}
            size={'sm'}
            variant="destructive"
          >
            {data?.confirmText || 'OK'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
