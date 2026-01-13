import { render, screen } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import HeroSection from './HeroSection';

describe('HeroSection', () => {
  it('renders title and subtitle', () => {
    render(
      <HeroSection
        title="Эмоциональный баланс"
        subtitle="Тёплое пространство"
      />
    );

    expect(screen.getByText('Эмоциональный баланс')).toBeInTheDocument();
    expect(screen.getByText('Тёплое пространство')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <HeroSection
        title="Test"
        subtitle="Test"
        description="Помогаю справиться с тревогой"
      />
    );

    expect(screen.getByText('Помогаю справиться с тревогой')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(
      <HeroSection
        title="Test"
        subtitle="Test"
      />
    );

    // Проверяем что есть только заголовок и подзаголовок
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('renders primary CTA button', () => {
    render(
      <HeroSection
        title="Test"
        subtitle="Test"
        primaryCTA={<button>Записаться</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Записаться' })).toBeInTheDocument();
  });

  it('renders secondary CTA button', () => {
    render(
      <HeroSection
        title="Test"
        subtitle="Test"
        secondaryCTA={<button>Telegram</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Telegram' })).toBeInTheDocument();
  });

  it('renders both CTAs when provided', () => {
    render(
      <HeroSection
        title="Test"
        subtitle="Test"
        primaryCTA={<button>Primary</button>}
        secondaryCTA={<button>Secondary</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
  });

  it('uses semantic HTML with correct heading levels', () => {
    const { container } = render(
      <HeroSection
        title="Main Title"
        subtitle="Subtitle"
      />
    );

    // H1 должен быть для главного заголовка
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe('Main Title');

    // Subtitle должен быть <p>, не <h2>
    const p = container.querySelector('p');
    expect(p).toBeInTheDocument();
    expect(p?.textContent).toBe('Subtitle');
  });
});
