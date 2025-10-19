import { create } from 'zustand';

export type ModalType = 'login' | 'signup' | 'confirm' | 'alert' | 'result';

export interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
  data?: any;
}

interface ModalStore extends ModalState {
  openModal: (type: ModalType, data?: Record<string, any>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: undefined,

  openModal: (type: ModalType, data?: Record<string, any>) => {
    set({ type, isOpen: true, data });
  },

  closeModal: () => {
    set({ type: null, isOpen: false, data: undefined });
  },
}));
