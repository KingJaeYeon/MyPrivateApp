import { Badge } from '@/components/ui/badge.tsx';

export function BadgeRenderer({
  isDeleting,
  isSub,
  pId,
  id,
}: {
  isDeleting: boolean;
  isSub: boolean;
  pId: number;
  id: number;
}) {
  if (isDeleting) {
    return <Badge>{`Idx:0`}</Badge>;
  }

  if (isSub || pId !== id) {
    return (
      <>
        <Badge>{`pIdx:${pId}`}</Badge>
        <Badge>{`Idx:${id}`}</Badge>
      </>
    );
  }

  return <Badge>{`Idx:${id}`}</Badge>;
}
