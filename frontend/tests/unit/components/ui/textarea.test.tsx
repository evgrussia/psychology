import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
  });

  it('has accessibility attributes when specified', () => {
    render(
      <>
        <label htmlFor="test-textarea">Label</label>
        <Textarea 
          id="test-textarea" 
          aria-invalid="true" 
          aria-describedby="error-msg" 
        />
        <div id="error-msg">Error</div>
      </>
    );
    
    const textarea = screen.getByLabelText('Label');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', 'error-msg');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });
});
