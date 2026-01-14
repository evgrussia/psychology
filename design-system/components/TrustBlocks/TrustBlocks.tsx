import React from 'react';
import { colors, spacing, typography } from '../../tokens';

export interface TrustItem {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface TrustBlocksProps {
  items: TrustItem[];
  title?: string;
}

const TrustBlocks: React.FC<TrustBlocksProps> = ({ items = [], title }) => {
  return (
    <section style={{ padding: `${spacing.space[20]} ${spacing.space[6]}` }}>
      {title && (
        <h2 style={{
          ...typography.h2,
          textAlign: 'center',
          marginBottom: spacing.space[12],
          color: colors.text.primary,
        }}>{title}</h2>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: spacing.space[8],
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {items.map((item) => (
          <div key={item.id} style={{ textAlign: 'center' }}>
            {item.icon && <div style={{ 
              marginBottom: spacing.space[4],
              color: colors.brand.primary.DEFAULT,
              fontSize: '2rem',
            }}>{item.icon}</div>}
            <h3 style={{
              ...typography.h3,
              marginBottom: spacing.space[2],
              color: colors.text.primary,
            }}>{item.title}</h3>
            <p style={{
              ...typography.body.md,
              color: colors.text.secondary,
              margin: 0,
            }}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBlocks;
