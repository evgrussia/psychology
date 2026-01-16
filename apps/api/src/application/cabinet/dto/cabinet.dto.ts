import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';
import { AppointmentMaterialType } from '@domain/booking/value-objects/MaterialEnums';
import { DiaryType } from '@domain/cabinet/value-objects/DiaryEnums';

export interface CabinetProfileDto {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: string[];
}

export interface CabinetAppointmentServiceDto {
  id: string;
  slug: string | null;
  title: string | null;
  duration_minutes: number | null;
}

export interface CabinetAppointmentDto {
  id: string;
  start_at_utc: string;
  end_at_utc: string;
  timezone: string;
  format: ServiceFormat;
  status: AppointmentStatus;
  service: CabinetAppointmentServiceDto | null;
}

export interface CabinetAppointmentsResponseDto {
  upcoming: CabinetAppointmentDto[];
  past: CabinetAppointmentDto[];
}

export interface CabinetMaterialDto {
  id: string;
  appointment_id: string;
  material_type: AppointmentMaterialType;
  title: string;
  description: string | null;
  url: string | null;
  created_at: string;
}

export interface CabinetMaterialsResponseDto {
  items: CabinetMaterialDto[];
}

export interface CreateDiaryEntryRequestDto {
  diary_type: DiaryType;
  entry_date?: string | null;
  payload: Record<string, unknown>;
}

export interface CreateDiaryEntryResponseDto {
  id: string;
  diary_type: DiaryType;
  entry_date: string;
  created_at: string;
  has_text: boolean;
}

export interface DiaryEntryDto {
  id: string;
  diary_type: DiaryType;
  entry_date: string;
  created_at: string;
  has_text: boolean;
  payload: Record<string, unknown>;
}

export interface ListDiaryEntriesResponseDto {
  items: DiaryEntryDto[];
}

export interface DeleteDiaryEntryResponseDto {
  id: string;
  diary_type: DiaryType;
  deleted_at: string;
}

export interface ExportDiaryPdfRequestDto {
  period: '7d' | '30d' | 'custom';
  from?: string | null;
  to?: string | null;
  entry_ids?: string[];
}

export interface CabinetConsentsDto {
  personal_data: boolean;
  communications: boolean;
  telegram: boolean;
}

export interface UpdateCabinetConsentsRequestDto {
  communications?: boolean;
  telegram?: boolean;
  source?: string;
}

export interface UpdateCabinetConsentsResponseDto {
  consents: CabinetConsentsDto;
}

export interface ExportAccountDataRequestDto {
  format?: 'json' | 'zip';
}

export interface DeleteAccountResponseDto {
  status: 'deleted';
}
