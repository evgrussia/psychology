import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');
    
    expect(input).toHaveValue('test value');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('handles different input types', () => {
    const { rerender, container } = render(<Input type="email" />);
    let input = container.querySelector('input[type="email"]');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    input = container.querySelector('input[type="password"]');
    expect(input).toHaveAttribute('type', 'password');
  });

  describe('Accessibility', () => {
    it('has correct aria-invalid when specified', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('has correct aria-describedby when specified', () => {
      render(
        <>
          <Input aria-describedby="test-desc" />
          <div id="test-desc">Description</div>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-desc');
    });

    it('has id matching label htmlFor', () => {
      render(
        <>
          <label htmlFor="test-id">Label</label>
          <Input id="test-id" />
        </>
      );
      const input = screen.getByLabelText('Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'test-id');
    });
  });
});
