/**
 * Design Tokens Index
 * 
 * Централизованный экспорт всех дизайн-токенов
 */

import { colors, colorsCSS, type Colors } from './colors';
import { typography, typographyCSS, type Typography } from './typography';
import { spacing, spacingCSS, type Spacing } from './spacing';
import { effects, effectsCSS, type Effects } from './effects';
import { a11yStyles, addFocusVisibleHandlers } from './a11y';

export { 
  colors, colorsCSS, type Colors,
  typography, typographyCSS, type Typography,
  spacing, spacingCSS, type Spacing,
  effects, effectsCSS, type Effects,
  a11yStyles, addFocusVisibleHandlers
};

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
