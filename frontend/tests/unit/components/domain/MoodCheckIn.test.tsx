import { render, screen, fireEvent, act } from '@testing-library/react';
import { MoodCheckIn } from '@/components/domain/MoodCheckIn';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('MoodCheckIn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<MoodCheckIn />);
    expect(screen.getByText('Как вы себя чувствуете сегодня?')).toBeInTheDocument();
    expect(screen.getByLabelText('Отлично')).toBeInTheDocument();
    expect(screen.getByLabelText('Очень плохо')).toBeInTheDocument();
  });

  it('selects a mood and shows note field', () => {
    render(<MoodCheckIn />);
    const moodButton = screen.getByLabelText('Отлично');
    fireEvent.click(moodButton);
    expect(moodButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Заметка (необязательно)')).toBeInTheDocument();
  });

  it('saves mood and shows success message', async () => {
    render(<MoodCheckIn />);
    fireEvent.click(screen.getByLabelText('Отлично'));
    fireEvent.click(screen.getByRole('button', { name: /Сохранить/i }));

    expect(screen.getByText('Спасибо за запись!')).toBeInTheDocument();

    // Verify it reverts after timeout
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Как вы себя чувствуете сегодня?')).toBeInTheDocument();
  });

  it('allows adding another entry manually from success screen', () => {
    render(<MoodCheckIn />);
    fireEvent.click(screen.getByLabelText('Отлично'));
    fireEvent.click(screen.getByRole('button', { name: /Сохранить/i }));
    
    fireEvent.click(screen.getByRole('button', { name: /Добавить ещё запись/i }));
    expect(screen.getByText('Как вы себя чувствуете сегодня?')).toBeInTheDocument();
  });
});
