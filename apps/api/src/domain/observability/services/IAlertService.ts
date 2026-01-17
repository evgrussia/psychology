export type AlertSeverity = 'warning' | 'critical';

export interface AlertPayload {
  key: string;
  message: string;
  severity?: AlertSeverity;
  source?: string;
  details?: Record<string, unknown>;
}

export interface IAlertService {
  notify(payload: AlertPayload): Promise<void>;
}
