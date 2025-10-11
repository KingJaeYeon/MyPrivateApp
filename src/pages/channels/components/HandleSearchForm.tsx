// refectoring
// 별도 컴포넌트로 분리
import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

export function HandleSearchForm({
  onSearch,
  isPending,
}: {
  onSearch: (handles: string) => void;
  isPending: boolean;
}) {
  return (
    <form
      className={'flex gap-2'}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.elements.namedItem('handles') as HTMLInputElement;
        onSearch(input.value);
        form.reset();
      }}
    >
      <Label className={'min-w-[80px]'}>Handle 검색(Max:50)</Label>
      <Input name="handles" placeholder={'@handle,@handle...'} />
      <Button type="submit" loading={isPending}>
        검색
      </Button>
    </form>
  );
}
