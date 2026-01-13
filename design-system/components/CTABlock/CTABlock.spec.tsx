import { render, screen } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import CTABlock from './CTABlock';

describe('CTABlock', () => {
  it('renders title and description', () => {
    render(
      <CTABlock
        title="Готовы сделать первый шаг?"
        description="Выберите удобный способ начать"
        primaryCTA={<button>Primary</button>}
      />
    );

    expect(screen.getByText('Готовы сделать первый шаг?')).toBeInTheDocument();
    expect(screen.getByText('Выберите удобный способ начать')).toBeInTheDocument();
  });

  it('renders primary CTA', () => {
    render(
      <CTABlock
        title="Test"
        description="Test"
        primaryCTA={<button>Записаться</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Записаться' })).toBeInTheDocument();
  });

  it('renders secondary CTA when provided', () => {
    render(
      <CTABlock
        title="Test"
        description="Test"
        primaryCTA={<button>Primary</button>}
        secondaryCTA={<button>Secondary</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
  });

  it('works without secondary CTA', () => {
    render(
      <CTABlock
        title="Test"
        description="Test"
        primaryCTA={<button>Primary</button>}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
  });
});
