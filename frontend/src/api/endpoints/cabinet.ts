/**
 * Cabinet endpoints: встречи, дневники.
 * Бэкенд: GET cabinet/appointments/, GET cabinet/diaries/, POST interactive/diaries/
 */

import { request } from '../client';
import type {
  CabinetAppointmentsResponse,
  CabinetDiaryResponse,
  CreateDiaryEntryRequest,
  CreateDiaryEntryResponse,
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

export async function createDiaryEntry(
  payload: CreateDiaryEntryRequest
): Promise<CreateDiaryEntryResponse> {
  return request<CreateDiaryEntryResponse>('POST', `${INTERACTIVE}/diaries/`, payload);
}
