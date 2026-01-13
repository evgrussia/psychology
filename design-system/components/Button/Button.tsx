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
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
    border: 'none',
    borderRadius: effects.radius.pill,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: effects.transition.normal,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.space[2],
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    outline: 'none', // Remove default outline, will add focus-visible
  };

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      fontSize: typography.fontSize['body-sm'],
      padding: `${spacing.space[2]} ${spacing.space[4]}`,
    },
    md: {
      fontSize: typography.fontSize.body,
      padding: `${spacing.space[3]} ${spacing.space[6]}`,
    },
    lg: {
      fontSize: typography.fontSize['body-lg'],
      padding: `${spacing.space[4]} ${spacing.space[8]}`,
    },
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.brand.primary.DEFAULT,
      color: colors.text.onDark,
      boxShadow: effects.shadow.sm,
    },
    secondary: {
      backgroundColor: colors.brand.secondary.DEFAULT,
      color: colors.text.primary,
      boxShadow: effects.shadow.sm,
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: colors.brand.primary.DEFAULT,
      border: `1px solid ${colors.border.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
    },
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

  const [isFocused, setIsFocused] = React.useState(false);
  
  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isFocused && a11yStyles.focusVisible),
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
