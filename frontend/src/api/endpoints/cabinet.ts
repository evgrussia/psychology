/**
 * Cabinet endpoints: встречи, дневники, избранное (аптечка).
 * Бэкенд: GET cabinet/appointments/, GET cabinet/diaries/, cabinet/favorites/
 */

import { request } from '../client';
import type {
  CabinetAppointmentsResponse,
  CabinetDiaryResponse,
  CreateDiaryEntryRequest,
  CreateDiaryEntryResponse,
  FavoritesListResponse,
  AddFavoriteRequest,
  AddFavoriteResponse,
} from '../types/cabinet';

const CABINET = 'cabinet';
const INTERACTIVE = 'interactive';

export interface GetAppointmentsParams {
  status?: 'all' | 'upcoming' | 'past';
  limit?: number;
}

export async function getAppointments(
  params?: GetAppointmentsParams
): Promise<CabinetAppointmentsResponse> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.limit != null) search.set('limit', String(params.limit));
  const query = search.toString();
  const path = query ? `${CABINET}/appointments/?${query}` : `${CABINET}/appointments/`;
  return request<CabinetAppointmentsResponse>('GET', path);
}

export async function getDiaryEntries(): Promise<CabinetDiaryResponse> {
  return request<CabinetDiaryResponse>('GET', `${CABINET}/diaries/`);
}

export async function getDiaryEntry(entryId: string): Promise<{ data: DiaryEntry }> {
  return request<{ data: DiaryEntry }>('GET', `${CABINET}/diaries/${entryId}/`);
}

export async function createDiaryEntry(
  payload: CreateDiaryEntryRequest
): Promise<CreateDiaryEntryResponse> {
  return request<CreateDiaryEntryResponse>('POST', `${INTERACTIVE}/diaries/`, payload);
}

export async function updateDiaryEntry(
  entryId: string,
  payload: { content: string }
): Promise<{ data: DiaryEntry }> {
  return request<{ data: DiaryEntry }>('PATCH', `${CABINET}/diaries/${entryId}/`, payload);
}

export async function deleteDiaryEntry(entryId: string): Promise<void> {
  return request<void>('DELETE', `${CABINET}/diaries/${entryId}/`);
}

// --- Favorites (аптечка) ---

export async function getFavorites(): Promise<FavoritesListResponse> {
  return request<FavoritesListResponse>('GET', `${CABINET}/favorites/`);
}

export async function addFavorite(payload: AddFavoriteRequest): Promise<AddFavoriteResponse> {
  return request<AddFavoriteResponse>('POST', `${CABINET}/favorites/`, payload);
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  return request<void>('DELETE', `${CABINET}/favorites/${favoriteId}/`);
}

// --- Export diaries to PDF ---

export interface ExportDiariesRequest {
  date_from: string; // ISO date
  date_to: string;
  format?: 'pdf';
}

export interface ExportDiariesResponse {
  data: {
    export_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    file_url?: string | null;
  };
}

export async function exportDiaries(payload: ExportDiariesRequest): Promise<ExportDiariesResponse> {
  return request<ExportDiariesResponse>('POST', `${CABINET}/exports/diaries/export/`, payload);
}
