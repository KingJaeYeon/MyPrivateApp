import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { IconEllipsis } from '@/assets/svg';

export default function ColumnMenu({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <Popover>
      <PopoverTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button className={'text-muted-foreground cursor-pointer'}>
          <IconEllipsis />
        </button>
      </PopoverTrigger>
      <PopoverContent className="mt-[-0.5rem] w-24 p-1" align={'end'}>
        <div className="flex h-full w-full flex-col justify-between text-sm">
          <button
            className="hover:bg-muted flex w-full cursor-pointer items-center justify-center rounded-md py-2 select-none"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${data.channelId}`);
            }}
          >
            상세 보기
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
