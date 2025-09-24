// renderer/src/components/MultiSelectDropBox.tsx
// A sleek, accessible multi-select dropdown built with shadcn/ui + Tailwind.
// Controlled component: receives selected + setSelected from parent.

import * as React from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

// icons
import { ChevronsUpDown, Check, X, Trash2 } from 'lucide-react';

export type Option = {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
};

export type MultiSelectDropBoxProps = {
  options: Option[];
  selected: string[]; // controlled
  setSelected: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  popoverClassName?: string;
  searchable?: boolean; // default true
  selectAll?: boolean; // default true
  maxHeight?: number; // px for the list, default 280
  emptyText?: string; // when search has no result
  renderValue?: (selected: Option[]) => React.ReactNode; // custom button label
};

export default function MultiSelectDropBox({
  options,
  selected,
  setSelected,
  placeholder = 'Select items…',
  disabled,
  className,
  popoverClassName,
  selectAll = true,
  maxHeight = 280,
  emptyText = 'No results',
  renderValue,
}: MultiSelectDropBoxProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = useMemo(
    () => options.filter((o) => selected.includes(o.value)),
    [options, selected]
  );

  const allValues = useMemo(() => options.map((o) => o.value), [options]);

  const toggle = (v: string) => {
    if (selected.includes(v)) setSelected(selected.filter((x) => x !== v));
    else setSelected([...selected, v]);
  };

  const selectAllValues = () => setSelected(allValues);
  const clearAll = () => setSelected([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Multi select"
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            {renderValue ? (
              renderValue(selectedOptions)
            ) : selectedOptions.length > 0 ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate text-sm">{selectedOptions[0]?.label}</span>
                {selectedOptions.length > 1 && (
                  <Badge variant="outline" className="shrink-0">
                    +{selectedOptions.length - 1}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[var(--radix-popover-trigger-width)] p-0', popoverClassName)}
        align="start"
      >
        <div className="p-2">
          <div className="mb-2 flex items-center gap-2">
            {selectAll && (
              <Button type="button" size="sm" variant="secondary" onClick={selectAllValues}>
                Select all
              </Button>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
              <Trash2 className="mr-1 h-4 w-4" /> Clear
            </Button>
          </div>
          <Separator />
        </div>
        <Command shouldFilter={false}>
          <ScrollArea style={{ maxHeight }}>
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const checked = selected.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      keywords={[opt.label, opt.hint || '']}
                      onSelect={() => toggle(opt.value)}
                      className="px-2"
                    >
                      <div className="mr-2 flex items-center justify-center">
                        <Checkbox checked={checked} aria-label={opt.label} />
                      </div>
                      {opt.icon && (
                        <span className="mr-2 inline-flex items-center">{opt.icon}</span>
                      )}
                      <span className="flex-1 truncate">{opt.label}</span>
                      {checked && <Check className="ml-2 h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
        {selectedOptions.length > 0 && (
          <div className="flex items-center gap-1 border-t px-2 py-2">
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((s) => (
                <Badge key={s.value} variant="secondary" className="flex items-center gap-1">
                  <span className="max-w-[8rem] truncate">{s.label}</span>
                  <button
                    type="button"
                    className="no-drag opacity-70 hover:opacity-100"
                    onClick={() => toggle(s.value)}
                    aria-label={`Remove ${s.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Usage example:
// const [tags, setTags] = useState<string[]>([]);
// const options: Option[] = [...];
// <MultiSelectDropBox options={options} selected={tags} setSelected={setTags} />
