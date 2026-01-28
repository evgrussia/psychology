/**
 * Типы для Admin API.
 * Бэкенд: admin/appointments, admin/leads, admin/content, admin/moderation, admin/me.
 */

export interface AdminMeResponse {
  user: { id: string; email: string };
  roles: string[];
}

export interface AdminPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// --- Appointments ---

export interface AdminAppointmentSlot {
  start_at: string;
  end_at: string;
}

export interface AdminAppointment {
  id: string;
  service: { id: string };
  client: { id: string };
  slot: AdminAppointmentSlot;
  status: string;
  created_at: string;
}

export interface AdminAppointmentsResponse {
  data: AdminAppointment[];
  pagination: AdminPagination;
}

export type AppointmentOutcome = 'attended' | 'no_show' | 'canceled';

// --- Leads ---

export interface AdminLead {
  id: string;
  identity: Record<string, unknown>;
  source: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface AdminLeadsResponse {
  data: AdminLead[];
  pagination: AdminPagination;
}

// --- Content ---

export interface AdminContentItem {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string | null;
}

export interface AdminContentResponse {
  data: AdminContentItem[];
  pagination: AdminPagination;
}

export interface PublishChecklist {
  hasDisclaimers?: boolean;
  toneChecked?: boolean;
  hasCta?: boolean;
  hasInternalLinks?: boolean;
}

// --- Moderation ---

export interface AdminModerationItem {
  id: string;
  content_type: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string | null;
}

export interface AdminModerationResponse {
  data: AdminModerationItem[];
  pagination: AdminPagination;
}
