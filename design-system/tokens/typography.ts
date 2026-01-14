/**
 * Design Tokens: Typography
 * 
 * Типографическая система проекта «Эмоциональный баланс»
 * Источник: Figma Design System
 */

const baseTypography = {
  // Font Families
  fontFamily: {
    serif: "'Lora', 'Georgia', 'Times New Roman', serif",
    sans: "'Inter', 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    mono: "'Fira Code', 'Consolas', 'Monaco', monospace",
  },

  // Font Sizes
  fontSize: {
    hero: 'clamp(48px, 6vw, 72px)',      // Hero заголовки
    h1: 'clamp(36px, 4.5vw, 48px)',      // H1
    h2: 'clamp(28px, 3.5vw, 36px)',      // H2
    h3: 'clamp(24px, 3vw, 28px)',        // H3
    h4: 'clamp(20px, 2.5vw, 24px)',      // H4
    'body-lg': '18px',                   // Крупный body
    body: '16px',                         // Основной body
    'body-sm': '14px',                   // Мелкий текст
    caption: '12px',                     // Caption/метки
  },

  // Font Weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,      // Заголовки
    snug: 1.4,       // Подзаголовки
    normal: 1.6,     // Body текст
    relaxed: 1.8,    // Комфортное чтение
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',    // Крупные заголовки
    normal: '0',         // Обычный текст
    wide: '0.02em',      // Заглавные буквы, мелкий текст
    wider: '0.05em',     // Uppercase текст
  },
} as const;

// Combined styles for convenience
export const textStyles = {
  hero: {
    fontFamily: baseTypography.fontFamily.serif,
    fontSize: baseTypography.fontSize.hero,
    fontWeight: baseTypography.fontWeight.bold,
    lineHeight: baseTypography.lineHeight.tight,
    letterSpacing: baseTypography.letterSpacing.tight,
  },
  h1: {
    fontFamily: baseTypography.fontFamily.serif,
    fontSize: baseTypography.fontSize.h1,
    fontWeight: baseTypography.fontWeight.bold,
    lineHeight: baseTypography.lineHeight.snug,
    letterSpacing: baseTypography.letterSpacing.tight,
  },
  h2: {
    fontFamily: baseTypography.fontFamily.sans,
    fontSize: baseTypography.fontSize.h2,
    fontWeight: baseTypography.fontWeight.semibold,
    lineHeight: baseTypography.lineHeight.snug,
  },
  h3: {
    fontFamily: baseTypography.fontFamily.sans,
    fontSize: baseTypography.fontSize.h3,
    fontWeight: baseTypography.fontWeight.semibold,
    lineHeight: baseTypography.lineHeight.snug,
  },
  h4: {
    fontFamily: baseTypography.fontFamily.sans,
    fontSize: baseTypography.fontSize.h4,
    fontWeight: baseTypography.fontWeight.medium,
    lineHeight: baseTypography.lineHeight.normal,
  },
  bodyLg: {
    fontFamily: baseTypography.fontFamily.sans,
    fontSize: baseTypography.fontSize['body-lg'],
    fontWeight: baseTypography.fontWeight.regular,
    lineHeight: baseTypography.lineHeight.relaxed,
  },
  body: {
    fontFamily: baseTypography.fontFamily.sans,
    fontSize: baseTypography.fontSize.body,
    fontWeight: baseTypography.fontWeight.regular,
    lineHeight: baseTypography.lineHeight.normal,
  },
  bodySm: {
    fontFamily: baseTypography.fontFamily.sans,
    fontSize: baseTypography.fontSize['body-sm'],
    fontWeight: baseTypography.fontWeight.regular,
    lineHeight: baseTypography.lineHeight.normal,
  },
  caption: {
    fontFamily: baseTypography.fontFamily.sans,
    fontSize: baseTypography.fontSize.caption,
    fontWeight: baseTypography.fontWeight.regular,
    lineHeight: baseTypography.lineHeight.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: baseTypography.letterSpacing.wider,
  },
} as const;

export const typography = {
  ...baseTypography,
  ...textStyles,
  body: {
    lg: textStyles.bodyLg,
    md: textStyles.body,
    sm: textStyles.bodySm,
  },
} as const;

/**
 * CSS Custom Properties для использования в CSS
 */
export const typographyCSS = {
  '--font-serif': baseTypography.fontFamily.serif,
  '--font-sans': baseTypography.fontFamily.sans,
  '--font-mono': baseTypography.fontFamily.mono,
  '--font-size-hero': baseTypography.fontSize.hero,
  '--font-size-h1': baseTypography.fontSize.h1,
  '--font-size-h2': baseTypography.fontSize.h2,
  '--font-size-h3': baseTypography.fontSize.h3,
  '--font-size-h4': baseTypography.fontSize.h4,
  '--font-size-body-lg': baseTypography.fontSize['body-lg'],
  '--font-size-body': baseTypography.fontSize.body,
  '--font-size-body-sm': baseTypography.fontSize['body-sm'],
  '--font-size-caption': baseTypography.fontSize.caption,
  '--font-weight-light': baseTypography.fontWeight.light,
  '--font-weight-regular': baseTypography.fontWeight.regular,
  '--font-weight-medium': baseTypography.fontWeight.medium,
  '--font-weight-semibold': baseTypography.fontWeight.semibold,
  '--font-weight-bold': baseTypography.fontWeight.bold,
  '--line-height-tight': baseTypography.lineHeight.tight,
  '--line-height-snug': baseTypography.lineHeight.snug,
  '--line-height-normal': baseTypography.lineHeight.normal,
  '--line-height-relaxed': baseTypography.lineHeight.relaxed,
  '--letter-spacing-tight': baseTypography.letterSpacing.tight,
  '--letter-spacing-normal': baseTypography.letterSpacing.normal,
  '--letter-spacing-wide': baseTypography.letterSpacing.wide,
  '--letter-spacing-wider': baseTypography.letterSpacing.wider,
} as const;

export type Typography = typeof typography;
