export interface AccountExportData {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    telegram_user_id: string | null;
    telegram_username: string | null;
    display_name: string | null;
    status: string;
    created_at: string;
    deleted_at: string | null;
  };
  consents: Array<{
    id: string;
    consent_type: string;
    granted: boolean;
    version: string;
    source: string;
    granted_at: string;
    revoked_at: string | null;
  }>;
  appointments: Array<Record<string, unknown>>;
  appointment_materials: Array<Record<string, unknown>>;
  diary_entries: Array<Record<string, unknown>>;
  intake_forms: Array<Record<string, unknown>>;
  waitlist_requests: Array<Record<string, unknown>>;
  anonymous_questions: Array<Record<string, unknown>>;
  question_answers: Array<Record<string, unknown>>;
  reviews: Array<Record<string, unknown>>;
  lead_identities: Array<Record<string, unknown>>;
}

export interface IAccountDataExporter {
  exportUserData(userId: string): Promise<AccountExportData>;
}
