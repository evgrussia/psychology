import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingService } from '@/services/api/booking';
import { apiClient } from '@/services/api/client';

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getServices', () => {
    it('fetches available services', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              slug: 'consultation',
              name: 'Консультация',
              description: 'Описание',
              price: 5000,
              duration_minutes: 60,
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await bookingService.getServices();

      expect(apiClient.get).toHaveBeenCalledWith('/booking/services');
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getAvailableSlots', () => {
    it('fetches available slots for a service', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              start_at: '2026-01-27T10:00:00Z',
              end_at: '2026-01-27T11:00:00Z',
              status: 'available',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await bookingService.getAvailableSlots('service-id', {
        date_from: '2026-01-27',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/booking/services/service-id/slots', {
        params: { date_from: '2026-01-27' },
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('createBooking', () => {
    it('creates a booking', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'booking-1',
            service_id: 'service-1',
            slot_id: 'slot-1',
            status: 'pending',
          },
        },
      };

      const bookingData = {
        service_id: 'service-1',
        slot_id: 'slot-1',
        intake_form: {
          question_1: 'Answer 1',
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await bookingService.createBooking(bookingData);

      expect(apiClient.post).toHaveBeenCalledWith('/booking/appointments', bookingData);
      expect(result).toEqual(mockResponse.data.data);
    });
  });
});
