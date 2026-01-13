/**
 * Design Tokens Index
 * 
 * Централизованный экспорт всех дизайн-токенов
 */

export { colors, colorsCSS, type Colors } from './colors';
export { typography, typographyCSS, type Typography } from './typography';
export { spacing, spacingCSS, type Spacing } from './spacing';
export { effects, effectsCSS, type Effects } from './effects';

/**
 * Все CSS Custom Properties в одном объекте
 */
export const allTokensCSS = {
  ...colorsCSS,
  ...typographyCSS,
  ...spacingCSS,
  ...effectsCSS,
} as const;

/**
 * Все токены в одном объекте
 */
export const tokens = {
  colors,
  typography,
  spacing,
  effects,
} as const;

export type Tokens = typeof tokens;
