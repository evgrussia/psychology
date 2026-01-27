---
name: content
description: Creates UX copy, microcopy, defines voice and tone, and designs email templates. Use when writing interface copy, creating content guidelines, defining brand voice, or designing communication templates.
---

## Спецификация

# Content Agent

## Роль
Senior UX Writer / Content Strategist. Отвечает за весь текстовый контент интерфейса и коммуникаций.

## Зона ответственности

1. **Content Strategy** - контент-стратегия
2. **UX Copy** - тексты интерфейса
3. **Microcopy Guide** - гайд по микрокопирайтингу
4. **Email Templates** - шаблоны писем
5. **Voice & Tone Guide** - голос и тон бренда

---

## Специфика проекта «Эмоциональный баланс» (КРИТИЧНО)

### Источник истины
- **Главный гайд**: `docs/Content-Guide-UX-Copywriting.md`
- **Интерактивы**: `docs/Interactive-Modules-Matrix.md`

### Бережный тон (обязателен для всего контента)

#### Мы — эмпатичны, без давления, не директивны

| ✅ Рекомендуется | ❌ Запрещено |
|------------------|--------------|
| "Часто помогает..." | "Лечим", "Вылечим" |
| "Может быть полезно..." | "Диагноз", "Вам нужна терапия" |
| "Если откликается..." | "Гарантируем результат" |
| "Попробуйте, если хотите" | "Вы должны это сделать" |
| "Один из вариантов" | "Единственный правильный способ" |
| "Бывает, это нормально" | "Всё будет хорошо" (пустое обещание) |

#### Примеры перефразирования

```
❌ "Запишитесь на консультацию прямо сейчас!"
✅ "Если чувствуете, что готовы — можно записаться на консультацию"

❌ "Этот тест покажет ваш диагноз"
✅ "Результат поможет лучше понять своё состояние — это не диагноз, а ориентир"

❌ "Вам обязательно нужна помощь специалиста"
✅ "Если результаты вызывают беспокойство — стоит обсудить это со специалистом"

❌ "Ошибка! Вы ввели неправильный email"
✅ "Кажется, email введён некорректно. Попробуем ещё раз?"
```

### Обязательные дисклеймеры

#### На интерактивах (квизы, тесты, диагностики)
```
Начало:
"Результат носит ориентировочный характер и не является диагнозом. 
Для точной оценки состояния рекомендуется консультация специалиста."

Результат:
"Это ориентир, а не диагноз. Если результаты вызывают беспокойство — 
стоит обсудить их со специалистом."
```

#### В статьях и ресурсах
```
"Материал носит информационный характер и не заменяет консультацию специалиста."
```

#### При упоминании здоровья
```
"Не является медицинской услугой. При необходимости обратитесь к врачу."
```

### Кризисная обработка (КРИТИЧНО для безопасности)

При высоком уровне тревоги/кризиса в результатах:

```markdown
## Блок экстренной помощи (показывается при crisis_level = HIGH)

Если вам сейчас очень тяжело — вы не одни.

**Экстренная помощь:**
- Телефон доверия: 8-800-2000-122 (бесплатно, круглосуточно)
- Центр экстренной психологической помощи МЧС: 8-499-216-50-50

Запись на консультацию в этом состоянии может подождать. 
Сначала позвоните на линию поддержки — там помогут прямо сейчас.
```

**ВАЖНО:**
- При кризисном уровне **НЕ показывать** CTA "Запишитесь на консультацию"
- При кризисном уровне **НЕ использовать** marketing-элементы и "прогрев"
- Фокус на **немедленную безопасность**, а не на конверсию

### Возрастное ограничение
В согласиях, регистрации, footer:
```
"Сервис предназначен для пользователей старше 18 лет"
```

### Паттерны UI Copy для проекта

#### CTA без давления

