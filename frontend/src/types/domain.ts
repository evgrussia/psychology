export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  article_count?: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  category: string;
  tags: string[];
}

export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimated_time_minutes: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'single_choice' | 'scale' | 'text';
  options?: string[];
}

export interface QuizAnswer {
  question_id: string;
  value: string | number | (string | number)[];
}

export interface QuizResult {
  level: string;
  profile: string;
  recommendations: string[];
}

export interface DiaryEntry {
  id: string;
  type: 'emotion' | 'gratitude' | 'reflection';
  content: string;
  created_at: string;
}

export interface CabinetAppointment {
  id: string;
  service: {
    id: string;
    title: string;
  };
  slot: {
    id: string;
    start_at: string;
    end_at?: string;
  };
  status: 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
}

export interface CabinetStats {
  upcoming_appointments: number;
  diary_entries_count: number;
  materials_count: number;
}

export interface CabinetMaterial {
  id: string;
  title: string;
  description?: string;
  type: string;
  download_url?: string;
  view_url?: string;
}

export interface CabinetAppointmentDetail {
  id: string;
  service_name: string;
  specialist_name?: string;
  datetime: string;
  is_online: boolean;
  location?: string;
  status: 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
}
