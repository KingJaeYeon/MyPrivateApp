'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';

export default function Tip({
  children,
  className,
  txt,
  asChild = false,
}: {
  children: React.ReactNode;
  className?: string;
  txt: string;
  asChild?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild} className={'text-start'}>
        {children}
      </TooltipTrigger>
      <TooltipContent className={className}>
        <p className={'whitespace-break-spaces'}>{txt}</p>
      </TooltipContent>
    </Tooltip>
  );
}
