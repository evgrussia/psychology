---
name: crisis-safety-check
description: Проверяет компоненты и контент на наличие корректной обработки кризисных состояний. Критичен для безопасности пользователей в психологическом продукте.
---

# Crisis Safety Check

## Назначение
Проверка корректной обработки кризисных состояний в UI, контенте и бизнес-логике. Критически важный навык для проектов в области психологической помощи.

## Когда применять
- При создании/редактировании интерактивных модулей (квизы, тесты, диагностики)
- При написании контента о ментальном здоровье
- При реализации результатов тестов/диагностик
- При проверке CTA и marketing-элементов
- В code review компонентов, связанных с эмоциональным состоянием пользователя

## Источники истины
- `docs/PRD.md` → Раздел "Кризисная обработка"
- `docs/research/09-AI-Agents-Safety.md` → Кризис-хендлинг
- `docs/Interactive-Modules-Matrix.md` → Спецификации модулей

---

## Чек-лист кризисной безопасности

### 1. Обнаружение кризиса

#### Обязательные триггеры для детекции:
```yaml
crisis_triggers:
  explicit_keywords:
    - "суицид"
    - "покончить с собой"
    - "не хочу жить"
    - "самоповреждение"
    - "резать себя"
    - "убить себя"
    
  implicit_signals:
    - Очень высокий уровень тревоги (anxiety_level >= 9/10)
    - Указание на острый кризис в свободном тексте
    - Выбор вариантов "постоянно думаю о смерти"
    
  context_based:
    - Несколько "красных флагов" в одном сеансе
    - Резкое ухудшение показателей между сессиями
```

#### Проверка в коде:
```python
# ✅ ПРАВИЛЬНО: Проверка кризиса присутствует
class QuizResultProcessor:
    def process_result(self, answers: List[Answer]) -> QuizResult:
        crisis_level = self.crisis_detector.detect(answers)
        
        if crisis_level == CrisisLevel.HIGH:
            return QuizResult(
                level=crisis_level,
                show_crisis_block=True,
                disable_marketing_cta=True,
                disable_booking_cta=True
            )
        
        return QuizResult(level=crisis_level, ...)

# ❌ НЕПРАВИЛЬНО: Кризис не проверяется
class QuizResultProcessor:
    def process_result(self, answers: List[Answer]) -> QuizResult:
        score = calculate_score(answers)
        return QuizResult(score=score)  # Опасно!
```

### 2. UI/UX при кризисе

#### Обязательные элементы при `crisis_level = HIGH`:

```tsx
// ✅ ПРАВИЛЬНО: Кризисный блок показывается
const QuizResult: React.FC<{ result: QuizResult }> = ({ result }) => {
  if (result.showCrisisBlock) {
    return (
      <CrisisHelpBlock>
        <h2>Если вам сейчас очень тяжело — вы не одни</h2>
        
        <EmergencyContacts>
          <Contact>
            <Label>Телефон доверия:</Label>
            <Phone href="tel:88002000122">8-800-2000-122</Phone>
            <Note>бесплатно, круглосуточно</Note>
          </Contact>
          
          <Contact>
            <Label>МЧС психологическая помощь:</Label>
            <Phone href="tel:84992165050">8-499-216-50-50</Phone>
          </Contact>
        </EmergencyContacts>
        
        <SafetyMessage>
          Запись на консультацию может подождать.
          Позвоните на линию поддержки — там помогут прямо сейчас.
        </SafetyMessage>
      </CrisisHelpBlock>
    );
  }
  
  return <RegularResult result={result} />;
};

// ❌ НЕПРАВИЛЬНО: CTA на запись при кризисе
const QuizResult: React.FC<{ result: QuizResult }> = ({ result }) => {
  return (
    <div>
      <ResultScore score={result.score} />
      {/* ОПАСНО: Предлагаем запись при любом состоянии */}
      <BookingCTA>Запишитесь на консультацию!</BookingCTA>
    </div>
  );
};
```

#### Запрещённые элементы при кризисе:

| Элемент | Почему запрещён |
|---------|-----------------|
| `<BookingCTA>` | Человек в кризисе не готов к записи, нужна немедленная помощь |
| `<MarketingBanner>` | Воспринимается как давление, усиливает дистресс |
| `<DiscountOffer>` | Манипулятивно в уязвимом состоянии |
| `<SocialProof>` | Отвлекает от экстренной помощи |
| `<NewsletterSignup>` | Неуместно в кризисной ситуации |

