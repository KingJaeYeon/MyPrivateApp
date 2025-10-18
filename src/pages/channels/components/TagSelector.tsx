import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import useTagStore from '@/store/tag.ts';

export default function TagSelector({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const tags = useTagStore((state) => state.data);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          size={'sm'}
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? tags.find((tag) => tag.idx === value)?.name : 'Select Tag...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="scrollWidth3 w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Tag..." className="h-9" />
          <CommandList>
            <CommandEmpty>No Tag found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="__clear__"
                value=""
                className={cn(value === '' && 'bg-accent')}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue);
                  setOpen(false);
                }}
              >
                {'All Tags'}
              </CommandItem>
              {tags.map((tag) => (
                <CommandItem
                  key={tag.idx}
                  value={tag.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className={cn(value === tag.idx && 'bg-accent')}
                >
                  {tag.name}
                  <Check
                    className={cn('ml-auto', value === tag.idx ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
