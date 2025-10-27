import { Badge } from '@/components/ui/badge.tsx';

export function BadgeRenderer({
  isDeleting,
  isSub,
  isKids,
  id,
}: {
  isDeleting: boolean;
  isSub: boolean;
  id: string;
  isKids: boolean;
}) {
  if (isDeleting) {
    return <Badge>{`Idx:0`}</Badge>;
  }

  if (isSub || isKids) {
    return (
      <>
        <Badge variant={'blue'}>{`하위 참조`}</Badge>
        <Badge>{`Idx:${id}`}</Badge>
      </>
    );
  }

  return <Badge>{`Idx:${id}`}</Badge>;
}
