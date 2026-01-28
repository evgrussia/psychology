/**
 * Типы ошибок API по контракту docs/api/api-contracts.md
 */

export interface ErrorDetail {
  field?: string;
  message?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ErrorDetail[];
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: ErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse(status: number, body: { error?: ApiErrorPayload }): ApiError {
    const err = body?.error;
    if (err) {
      return new ApiError(err.code, err.message, status, err.details);
    }
    const fallback: Record<number, string> = {
      400: 'Неверный запрос',
      401: 'Требуется авторизация',
      403: 'Недостаточно прав',
      404: 'Ресурс не найден',
      422: 'Ошибка валидации',
      429: 'Слишком много запросов. Попробуйте позже.',
      500: 'Внутренняя ошибка сервера',
    };
    return new ApiError(
      'UNKNOWN',
      fallback[status] ?? `Ошибка ${status}`,
      status
    );
  }
}
