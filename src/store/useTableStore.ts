import { create } from 'zustand';

interface TableStoreType {
  triggerHeight: any;
  headerWidth: {
    key: string;
    width: number;
  }[];
  setHeaderWidth: (key: string, width: number) => void;
  resetHeaderWidth: () => void;
  getHeaderWidth: (key: string) => number;
  setTriggerHeight: (height: number, key?: string) => void;
  getTriggerHeight: (key: string) => number;
}

const useTableStore = create<TableStoreType>((set, get) => ({
  headerWidth: [],
  triggerHeight: {},
  setHeaderWidth: (key, width) => {
    const { headerWidth } = get();
    const index = headerWidth.findIndex((item) => item.key === key);
    if (index === -1) {
      headerWidth.push({ key, width });
    } else {
      headerWidth[index].width = width;
    }
    set({ headerWidth });
  },
  resetHeaderWidth: () => set({ headerWidth: [] }),
  getHeaderWidth: (key) => {
    const { headerWidth } = get();
    const index = headerWidth.findIndex((item) => item.key === key);
    if (index === -1) {
      return 0;
    }
    return headerWidth[index].width;
  },
  setTriggerHeight: (height, key = 'default') => {
    const { triggerHeight } = get();
    triggerHeight[key] = height;
    set({ triggerHeight });
  },
  getTriggerHeight: (key = 'default') => {
    const { triggerHeight } = get();
    return triggerHeight[key];
  },
}));

export default useTableStore;
