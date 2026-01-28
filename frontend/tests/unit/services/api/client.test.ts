import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/services/api/client';
import { isApiError } from '@/types/api';

// Mock localStorage before importing apiClient
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('apiClient', () => {
  describe('Request interceptor', () => {
    it('passes config through (token is in cookies)', () => {
      const config = {
        headers: {},
      };
      
      const interceptor = (apiClient.interceptors.request as any).handlers[0];
      if (interceptor) {
        const result = interceptor.fulfilled(config);
        expect(result).toBe(config);
      }
    });
  });

  describe('Response interceptor', () => {
    it('handles 401 error and redirects to login', async () => {
      const error = {
        config: { _retry: false },
        response: {
          status: 401,
        },
      };

      // Mock window.location
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = { href: '' };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];
      if (interceptor) {
        try {
          await interceptor.rejected(error);
        } catch (e) {
          // Expected to reject
        }
        expect(window.location.href).toBe('/login');
      }

      window.location = originalLocation;
    });

    it('passes through successful responses', () => {
      const response = { data: { success: true } };
      
      const interceptor = (apiClient.interceptors.response as any).handlers[0];
      if (interceptor) {
        const result = interceptor.fulfilled(response);
        expect(result).toBe(response);
      }
    });
  });
});

describe('isApiError', () => {
  it('returns true for valid ApiError objects', () => {
    const error: any = {
      error: {
        code: 'ERROR_CODE',
        message: 'Error message',
      },
    };
    expect(isApiError(error)).toBe(true);
  });

  it('returns false for Error objects', () => {
    const error = new Error('Standard error');
    expect(isApiError(error)).toBe(false);
  });

  it('returns false for plain objects without error property', () => {
    const obj = { message: 'Not an API error' };
    expect(isApiError(obj)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });

  it('returns false for strings', () => {
    expect(isApiError('error string')).toBe(false);
  });
});
