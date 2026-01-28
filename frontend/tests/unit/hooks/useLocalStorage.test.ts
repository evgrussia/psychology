import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  const key = 'test-key';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('returns stored value from localStorage', () => {
    localStorage.setItem(key, JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage(key, 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem(key)).toBe(JSON.stringify('new-value'));
  });

  it('handles complex objects', () => {
    const initialValue = { name: 'Test', count: 42 };
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    expect(result.current[0]).toEqual(initialValue);

    const newValue = { name: 'Updated', count: 100 };
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(JSON.parse(localStorage.getItem(key) || '{}')).toEqual(newValue);
  });

  it('handles array values', () => {
    const initialValue = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    expect(result.current[0]).toEqual(initialValue);

    const newValue = [4, 5, 6];
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
  });
});
