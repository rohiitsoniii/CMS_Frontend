import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      tenant: null,
      accessToken: null,
      currentProject: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  it('sets auth and marks authenticated', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth(
      { id: '1', _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'owner' },
      { id: 't1', name: 'T', slug: 't', subscription: { plan: 'free', status: 'active' }, usage: { storageUsed: 0, apiCalls: 0, contentItems: 0 } },
      { accessToken: 'at', refreshToken: 'rt' }
    );
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('at');
    expect(state.user?.email).toBe('a@b.com');
  });

  it('updates user partially', () => {
    const { setAuth, updateUser } = useAuthStore.getState();
    setAuth(
      { id: '1', _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'owner' },
      { id: 't1', name: 'T', slug: 't', subscription: { plan: 'free', status: 'active' }, usage: { storageUsed: 0, apiCalls: 0, contentItems: 0 } }
    );
    updateUser({ firstName: 'Alice' });
    expect(useAuthStore.getState().user?.firstName).toBe('Alice');
  });

  it('sets current project', () => {
    const { setAuth, setCurrentProject } = useAuthStore.getState();
    setAuth(
      { id: '1', _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'owner' },
      { id: 't1', name: 'T', slug: 't', subscription: { plan: 'free', status: 'active' }, usage: { storageUsed: 0, apiCalls: 0, contentItems: 0 } }
    );
    setCurrentProject({ id: 'p1', name: 'P', slug: 'p', status: 'active' });
    expect(useAuthStore.getState().currentProject?.name).toBe('P');
  });

  it('logs out and clears everything', () => {
    const { setAuth, logout } = useAuthStore.getState();
    setAuth(
      { id: '1', _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'owner' },
      { id: 't1', name: 'T', slug: 't', subscription: { plan: 'free', status: 'active' }, usage: { storageUsed: 0, apiCalls: 0, contentItems: 0 } },
      { accessToken: 'at' }
    );
    logout();
    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.accessToken).toBeNull();
    expect(s.user).toBeNull();
  });

  it('persists user, tenant, project, isAuthenticated — but NOT accessToken', () => {
    const { setAuth } = useAuthStore.getState();
    setAuth(
      { id: '1', _id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'owner' },
      { id: 't1', name: 'T', slug: 't', subscription: { plan: 'free', status: 'active' }, usage: { storageUsed: 0, apiCalls: 0, contentItems: 0 } },
      { accessToken: 'secret-token' }
    );
    // Read raw localStorage
    const raw = JSON.parse(localStorage.getItem('cms-auth-storage') || '{}');
    expect(raw.state.user).toBeTruthy();
    expect(raw.state.tenant).toBeTruthy();
    expect(raw.state.currentProject).toBeNull(); // not set
    expect(raw.state.isAuthenticated).toBe(true);
    // accessToken must NOT be in persisted state
    expect(raw.state.accessToken).toBeUndefined();
  });
});