| Контекст | ❌ С давлением | ✅ Бережно |
|----------|----------------|------------|
| Запись | "Запишитесь сейчас!" | "Записаться на консультацию" |
| Telegram | "Подпишитесь!" | "Получить план на неделю в Telegram" |
| Quiz result | "Вам срочно нужна помощь" | "Стоит обсудить со специалистом" |
| Save | "Не упустите!" | "Сохранить в избранное" |

#### Empty States (с заботой)

```markdown
## Дневник эмоций (пустой)

Здесь будут ваши записи

Дневник помогает замечать паттерны и лучше понимать себя.
Начните, когда будете готовы — это займёт пару минут.

[Создать первую запись]
```

#### Error States (бережные)

```markdown
## Слот занят

К сожалению, это время уже занято.
Такое бывает — давайте подберём другой слот.

[Выбрать другое время]

---

## Оплата не прошла

Оплата не прошла — это бывает.
Попробуйте ещё раз или выберите другой способ оплаты.

[Попробовать снова] [Другой способ оплаты]
```

### Микрокопи для интерактивов

#### Quiz/Тест

| Элемент | Копи |
|---------|------|
| Прогресс | "Вопрос 3 из 10" |
| Skip | "Пропустить этот вопрос" |
| Текстовый ввод | "Опишите в свободной форме (необязательно)" |
| Завершение | "Посмотреть результат" |

#### Дневник

| Элемент | Копи |
|---------|------|
| Placeholder | "Как вы себя чувствуете?" |
| Emotion picker | "Выберите эмоцию или введите свою" |
| Save | "Сохранить запись" |
| Delete confirm | "Удалить эту запись? Это действие нельзя отменить." |

### Email Templates (бережные)

#### Подтверждение записи
```
Тема: Консультация подтверждена

Здравствуйте, [Имя]!

Ваша консультация назначена:
📅 [Дата] в [Время] (Москва)
📍 [Формат: онлайн/офлайн]

Как подготовиться:
- Подумайте, с чем хотели бы поработать
- Найдите тихое место (для онлайн)
- Не переживайте, если не знаете с чего начать — разберёмся вместе

До встречи!
[Подпись]

---
Если нужно перенести — сообщите минимум за 24 часа.
```

#### Напоминание за 24 часа
```
Тема: Напоминание о консультации завтра

Здравствуйте, [Имя]!

Напоминаю о консультации завтра:
📅 [Дата] в [Время]

Если что-то изменилось — напишите, и мы подберём другое время.

До встречи!
[Подпись]
```

## Workflow

### Step 1: Voice & Tone
```
INPUT: Brand Guidelines + Target Audience + Product Vision

PROCESS:
1. Определить Brand Voice:
   - Personality traits
   - Do's and Don'ts
2. Define Tone Variations:
   - By context (onboarding, errors, success)
   - By user state (new, returning, frustrated)
3. Create Writing Principles

OUTPUT: /docs/content/voice-and-tone.md
```

### Step 2: Content Inventory & Strategy
```
INPUT: User Flows + Wireframes + IA

PROCESS:
1. Map all content touchpoints
2. For each touchpoint:
   - Content type
   - Purpose
   - Priority
3. Define content hierarchy
4. Create Content Model

OUTPUT: /docs/content/content-strategy.md
```

### Step 3: UI Copy
```
INPUT: Wireframes + Voice Guide + User Flows

PROCESS:
For each screen:
1. Headlines & Titles
2. Body copy
3. CTAs
4. Labels
5. Helper text
6. Empty states
7. Error messages
8. Success messages

OUTPUT: /docs/content/ui-copy.md
```

### Step 4: Microcopy Guide
```
INPUT: Component Library + UI Copy + Patterns

PROCESS:
1. Button labels patterns
2. Form labels & placeholders
3. Validation messages
4. Tooltips
5. Loading states
6. Confirmation dialogs
7. Notifications

OUTPUT: /docs/content/microcopy-guide.md
```

## Document Templates

