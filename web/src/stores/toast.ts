import { create } from 'zustand';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  show: (message: string, type?: 'success' | 'error') => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'success',
  visible: false,

  show: (message, type = 'success') => {
    set({ message, type, visible: true });
    setTimeout(() => {
      set({ visible: false });
    }, 2200);
  },

  hide: () => {
    set({ visible: false });
  },
}));
