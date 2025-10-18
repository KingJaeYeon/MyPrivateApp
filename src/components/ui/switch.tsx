import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme-provider.tsx';
import { IconMoon, IconSun } from '@/assets/svg';
import { cva, type VariantProps } from 'class-variance-authority';

const switchVariants = cva(
  'relative no-drag h-[24px] w-[60px] focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'h-[20px] w-[60px] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        theme:
          'h-[20px] w-[46px] data-[state=checked]:bg-[hsl(180,1%,86%)] data-[state=unchecked]:bg-[hsl(228,3%,34%)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

function Switch({ className, variant, ...props }: SwitchProps) {
  const isChecked = props.checked;
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ variant, className }))}
      {...props}
    >
      {variant === 'theme' ? (
        <SwitchThemeThumb />
      ) : (
        <>
          <SwitchThumb />
          <SwitchLabel isChecked={!!isChecked} />
        </>
      )}
    </SwitchPrimitive.Root>
  );
}

const SwitchThumb = React.forwardRef<
  React.ComponentProps<typeof SwitchPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Thumb>
>(() => (
  <SwitchPrimitive.Thumb
    data-slot="switch-thumb"
    className={cn(
      'bg-background data-[state=checked]:bg-switch-on-thumb data-[state=unchecked]:bg-switch-off-thumb pointer-events-none block h-[19px] w-[19px] rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-0 data-[state=unchecked]:translate-x-9.5'
    )}
  />
));

const SwitchThemeThumb = React.forwardRef<
  React.ComponentProps<typeof SwitchPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Thumb>
>(({ className, children, ...props }) => {
  const { theme } = useTheme();
  return (
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        'dark:data-[state=checked]:bg-[hsl(228,3%,34%)] dark:data-[state=unchecked]:bg-[hsl(180,1%,86%)]',
        'pointer-events-none flex h-[18px] w-[18px] items-center justify-center rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-0.5 data-[state=unchecked]:translate-x-6',
        className
      )}
      {...props}
    >
      {theme === 'dark' ? (
        <IconSun className={'h-[14px] w-[14px] text-[hsla(0_0%_36%)]'} />
      ) : (
        <IconMoon className={'h-[14px] w-[14px] text-white'} />
      )}
    </SwitchPrimitive.Thumb>
  );
});

const SwitchLabel = ({ isChecked }: { isChecked: boolean }) => (
  <div
    className={cn(
      'absolute text-xs',
      isChecked ? 'text-switch-on-thumb right-3' : 'text-switch-off-thumb left-1.5'
    )}
  >
    {isChecked ? 'ON' : 'OFF'}
  </div>
);

Switch.displayName = SwitchPrimitive.Root.displayName;
SwitchThumb.displayName = SwitchPrimitive.Thumb.displayName;
SwitchThemeThumb.displayName = SwitchPrimitive.Thumb.displayName;

export { Switch };
