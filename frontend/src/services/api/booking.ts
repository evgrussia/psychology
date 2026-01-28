import { apiClient } from './client';

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  currency: string;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
}

export interface BookingRequest {
  service_id: string;
  slot_id: string;
  intake_form?: Record<string, string>;
  consents?: {
    personal_data: boolean;
    communications?: boolean;
  };
}

export interface Booking {
  id: string;
  service_id: string;
  slot_id: string;
  status: 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  service?: {
    id: string;
    title: string;
  };
  slot?: {
    id: string;
    start_at: string;
    end_at?: string;
  };
  payment?: {
    id: string;
    amount: number;
    deposit_amount?: number;
    payment_url?: string;
    status?: string;
  };
}

export interface Slot {
  id: string;
  start_at: string;
  end_at: string;
  status: 'available' | 'booked' | 'unavailable';
}

export const bookingService = {
  getServices: async (): Promise<Service[]> => {
    const response = await apiClient.get<{ data: Service[] }>('/booking/services');
    return response.data.data;
  },

  getAvailableSlots: async (
    serviceId: string,
    params?: {
      date_from?: string;
      date_to?: string;
      timezone?: string;
    }
  ): Promise<Slot[]> => {
    const response = await apiClient.get<{ data: Slot[] }>(
      `/booking/services/${serviceId}/slots`,
      {
        params,
      }
    );
    return response.data.data;
  },

  createBooking: async (request: BookingRequest): Promise<Booking> => {
    const response = await apiClient.post<{ data: Booking }>('/booking/appointments', request);
    return response.data.data;
  },

  getBooking: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<{ data: Booking }>(`/booking/appointments/${bookingId}`);
    return response.data.data;
  },
};
