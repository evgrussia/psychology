/**
 * Типы для Cabinet API: встречи, дневники.
 * По контракту backend: cabinet/appointments, cabinet/diaries, interactive/diaries (create).
 */

export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'canceled'
  | 'rescheduled'
  | 'completed'
  | 'no_show';

export interface CabinetSlot {
  id?: string;
  start_at: string;
  end_at: string;
  local_start_at?: string;
  local_end_at?: string;
  status?: string;
}

export interface CabinetAppointment {
  id: string;
  service_id?: string;
  slot: CabinetSlot;
  status: AppointmentStatus;
  format?: 'online' | 'offline';
  payment?: { id?: string; status?: string; amount?: string; payment_url?: string } | null;
  service?: { id: string; title: string; duration_minutes?: number };
}

export interface CabinetAppointmentsResponse {
  data: CabinetAppointment[];
}

export interface DiaryEntry {
  id: string;
  type: string;
  content?: string;
  created_at: string | null;
}

export interface CabinetDiaryResponse {
  data: DiaryEntry[];
}

export interface CreateDiaryEntryRequest {
  type: string;
  content?: string;
}

export interface CreateDiaryEntryResponse {
  data: DiaryEntry;
}

// --- Favorites (аптечка) ---

export type FavoriteResourceType = 'article' | 'resource' | 'ritual';

export interface FavoriteItem {
  id: string;
  resource_type: FavoriteResourceType;
  resource_id: string;
  created_at: string;
}

export interface FavoritesListResponse {
  data: FavoriteItem[];
}

export interface AddFavoriteRequest {
  resource_type: FavoriteResourceType;
  resource_id: string;
}

export interface AddFavoriteResponse {
  data: FavoriteItem;
}
