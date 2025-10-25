import { Button } from '@/components/ui/button.tsx';
import useReferenceStore from '@/store/useReferenceStore.ts';

export function ButtonRenderer({
  isDeleting,
  disabled,
  pushInput,
  updated,
}: {
  isDeleting: boolean;
  disabled: boolean;
  pushInput: () => void;
  updated: () => void;
}) {
  const { panelState, setPanelState } = useReferenceStore();
  if (isDeleting) {
    return null;
  }

  if (panelState.isNew) {
    return (
      <Button disabled={disabled} onClick={pushInput}>
        저장
      </Button>
    );
  }

  if (!panelState.isNew && panelState.isSub) {
    return (
      <>
        <Button variant={'secondary'} onClick={() => setPanelState('isSub', false)}>
          취소
        </Button>
        <Button disabled={disabled} onClick={pushInput}>
          저장
        </Button>
      </>
    );
  }

  if (!panelState.isNew && !panelState.isSub) {
    return (
      <>
        <Button variant={'secondary'} onClick={() => setPanelState('isSub', true)}>
          하위 항목 추가
        </Button>
        <Button disabled={disabled} onClick={updated}>
          갱신
        </Button>
      </>
    );
  }
}
