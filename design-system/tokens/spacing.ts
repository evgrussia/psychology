/**
 * Design Tokens: Spacing
 * 
 * Система отступов и размеров проекта «Эмоциональный баланс»
 * Основана на 8px grid system
 * Источник: Figma Design System
 */

export const spacing = {
  // Base scale (8px grid)
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },

  // Layout
  container: {
    maxWidth: '1280px',
    padding: '24px', // space-6
  },

  section: {
    spacing: '80px', // space-20
  },

  element: {
    spacing: '32px', // space-8
  },
} as const;

/**
 * CSS Custom Properties для использования в CSS
 */
export const spacingCSS = {
  '--space-1': spacing.space[1],
  '--space-2': spacing.space[2],
  '--space-3': spacing.space[3],
  '--space-4': spacing.space[4],
  '--space-5': spacing.space[5],
  '--space-6': spacing.space[6],
  '--space-8': spacing.space[8],
  '--space-10': spacing.space[10],
  '--space-12': spacing.space[12],
  '--space-16': spacing.space[16],
  '--space-20': spacing.space[20],
  '--space-24': spacing.space[24],
  '--space-32': spacing.space[32],
  '--container-max-width': spacing.container.maxWidth,
  '--container-padding': spacing.container.padding,
  '--section-spacing': spacing.section.spacing,
  '--element-spacing': spacing.element.spacing,
} as const;

export type Spacing = typeof spacing;
