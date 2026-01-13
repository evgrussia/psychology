/**
 * Card Component
 * 
 * Универсальный компонент карточки для отображения контента
 * 
 * @see https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System
 */

import React from 'react';
import { colors, spacing, effects } from '../../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    backgroundColor: colors.bg.primary,
    borderRadius: effects.radius.md,
    padding: spacing.space[6],
    transition: effects.transition.normal,
  };

  const variantStyles: Record<CardProps['variant'], React.CSSProperties> = {
    default: {
      border: `1px solid ${colors.border.primary}`,
    },
    elevated: {
      boxShadow: effects.shadow.md,
      border: 'none',
    },
    outlined: {
      border: `2px solid ${colors.border.secondary}`,
    },
  };

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
  };

  return (
    <div style={combinedStyles} className={className} {...props}>
      {children}
    </div>
  );
};

export default Card;
