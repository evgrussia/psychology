import { render, screen } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import TopicCard from './TopicCard';

describe('TopicCard', () => {
  it('renders with title and description', () => {
    render(
      <TopicCard
        title="Тревога"
        description="Помощь с тревогой"
      />
    );

    expect(screen.getByText('Тревога')).toBeInTheDocument();
    expect(screen.getByText('Помощь с тревогой')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <TopicCard
        title="Тревога"
        icon={<span data-testid="icon">🔒</span>}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders as link when href is provided', () => {
    render(
      <TopicCard
        title="Тревога"
        href="/topics/anxiety"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/topics/anxiety');
  });

  it('does not render description when not provided', () => {
    const { container } = render(
      <TopicCard title="Тревога" />
    );

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('applies cursor pointer when onClick or href provided', () => {
    const { container } = render(
      <TopicCard
        title="Тревога"
        onClick={() => {}}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.cursor).toBe('pointer');
  });
});
