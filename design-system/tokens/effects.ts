/**
 * Design Tokens: Effects
 * 
 * Тени, границы, скругления и другие визуальные эффекты
 * Источник: Figma Design System
 */

export const effects = {
  // Border Radius
  radius: {
    sm: '6px',           // Мелкие элементы
    md: '12px',          // Карточки, поля ввода
    lg: '20px',          // Крупные контейнеры
    xl: '32px',          // Кнопки-пилюли
    pill: '9999px',      // Полное скругление
    circle: '50%',       // Круглые элементы
  },

  // Shadows
  shadow: {
    sm: '0 2px 8px rgba(42, 58, 46, 0.08)',
    md: '0 4px 16px rgba(42, 58, 46, 0.12)',
    lg: '0 8px 24px rgba(42, 58, 46, 0.16)',
    xl: '0 12px 32px rgba(42, 58, 46, 0.20)',
    inner: 'inset 0 2px 4px rgba(42, 58, 46, 0.06)',
  },

  // Transitions
  transition: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },

  // Z-Index Layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

/**
 * CSS Custom Properties для использования в CSS
 */
export const effectsCSS = {
  '--radius-sm': effects.radius.sm,
  '--radius-md': effects.radius.md,
  '--radius-lg': effects.radius.lg,
  '--radius-xl': effects.radius.xl,
  '--radius-pill': effects.radius.pill,
  '--radius-circle': effects.radius.circle,
  '--shadow-sm': effects.shadow.sm,
  '--shadow-md': effects.shadow.md,
  '--shadow-lg': effects.shadow.lg,
  '--shadow-xl': effects.shadow.xl,
  '--shadow-inner': effects.shadow.inner,
  '--transition-fast': effects.transition.fast,
  '--transition-normal': effects.transition.normal,
  '--transition-slow': effects.transition.slow,
  '--z-base': effects.zIndex.base,
  '--z-dropdown': effects.zIndex.dropdown,
  '--z-sticky': effects.zIndex.sticky,
  '--z-fixed': effects.zIndex.fixed,
  '--z-modal-backdrop': effects.zIndex.modalBackdrop,
  '--z-modal': effects.zIndex.modal,
  '--z-popover': effects.zIndex.popover,
  '--z-tooltip': effects.zIndex.tooltip,
} as const;

export type Effects = typeof effects;
