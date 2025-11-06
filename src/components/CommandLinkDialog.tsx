import * as React from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { navigationRoutes } from '@/routes.tsx';
import { useNavigate } from 'react-router-dom';

export function CommandLinkDialog() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <p className="text-muted-foreground flex items-center gap-1 text-[12px]">
        Press
        <kbd className="bg-muted/70 text-foreground/80 border-border inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold shadow-sm">
          <span className="opacity-70">Ctrl</span>
          <span className="text-primary text-xs font-bold">Space</span>
        </kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navigationRoutes.map((route) => (
            <CommandGroup heading={route.title.toLocaleUpperCase()} key={route.title}>
              {route.items
                .filter((f) => !f.hidden)
                .map((item) => (
                  <CommandItem onSelect={() => handleSelect(item.url)} key={item.title}>
                    <route.icon />
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
