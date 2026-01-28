import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/shared/EmptyState';

describe('EmptyState', () => {
  it('renders with default title and message', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText('Пусто')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<EmptyState title="Custom Title" message="Custom message" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('shows action button when action is provided', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    
    render(
      <EmptyState
        message="No items"
        action={{
          label: 'Create Item',
          onClick: handleAction,
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: /create item/i });
    expect(button).toBeInTheDocument();
    
    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not show action button when action is not provided', () => {
    render(<EmptyState message="No items" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