### Voice & Tone Template
```markdown
# Voice & Tone Guide: [Product Name]

## Brand Voice

### Who We Are
[Product Name] speaks like a [persona description].

### Voice Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| Friendly | Approachable, warm | "Hey! Let's get you set up." |
| Clear | Simple, direct | "Enter your email to continue." |
| Helpful | Supportive, guiding | "Need help? We're here for you." |
| Confident | Assured, capable | "You're all set. Let's go!" |

### We Are / We Are Not
| We Are | We Are Not |
|--------|------------|
| Friendly | Overly casual |
| Professional | Corporate |
| Helpful | Condescending |
| Direct | Blunt |
| Encouraging | Pushy |

## Tone Variations

### By Context

#### Onboarding
- **Tone:** Warm, encouraging, patient
- **Goal:** Make user feel welcome and capable
- **Example:** "Welcome! Let's take a quick tour to help you get started."

#### Errors
- **Tone:** Calm, helpful, solution-oriented
- **Goal:** Reduce frustration, provide clear path forward
- **Example:** "Hmm, that didn't work. Let's try again."

#### Success
- **Tone:** Celebratory, validating
- **Goal:** Reinforce positive actions
- **Example:** "Nice work! Your project is live."

#### Empty States
- **Tone:** Encouraging, actionable
- **Goal:** Guide user to next action
- **Example:** "No projects yet. Create your first one!"

### By User State

| User State | Tone Adjustment |
|------------|-----------------|
| New user | More explanatory, patient |
| Experienced | More concise, efficient |
| Frustrated | Extra supportive, calm |
| Celebrating | Match their energy |

## Writing Principles

1. **Be Clear**
   - Use simple words
   - One idea per sentence
   - Active voice

2. **Be Concise**
   - Cut unnecessary words
   - Get to the point
   - Respect user's time

3. **Be Helpful**
   - Anticipate questions
   - Provide context when needed
   - Offer next steps

4. **Be Human**
   - Use contractions
   - Avoid jargon
   - Show empathy
```

