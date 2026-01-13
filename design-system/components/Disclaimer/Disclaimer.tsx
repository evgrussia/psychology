import React from 'react';
import { colors, spacing, typography } from '../../tokens';

export interface DisclaimerProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'warning' | 'info';
  showEmergencyLink?: boolean;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  title = 'Важное уведомление',
  children,
  variant = 'warning',
  showEmergencyLink = false,
}) => {
  const variantStyles = {
    warning: {
      bg: colors.semantic.warning.light,
      border: colors.semantic.warning.DEFAULT,
      iconColor: colors.semantic.warning.dark,
    },
    info: {
      bg: colors.semantic.info.light,
      border: colors.semantic.info.DEFAULT,
      iconColor: colors.semantic.info.dark,
    },
  }[variant];

  return (
    <div
      style={{
        backgroundColor: variantStyles.bg,
        border: `1px solid ${variantStyles.border}`,
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
        <span style={{ fontSize: '20px', color: variantStyles.iconColor }}>
          {variant === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <h4 style={{ ...typography.h4, margin: 0, color: colors.text.primary }}>
          {title}
        </h4>
      </div>
      <div style={{ ...typography.body, color: colors.text.secondary }}>
        {children}
      </div>
      {showEmergencyLink && (
        <div style={{ marginTop: spacing.space[2] }}>
          <a
            href="/emergency"
            style={{
              ...typography.bodySmall,
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
