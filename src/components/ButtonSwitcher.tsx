import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSpring, animated } from '@react-spring/web';
import { buttonVariants } from '@/components/ui/button.tsx';
import type { VariantProps } from 'class-variance-authority';

type Props = {
  state: string;
  setState: (state: string) => void;
  className?: string;
  wrapperClassName?: string;
  list: {
    label: any;
    value: string;
  }[];
};

export default function ButtonSwitcher({
  state,
  setState,
  className,
  list,
  wrapperClassName,
  size,
}: Props & VariantProps<typeof buttonVariants>) {
  const itemRefs = useRef<any>([]);
  const [sliderStyle, setSliderStyle] = useState({ width: '0px', left: '0px' });

  const animatedStyle = useSpring({
    width: sliderStyle.width,
    left: sliderStyle.left,
    config: { tension: 1000, friction: 50 }, // You can adjust these for smoother or snappier animations
  });

  useEffect(() => {
    const activeIndex = list.findIndex((item) => item.value === state);
    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const activeItem = itemRefs.current[activeIndex];
      if (activeItem) {
        const { offsetWidth, offsetLeft } = activeItem;
        setSliderStyle({
          width: `${offsetWidth}px`,
          left: `${offsetLeft}px`,
        });
      }
    }
  }, [state, list]);

  return (
    <div
      className={cn(
        buttonVariants({ size, variant: 'none' }),
        'bg-secondary text-secondary-foreground relative flex rounded-md p-[3px]'
      )}
    >
      <animated.div
        className={cn(
          buttonVariants({ size: 'xs', variant: 'none' }),
          'text-secondary bg-background absolute top-[50%] left-[3px] z-0 translate-y-[-50%] rounded-md',
          wrapperClassName
        )}
        style={animatedStyle}
      />
      {list.map((item, index) => {
        return (
          <div
            ref={(el: any) => (itemRefs.current[index] = el)}
            className={cn(
              `z-0 flex cursor-pointer items-center justify-center rounded-full px-2 text-xs whitespace-nowrap select-none`,
              state === item.value ? '' : 'opacity-70',
              className
            )}
            key={`group-${item.value}`}
            onClick={() => setState(item.value)}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
