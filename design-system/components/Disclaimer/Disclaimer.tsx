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
        borderRadius: '8px',
        padding: spacing.space[4],
        marginBottom: spacing.space[6],
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.space[2],
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.space[2] }}>
        <span style={{ fontSize: '20px', color: currentStyle.iconColor }}>
          {currentStyle.icon}
        </span>
        <h4 style={{ ...typography.h4, margin: 0, color: colors.text.primary }}>
          {title}
        </h4>
      </div>
      <div style={{ ...typography.body.md, color: colors.text.secondary }}>
        {children}
      </div>
      {showEmergencyLink && (
        <div style={{ marginTop: spacing.space[2] }}>
          <a
            href="/emergency"
            style={{
              ...typography.body.sm,
              color: colors.semantic.error.dark,
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
