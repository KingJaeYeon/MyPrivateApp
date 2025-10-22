import { useEffect, useRef } from 'react';

const useSyncScroll = (trigger: any) => {
  const ref1 = useRef<any>(null);
  const ref2 = useRef<any>(null);

  useEffect(() => {
    const scrollRef1 = ref1.current;
    const scrollRef2 = ref2.current;
    const handleScroll1 = () => {
      if (ref2.current) {
        ref2.current.scrollLeft = ref1.current.scrollLeft;
      }
    };

    const handleScroll2 = () => {
      if (ref1.current) {
        ref1.current.scrollLeft = ref2.current.scrollLeft;
      }
    };

    if (ref1.current) {
      scrollRef1.addEventListener('scroll', handleScroll1);
    }

    if (ref2.current) {
      scrollRef2.addEventListener('scroll', handleScroll2);
    }

    // Cleanup event listeners on component unmount
    return () => {
      if (scrollRef1) {
        scrollRef1.removeEventListener('scroll', handleScroll1);
      }

      if (scrollRef2) {
        scrollRef2.removeEventListener('scroll', handleScroll2);
      }
    };
  }, [ref1, ref2, trigger]);

  return [ref1, ref2];
};

export default useSyncScroll;
