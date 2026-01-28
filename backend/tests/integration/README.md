# Интеграционные тесты для API endpoints

## Обзор

Этот каталог содержит интеграционные тесты для критичных API endpoints проекта «Эмоциональный баланс».

## Структура

### Auth Endpoints (`test_auth_endpoints.py`)

Интеграционные тесты для endpoints аутентификации:

- **POST /api/v1/auth/register** - Регистрация пользователя
  - Успешная регистрация
  - Дубликат email
  - Валидация email
  - Валидация пароля (минимум 12 символов)
  - Отсутствие обязательных полей

- **POST /api/v1/auth/login** - Авторизация пользователя
  - Успешный вход
  - Неверные credentials
  - Несуществующий пользователь
  - Неактивный пользователь
  - Отсутствие обязательных полей

- **POST /api/v1/auth/refresh** - Обновление access token
  - Успешное обновление токена
  - Невалидный токен
  - Отсутствие токена

- **POST /api/v1/auth/logout** - Выход из системы
  - Успешный выход
  - Выход без аутентификации
  - Выход без refresh token

### Booking Endpoints (`test_booking_endpoints.py`)

Интеграционные тесты для endpoints бронирования:

- **GET /api/v1/booking/services** - Список услуг
  - Получение списка опубликованных услуг
  - Публичный доступ (без аутентификации)
  - Получение деталей услуги
  - Несуществующая услуга

- **GET /api/v1/booking/services/:id/slots** - Доступные слоты
  - Получение доступных слотов
  - Валидация обязательных параметров (date_from, date_to)
  - Несуществующая услуга
  - Публичный доступ

- **POST /api/v1/booking/appointments** - Создание бронирования
  - Успешное создание бронирования
  - Требование аутентификации
  - Валидация обязательных полей
  - Несуществующая услуга

- **GET /api/v1/booking/appointments/:id** - Получение бронирования
  - Требование аутентификации
  - Несуществующее бронирование

## Запуск тестов

### Все интеграционные тесты

```bash
pytest backend/tests/integration/ -v
```

### Только auth endpoints

```bash
pytest backend/tests/integration/test_auth_endpoints.py -v
```

### Только booking endpoints

```bash
pytest backend/tests/integration/test_booking_endpoints.py -v
```

### С маркером integration

```bash
pytest -m integration -v
```

## Требования

- `pytest`
- `pytest-django`
- Тестовая база данных (настраивается через `DJANGO_SETTINGS_MODULE=config.settings.testing`)

## Примечания

- Все тесты используют `@pytest.mark.django_db` для доступа к тестовой БД
- Все тесты помечены маркером `@pytest.mark.integration`
- Тесты изолированы: каждый тест создает свои тестовые данные в `setUp()`
- Для аутентификации используется JWT токены через DRF SimpleJWT

---
*Документ создан: Coder Agent*
