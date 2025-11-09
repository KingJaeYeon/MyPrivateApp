import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertModalProps {
  onClose: () => void;
}

export default function CoffeModal({ onClose }: AlertModalProps) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="bg-secondary max-w-[18rem] border-2 p-4">
        <AlertDialogHeader>
          <AlertDialogTitle className={'flex justify-center'}>
            <img src={'./AQR.png'} className={'w-[300px]'} alt={'aqr-logo'} />
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className={'flex w-full flex-col justify-center gap-2'}>
          <button
            className={'btn-submit cursor-pointer text-sm'}
            onClick={() => window.electronAPI.openExternal('https://aq.gy/f/lcX5G')}
          >
            커피 한잔만 기부하로가기 😍
          </button>
          <button className={'w-full cursor-pointer text-sm hover:underline'} onClick={onClose}>
            뭔놈의 커피야. 꺼지쇼 😱
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
