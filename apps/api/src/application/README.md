# Application Layer

Этот слой содержит use cases (сценарии использования) и оркестрацию бизнес-логики.

## Структура

- **Use Cases** - конкретные сценарии использования приложения
- **Application Services** - сервисы, координирующие выполнение use cases
- **DTOs** - объекты для передачи данных между слоями
- **Application Events** - события уровня приложения

## Принципы

- ✅ Зависит только от Domain Layer
- ✅ Использует интерфейсы репозиториев из Domain Layer
- ✅ Не содержит бизнес-логику (она в Domain Layer)
- ✅ Координирует выполнение use cases

## Пример структуры

```
application/
  use-cases/
    booking/
      create-booking.use-case.ts
    payment/
      process-payment.use-case.ts
  dto/
    booking.dto.ts
    payment.dto.ts
```

## Связь с другими слоями

- **Domain Layer** - использует интерфейсы и сущности
- **Infrastructure Layer** - получает реализации репозиториев через DI
- **Presentation Layer** - вызывает use cases через контроллеры
