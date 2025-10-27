import { create } from 'zustand';

export type ModalType = 'login' | 'signup' | 'confirm' | 'alert' | 'result';

export interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
  data?: any;
  resultData?: any;
}

interface ModalStore extends ModalState {
  openModal: (type: ModalType, data?: any) => void;
  reOpenModal: (type: ModalType) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: undefined,
  resultData: undefined,

  openModal: (type: ModalType, data?: any) => {
    if (type === 'result') {
      set({ resultData: data, isOpen: true, type });
      return;
    }
    set({ type, isOpen: true, data });
  },
  reOpenModal: (type: ModalType) => {
    set({ type, isOpen: true });
  },

  closeModal: () => {
    set({ type: null, isOpen: false, data: undefined });
  },
}));