### 3. Контент при кризисе

#### Тон и формулировки:

```markdown
✅ ПРАВИЛЬНО:
"Если вам сейчас очень тяжело — вы не одни."
"Сейчас самое важное — ваша безопасность."
"Позвоните на линию поддержки — там помогут прямо сейчас."

❌ НЕПРАВИЛЬНО:
"Не переживайте, всё будет хорошо!" (пустое обещание)
"Вам срочно нужна терапия!" (давление)
"Это не так страшно, как кажется" (обесценивание)
"Возьмите себя в руки" (обвинение)
```

### 4. Логирование и аналитика

#### Правила безопасного логирования:

```python
# ✅ ПРАВИЛЬНО: Логируем факт, не содержание
logger.info("Crisis level detected", extra={
    "session_id": session.id,
    "crisis_level": "HIGH",
    "module_type": "quiz",
    # НЕ логируем: ответы пользователя, свободный текст
})

# ❌ НЕПРАВИЛЬНО: Логируем чувствительные данные
logger.info("Crisis detected", extra={
    "user_id": user.id,
    "answers": answers,  # ОПАСНО: персональные данные
    "free_text": user_text  # ОПАСНО: чувствительный контент
})
```

#### Аналитика без PII:

```yaml
event: crisis_block_shown
properties:
  module_type: quiz
  crisis_level: high
  # НЕ включать: user_id, answers, free_text
```

---

## Алгоритм проверки

### Шаг 1: Идентификация компонентов
```
1. Определить тип компонента:
   - [ ] Интерактивный модуль (quiz, test, diary)
   - [ ] Результат теста/диагностики
   - [ ] Контент о ментальном здоровье
   - [ ] CTA/marketing элемент
   - [ ] Форма обратной связи

2. Если интерактивный модуль:
   - Проверить наличие crisis detection
   - Проверить обработку crisis_level = HIGH
```

### Шаг 2: Проверка crisis detection
```
□ Код содержит CrisisDetectionService или аналог
□ Проверяются explicit_keywords
□ Проверяется severity level ответов
□ Есть mapping: high severity → crisis mode
```

### Шаг 3: Проверка UI при кризисе
```
□ При crisis_level = HIGH показывается CrisisHelpBlock
□ CrisisHelpBlock содержит:
  □ Сообщение поддержки
  □ Контакты экстренной помощи (телефон доверия)
  □ Объяснение что делать прямо сейчас
□ При crisis_level = HIGH скрыты:
  □ BookingCTA
  □ Marketing elements
  □ Newsletter signup
  □ Social proof / отзывы
```

### Шаг 4: Проверка контента
```
□ Нет обесценивания ("не так страшно", "возьмите себя в руки")
□ Нет пустых обещаний ("всё будет хорошо")
□ Нет давления ("вам срочно нужно")
□ Есть фокус на немедленную безопасность
□ Контакты экстренной помощи актуальны
```

### Шаг 5: Проверка логирования
```
□ Не логируются: ответы пользователя с чувствительным содержанием
□ Не логируются: свободный текст пользователя
□ Логируется только: факт crisis detection (без PII)
```

---

## Чек-лист для Code Review

### Обязательные проверки

```markdown
## Crisis Safety Review

### Detection
- [ ] CrisisDetectionService присутствует
- [ ] Триггеры покрывают явные и неявные сигналы
- [ ] Порог срабатывания адекватен (не слишком чувствительный, не слишком грубый)

### UI Handling
- [ ] CrisisHelpBlock реализован и показывается при HIGH
- [ ] Marketing CTA скрыты при HIGH
- [ ] Booking CTA скрыт при HIGH
- [ ] Контакты экстренной помощи актуальны

### Content
- [ ] Тон соответствует crisis guidelines
- [ ] Нет обесценивания и пустых обещаний
- [ ] Фокус на немедленную безопасность

### Logging
- [ ] Чувствительные данные не логируются
- [ ] PII не попадает в аналитику

### Testing
- [ ] Есть тесты на crisis flow
- [ ] Тестируется корректное скрытие CTA
- [ ] Тестируется показ CrisisHelpBlock
```

---

## Примеры реализации

### Domain Service: Crisis Detection

