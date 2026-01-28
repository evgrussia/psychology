import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { tracker } from '@/services/tracking/tracker';

export function useTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Автоматический page_view при изменении роута
    tracker.track('page_view', {
      page_path: pathname,
    });
  }, [pathname]);

  return {
    track: (eventName: string, properties?: Record<string, unknown>) => {
      tracker.track(eventName, properties);
    },
  };
}
