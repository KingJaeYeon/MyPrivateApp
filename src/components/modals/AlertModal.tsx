import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTheme } from '@/providers/theme-provider.tsx';

interface AlertModalProps {
  onClose: () => void;
  data?: string;
}

export default function AlertModal({ onClose, data }: AlertModalProps) {
  const { theme } = useTheme();
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="bg-secondary max-w-[18rem] border-2 p-4">
        <AlertDialogHeader>
          <AlertDialogTitle className={'flex justify-center'}>
            <img
              src={theme === 'dark' ? './logo-dark.png' : './logo.png'}
              className={'w-[100px]'}
              alt={'logo'}
            />
          </AlertDialogTitle>
          <AlertDialogDescription
            className={'text-0.5xs mt-3 px-1.5 text-center font-semibold text-white'}
          >
            {data}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <button className={'btn-submit w-full text-sm'} onClick={onClose}>
          OK
        </button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
