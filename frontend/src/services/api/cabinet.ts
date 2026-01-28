import { apiClient } from './client';
import { 
  CabinetAppointment, 
  CabinetAppointmentDetail, 
  CabinetStats, 
  CabinetMaterial, 
  ExportRequest, 
  ExportResponse,
  DiaryEntry
} from '@/types/api';

export const cabinetService = {
  getStats: async (): Promise<CabinetStats> => {
    const response = await apiClient.get<{ data: CabinetStats }>('/cabinet/stats');
    return response.data.data;
  },

  getAppointments: async (): Promise<CabinetAppointmentDetail[]> => {
    const response = await apiClient.get<{ data: CabinetAppointment[] }>(
      '/cabinet/appointments'
    );
    // Преобразуем формат для совместимости
    return response.data.data.map((apt) => ({
      id: apt.id,
      service_name: apt.service.title,
      datetime: apt.slot.start_at,
      is_online: false, // TODO: получить из API
      status: apt.status,
    }));
  },

  cancelAppointment: async (appointmentId: string): Promise<void> => {
    await apiClient.delete(`/cabinet/appointments/${appointmentId}`);
  },

  getDiaries: async (): Promise<DiaryEntry[]> => {
    const response = await apiClient.get<{ data: DiaryEntry[] }>('/cabinet/diaries');
    return response.data.data;
  },

  getMaterials: async (): Promise<CabinetMaterial[]> => {
    const response = await apiClient.get<{ data: CabinetMaterial[] }>('/cabinet/materials');
    return response.data.data;
  },

  exportData: async (data: ExportRequest): Promise<ExportResponse> => {
    const response = await apiClient.post<ExportResponse>('/cabinet/data/export', data);
    return response.data;
  },

  deleteData: async (): Promise<void> => {
    await apiClient.delete('/cabinet/data');
  },
};
