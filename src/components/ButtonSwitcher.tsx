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
        'relative rounded-md p-[3px] flex bg-secondary text-secondary-foreground'
      )}
    >
      <animated.div
        className={cn(
          buttonVariants({ size: 'xs', variant: 'none' }),
          'z-0 absolute left-[3px] top-[50%] translate-y-[-50%] rounded-md text-secondary bg-background',
          wrapperClassName
        )}
        style={animatedStyle}
      />
      {list.map((item, index) => {
        return (
          <div
            ref={(el: any) => (itemRefs.current[index] = el)}
            className={cn(
              `flex text-xs z-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-full px-2`,
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
