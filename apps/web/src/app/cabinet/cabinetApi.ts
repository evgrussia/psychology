export interface CabinetProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: string[];
}

export interface CabinetAppointmentService {
  id: string;
  slug: string | null;
  title: string | null;
  duration_minutes: number | null;
}

export interface CabinetAppointment {
  id: string;
  start_at_utc: string;
  end_at_utc: string;
  timezone: string;
  format: 'online' | 'offline' | 'hybrid';
  status: 'pending_payment' | 'paid' | 'confirmed' | 'canceled' | 'rescheduled' | 'completed';
  service: CabinetAppointmentService | null;
}

export interface CabinetAppointmentsResponse {
  upcoming: CabinetAppointment[];
  past: CabinetAppointment[];
}

export interface CabinetMaterial {
  id: string;
  appointment_id: string;
  material_type: 'link' | 'file';
  title: string;
  description: string | null;
  url: string | null;
  created_at: string;
}

export interface CabinetMaterialsResponse {
  items: CabinetMaterial[];
}

export type DiaryType = 'emotions' | 'abc' | 'sleep_energy' | 'gratitude';

export interface DiaryEntry {
  id: string;
  diary_type: DiaryType;
  entry_date: string;
  created_at: string;
  has_text: boolean;
  payload: Record<string, unknown>;
}

export interface DiaryEntriesResponse {
  items: DiaryEntry[];
}

export interface CreateDiaryEntryPayload {
  diary_type: DiaryType;
  entry_date?: string | null;
  payload: Record<string, unknown>;
}

export interface CreateDiaryEntryResponse {
  id: string;
  diary_type: DiaryType;
  entry_date: string;
  created_at: string;
  has_text: boolean;
}

export interface DeleteDiaryEntryResponse {
  id: string;
  diary_type: DiaryType;
  deleted_at: string;
}

export type ExportDiaryPeriod = '7d' | '30d' | 'custom';

export interface ExportDiaryPdfPayload {
  period: ExportDiaryPeriod;
  from?: string | null;
  to?: string | null;
  entry_ids?: string[];
}

export interface ExportDiaryPdfResult {
  blob: Blob;
  filename: string;
}

export interface CabinetConsents {
  personal_data: boolean;
  communications: boolean;
  telegram: boolean;
}

export interface UpdateCabinetConsentsPayload {
  communications?: boolean;
  telegram?: boolean;
  source?: string;
}

export interface UpdateCabinetConsentsResponse {
  consents: CabinetConsents;
}

export interface ExportAccountDataPayload {
  format?: 'json' | 'zip';
}

export interface ExportAccountDataResult {
  blob: Blob;
  filename: string;
}

export interface DeleteAccountResponse {
  status: 'deleted';
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

async function fetchCabinet<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(5000),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    throw new Error('request_failed');
  }

  return res.json();
}

async function sendCabinet<T>(path: string, method: 'POST' | 'DELETE', body?: unknown): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5000),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    throw new Error('request_failed');
  }

  return res.json();
}

export const getCabinetProfile = () => fetchCabinet<CabinetProfile>('/cabinet/me');
export const getCabinetAppointments = () => fetchCabinet<CabinetAppointmentsResponse>('/cabinet/appointments');
export const getCabinetMaterials = () => fetchCabinet<CabinetMaterialsResponse>('/cabinet/materials');
export const getCabinetDiary = (params?: { type?: DiaryType; from?: string; to?: string }) => {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return fetchCabinet<DiaryEntriesResponse>(`/cabinet/diary${suffix}`);
};
export const createCabinetDiary = (payload: CreateDiaryEntryPayload) =>
  sendCabinet<CreateDiaryEntryResponse>('/cabinet/diary', 'POST', payload);
export const deleteCabinetDiary = (id: string) =>
  sendCabinet<DeleteDiaryEntryResponse>(`/cabinet/diary/${id}`, 'DELETE');

export const exportCabinetDiary = async (payload: ExportDiaryPdfPayload): Promise<ExportDiaryPdfResult> => {
  const res = await fetch(`${apiUrl}/cabinet/diary/export`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    throw new Error('request_failed');
  }

  const blob = await res.blob();
  const filename = extractFilename(res.headers.get('content-disposition')) ?? 'diary-export.pdf';
  return { blob, filename };
};

export const getCabinetConsents = () => fetchCabinet<CabinetConsents>('/cabinet/consents');

export const updateCabinetConsents = (payload: UpdateCabinetConsentsPayload) =>
  sendCabinet<UpdateCabinetConsentsResponse>('/cabinet/consents', 'POST', payload);

export const exportCabinetData = async (payload: ExportAccountDataPayload): Promise<ExportAccountDataResult> => {
  const res = await fetch(`${apiUrl}/cabinet/data/export`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    throw new Error('request_failed');
  }

  const blob = await res.blob();
  const filename = extractFilename(res.headers.get('content-disposition')) ?? 'user-data.json';
  return { blob, filename };
};

export const deleteCabinetAccount = () =>
  sendCabinet<DeleteAccountResponse>('/cabinet/account/delete', 'POST');

const extractFilename = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) {
    return null;
  }
  const match = /filename="([^"]+)"/.exec(contentDisposition);
  return match?.[1] ?? null;
};
