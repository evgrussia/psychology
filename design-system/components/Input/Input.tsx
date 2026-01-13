/**
 * Input Component
 * 
 * Компонент поля ввода с поддержкой различных состояний
 * 
 * @see https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System
 */

import React from 'react';
import { colors, typography, spacing, effects } from '../../tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  const inputStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.primary,
    backgroundColor: colors.bg.primary,
    border: `1px solid ${error ? colors.semantic.error.DEFAULT : colors.border.primary}`,
    borderRadius: effects.radius.md,
    padding: `${spacing.space[3]} ${spacing.space[4]}`,
    width: fullWidth ? '100%' : 'auto',
    transition: effects.transition.normal,
    outline: 'none',
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize['body-sm'],
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.space[2],
    display: 'block',
  };

  const errorStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.semantic.error.DEFAULT,
    marginTop: spacing.space[1],
    display: 'block',
  };

  const helperStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.caption,
    color: colors.text.tertiary,
    marginTop: spacing.space[1],
    display: 'block',
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label htmlFor={inputId} style={labelStyles}>
          {label}
          {props.required && <span style={{ color: colors.semantic.error.DEFAULT }}> *</span>}
        </label>
      )}
      <input
        id={inputId}
        style={inputStyles}
        className={className}
        aria-invalid={!!error}
        aria-describedby={errorId || helperId}
        aria-required={props.required}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error
            ? colors.semantic.error.DEFAULT
            : colors.border.focus;
          e.currentTarget.style.boxShadow = effects.shadow.sm;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? colors.semantic.error.DEFAULT
            : colors.border.primary;
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && (
        <span id={errorId} role="alert" style={errorStyles}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={helperId} style={helperStyles}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
