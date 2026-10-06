import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscription: {
    plan: string;
    status: string;
    isActive?: boolean;
    startDate?: string;
  };
  usage: {
    storageUsed: number;
    apiCalls: number;
    contentItems: number;
  };
}


interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  description?: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  currentProject: Project | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, tenant: Tenant, tokens: { accessToken: string; refreshToken: string }) => void;
  updateUser: (user: Partial<User>) => void;
  setCurrentProject: (project: Project | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      currentProject: null,
      isAuthenticated: false,
      
      setAuth: (user, tenant, tokens) => set({
        user,
        tenant,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      }),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      logout: () => set({
        user: null,
        tenant: null,
        accessToken: null,
        refreshToken: null,
        currentProject: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'cms-auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        currentProject: state.currentProject,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
