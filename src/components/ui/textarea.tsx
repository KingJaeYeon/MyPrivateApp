import * as React from 'react';

import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

export const textareaVariants = cva(
  'text-sm placeholder:text-sm flex min-h-[80px] w-full max-w-full resize-none bg-transparent dark:bg-input/30 px-3 py-2 focus-visible:outline-none disabled:pointer-events-none disabled:border-input-disabled-border disabled:text-input-disabled-foreground disabled:placeholder:opacity-20',
  {
    variants: {
      variant: {
        default:
          'placeholder:text-muted-foreground dark:bg-input/30 field-sizing-content w-full rounded-md focus:border-[3px] border-2 bg-transparent px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:border-input',
        blockquote:
          'rounded-none placeholder:leading-7 py-1 relative max-w-[40rem] mx-auto leading-7 bg-transparent border-l-4 border-r-none focus:border-input',
      },
      error: {
        true: 'border-destructive hover:border-destructive focus:border-destructive',
      },
      hasMaxLength: {
        // true: 'pr-[70px]',
        true: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      error: false,
      hasMaxLength: false,
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  errorMessage?: string;
  showMaxLength?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className, //
      errorMessage,
      disabled = false,
      value,
      maxLength = 250,
      readOnly = false,
      showMaxLength,
      variant,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'scrollWidth3 relative w-full max-w-full text-sm placeholder:text-sm',
          disabled && 'cursor-not-allowed'
        )}
      >
        <textarea
          className={cn(
            textareaVariants({
              variant,
              error: !!errorMessage,
              hasMaxLength: showMaxLength,
            }),
            className
          )}
          ref={ref}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        />
        {!readOnly && showMaxLength && (
          <div
            className={cn(
              'absolute right-[16px] bottom-[8px]',
              disabled && 'opacity-10',
              errorMessage && 'bottom-[35px]'
            )}
          >
            <p className="text-muted-foreground pt-[3px] text-sm">
              {`${!value ? 0 : value.toString().length} `}
              <span>{`/ ${maxLength}`}</span>
            </p>
          </div>
        )}
        {errorMessage && <p className={'text-red pt-[5px] pl-[20px] text-xs'}>{errorMessage}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
