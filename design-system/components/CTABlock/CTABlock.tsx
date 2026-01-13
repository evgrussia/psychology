import React from 'react';
import { colors, spacing, typography, effects } from '../../tokens';

export interface CTABlockProps {
  title: string;
  description: string;
  primaryCTA: React.ReactNode;
  secondaryCTA?: React.ReactNode;
}

const CTABlock: React.FC<CTABlockProps> = ({
  title,
  description,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <section style={{ padding: `${spacing.space[20]} ${spacing.space[6]}` }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: colors.brand.primary,
        borderRadius: effects.radius.lg,
        padding: `${spacing.space[16]} ${spacing.space[8]}`,
        textAlign: 'center',
        color: colors.text.onDark,
      }}>
        <h2 style={{
          ...typography.h2,
          color: colors.text.onDark,
          marginBottom: spacing.space[4],
        }}>{title}</h2>
        <p style={{
          ...typography.body.lg,
          color: colors.text.onDark,
          opacity: 0.9,
          marginBottom: spacing.space[10],
          maxWidth: '600px',
          margin: '0 auto 40px auto',
        }}>{description}</p>
        <div style={{
          display: 'flex',
          gap: spacing.space[4],
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {primaryCTA}
          {secondaryCTA}
        </div>
      </div>
    </section>
  );
};

export default CTABlock;
