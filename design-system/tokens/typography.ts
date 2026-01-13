/**
 * Design Tokens: Typography
 * 
 * Типографическая система проекта «Эмоциональный баланс»
 * Источник: Figma Design System
 */

export const typography = {
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

/**
 * CSS Custom Properties для использования в CSS
 */
export const typographyCSS = {
  '--font-serif': typography.fontFamily.serif,
  '--font-sans': typography.fontFamily.sans,
  '--font-mono': typography.fontFamily.mono,
  '--font-size-hero': typography.fontSize.hero,
  '--font-size-h1': typography.fontSize.h1,
  '--font-size-h2': typography.fontSize.h2,
  '--font-size-h3': typography.fontSize.h3,
  '--font-size-h4': typography.fontSize.h4,
  '--font-size-body-lg': typography.fontSize['body-lg'],
  '--font-size-body': typography.fontSize.body,
  '--font-size-body-sm': typography.fontSize['body-sm'],
  '--font-size-caption': typography.fontSize.caption,
  '--font-weight-light': typography.fontWeight.light,
  '--font-weight-regular': typography.fontWeight.regular,
  '--font-weight-medium': typography.fontWeight.medium,
  '--font-weight-semibold': typography.fontWeight.semibold,
  '--font-weight-bold': typography.fontWeight.bold,
  '--line-height-tight': typography.lineHeight.tight,
  '--line-height-snug': typography.lineHeight.snug,
  '--line-height-normal': typography.lineHeight.normal,
  '--line-height-relaxed': typography.lineHeight.relaxed,
  '--letter-spacing-tight': typography.letterSpacing.tight,
  '--letter-spacing-normal': typography.letterSpacing.normal,
  '--letter-spacing-wide': typography.letterSpacing.wide,
  '--letter-spacing-wider': typography.letterSpacing.wider,
} as const;

export type Typography = typeof typography;
