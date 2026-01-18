import { AiCrisisTriggerType, AiRefusalReason, AiSurface } from '@domain/ai/value-objects/AiEnums';

const DEFAULT_DISCLAIMER =
  'Я не ставлю диагноз и не заменяю консультацию специалиста. Если вам нужна срочная помощь, обратитесь в экстренные службы.';

export const buildCrisisResponse = (trigger: AiCrisisTriggerType, _surface: AiSurface) => {
  return {
    status: 'crisis' as const,
    message:
      'Похоже, сейчас вам может быть нужна срочная поддержка. Я не могу помогать в кризисных ситуациях через этот формат.',
    disclaimer: DEFAULT_DISCLAIMER,
    crisis: {
      trigger,
      actions: [
        { id: 'call_112', label: 'Позвонить 112', href: 'tel:112' },
        { id: 'hotline', label: 'Горячая линия', href: 'tel:88002000122' },
        { id: 'tell_someone', label: 'Сказать близкому', href: '/emergency' },
        { id: 'back_to_resources', label: 'Вернуться к материалам', href: '/resources' },
      ],
    },
  };
};

export const buildRefusalResponse = (reason: AiRefusalReason) => {
  const messages: Record<AiRefusalReason, string> = {
    underage:
      'Я работаю только со взрослыми (18+). Если вы несовершеннолетний(яя), лучше обратиться к доверенному взрослому или в службы поддержки.',
    sensitive_without_consent:
      'Чтобы работать с чувствительным текстом, нужно отдельное согласие. Вы можете продолжить без описаний или включить согласие.',
    diagnosis_request:
      'Я не могу ставить диагнозы. Могу помочь с безопасным первым шагом или подсказать, как записаться на консультацию.',
    medication_request:
      'Я не даю рекомендации по лекарствам. Могу предложить безопасные шаги и рассказать о записи к специалисту.',
    therapy_request:
      'Я не провожу терапию в чате. Могу помочь выбрать следующий шаг или оформить запись.',
    out_of_scope:
      'Этот запрос выходит за рамки безопасных сценариев. Я могу подсказать следующий шаг или связать вас со специалистом.',
  };

  return {
    status: 'refused' as const,
    message: messages[reason] || messages.out_of_scope,
    disclaimer: DEFAULT_DISCLAIMER,
    refusal_reason: reason,
  };
};

export const getDefaultDisclaimer = () => DEFAULT_DISCLAIMER;
