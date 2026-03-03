import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  initNetwork: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: navigator.onLine,

  setOnline: (online) => set({ isOnline: online }),

  initNetwork: () => {
    set({ isOnline: navigator.onLine });

    const handleOnline = () => set({ isOnline: true });
    const handleOffline = () => set({ isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  },
}));
