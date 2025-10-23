import { useTheme } from '@/providers/theme-provider.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  return (
    <div className={'no-drag flex flex-1 items-center justify-center select-none'}>
      <div className={'mb-20 flex flex-col items-center gap-4'}>
        <img
          src={theme === 'dark' ? './logo-dark.png' : './logo.png'}
          className={'w-[220px]'}
          alt={'logo'}
        />
        <div className={'flex flex-col items-center justify-center gap-4'}>
          <p className={'font-semibold'}>
            {`죄송합니다. 현재 찾을 수 없는 페이지를 요청 하셨습니다.`}
          </p>
          <div className={'text-muted-foreground text-center text-sm'}>
            <p>{`엑셀이 위치한 Location이나 생성여부를 확인해주세요.`}</p>
            <p>{`확인 후에도 버그가 발생하면 문의는 개발자에게 해주세요.`}</p>
          </div>
          <div className={'mt-2 flex gap-4'}>
            <Button variant={'secondary'} size={'lg'} onClick={() => navigate('/')}>
              메인으로
              <span className={'h-1.5 w-1.5 animate-pulse rounded-full bg-green-500'} />
            </Button>
            <Button size={'lg'} onClick={() => navigate(-1)}>
              이전으로
              <span className={'bg-background h-1.5 w-1.5 animate-pulse rounded-full'} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
