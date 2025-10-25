import { Button } from '@/components/ui/button.tsx';

export function ButtonRenderer({
  isDeleting,
  isSelect,
  isSub,
  disabled,
  setIsSub,
  pushInput,
  updated,
}: {
  isDeleting: boolean;
  isSelect: boolean;
  isSub: boolean;
  disabled: boolean;
  setIsSub: (b: boolean) => void;
  pushInput: () => void;
  updated: () => void;
}) {
  if (isDeleting) {
    return null;
  }

  if (!isSelect) {
    return (
      <Button disabled={disabled} onClick={pushInput}>
        저장
      </Button>
    );
  }

  if (isSelect && isSub) {
    return (
      <>
        <Button variant={'secondary'} onClick={() => setIsSub(false)}>
          취소
        </Button>
        <Button disabled={disabled} onClick={pushInput}>
          저장
        </Button>
      </>
    );
  }

  if (isSelect && !isSub) {
    return (
      <>
        <Button variant={'secondary'} onClick={() => setIsSub(true)}>
          하위 항목 추가
        </Button>
        <Button disabled={disabled} onClick={updated}>
          갱신
        </Button>
      </>
    );
  }
}
