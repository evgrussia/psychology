import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Clear store before each test
    useAuthStore.getState().clearAuth();
    localStorage.clear();
  });

  afterEach(() => {
    useAuthStore.getState().clearAuth();
    localStorage.clear();
  });

  it('initializes with null user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it('sets auth correctly', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      display_name: 'Test User',
    };

    useAuthStore.getState().setAuth(user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated()).toBe(true);
  });

  it('clears auth correctly', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      display_name: 'Test User',
    };

    useAuthStore.getState().setAuth(user);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns correct value', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);

    const user = {
      id: '1',
      email: 'test@example.com',
      display_name: 'Test User',
    };
    useAuthStore.getState().setAuth(user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);

    useAuthStore.getState().clearAuth();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });
});
