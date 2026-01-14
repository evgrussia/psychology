import React from 'react';
import { colors, spacing, typography, effects } from '../../tokens';

export interface CTABlockProps {
  title: string;
  description: string;
  primaryCTA: React.ReactNode;
  secondaryCTA?: React.ReactNode;
}

import { Container } from '../Layout';

const CTABlock: React.FC<CTABlockProps> = ({
  title,
  description,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <Container>
      <div style={{
        backgroundColor: 'var(--color-brand-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-12) var(--space-8)',
        textAlign: 'center',
        color: 'var(--color-text-on-dark)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h2 style={{
          ...typography.h2,
          color: 'var(--color-text-on-dark)',
          marginBottom: 'var(--space-4)',
        }}>{title}</h2>
        <p style={{
          ...typography.body.lg,
          color: 'var(--color-text-on-dark)',
          opacity: 0.9,
          marginBottom: 'var(--space-8)',
          maxWidth: '600px',
          margin: '0 auto var(--space-8) auto',
        }}>{description}</p>
        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {primaryCTA}
          {secondaryCTA}
        </div>
      </div>
    </Container>
  );
};

export default CTABlock;
