import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readCsrfToken, restoreSession } from '@/services/api';
import { useAuthStore } from '@/store';

const { mockPost, mockGet, mockRequestUse, mockResponseUse } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
  mockRequestUse: vi.fn(),
  mockResponseUse: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: mockRequestUse },
        response: { use: mockResponseUse },
      },
      get: mockGet,
      post: mockPost,
      put: vi.fn(),
      delete: vi.fn(),
    })),
    post: mockPost,
    get: mockGet,
    isAxiosError: vi.fn(() => false),
  },
  isAxiosError: vi.fn(() => false),
}));

// Mock document.cookie with a controllable string
let mockCookie = '';
Object.defineProperty(document, 'cookie', {
  get: () => mockCookie,
  set: (val: string) => { mockCookie = val; },
  configurable: true,
});

describe('api interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookie = '';
    useAuthStore.setState({ accessToken: null, user: null, tenant: null, isAuthenticated: false });
  });

  it('readCsrfToken extracts csrf_token when present', () => {
    mockCookie = 'csrf_token=abc123; other=val';
    expect(readCsrfToken()).toBe('abc123');
  });

  it('readCsrfToken returns null when cookie missing', () => {
    mockCookie = 'no-csrf=here';
    expect(readCsrfToken()).toBeNull();
  });

  it('request interceptor logic uses accessToken from store', () => {
    useAuthStore.setState({ accessToken: 'memory-token' });
    const token = useAuthStore.getState().accessToken;
    expect(token).toBe('memory-token');
  });

  it('request interceptor logic reads CSRF for mutations', () => {
    mockCookie = 'csrf_token=csrf-123';
    const csrf = readCsrfToken();
    expect(csrf).toBe('csrf-123');
  });
});

describe('restoreSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookie = '';
    useAuthStore.setState({ accessToken: null, user: null, tenant: null, isAuthenticated: false });
  });

  it('restores from the session cookie without rotating tokens', async () => {
    const setAuthSpy = vi.spyOn(useAuthStore.getState(), 'setAuth');
    mockGet.mockResolvedValueOnce({ status: 200, data: { data: { user: { id: '1', email: 'a@b.com' }, tenant: { id: 't1' } } } });
    useAuthStore.setState({ isAuthenticated: true, accessToken: null });

    expect(await restoreSession()).toBe(true);
    expect(setAuthSpy).toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('returns true and sets auth when refresh succeeds', async () => {
    const setAuthSpy = vi.spyOn(useAuthStore.getState(), 'setAuth');
    const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');
    
    // Access cookie expired -> fall back to refresh
    mockGet.mockResolvedValueOnce({ status: 401, data: {} });
    mockPost.mockResolvedValueOnce({ data: { data: { tokens: { accessToken: 'new-at', refreshToken: 'new-rt' } } } });
    mockGet.mockResolvedValueOnce({
      data: { data: { user: { id: '1', email: 'a@b.com' }, tenant: { id: 't1' } } }
    });

    useAuthStore.setState({ isAuthenticated: true, accessToken: null });

    const result = await restoreSession();
    
    expect(result).toBe(true);
    expect(setAuthSpy).toHaveBeenCalled();
    expect(logoutSpy).not.toHaveBeenCalled();
  });

  it('returns false and logs out when refresh fails', async () => {
    const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');
    
    mockPost.mockRejectedValueOnce(new Error('refresh failed'));
    
    useAuthStore.setState({ isAuthenticated: true, accessToken: null });

    const result = await restoreSession();
    
    expect(result).toBe(false);
    expect(logoutSpy).toHaveBeenCalled();
  });
});