import { render, screen, fireEvent } from '@testing-library/react';
import { ContentModuleTile } from '@/components/domain/ContentModuleTile';
import { describe, it, expect, vi } from 'vitest';

describe('ContentModuleTile', () => {
  const defaultProps = {
    title: 'Test Module',
    description: 'Test Description',
    duration: '20 min',
    onClick: vi.fn(),
  };

  it('renders correctly', () => {
    render(<ContentModuleTile {...defaultProps} />);
    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('20 min')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Начать/i })).toBeInTheDocument();
  });

  it('shows progress and correct button text in-progress status', () => {
    render(
      <ContentModuleTile
        {...defaultProps}
        status="in-progress"
        progress={50}
        imageUrl="test.jpg"
      />
    );
    expect(screen.getByText('50% пройдено')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Продолжить/i })).toBeInTheDocument();
  });

  it('shows completed status', () => {
    render(<ContentModuleTile {...defaultProps} status="completed" imageUrl="test.jpg" />);
    expect(screen.getByText('Пройдено')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Пройти снова/i })).toBeInTheDocument();
  });

  it('shows locked status and disables button', () => {
    render(<ContentModuleTile {...defaultProps} status="locked" imageUrl="test.jpg" />);
    expect(screen.getByText('Заблокировано')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Недоступно/i });
    expect(button).toBeDisabled();
  });

  it('calls onClick when button is clicked', () => {
    render(<ContentModuleTile {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalled();
  });
});
