import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tracker } from '@/services/tracking/tracker';

// Mock fetch
global.fetch = vi.fn();

describe('Tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    // Reset environment
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_TRACKING_ENABLED = 'true';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('track', () => {
    it('tracks event with properties', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      tracker.track('test_event', { property1: 'value1', property2: 123 });
      
      expect(consoleSpy).toHaveBeenCalled();
      const callArgs = consoleSpy.mock.calls[0][1] as any;
      expect(callArgs.event_name).toBe('test_event');
      expect(callArgs.properties.property1).toBe('value1');
      expect(callArgs.properties.property2).toBe(123);
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('filters out forbidden PII fields', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      tracker.track('test_event', {
        allowed_field: 'value',
        email: 'test@example.com',
        phone: '1234567890',
        text: 'some text',
        content: 'some content',
      });
      
      const callArgs = consoleSpy.mock.calls.find((call) =>
        call[0]?.toString().includes('Skipping forbidden field')
      );
      expect(callArgs).toBeDefined();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('generates unique event IDs', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      tracker.track('event1');
      tracker.track('event2');
      
      const calls = consoleSpy.mock.calls;
      const event1Id = (calls[0][1] as any).event_id;
      const event2Id = (calls[1][1] as any).event_id;
      
      expect(event1Id).not.toBe(event2Id);
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('includes session and anonymous IDs', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      tracker.track('test_event');
      
      const callArgs = consoleSpy.mock.calls[0][1] as any;
      expect(callArgs.session_id).toBeDefined();
      expect(callArgs.anonymous_id).toBeDefined();
      expect(callArgs.anonymous_id).toMatch(/^anon_/);
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('sends event to backend when tracking is enabled', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
      });
      
      process.env.NEXT_PUBLIC_TRACKING_ENABLED = 'true';
      
      tracker.track('test_event', { test: 'value' });
      
      // Wait for async sendEvent
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('/tracking/events');
      expect(fetchCall[1].method).toBe('POST');
    });

    it('does not send to backend when tracking is disabled', async () => {
      process.env.NEXT_PUBLIC_TRACKING_ENABLED = 'false';
      
      tracker.track('test_event');
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('handles fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      process.env.NEXT_PUBLIC_TRACKING_ENABLED = 'true';
      
      tracker.track('test_event');
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should not throw, just log error
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('privacy validation', () => {
    it('filters email field', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      tracker.track('event', { user_email: 'test@example.com' });
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('filters phone field', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      tracker.track('event', { user_phone: '1234567890' });
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('allows non-forbidden fields', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      tracker.track('event', {
        user_id: '123',
        service_id: '456',
        action: 'click',
      });
      
      const callArgs = consoleSpy.mock.calls[0][1] as any;
      expect(callArgs.properties.user_id).toBe('123');
      expect(callArgs.properties.service_id).toBe('456');
      expect(callArgs.properties.action).toBe('click');
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });
  });
});
