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
  // In-memory only — NEVER persisted. Sessions live in httpOnly cookies;
  // this is only a fallback for flows that return tokens in-band (MFA).
  accessToken: string | null;
  currentProject: Project | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, tenant: Tenant, tokens?: { accessToken: string; refreshToken?: string }) => void;
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
      currentProject: null,
      isAuthenticated: false,

      setAuth: (user, tenant, tokens) => set({
        user,
        tenant,
        accessToken: tokens?.accessToken || null,
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
        currentProject: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'cms-auth-storage',
      // Tokens are intentionally excluded — sessions live in httpOnly
      // cookies so XSS cannot steal them from storage.
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        currentProject: state.currentProject,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
