'use client';

import React, { useState } from 'react';
import { colors, spacing, typography, effects } from '../../tokens';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  onItemToggle?: (id: string, isOpen: boolean) => void;
}

const FAQSection: React.FC<FAQSectionProps> = ({ items, title = 'Частые вопросы', onItemToggle }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    const isOpening = openId !== id;
    setOpenId(isOpening ? id : null);
    if (onItemToggle) {
      onItemToggle(id, isOpening);
    }
  };

  return (
    <section style={{ 
      padding: `${spacing.space[20]} ${spacing.space[6]}`,
      backgroundColor: colors.bg.primary 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          ...typography.h2,
          textAlign: 'center',
          marginBottom: spacing.space[12],
          color: colors.text.primary,
        }}>{title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.space[4] }}>
          {items.map((item) => (
            <div 
              key={item.id} 
              style={{
                borderBottom: `1px solid ${colors.border.primary}`,
                paddingBottom: spacing.space[4],
              }}
            >
              <button
                onClick={() => handleToggle(item.id)}
                aria-expanded={openId === item.id}
                aria-controls={`faq-answer-${item.id}`}
                id={`faq-question-${item.id}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  padding: `${spacing.space[4]} 0`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  ...typography.h4,
                  color: colors.text.primary,
                }}
              >
                {item.question}
                <span style={{ 
                  transition: effects.transition.normal,
                  transform: openId === item.id ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>
              {openId === item.id && (
                <div 
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-question-${item.id}`}
                  style={{
                    padding: `${spacing.space[2]} 0 ${spacing.space[4]}`,
                    ...typography.body,
                    color: colors.text.secondary,
                  }}
                >
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
