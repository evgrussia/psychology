import React from 'react';
import { colors, spacing, typography } from '../../tokens';
import Button from '../Button/Button';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string;
  primaryCTA?: React.ReactNode;
  secondaryCTA?: React.ReactNode;
}

import { Container } from '../Layout';

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <Container>
      <div style={{
        textAlign: 'center',
        padding: `${spacing.space[16]} 0`,
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <p style={{
          ...typography.h3,
          color: colors.brand.primary.DEFAULT,
          marginBottom: spacing.space[4],
          margin: 0,
        }}>{subtitle}</p>
        <h1 style={{
          ...typography.hero,
          color: colors.text.primary,
          marginBottom: spacing.space[6],
        }}>{title}</h1>
        {description && (
          <p style={{
            ...typography.body.lg,
            color: colors.text.secondary,
            marginBottom: spacing.space[10],
          }}>{description}</p>
        )}
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
    </Container>
  );
};

export default HeroSection;
