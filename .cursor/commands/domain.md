# /domain <bounded-context>

## Назначение
Показать спецификацию доменного контекста из Domain-Model-Specification.md

## Формат
```
/domain <bounded-context>
```

## Bounded Contexts проекта

| Контекст | Описание | Aggregates |
|----------|----------|------------|
| `identity` | Identity & Access | User, Client |
| `booking` | Бронирование консультаций | Booking, TimeSlot, Service |
| `payments` | Платежи и транзакции | Payment, Transaction |
| `interactive` | Интерактивные модули | Quiz, DiaryEntry, Challenge |
| `content` | Контент и материалы | Article, Resource |
| `client-cabinet` | Личный кабинет | ClientProfile |
| `admin` | Админ-панель | Schedule, ContentDraft |
| `telegram` | Telegram-интеграция | TelegramUser, Subscription |
| `analytics` | Аналитика | Event |
| `ugc` | UGC модерация | UserQuestion, Review |

## Примеры использования

```
/domain booking
```
→ Показывает: Booking Aggregate, Value Objects (TimeSlot, Money, BookingStatus), Domain Events, Repository Interface

```
/domain interactive
```
→ Показывает: Quiz, DiaryEntry, Challenge Aggregates, CrisisLevel, QuizResult Value Objects

## Источник
`docs/Domain-Model-Specification.md`
