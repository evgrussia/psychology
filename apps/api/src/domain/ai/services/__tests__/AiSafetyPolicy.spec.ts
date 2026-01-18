import { AiSafetyPolicy } from '../AiSafetyPolicy';

describe('AiSafetyPolicy', () => {
  const policy = new AiSafetyPolicy();

  it('refuses when age is not confirmed', () => {
    const decision = policy.evaluate({
      surface: 'next_step',
      ageConfirmed: false,
      consentSensitive: false,
      text: '',
    });

    expect(decision.status).toBe('refuse');
    expect(decision.refusalReason).toBe('underage');
  });

  it('refuses when sensitive text without consent', () => {
    const decision = policy.evaluate({
      surface: 'next_step',
      ageConfirmed: true,
      consentSensitive: false,
      text: 'Мне очень плохо',
    });

    expect(decision.status).toBe('refuse');
    expect(decision.refusalReason).toBe('sensitive_without_consent');
  });

  it('detects crisis trigger', () => {
    const decision = policy.evaluate({
      surface: 'next_step',
      ageConfirmed: true,
      consentSensitive: true,
      text: 'Мне очень плохо, думаю о суициде',
    });

    expect(decision.status).toBe('crisis');
    expect(decision.crisisTrigger).toBe('suicidal_ideation');
  });

  it('refuses medication requests', () => {
    const decision = policy.evaluate({
      surface: 'concierge',
      ageConfirmed: true,
      consentSensitive: true,
      text: 'Подскажите, какие таблетки пить',
    });

    expect(decision.status).toBe('refuse');
    expect(decision.refusalReason).toBe('medication_request');
  });

  it('allows neutral inputs', () => {
    const decision = policy.evaluate({
      surface: 'next_step',
      ageConfirmed: true,
      consentSensitive: false,
      text: '',
    });

    expect(decision.status).toBe('allow');
  });
});
