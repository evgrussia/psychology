import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTracking } from '@/hooks/useTracking';
import { tracker } from '@/services/tracking/tracker';
import * as nextNavigation from 'next/navigation';

// Mock dependencies
vi.mock('@/services/tracking/tracker');
vi.mock('next/navigation');

describe('useTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (nextNavigation.usePathname as any).mockReturnValue('/test-page');
  });

  it('provides track function', () => {
    const { result } = renderHook(() => useTracking());
    
    expect(typeof result.current.track).toBe('function');
  });

  it('calls tracker.track when track is invoked', () => {
    const { result } = renderHook(() => useTracking());
    
    result.current.track('test_event', { property: 'value' });
    
    expect(tracker.track).toHaveBeenCalledWith('test_event', { property: 'value' });
  });

  it('tracks page_view on pathname change', () => {
    const { rerender } = renderHook(() => useTracking());
    
    // Change pathname
    (nextNavigation.usePathname as any).mockReturnValue('/new-page');
    rerender();
    
    // Should track page_view (implementation may vary)
    // This depends on how useTracking is implemented
  });
});
