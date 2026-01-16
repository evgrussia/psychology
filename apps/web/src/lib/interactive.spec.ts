import { describe, it, expect } from 'vitest';
import { evaluateCrisisTrigger, CrisisTriggerType, CRISIS_KEYWORDS } from './interactive';

describe('evaluateCrisisTrigger', () => {
  describe('High priority categories', () => {
    it('should detect suicidal_ideation keywords', () => {
      const testCases = [
        'Я думаю о суициде',
        'Хочу убить себя',
        'Покончить с собой',
        'Не хочу жить',
        'Хочу умереть',
        'Это конец',
        'Хочу прыгнуть',
        'Повеситься',
        'Самоубийство',
      ];

      testCases.forEach(text => {
        const result = evaluateCrisisTrigger(text);
        expect(result).toBe('suicidal_ideation');
      });
    });

    it('should detect self_harm keywords', () => {
      const testCases = [
        'Приму таблетки все',
        'Передозировка',
        'Резать вены',
        'Порезать себя',
        'Бритва',
      ];

      testCases.forEach(text => {
        const result = evaluateCrisisTrigger(text);
        expect(result).toBe('self_harm');
      });
    });

    it('should detect violence keywords', () => {
      const testCases = [
        'Он бьёт меня',
        'Меня ударил',
        'Избил меня',
        'Насилие',
        'Изнасилование',
        'Не могу уйти',
        'Боюсь за жизнь',
        'Угрожает убить',
        'Держит силой',
      ];

      testCases.forEach(text => {
        const result = evaluateCrisisTrigger(text);
        expect(result).toBe('violence');
      });
    });
  });

  describe('Low priority categories', () => {
    it('should detect panic_like keywords', () => {
      const testCases = [
        'У меня паника',
        'Задыхаюсь',
        'Страх смерти',
        'Сердце выпрыгивает',
      ];

      testCases.forEach(text => {
        const result = evaluateCrisisTrigger(text);
        expect(result).toBe('panic_like');
      });
    });

    it('should detect minor_risk keywords', () => {
      const testCases = [
        'Мне тяжело',
        'Не справляюсь',
        'Одиноко',
      ];

      testCases.forEach(text => {
        const result = evaluateCrisisTrigger(text);
        expect(result).toBe('minor_risk');
      });
    });
  });

  describe('Priority handling', () => {
    it('should prioritize high priority categories over low priority', () => {
      // Текст содержит и high priority, и low priority ключевые слова
      const text = 'Мне тяжело, хочу убить себя';
      const result = evaluateCrisisTrigger(text);
      expect(result).toBe('suicidal_ideation'); // High priority должен быть первым
    });

    it('should prioritize suicidal_ideation over self_harm and violence', () => {
      const text = 'Хочу убить себя, резать вены, бьёт меня';
      const result = evaluateCrisisTrigger(text);
      expect(result).toBe('suicidal_ideation'); // Первый в high priority списке
    });
  });

  describe('Case insensitivity', () => {
    it('should work with uppercase text', () => {
      const result = evaluateCrisisTrigger('СУИЦИД');
      expect(result).toBe('suicidal_ideation');
    });

    it('should work with mixed case text', () => {
      const result = evaluateCrisisTrigger('ХоЧу УбИтЬ сЕбЯ');
      expect(result).toBe('suicidal_ideation');
    });
  });

  describe('Edge cases', () => {
    it('should return null for empty string', () => {
      const result = evaluateCrisisTrigger('');
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = evaluateCrisisTrigger(null as any);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = evaluateCrisisTrigger(undefined as any);
      expect(result).toBeNull();
    });

    it('should return null for text without crisis keywords', () => {
      const result = evaluateCrisisTrigger('Обычный текст без кризисных маркеров');
      expect(result).toBeNull();
    });

    it('should detect keywords in longer sentences', () => {
      const result = evaluateCrisisTrigger('Сегодня был тяжелый день, и я думаю о суициде, потому что не вижу выхода');
      expect(result).toBe('suicidal_ideation');
    });
  });

  describe('Privacy: no text in results', () => {
    it('should only return category, never the original text', () => {
      const sensitiveText = 'Я хочу убить себя прямо сейчас';
      const result = evaluateCrisisTrigger(sensitiveText);
      
      // Проверяем, что результат - это только категория, не текст
      expect(typeof result).toBe('string');
      expect(result).not.toContain(sensitiveText);
      expect(['self_harm', 'suicidal_ideation', 'violence', 'minor_risk', 'panic_like', null]).toContain(result);
    });
  });
});

describe('CRISIS_KEYWORDS', () => {
  it('should have all required categories', () => {
    const expectedCategories: CrisisTriggerType[] = [
      'self_harm',
      'suicidal_ideation',
      'violence',
      'minor_risk',
      'panic_like',
    ];

    expectedCategories.forEach(category => {
      expect(CRISIS_KEYWORDS[category]).toBeDefined();
      expect(Array.isArray(CRISIS_KEYWORDS[category])).toBe(true);
      expect(CRISIS_KEYWORDS[category].length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty keyword arrays', () => {
    Object.values(CRISIS_KEYWORDS).forEach(keywords => {
      expect(keywords.length).toBeGreaterThan(0);
      keywords.forEach(keyword => {
        expect(typeof keyword).toBe('string');
        expect(keyword.length).toBeGreaterThan(0);
      });
    });
  });
});
