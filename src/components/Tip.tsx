'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';
import { cn } from '@/lib/utils.ts';

export default function Tip({
  children,
  className,
  txt,
  asChild = false,
  color,
  align,
}: {
  children: React.ReactNode;
  className?: string;
  txt: string;
  asChild?: boolean;
  color?: 'green' | 'red';
  align?: 'center' | 'end' | 'start';
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild={asChild}
        className={cn(
          'text-start',
          color === 'green' && 'text-green-600',
          color === 'red' && 'text-destructive'
        )}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent className={className} align={align}>
        <p className={'whitespace-break-spaces'}>{txt}</p>
      </TooltipContent>
    </Tooltip>
  );
}
