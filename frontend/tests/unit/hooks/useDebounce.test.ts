import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still initial

    vi.advanceTimersByTime(500);
    // Wait for React to update
    await vi.runAllTimersAsync();
    
    expect(result.current).toBe('updated');
  });

  it('uses custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });

    vi.advanceTimersByTime(500);
    expect(result.current).toBe('initial'); // Still initial after 500ms

    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();
    
    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    rerender({ value: 'change1', delay: 500 });
    vi.advanceTimersByTime(200);

    rerender({ value: 'change2', delay: 500 });
    vi.advanceTimersByTime(200);

    rerender({ value: 'change3', delay: 500 });
    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();

    expect(result.current).toBe('change3');
  });
});
