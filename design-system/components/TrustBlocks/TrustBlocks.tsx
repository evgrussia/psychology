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

import { Container } from '../Layout';

const TrustBlocks: React.FC<TrustBlocksProps> = ({ items = [], title }) => {
  return (
    <Container>
      {title && (
        <h2 style={{
          ...typography.h2,
          textAlign: 'center',
          marginBottom: 'var(--space-12)',
          color: 'var(--color-text-primary)',
        }}>{title}</h2>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-8)',
      }}>
        {items.map((item) => (
          <div key={item.id} style={{ 
            textAlign: 'center',
            padding: 'var(--space-6)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {item.icon && <div style={{ 
              marginBottom: 'var(--space-4)',
              color: 'var(--color-brand-primary)',
              fontSize: '2.5rem',
            }}>{item.icon}</div>}
            <h3 style={{
              ...typography.h3,
              marginBottom: 'var(--space-2)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-h4)',
            }}>{item.title}</h3>
            <p style={{
              ...typography.body.md,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}>{item.description}</p>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default TrustBlocks;
