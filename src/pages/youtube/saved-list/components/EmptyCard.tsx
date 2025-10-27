import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx';
import { IconFolder } from '@/assets/svg';
import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';

export function EmptyCard() {
  return (
    <div className={'h-full flex-1 rounded-md p-10'}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFolder />
          </EmptyMedia>
          <EmptyTitle>No Result Files Yet</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t selected any files yet. Please select one from the left panel.
          </EmptyDescription>
        </EmptyHeader>

        <Button variant="link" className="text-muted-foreground" size="sm">
          <Link to="/youtube/search" className={'flex gap-2'}>
            Search Video
            <ArrowUpRightIcon />
          </Link>
        </Button>
      </Empty>
    </div>
  );
}