```python
# domain/interactive/domain_services.py
from enum import Enum
from typing import List
from dataclasses import dataclass

class CrisisLevel(Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

@dataclass
class CrisisAssessment:
    level: CrisisLevel
    triggers_found: List[str]
    show_crisis_block: bool
    disable_marketing: bool
    disable_booking: bool

class CrisisDetectionService:
    """Определение кризисных состояний в ответах пользователя."""
    
    EXPLICIT_CRISIS_KEYWORDS = [
        "суицид", "покончить", "не хочу жить",
        "самоповреждение", "резать себя", "убить себя"
    ]
    
    HIGH_SEVERITY_ANSWERS = [
        "постоянно думаю о смерти",
        "не вижу смысла продолжать",
        "хочу исчезнуть"
    ]
    
    def assess(
        self, 
        answers: List[str], 
        free_text: str | None = None
    ) -> CrisisAssessment:
        triggers = []
        
        # Check explicit keywords
        all_text = " ".join(answers)
        if free_text:
            all_text += " " + free_text
        all_text = all_text.lower()
        
        for keyword in self.EXPLICIT_CRISIS_KEYWORDS:
            if keyword in all_text:
                triggers.append(f"keyword:{keyword}")
        
        # Check high severity answers
        for answer in answers:
            if answer.lower() in [a.lower() for a in self.HIGH_SEVERITY_ANSWERS]:
                triggers.append(f"answer:{answer[:20]}...")
        
        # Determine level
        if triggers:
            level = CrisisLevel.HIGH
        else:
            level = CrisisLevel.NONE
        
        return CrisisAssessment(
            level=level,
            triggers_found=triggers,
            show_crisis_block=level == CrisisLevel.HIGH,
            disable_marketing=level == CrisisLevel.HIGH,
            disable_booking=level == CrisisLevel.HIGH
        )
```

### React Component: Crisis Help Block

```tsx
// components/CrisisHelpBlock.tsx
import React from 'react';

interface EmergencyContact {
  name: string;
  phone: string;
  note: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Телефон доверия',
    phone: '8-800-2000-122',
    note: 'бесплатно, круглосуточно'
  },
  {
    name: 'Центр экстренной психологической помощи МЧС',
    phone: '8-499-216-50-50',
    note: ''
  }
];

export const CrisisHelpBlock: React.FC = () => {
  return (
    <div className="crisis-help-block bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
      <h2 className="text-xl font-semibold text-amber-900 mb-4">
        Если вам сейчас очень тяжело — вы не одни
      </h2>
      
      <div className="space-y-4 mb-6">
        {EMERGENCY_CONTACTS.map((contact) => (
          <div key={contact.phone} className="flex flex-col">
            <span className="text-sm text-amber-700">{contact.name}:</span>
            <a 
              href={`tel:${contact.phone.replace(/-/g, '')}`}
              className="text-lg font-medium text-amber-900 hover:underline"
            >
              {contact.phone}
            </a>
            {contact.note && (
              <span className="text-sm text-amber-600">{contact.note}</span>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-amber-800">
        Запись на консультацию может подождать.
        Позвоните на линию поддержки — там помогут прямо сейчас.
      </p>
    </div>
  );
};
```

---

## Контакты экстренной помощи (актуальные для РФ)

```yaml
emergency_contacts:
  - name: "Телефон доверия"
    phone: "8-800-2000-122"
    note: "бесплатно, круглосуточно"
    
  - name: "Центр экстренной психологической помощи МЧС"
    phone: "8-499-216-50-50"
    
  - name: "Скорая психиатрическая помощь"
    phone: "112"
    note: "при непосредственной угрозе жизни"
```

**ВАЖНО:** Периодически проверять актуальность контактов!

---

## Quality Gate: Crisis Safety

Перед release любого компонента, связанного с эмоциональным состоянием:

```markdown
## Crisis Safety Sign-off

- [ ] Crisis detection реализован и протестирован
- [ ] UI корректно обрабатывает crisis_level = HIGH
- [ ] Marketing CTA отключены при кризисе
- [ ] Контент соответствует crisis tone guidelines
- [ ] Контакты экстренной помощи актуальны и кликабельны
- [ ] Логирование не содержит PII
- [ ] Ручное тестирование crisis flow пройдено

Подпись: ________________ Дата: ________________
```
