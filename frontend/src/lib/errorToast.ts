/**
 * Единая обработка ошибок API в UI (тосты).
 * По плану: frontend/docs/BACKEND-INTEGRATION-PLAN.md § 6, Фаза 6 п.25
 */

import { toast } from 'sonner';
import { ApiError } from '@/api/client';

/**
 * Показывает сообщение об ошибке в тосте.
 * Маппинг по статусу: сеть, 401, 403, 404, 422, 429 и т.д.
 */
export function showApiError(err: unknown): void {
  if (err instanceof ApiError) {
    const message = getMessageForStatus(err.status, err.message);
    toast.error(message);
    return;
  }
  if (err instanceof TypeError && err.message.includes('fetch')) {
    toast.error('Проверьте подключение к интернету');
    return;
  }
  const message = err instanceof Error ? err.message : 'Произошла ошибка. Попробуйте позже.';
  toast.error(message);
}

function getMessageForStatus(status: number, fallback: string): string {
  switch (status) {
    case 401:
      return 'Требуется авторизация';
    case 403:
      return 'Недостаточно прав';
    case 404:
      return 'Ресурс не найден';
    case 422:
      return fallback || 'Ошибка валидации';
    case 429:
      return 'Слишком много запросов. Попробуйте позже.';
    default:
      return fallback || 'Произошла ошибка';
  }
}
