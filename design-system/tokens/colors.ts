/**
 * Design Tokens: Colors
 * 
 * Цветовая палитра проекта «Эмоциональный баланс»
 * Источник: Figma Design System
 * 
 * @see https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: {
      DEFAULT: '#5A7A5E',      // Darker Sage Green for better accessibility
      dark: '#456148',         // Even darker for hover
      light: '#9AB89E',        // Светлый вариант для фонов
    },
    secondary: {
      DEFAULT: '#D4C5A9',      // Warm Sand — вторичный цвет
      dark: '#B8A68A',         // Тёмный вариант
      light: '#E8DBC5',        // Светлый вариант
    },
    accent: {
      DEFAULT: '#E8A87C',      // Coral — акцентный цвет
      dark: '#D18A5F',         // Тёмный вариант
      light: '#F5C4A0',        // Светлый вариант
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      DEFAULT: '#5A9B5E',
      light: '#E8F5E9',
      dark: '#3A7A3E',
    },
    warning: {
      DEFAULT: '#E8A87C',
      light: '#FFF4E8',
      dark: '#D18A5F',
    },
    error: {
      DEFAULT: '#C85A5A',
      light: '#FFEBEE',
      dark: '#A83A3A',
    },
    info: {
      DEFAULT: '#5A8A9B',
      light: '#E8F4F8',
      dark: '#3A6A7A',
    },
  },

  // Background Colors
  bg: {
    primary: '#FAF8F4',         // Основной фон (warm off-white)
    secondary: '#F5F2ED',       // Вторичный фон
    tertiary: '#EFEBE5',       // Третичный фон
    dark: '#5A7A5E',           // Тёмный фон
    overlay: 'rgba(90, 122, 94, 0.85)', // Оверлей для модальных окон
  },

  // Text Colors
  text: {
    primary: '#2A3A2E',         // Основной текст
    secondary: '#5A6A5E',       // Вторичный текст
    tertiary: '#8A9A8E',       // Третичный текст
    onDark: '#FAF8F4',         // Текст на тёмном фоне
    muted: '#AABAAE',          // Приглушённый текст
    disabled: '#CACACA',       // Деактивированный текст
  },

  // Border Colors
  border: {
    primary: '#E5E0D8',         // Основные границы
    secondary: '#D8D0C5',       // Вторичные границы
    focus: '#7A9B7E',          // Фокус (акцент)
    error: '#C85A5A',          // Ошибка
  },
} as const;

/**
 * CSS Custom Properties для использования в CSS
 */
export const colorsCSS = {
  '--color-brand-primary': colors.brand.primary.DEFAULT,
  '--color-brand-primary-dark': colors.brand.primary.dark,
  '--color-brand-primary-light': colors.brand.primary.light,
  '--color-brand-secondary': colors.brand.secondary.DEFAULT,
  '--color-brand-secondary-dark': colors.brand.secondary.dark,
  '--color-brand-secondary-light': colors.brand.secondary.light,
  '--color-brand-accent': colors.brand.accent.DEFAULT,
  '--color-brand-accent-dark': colors.brand.accent.dark,
  '--color-brand-accent-light': colors.brand.accent.light,
  '--color-success': colors.semantic.success.DEFAULT,
  '--color-success-light': colors.semantic.success.light,
  '--color-success-dark': colors.semantic.success.dark,
  '--color-warning': colors.semantic.warning.DEFAULT,
  '--color-warning-light': colors.semantic.warning.light,
  '--color-warning-dark': colors.semantic.warning.dark,
  '--color-error': colors.semantic.error.DEFAULT,
  '--color-error-light': colors.semantic.error.light,
  '--color-error-dark': colors.semantic.error.dark,
  '--color-info': colors.semantic.info.DEFAULT,
  '--color-info-light': colors.semantic.info.light,
  '--color-info-dark': colors.semantic.info.dark,
  '--color-bg-primary': colors.bg.primary,
  '--color-bg-secondary': colors.bg.secondary,
  '--color-bg-tertiary': colors.bg.tertiary,
  '--color-bg-dark': colors.bg.dark,
  '--color-bg-overlay': colors.bg.overlay,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  '--color-text-on-dark': colors.text.onDark,
  '--color-text-muted': colors.text.muted,
  '--color-text-disabled': colors.text.disabled,
  '--color-border-primary': colors.border.primary,
  '--color-border-secondary': colors.border.secondary,
  '--color-border-focus': colors.border.focus,
  '--color-border-error': colors.border.error,
} as const;

export type Colors = typeof colors;
