import React from 'react';
import { spacing, colors } from '../../tokens';

export interface SectionProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'dark' | 'transparent';
  spacingSize?: 'sm' | 'md' | 'lg' | 'none';
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const Section: React.FC<SectionProps> = ({
  children,
  variant = 'transparent',
  spacingSize = 'md',
  className = '',
  style = {},
  id,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return colors.bg.primary;
      case 'secondary': return colors.bg.secondary;
      case 'tertiary': return colors.bg.tertiary;
      case 'dark': return colors.bg.dark;
      case 'transparent': return 'transparent';
      default: return 'transparent';
    }
  };

  const getPadding = () => {
    switch (spacingSize) {
      case 'sm': return `${spacing.space[10]} 0`;
      case 'md': return `${spacing.space[20]} 0`;
      case 'lg': return `${spacing.space[32]} 0`;
      case 'none': return '0';
      default: return `${spacing.space[20]} 0`;
    }
  };

  return (
    <section
      id={id}
      className={`ds-section ds-section--${variant} ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        padding: getPadding(),
        width: '100%',
        ...style,
      }}
    >
      {children}
    </section>
  );
};

export default Section;
