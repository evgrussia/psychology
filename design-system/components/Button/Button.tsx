'use client';

/**
 * Button Component
 * 
 * Универсальный компонент кнопки с поддержкой различных вариантов стилей
 * 
 * @see https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System
 */

import React from 'react';
import { colors, typography, spacing, effects, a11yStyles } from '../../tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const combinedStyles: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    border: variant === 'tertiary' ? `1px solid var(--color-border-primary)` : 'none',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-normal)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
    padding: size === 'sm' ? 'var(--space-2) var(--space-4)' : 
             size === 'lg' ? 'var(--space-4) var(--space-8)' : 
             'var(--space-3) var(--space-6)',
    fontSize: size === 'sm' ? 'var(--font-size-body-sm)' : 
              size === 'lg' ? 'var(--font-size-body-lg)' : 
              'var(--font-size-body)',
    backgroundColor: variant === 'primary' ? 'var(--color-brand-primary)' :
                     variant === 'secondary' ? 'var(--color-brand-secondary)' :
                     'transparent',
    color: variant === 'primary' ? 'var(--color-text-on-dark)' : 'var(--color-text-primary)',
    boxShadow: (variant === 'primary' || variant === 'secondary') ? 'var(--shadow-sm)' : 'none',
    ...(isFocused && a11yStyles.focusVisible),
    ...style,
  };

  const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.brand.primary.dark,
      boxShadow: effects.shadow.md,
    },
    secondary: {
      backgroundColor: colors.brand.secondary.dark,
      boxShadow: effects.shadow.md,
    },
    tertiary: {
      borderColor: colors.brand.primary.DEFAULT,
    },
    ghost: {
      backgroundColor: colors.bg.secondary,
    },
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.brand.primary.DEFAULT,
      boxShadow: effects.shadow.sm,
    },
    secondary: {
      backgroundColor: colors.brand.secondary.DEFAULT,
      boxShadow: effects.shadow.sm,
    },
    tertiary: {
      backgroundColor: 'transparent',
      borderColor: colors.border.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled || loading}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      {...props}
    >
      {loading && <span>⏳</span>}
      {children}
    </button>
  );
};

export default Button;
