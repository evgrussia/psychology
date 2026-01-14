import React from 'react';
import { spacing } from '../../tokens';

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = spacing.container.maxWidth,
  padding = spacing.container.padding,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`ds-container ${className}`}
      style={{
        maxWidth,
        paddingLeft: padding,
        paddingRight: padding,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Container;