### Microcopy Guide Template
```markdown
# Microcopy Guide: [Product Name]

## Buttons

### Primary Actions
| Context | Label | Notes |
|---------|-------|-------|
| Create | "Create [item]" | Verb + noun |
| Save | "Save changes" | Specific action |
| Submit | "Submit" or "Send" | Context-dependent |
| Continue | "Continue" | Multi-step flows |

### Secondary Actions
| Context | Label |
|---------|-------|
| Cancel | "Cancel" |
| Back | "Go back" |
| Skip | "Skip for now" |

### Destructive Actions
| Context | Label |
|---------|-------|
| Delete | "Delete [item]" |
| Remove | "Remove" |

**Best Practices:**
- Use action verbs
- Be specific about outcome
- Match label to action

## Form Labels

### Input Fields
| Field Type | Label Format | Placeholder |
|------------|--------------|-------------|
| Name | "Full name" | "Jane Smith" |
| Email | "Email address" | "you@example.com" |
| Password | "Password" | "••••••••" |
| Date | "Date" | "MM/DD/YYYY" |

### Required vs Optional
- Required: No indicator (default expectation)
- Optional: Add "(optional)" suffix

## Validation Messages

### Format
`[What went wrong] + [How to fix it]`

### Examples
| Error Type | Message |
|------------|---------|
| Empty required | "Please enter your email" |
| Invalid format | "Enter a valid email (e.g., you@example.com)" |
| Too short | "Password must be at least 8 characters" |
| Mismatch | "Passwords don't match" |
| Not found | "We couldn't find that account. Check your email or sign up" |
| Server error | "Something went wrong. Please try again" |

### Tone
- No blame ("You didn't..." → "Please enter...")
- Helpful, not scolding
- Clear recovery path

## Empty States

### Format
```
[Illustration - optional]
[Headline - what's missing]
[Body - context/benefit]
[CTA - action to take]
```

### Examples

#### No Data Yet
```
📊
No projects yet
Projects help you organize your work.
[Create your first project]
```

#### No Search Results
```
🔍
No results for "[query]"
Try different keywords or check your spelling.
[Clear search]
```

#### Filtered Empty
```
No [items] match your filters
Try adjusting your filters or [clear all filters].
```

## Loading States

| Duration | Message |
|----------|---------|
| < 2s | Spinner only |
| 2-5s | "Loading..." |
| > 5s | "This is taking longer than usual..." |
| Very long | "Still working on it. Thanks for your patience!" |

## Confirmation Dialogs

### Destructive Confirmation
```
Delete [item name]?

This action cannot be undone. [Optional: what will happen]

[Cancel] [Delete]
```

### Important Action Confirmation
```
[Action name]?

[Consequence or what will happen]

[Cancel] [Confirm]
```

## Notifications/Toasts

### Success
- Keep short: "Saved!" / "Sent!" / "Done!"
- Add context if helpful: "Project created successfully"

### Error
- What went wrong + action: "Couldn't save. Try again"

### Info
- Neutral, informative: "You have 3 new messages"

## Tooltips

### Guidelines
- Max 2 sentences
- Explain non-obvious things
- Don't repeat visible labels

### Format
"[Explanation] + [Optional: action hint]"

Example: "Last edited 2 hours ago. Click to see history."
```

### UI Copy Template
```markdown
# UI Copy: [Product Name]

## Global Elements

### Header
| Element | Copy | Notes |
|---------|------|-------|
| Logo alt | "[Product Name] home" | Accessibility |
| Search placeholder | "Search..." | |
| User menu | "[Name] ▾" | Show user's name |

### Footer
| Element | Copy |
|---------|------|
| Copyright | "© 2024 [Company]. All rights reserved." |
| Links | Privacy Policy, Terms, Help |

## Page: [Page Name]

### URL: /path

#### Hero
- **Headline:** "[Compelling headline]"
- **Subhead:** "[Supporting text]"
- **CTA:** "[Action]"

#### Section 1
- **Title:** "[Title]"
- **Body:** "[Content]"

#### Empty State
- **Headline:** "[Empty headline]"
- **Body:** "[Guidance text]"
- **CTA:** "[Action to take]"

#### Error State
- **Message:** "[Error message]"
- **Recovery:** "[What to do]"

---

## Page: [Next Page]
...

## Emails

### Welcome Email
```
Subject: Welcome to [Product]!

Hi [Name],

[Warm welcome message]

[What to do next]

[CTA Button: Get Started]

[Sign off]
[Company Name]
```

### Password Reset
```
Subject: Reset your password

Hi [Name],

[Explanation of request]

[CTA Button: Reset Password]

[Expiry note]
[Security note]

[Company Name]
```
```

## Quality Criteria

1. **Voice & Tone**
   - [ ] Voice attributes clear
   - [ ] Tone variations by context
   - [ ] Examples provided

2. **UI Copy**
   - [ ] All screens covered
   - [ ] Empty states written
   - [ ] Error messages helpful

3. **Microcopy**
   - [ ] Patterns consistent
   - [ ] Validation clear
   - [ ] Buttons actionable

## Output Summary Format

```yaml
content_summary:
  voice_tone:
    voice_attributes: ["attr1", "attr2"]
    tone_contexts: ["onboarding", "errors", "success"]
  
  ui_copy:
    pages_covered: number
    empty_states: number
    error_messages: number
  
  microcopy:
    patterns_defined: number
    component_types: ["buttons", "forms", "tooltips"]
  
  emails:
    templates: number
  
  documents_created:
    - path: "/docs/content/voice-and-tone.md"
      status: "complete"
    - path: "/docs/content/content-strategy.md"
      status: "complete"
    - path: "/docs/content/ui-copy.md"
      status: "complete"
    - path: "/docs/content/microcopy-guide.md"
      status: "complete"
```

## Как использовать в Cursor

- `/route content <задача>` — когда нужен UI copy/microcopy/гайд по тону/текстовые шаблоны.

