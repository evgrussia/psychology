# FEAT-BKG-05 — Implementation Report

Дата: 2026-01-15  
Статус: выполнено

## Что реализовано
- AC-1: `show_no_slots` отправляется с `service_slug` при пустой выдаче и на странице `no-slots`.
- AC-2: Создание `waitlist_requests` + создание лида и таймлайна (CRM) при отправке формы.
- AC-3: Без согласия на коммуникации запрос в лист ожидания не отправляется (валидируется на UI и backend).
- DoD: пользователь не упирается в тупик — доступны варианты waitlist и TG‑консьерж.

## Основные точки входа
- Web UI: `apps/web/src/app/booking/no-slots/NoSlotsClient.tsx`
- Telegram deep link helper: `apps/web/src/lib/telegram.ts`
- API: `apps/api/src/presentation/controllers/public/public.controller.ts`
- Use cases: 
  - `apps/api/src/application/booking/use-cases/CreateWaitlistRequestUseCase.ts`
  - `apps/api/src/application/booking/use-cases/GetNoSlotsModelUseCase.ts`
  - `apps/api/src/application/crm/use-cases/CreateOrUpdateLeadUseCase.ts`
- Persistence:
  - `apps/api/src/infrastructure/persistence/prisma/booking/prisma-waitlist-request.repository.ts`
  - `apps/api/src/infrastructure/persistence/prisma/crm/prisma-lead.repository.ts`

## Проверки и тесты
Запускалось:
- `pnpm test -- CreateWaitlistRequestUseCase.spec.ts public.controller.integration.spec.ts` (apps/api)

Тест‑план из спеки:
- e2e: сценарий “нет слотов → submit waitlist → успех + события” покрыт unit/integration тестами; e2e сценарий требует окружения веб+API и не запускался локально.

## Конфигурация/ENV
- `NEXT_PUBLIC_API_URL` (web, адрес API)
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` (web, имя TG‑бота; fallback на `psy_balance_bot`)
- `ENCRYPTION_KEY`, `ENCRYPTION_KEY_ID` (api, шифрование контактов)

## Блокеры
Нет. Интеграция с TG‑ботом отложена до `FEAT-TG-02`, текущая реализация готова к подключению (deep link payload + `cta_tg_click`).
