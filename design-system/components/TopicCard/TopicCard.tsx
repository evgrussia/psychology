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
    <>
      {icon && <div style={{ marginBottom: spacing.space[4] }}>{icon}</div>}
      <h3 style={{
        ...typography.h3,
        color: colors.text.primary,
        marginBottom: spacing.space[2],
      }}>{title}</h3>
      {description && (
        <p style={{
          ...typography.body.sm,
          color: colors.text.secondary,
        }}>{description}</p>
      )}
    </>
  );

  const focusStyles = {
    outline: 'none',
    ':focus-visible': a11yStyles.focusVisible,
  };

  const cardStyle = {
    cursor: (onClick || href) ? 'pointer' : 'default',
    textAlign: 'center' as const,
    height: '100%',
    transition: effects.transition.normal,
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
