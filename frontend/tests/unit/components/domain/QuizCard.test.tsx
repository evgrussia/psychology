import { render, screen } from '@testing-library/react';
import { QuizCard } from '@/components/domain/QuizCard';
import { describe, it, expect } from 'vitest';

describe('QuizCard', () => {
  const defaultProps = {
    id: '1',
    slug: 'test-quiz',
    title: 'Test Quiz',
    description: 'Test Description',
    estimated_time_minutes: 15,
  };

  it('renders correctly', () => {
    render(<QuizCard {...defaultProps} />);
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('15 мин')).toBeInTheDocument();
  });

  it('contains a link to the quiz', () => {
    render(<QuizCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: /Начать/i });
    expect(link).toHaveAttribute('href', '/quiz/test-quiz');
  });
});
