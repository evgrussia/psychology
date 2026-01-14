import React from 'react';
import { colors, spacing, typography } from '../../tokens';

export interface DisclaimerProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'warning' | 'info' | 'error' | 'success';
  showEmergencyLink?: boolean;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  title = 'Важное уведомление',
  children,
  variant = 'warning',
  showEmergencyLink = false,
}) => {
  const styles = {
    warning: {
      bg: colors.semantic.warning.light,
      border: colors.semantic.warning.DEFAULT,
      iconColor: colors.semantic.warning.dark,
      icon: '⚠️',
    },
    info: {
      bg: colors.semantic.info.light,
      border: colors.semantic.info.DEFAULT,
      iconColor: colors.semantic.info.dark,
      icon: 'ℹ️',
    },
    error: {
      bg: colors.semantic.error.light,
      border: colors.semantic.error.DEFAULT,
      iconColor: colors.semantic.error.dark,
      icon: '🚨',
    },
    success: {
      bg: colors.semantic.success.light,
      border: colors.semantic.success.DEFAULT,
      iconColor: colors.semantic.success.dark,
      icon: '✅',
    },
  };

  const currentStyle = styles[variant as keyof typeof styles] || styles.warning;

  return (
    <div
      style={{
        backgroundColor: currentStyle.bg,
        border: `1px solid ${currentStyle.border}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        boxShadow: 'var(--shadow-sm)',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: '24px', color: currentStyle.iconColor }}>
          {currentStyle.icon}
        </span>
        <h4 style={{ 
          ...typography.h4, 
          margin: 0, 
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-size-h4)',
        }}>
          {title}
        </h4>
      </div>
      <div style={{ 
        ...typography.body.md, 
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
      }}>
        {children}
      </div>
      {showEmergencyLink && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <a
            href="/emergency"
            style={{
              ...typography.body.sm,
              color: 'var(--color-error)',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
            aria-label="Перейти на страницу экстренной помощи"
          >
            Нужна экстренная помощь?
          </a>
        </div>
      )}
    </div>
  );
};
