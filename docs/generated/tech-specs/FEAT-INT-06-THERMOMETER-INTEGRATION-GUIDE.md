# Руководство по интеграции кризисного режима в Thermometer (TRM-01)

**Feature ID:** `FEAT-INT-06`  
**Для:** `FEAT-INT-XX` (Thermometer implementation)  
**Дата:** 2026-01-13

---

## Обзор

Это руководство описывает, как интегрировать кризисный режим в термометр ресурса (TRM-01) при его реализации.

## Требования

- Компонент `CrisisBanner` из `design-system/components/CrisisBanner`
- Функция `evaluateCrisisTrigger()` из `apps/web/src/lib/interactive.ts` (если нужна проверка текста)
- Метод `InteractivePlatform.trackCrisisTriggered()` для трекинга

---

## Логика триггера кризиса

### Вариант 1: По пороговым значениям (рекомендуется)

Триггер срабатывает, если:
- **Энергия** очень низкая (≤ 2 из 10) **И**
- **Напряжение** очень высокое (≥ 8 из 10) **И**
- **Поддержка** очень низкая (≤ 2 из 10)

**Пример кода:**

```typescript
// apps/web/src/app/start/thermometer/[slug]/ThermometerClient.tsx
const [energy, setEnergy] = useState<number>(5);
const [tension, setTension] = useState<number>(5);
const [support, setSupport] = useState<number>(5);
const [crisisTriggered, setCrisisTriggered] = useState(false);

const calculateCrisisTrigger = () => {
  // Формула: очень низкий ресурс = низкая энергия + низкая поддержка + высокое напряжение
  const isLowResource = energy <= 2 && support <= 2 && tension >= 8;
  
  if (isLowResource) {
    setCrisisTriggered(true);
    InteractivePlatform.trackCrisisTriggered('low_resource', 'thermometer');
    return true;
  }
  
  return false;
};

const handleComplete = async () => {
  const crisisTriggered = calculateCrisisTrigger();
  
  if (runId) {
    await InteractivePlatform.completeRun({
      runId,
      resultLevel: calculateResourceLevel(), // 'low' | 'moderate' | 'high'
      durationMs: Date.now() - startTime,
      crisisTriggered,
      crisisTriggerType: crisisTriggered ? 'low_resource' : undefined,
    });
  }
  
  InteractivePlatform.trackComplete('resource_thermometer', slug, {
    resource_level: calculateResourceLevel(),
    duration_ms: Date.now() - startTime,
  });
  
  setStep('result');
};
```

### Вариант 2: По результату (fallback)

Если `resource_level === 'low'` (очень низкий ресурс), показывать кризисный баннер.

```typescript
const resultLevel = calculateResourceLevel(); // 'low' | 'moderate' | 'high'
const isHighRisk = resultLevel === 'low';

if (isHighRisk) {
  setCrisisTriggered(true);
  InteractivePlatform.trackCrisisTriggered('low_resource', 'thermometer');
}
```

---

## Интеграция компонента CrisisBanner

### На экране результата

```typescript
// apps/web/src/app/start/thermometer/[slug]/ThermometerClient.tsx
import { CrisisBanner } from '../../../../../design-system/components';

// В компоненте результата:
if (step === 'result') {
  return (
    <div className="space-y-6">
      {crisisTriggered && isCrisisVisible && (
        <CrisisBanner 
          surface="thermometer" 
          triggerType="low_resource" 
          onBackToResources={() => setIsCrisisVisible(false)}
        />
      )}
      
      <ResultCard
        title={resultData.title}
        description={resultData.description}
        // ...
      >
        {/* Результаты термометра */}
      </ResultCard>
      
      {/* CTA с измененным приоритетом */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant={crisisTriggered ? "secondary" : "primary"} 
          onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}
        >
          Получить план в Telegram
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => window.location.href = '/booking'}
        >
          Записаться к психологу
        </Button>
      </div>
    </div>
  );
}
```

---

## Трекинг событий

### Событие `crisis_banner_shown`

Отправляется автоматически при показе `CrisisBanner`:

```typescript
// Автоматически в CrisisBanner компоненте:
track('crisis_banner_shown', {
  trigger_type: 'low_resource', // категория, не текст
  surface: 'thermometer'
});
```

### Событие `crisis_help_click`

Отправляется при клике на действия в баннере (автоматически в компоненте).

---

## Изменение приоритета CTA

При кризисном триггере CTA "Запись/Telegram" должны быть `secondary`, а не `primary`:

