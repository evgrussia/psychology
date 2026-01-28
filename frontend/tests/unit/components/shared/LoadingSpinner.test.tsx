import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, ArticleCardSkeleton } from '@/components/shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders correctly with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender, container } = render(<LoadingSpinner size="sm" />);
    let spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="md" />);
    spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-6', 'w-6');

    rerender(<LoadingSpinner size="lg" />);
    spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('custom-class');
  });
});

describe('ArticleCardSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<ArticleCardSkeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton?.querySelectorAll('.bg-muted')).toHaveLength(3);
  });
});
