import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  onChangeValue: (value: string) => void;
  isError?: boolean;
  id?: string;
}
//<FloatingOutlinedInput
//           id={"ddddddd"}
//           label={"테스트"}
//           value={input5}
//           onChangeValue={(value: string) => setInput5(value)}
//         />
export function FloatingOutlinedInput(props: FloatingInputProps & { sizeC?: 'lg' | 'default' }) {
  const {
    label,
    className,
    onChangeValue,
    isError,
    id,
    disabled,
    sizeC = 'default',
    ...rest
  } = props;
  const [isFocused, setIsFocused] = useState(false);

  const sizes = {
    default: {
      label: 'px-1',
      input: 'h-[20px] text-sm px-[10px]',
      container: 'h-[48px] text-sm',
    },
    lg: {
      label: 'px-1.5',
      input: 'h-[28px] px-[14px]',
      container: 'h-[56px]',
    },
  };

  useEffect(() => {
    if (rest.value !== '') {
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }
  }, [rest.value]);

  return (
    <div
      className={cn(
        'relative isolate flex flex-col justify-center',
        className,
        sizes[sizeC].container
      )}
    >
      <input
        id={id}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.target.value) setIsFocused(false);
        }}
        onChange={(e) => onChangeValue(e.target.value)}
        disabled={disabled}
        className={cn(
          'bg-background m-[2px] flex flex-1 border-none py-[12px] focus-visible:outline-none',
          sizes[sizeC].input,
          disabled && 'cursor-not-allowed'
        )}
        {...rest}
      />

      <label
        htmlFor={id}
        className={cn(
          'bg-background absolute left-2',
          isFocused ? 'left-1 translate-y-[-110%] scale-[0.8] text-[#0b57b0]' : '',
          isError && 'text-[#b3261e]',
          sizes[sizeC].label
        )}
        style={{ transition: 'all .3s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {label}
      </label>
      <div
        className={cn(
          'border-input absolute z-[-1] flex h-full w-full rounded-[4px] border-2',
          isError && 'border-[#b3261e]'
        )}
      />
      <div
        className={cn(
          'absolute z-[-1] flex h-full w-full rounded-[4px] border-[3px] border-[#0b57b0]',
          isError && 'border-[#b3261e]'
        )}
        style={{
          transition: 'opacity .3s cubic-bezier(0.4,0,0.2,1)',
          opacity: isFocused ? '1' : '0',
        }}
      />
    </div>
  );
}
