import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api/auth';
import * as nextNavigation from 'next/navigation';
import { toast } from 'sonner';
import React from 'react';

// Mock dependencies
vi.mock('@/services/api/auth');
vi.mock('@/store/authStore');
vi.mock('next/navigation');
vi.mock('sonner');

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

describe('useAuth', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    (nextNavigation.useRouter as any).mockReturnValue(mockRouter);
    (useAuthStore as any).mockReturnValue({
      user: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
      isAuthenticated: vi.fn(() => false),
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('handles successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com', display_name: 'Test User' };
    const mockResponse = {
      user: mockUser,
    };

    (authService.login as any).mockResolvedValue(mockResponse);
    const setAuth = vi.fn();
    (useAuthStore as any).mockReturnValue({
      user: null,
      setAuth: setAuth,
      clearAuth: vi.fn(),
      isAuthenticated: vi.fn(() => false),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    result.current.login({ email: 'test@example.com', password: 'password' });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    await waitFor(() => {
      expect(setAuth).toHaveBeenCalledWith(mockUser);
      expect(mockRouter.push).toHaveBeenCalledWith('/cabinet');
      expect(toast.success).toHaveBeenCalledWith('Вход выполнен успешно');
    });
  });

  it('handles successful registration', async () => {
    const mockUser = { id: '1', email: 'test@example.com', display_name: 'Test User' };
    const mockResponse = {
      user: mockUser,
    };

    (authService.register as any).mockResolvedValue(mockResponse);
    const setAuth = vi.fn();
    (useAuthStore as any).mockReturnValue({
      user: null,
      setAuth: setAuth,
      clearAuth: vi.fn(),
      isAuthenticated: vi.fn(() => false),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    result.current.register({
      email: 'test@example.com',
      password: 'password',
      display_name: 'Test User',
    });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
      expect(setAuth).toHaveBeenCalledWith(mockUser);
      expect(mockRouter.push).toHaveBeenCalledWith('/cabinet');
      expect(toast.success).toHaveBeenCalledWith('Регистрация выполнена успешно');
    });
  });

  it('handles logout successfully', async () => {
    (authService.logout as any).mockResolvedValue({});
    const mockClearAuth = vi.fn();
    (useAuthStore as any).mockReturnValue({
      user: { id: '1' },
      setAuth: vi.fn(),
      clearAuth: mockClearAuth,
      isAuthenticated: vi.fn(() => true),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    result.current.logout();

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(mockClearAuth).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(toast.success).toHaveBeenCalledWith('Выход выполнен');
    });
  });
});
