# /crisis-check

## Назначение
Проверить компонент/контент на наличие корректной обработки кризисных состояний

## Формат
```
/crisis-check <путь к файлу или компоненту>
```

## Что проверяется

### 1. Crisis Detection
- [ ] Реализован CrisisDetectionService или аналог
- [ ] Проверяются explicit keywords (суицид, самоповреждение, и т.д.)
- [ ] Проверяется severity level ответов
- [ ] Есть mapping: high severity → crisis mode

### 2. UI при кризисе
- [ ] При crisis_level = HIGH показывается CrisisHelpBlock
- [ ] CrisisHelpBlock содержит контакты экстренной помощи
- [ ] При crisis_level = HIGH скрыты Marketing CTA
- [ ] При crisis_level = HIGH скрыт Booking CTA

### 3. Контент при кризисе
- [ ] Нет обесценивания
- [ ] Нет пустых обещаний
- [ ] Фокус на немедленную безопасность
- [ ] Контакты актуальны

### 4. Logging
- [ ] Не логируются чувствительные данные
- [ ] Логируется только факт crisis detection

## Пример использования

```
/crisis-check src/components/QuizResult.tsx
```

### Ожидаемый результат:
```yaml
file: src/components/QuizResult.tsx
status: PASS | FAIL | WARNING

checks:
  crisis_detection:
    status: PASS
    details: "CrisisLevel check found at line 45"
  
  crisis_block:
    status: PASS
    details: "CrisisHelpBlock rendered when showCrisisBlock=true"
  
  marketing_hidden:
    status: FAIL
    details: "BookingCTA not conditionally hidden at crisis"
    fix: "Add condition: !result.showCrisisBlock && <BookingCTA />"
  
  emergency_contacts:
    status: WARNING
    details: "Phone numbers should be verified for accuracy"

recommendations:
  - "Add showCrisisBlock check before BookingCTA"
  - "Verify emergency contact numbers are current"
```

## Связанные ресурсы
- `.cursor/skills/crisis-safety-check/SKILL.md`
- `docs/research/09-AI-Agents-Safety.md`
