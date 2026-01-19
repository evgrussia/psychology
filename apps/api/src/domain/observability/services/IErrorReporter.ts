export interface ErrorReporterContext {
  requestId?: string | null;
  method?: string | null;
  path?: string | null;
  statusCode?: number | null;
  userId?: string | null;
  leadId?: string | null;
  source?: string | null;
}

export interface IErrorReporter {
  captureException(error: unknown, context?: ErrorReporterContext): void;
  captureMessage?(message: string, context?: ErrorReporterContext): void;
}
