import { render, screen, fireEvent } from '@testing-library/react';
import { BookingSlot } from '@/components/domain/BookingSlot';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('BookingSlot', () => {
  const defaultProps = {
    id: '1',
    start_at: '2026-01-28T10:00:00Z',
    end_at: '2026-01-28T11:00:00Z',
    status: 'available' as const,
  };

  let onClick: any;

  beforeEach(() => {
    onClick = vi.fn();
  });

  it('renders correctly with start and end time', () => {
    render(<BookingSlot {...defaultProps} onClick={onClick} />);
    // The test environment seems to use UTC
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('— 11:00')).toBeInTheDocument();
  });

  it('calls onClick when clicked and available', () => {
    render(<BookingSlot {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not call onClick when unavailable', () => {
    render(<BookingSlot {...defaultProps} status="booked" onClick={onClick} />);
    const card = screen.queryByRole('button');
    if (card) {
      fireEvent.click(card);
    }
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByText('Занято')).toBeInTheDocument();
  });

  it('handles keyboard events (Enter/Space)', () => {
    render(<BookingSlot {...defaultProps} onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('shows unavailable status', () => {
    render(<BookingSlot {...defaultProps} status="unavailable" onClick={onClick} />);
    expect(screen.getByText('Недоступно')).toBeInTheDocument();
  });
});
