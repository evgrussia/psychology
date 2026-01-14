'use client';

import React from 'react';
import Card from '../Card/Card';
import { colors, spacing, typography, effects, a11yStyles } from '../../tokens';

export interface TopicCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

const TopicCard: React.FC<TopicCardProps> = ({
  title,
  description,
  icon,
  onClick,
  href,
}) => {
  const content = (
    <div style={{ padding: 'var(--space-2)' }}>
      {icon && <div style={{ marginBottom: 'var(--space-4)', fontSize: '2rem' }}>{icon}</div>}
      <h3 style={{
        ...typography.h3,
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-2)',
      }}>{title}</h3>
      {description && (
        <p style={{
          ...typography.body.sm,
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}>{description}</p>
      )}
    </div>
  );

  const cardStyle: React.CSSProperties = {
    cursor: (onClick || href) ? 'pointer' : 'default',
    textAlign: 'center',
    height: '100%',
    transition: 'var(--transition-normal)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (href) {
    return (
      <Card variant="elevated" style={cardStyle}>
        <a 
          href={href} 
          style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'block',
            outline: 'none',
          }}
          aria-label={`Перейти к теме: ${title}`}
          onClick={(e) => {
            if (onClick) onClick();
          }}
          onFocus={(e) => {
            // Add focus-visible styling
            if (e.currentTarget.matches(':focus-visible')) {
              e.currentTarget.style.outline = a11yStyles.focusVisible.outline;
              e.currentTarget.style.outlineOffset = a11yStyles.focusVisible.outlineOffset;
              e.currentTarget.style.borderRadius = a11yStyles.focusVisible.borderRadius;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {content}
        </a>
      </Card>
    );
  }

  if (onClick) {
    return (
      <Card 
        variant="elevated" 
        style={cardStyle}
      >
        <button
          onClick={onClick}
          style={{
            background: 'none',
            border: 'none',
            width: '100%',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'inherit',
            outline: 'none',
          }}
          aria-label={`Выбрать тему: ${title}`}
          onFocus={(e) => {
            if (e.currentTarget.matches(':focus-visible')) {
              e.currentTarget.style.outline = a11yStyles.focusVisible.outline;
              e.currentTarget.style.outlineOffset = a11yStyles.focusVisible.outlineOffset;
              e.currentTarget.style.borderRadius = a11yStyles.focusVisible.borderRadius;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {content}
        </button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={cardStyle}>
      {content}
    </Card>
  );
};

export default TopicCard;