```typescript
<Button 
  variant={crisisTriggered ? "secondary" : "primary"} 
  onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}
>
  Получить план в Telegram
</Button>
```

---

## Privacy: без текста

**Важно:** В событиях и БД сохраняем только категорию триггера, **не текст**:

✅ Правильно:
```typescript
crisisTriggerType: 'low_resource' // категория
```

❌ Неправильно:
```typescript
crisisTriggerType: 'Пользователь выбрал очень низкую энергию и высокое напряжение' // текст
```

---

## Пример полной реализации

```typescript
'use client';

import React, { useState } from 'react';
import { CrisisBanner, Button, ResultCard } from '../../../../../design-system/components';
import { InteractivePlatform } from '../../../lib/interactive';

export const ThermometerClient: React.FC<{ data: any }> = ({ data }) => {
  const [step, setStep] = useState<'start' | 'progress' | 'result'>('start');
  const [energy, setEnergy] = useState<number>(5);
  const [tension, setTension] = useState<number>(5);
  const [support, setSupport] = useState<number>(5);
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const [isCrisisVisible, setIsCrisisVisible] = useState(true);
  const [runId, setRunId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const calculateResourceLevel = (): 'low' | 'moderate' | 'high' => {
    const score = energy + support - tension;
    if (score <= 3) return 'low';
    if (score <= 7) return 'moderate';
    return 'high';
  };

  const checkCrisisTrigger = (): boolean => {
    // Триггер: очень низкий ресурс
    const isLowResource = energy <= 2 && support <= 2 && tension >= 8;
    const resourceLevel = calculateResourceLevel();
    
    if (isLowResource || resourceLevel === 'low') {
      setCrisisTriggered(true);
      InteractivePlatform.trackCrisisTriggered('low_resource', 'thermometer');
      return true;
    }
    
    return false;
  };

  const handleComplete = async () => {
    const triggered = checkCrisisTrigger();
    const resourceLevel = calculateResourceLevel();
    const durationMs = Date.now() - startTime;

    if (runId) {
      await InteractivePlatform.completeRun({
        runId,
        resultLevel: resourceLevel === 'low' ? 'low' : resourceLevel === 'moderate' ? 'moderate' : 'high',
        durationMs,
        crisisTriggered: triggered,
        crisisTriggerType: triggered ? 'low_resource' : undefined,
      });
    }

    InteractivePlatform.trackComplete('resource_thermometer', data.slug, {
      resource_level: resourceLevel,
      duration_ms: durationMs,
    });

    setStep('result');
  };

  if (step === 'result') {
    return (
      <div className="space-y-6">
        {crisisTriggered && isCrisisVisible && (
          <CrisisBanner 
            surface="thermometer" 
            triggerType="low_resource" 
            onBackToResources={() => setIsCrisisVisible(false)}
          />
        )}
        
        <ResultCard
          title={`Ваш ресурс: ${calculateResourceLevel() === 'low' ? 'Низкий' : calculateResourceLevel() === 'moderate' ? 'Умеренный' : 'Высокий'}`}
          description="..."
        >
          {/* Рекомендации */}
        </ResultCard>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant={crisisTriggered ? "secondary" : "primary"} 
            onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}
          >
            Получить план в Telegram
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/booking'}
          >
            Записаться к психологу
          </Button>
        </div>
      </div>
    );
  }

  // ... остальная логика
};
```

---

## Тестирование

При реализации thermometer добавьте тесты:

1. **Unit тесты:**
   - Проверка логики триггера (пороговые значения)
   - Проверка расчета `resource_level`

2. **E2E тесты:**
   - Триггер → баннер показан
   - События `crisis_banner_shown` и `crisis_help_click` отправлены
   - CTA меняют приоритет

3. **Privacy тесты:**
   - В событиях нет текста, только категории

---

## Ссылки

- Техспека FEAT-INT-06: `docs/generated/tech-specs/FEAT-INT-06.md`
- Отчет о реализации: `docs/generated/tech-specs/FEAT-INT-06-IMPLEMENTATION-REPORT.md`
- Компонент CrisisBanner: `design-system/components/CrisisBanner/CrisisBanner.tsx`
- Примеры интеграции: `apps/web/src/app/start/quizzes/[slug]/QuizClient.tsx`, `apps/web/src/app/start/navigator/[slug]/NavigatorClient.tsx`

---

**Версия:** v1.0  
**Дата:** 2026-01-13
