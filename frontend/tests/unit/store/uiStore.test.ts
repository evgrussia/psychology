import { describe, it, expect } from 'vitest';
import { useUIStore } from '@/store/uiStore';

describe('uiStore', () => {
  it('initializes with default state', () => {
    const state = useUIStore.getState();
    expect(state.theme).toBe('system');
    expect(state.isModalOpen).toBe(false);
  });

  it('sets theme correctly', () => {
    useUIStore.getState().setTheme('dark');
    expect(useUIStore.getState().theme).toBe('dark');

    useUIStore.getState().setTheme('light');
    expect(useUIStore.getState().theme).toBe('light');

    useUIStore.getState().setTheme('system');
    expect(useUIStore.getState().theme).toBe('system');
  });

  it('opens and closes modal', () => {
    expect(useUIStore.getState().isModalOpen).toBe(false);

    useUIStore.getState().openModal();
    expect(useUIStore.getState().isModalOpen).toBe(true);

    useUIStore.getState().closeModal();
    expect(useUIStore.getState().isModalOpen).toBe(false);
  });
});
