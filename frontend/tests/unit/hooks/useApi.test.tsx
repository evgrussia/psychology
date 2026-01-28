import { renderHook, waitFor } from '@testing-library/react';
import { useApiQuery, useApiMutation } from '@/hooks/useApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useApi hooks', () => {
  describe('useApiQuery', () => {
    it('fetches data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      const queryFn = vi.fn().mockResolvedValue(mockData);
      
      const { result } = renderHook(
        () => useApiQuery(['test'], queryFn),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(queryFn).toHaveBeenCalled();
    });

    it('handles errors', async () => {
      const error = new Error('Failed to fetch');
      const queryFn = vi.fn().mockRejectedValue(error);
      
      const { result } = renderHook(
        () => useApiQuery(['error'], queryFn),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useApiMutation', () => {
    it('executes mutation successfully', async () => {
      const mockData = { id: 1, success: true };
      const mutationFn = vi.fn().mockResolvedValue(mockData);
      const onSuccess = vi.fn();

      const { result } = renderHook(
        () => useApiMutation(mutationFn, { onSuccess }),
        { wrapper: createWrapper() }
      );

      result.current.mutate({ payload: 'test' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(mutationFn).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      
      const mutationCalls = (mutationFn as any).mock.calls[0];
      expect(mutationCalls[0]).toEqual({ payload: 'test' });
      
      const successCalls = (onSuccess as any).mock.calls[0];
      expect(successCalls[0]).toEqual(mockData);
      expect(successCalls[1]).toEqual({ payload: 'test' });
    });

    it('handles mutation errors', async () => {
      const error = new Error('Mutation failed');
      const mutationFn = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () => useApiMutation(mutationFn),
        { wrapper: createWrapper() }
      );

      result.current.mutate({ payload: 'test' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
