/**
 * Admin endpoints: встречи, лиды, контент, модерация, admin/me.
 * Бэкенд: GET admin/appointments/, admin/leads/, admin/content/, admin/moderation/, admin/me/;
 * POST record_outcome, moderate, answer, publish.
 */

import { request } from '../client';
import type {
  AdminMeResponse,
  AdminAppointmentsResponse,
  AdminLeadsResponse,
  AdminContentResponse,
  AdminModerationResponse,
  AppointmentOutcome,
  PublishChecklist,
} from '../types/admin';

const ADMIN = 'admin';

export async function getAdminMe(): Promise<AdminMeResponse> {
  return request<AdminMeResponse>('GET', `${ADMIN}/me/`);
}

// --- Appointments ---

export interface AdminAppointmentsParams {
  page?: number;
  per_page?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export async function getAdminAppointments(
  params?: AdminAppointmentsParams
): Promise<AdminAppointmentsResponse> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.per_page != null) search.set('per_page', String(params.per_page));
  if (params?.status) search.set('status', params.status);
  if (params?.date_from) search.set('date_from', params.date_from);
  if (params?.date_to) search.set('date_to', params.date_to);
  const query = search.toString();
  const path = query ? `${ADMIN}/appointments/?${query}` : `${ADMIN}/appointments/`;
  return request<AdminAppointmentsResponse>('GET', path);
}

export async function recordAppointmentOutcome(
  appointmentId: string,
  outcome: AppointmentOutcome
): Promise<{ appointment_id: string; outcome: string; status: string; recorded_by: string }> {
  return request('POST', `${ADMIN}/appointments/${appointmentId}/record_outcome/`, { outcome });
}

// --- Leads ---

export interface AdminLeadsParams {
  page?: number;
  per_page?: number;
  status?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
}

export async function getAdminLeads(params?: AdminLeadsParams): Promise<AdminLeadsResponse> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set('page', String(params.page));
  if (params?.per_page != null) search.set('per_page', String(params.per_page));
  if (params?.status) search.set('status', params.status);
  if (params?.source) search.set('source', params.source);
  if (params?.date_from) search.set('date_from', params.date_from);
  if (params?.date_to) search.set('date_to', params.date_to);
  const query = search.toString();
  const path = query ? `${ADMIN}/leads/?${query}` : `${ADMIN}/leads/`;
  return request<AdminLeadsResponse>('GET', path);
}

// --- Content ---

export async function getAdminContent(): Promise<AdminContentResponse> {
  return request<AdminContentResponse>('GET', `${ADMIN}/content/`);
}

export async function publishContentItem(
  contentId: string,
  checklist: PublishChecklist
): Promise<{ content_id: string; status: string; published_at?: string }> {
  return request('POST', `${ADMIN}/content/${contentId}/publish/`, { checklist });
}

// --- Moderation ---

export interface AdminModerationParams {
  status?: string;
}

export async function getAdminModeration(
  params?: AdminModerationParams
): Promise<AdminModerationResponse> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  const query = search.toString();
  const path = query ? `${ADMIN}/moderation/?${query}` : `${ADMIN}/moderation/`;
  return request<AdminModerationResponse>('GET', path);
}

export async function moderateUGCItem(
  itemId: string,
  status: 'approved' | 'rejected',
  comment?: string
): Promise<{ item_id: string; decision: string; status: string }> {
  return request('POST', `${ADMIN}/moderation/${itemId}/moderate/`, { status, comment });
}

export async function answerUGCQuestion(
  itemId: string,
  text: string
): Promise<{ item_id: string; answer_id: string; status: string }> {
  return request('POST', `${ADMIN}/moderation/${itemId}/answer/`, { text });
}
