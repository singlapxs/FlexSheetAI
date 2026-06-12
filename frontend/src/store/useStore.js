import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  activeWorkspace: null,
  activeRegister: null,
  
  setUser: (user) => set({ user }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setActiveRegister: (register) => set({ activeRegister: register }),
}));
