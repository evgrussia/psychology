import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import FAQSection from './FAQSection';

describe('FAQSection', () => {
  const mockItems = [
    {
      id: '1',
      question: 'Как проходит встреча?',
      answer: 'Встреча длится 50 минут',
    },
    {
      id: '2',
      question: 'Это конфиденциально?',
      answer: 'Да, всё конфиденциально',
    },
  ];

  it('renders with default title', () => {
    render(<FAQSection items={mockItems} />);

    expect(screen.getByText('Частые вопросы')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<FAQSection items={mockItems} title="Мои вопросы" />);

    expect(screen.getByText('Мои вопросы')).toBeInTheDocument();
  });

  it('renders all questions', () => {
    render(<FAQSection items={mockItems} />);

    expect(screen.getByText('Как проходит встреча?')).toBeInTheDocument();
    expect(screen.getByText('Это конфиденциально?')).toBeInTheDocument();
  });

  it('does not show answers by default', () => {
    render(<FAQSection items={mockItems} />);

    expect(screen.queryByText('Встреча длится 50 минут')).not.toBeInTheDocument();
    expect(screen.queryByText('Да, всё конфиденциально')).not.toBeInTheDocument();
  });

  it('shows answer when question is clicked', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    fireEvent.click(question1Button);

    expect(screen.getByText('Встреча длится 50 минут')).toBeInTheDocument();
  });

  it('hides answer when question is clicked again', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    
    // Открываем
    fireEvent.click(question1Button);
    expect(screen.getByText('Встреча длится 50 минут')).toBeInTheDocument();

    // Закрываем
    fireEvent.click(question1Button);
    expect(screen.queryByText('Встреча длится 50 минут')).not.toBeInTheDocument();
  });

  it('shows only one answer at a time', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    const question2Button = screen.getByRole('button', { name: /Это конфиденциально\?/ });

    // Открываем первый вопрос
    fireEvent.click(question1Button);
    expect(screen.getByText('Встреча длится 50 минут')).toBeInTheDocument();

    // Открываем второй вопрос - первый должен закрыться
    fireEvent.click(question2Button);
    expect(screen.queryByText('Встреча длится 50 минут')).not.toBeInTheDocument();
    expect(screen.getByText('Да, всё конфиденциально')).toBeInTheDocument();
  });

  it('renders buttons for accessibility', () => {
    render(<FAQSection items={mockItems} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should have aria-expanded="false" by default', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    expect(question1Button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should update aria-expanded to "true" when opened', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    fireEvent.click(question1Button);

    expect(question1Button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should have aria-controls linking to answer', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    expect(question1Button).toHaveAttribute('aria-controls', 'faq-answer-1');
  });

  it('should have id on answer element matching aria-controls', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    fireEvent.click(question1Button);

    const answer = screen.getByText('Встреча длится 50 минут');
    expect(answer).toHaveAttribute('id', 'faq-answer-1');
    expect(answer).toHaveAttribute('role', 'region');
  });

  it('should have aria-labelledby on answer element', () => {
    render(<FAQSection items={mockItems} />);

    const question1Button = screen.getByRole('button', { name: /Как проходит встреча\?/ });
    fireEvent.click(question1Button);

    const answer = screen.getByText('Встреча длится 50 минут');
    expect(answer).toHaveAttribute('aria-labelledby', 'faq-question-1');
    expect(question1Button).toHaveAttribute('id', 'faq-question-1');
  });
});
