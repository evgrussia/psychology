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
  style,
  ...props
}) => {
  const combinedStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-primary)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-6)',
    transition: 'var(--transition-normal)',
    border: variant === 'outlined' ? '2px solid var(--color-border-secondary)' : 
            variant === 'default' ? '1px solid var(--color-border-primary)' : 'none',
    boxShadow: variant === 'elevated' ? 'var(--shadow-md)' : 'none',
    ...style,
  };

  return (
    <div style={combinedStyles} className={className} {...props}>
      {children}
    </div>
  );
};

export default Card;
