import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
                              options,
                              value,
                              onChange,
                              placeholder = "Select items...",
                              className,
                            }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeTag = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className={cn("space-y-2", className)}>
  <Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
  <Button
    variant="outline"
  size="sm"
  role="combobox"
  aria-expanded={open}
  className="w-full justify-between text-left font-normal"
    >
    {value.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((opt) => (
              <Badge
                key={opt.value}
            variant="secondary"
            className="flex items-center gap-1 text-xs"
              >
              {opt.label}
              <X
            className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
            onClick={(e) => {
    e.stopPropagation();
    removeTag(opt.value);
  }}
  />
  </Badge>
))}
  </div>
) : (
    <span className="text-muted-foreground text-sm">{placeholder}</span>
  )}
  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
    </Button>
    </PopoverTrigger>

    <PopoverContent className="w-[300px] p-0">
  <Command>
    <CommandInput placeholder="Search..." className="h-9" />
    <CommandEmpty>No results found.</CommandEmpty>
  <CommandGroup className="max-h-[200px] overflow-auto">
    {options.map((opt) => (
        <CommandItem
          key={opt.value}
      onSelect={() => handleSelect(opt.value)}
  className="flex items-center justify-between"
    >
    <span>{opt.label}</span>
  {value.includes(opt.value) && (
    <Check className="h-4 w-4 text-primary" />
  )}
  </CommandItem>
))}
  </CommandGroup>
  </Command>
  </PopoverContent>
  </Popover>

  {value.length > 0 && (
    <div className="flex flex-wrap gap-1">
      {selectedOptions.map((opt) => (
          <Badge
            key={opt.value}
        variant="outline"
        className="flex items-center gap-1 text-xs"
          >
          {opt.label}
          <X
        className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
        onClick={() => removeTag(opt.value)}
    />
    </Badge>
  ))}
    </div>
  )}
  </div>
);
}
