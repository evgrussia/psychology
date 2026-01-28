import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@/components/shared/ErrorState';
import { ApiError } from '@/services/api/client';

describe('ErrorState', () => {
  it('renders with default title and message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Ошибка')).toBeInTheDocument();
    expect(
      screen.getByText('Произошла ошибка. Пожалуйста, попробуйте позже.')
    ).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(<ErrorState title="Custom Error" message="Custom message" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('displays API error message correctly', () => {
    const apiError: ApiError = {
      error: {
        code: 'ERROR_CODE',
        message: 'API error message',
      },
    };
    render(<ErrorState error={apiError} />);
    expect(screen.getByText('API error message')).toBeInTheDocument();
  });

  it('displays Error object message correctly', () => {
    const error = new Error('Standard error message');
    render(<ErrorState error={error} />);
    expect(screen.getByText('Standard error message')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /попробовать снова/i });
    expect(retryButton).toBeInTheDocument();
    
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('prioritizes message prop over error', () => {
    const error = new Error('Error message');
    render(<ErrorState error={error} message="Prop message" />);
    expect(screen.getByText('Prop message')).toBeInTheDocument();
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });
});
