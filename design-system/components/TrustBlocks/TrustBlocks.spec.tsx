import { render, screen } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import TrustBlocks from './TrustBlocks';

describe('TrustBlocks', () => {
  const mockItems = [
    {
      id: 'confidentiality',
      title: 'Конфиденциальность',
      description: 'Ваши данные под защитой',
      icon: '🔒',
    },
    {
      id: 'how_it_works',
      title: 'Как это работает',
      description: '3 шага к балансу',
      icon: '🤝',
    },
  ];

  it('renders all trust blocks', () => {
    render(<TrustBlocks items={mockItems} />);

    expect(screen.getByText('Конфиденциальность')).toBeInTheDocument();
    expect(screen.getByText('Как это работает')).toBeInTheDocument();
    expect(screen.getByText('Ваши данные под защитой')).toBeInTheDocument();
    expect(screen.getByText('3 шага к балансу')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<TrustBlocks items={mockItems} title="Почему мне можно доверять" />);

    expect(screen.getByText('Почему мне можно доверять')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const { container } = render(<TrustBlocks items={mockItems} />);

    const h2 = container.querySelector('h2');
    expect(h2).not.toBeInTheDocument();
  });

  it('renders icons when provided', () => {
    render(<TrustBlocks items={mockItems} />);

    expect(screen.getByText('🔒')).toBeInTheDocument();
    expect(screen.getByText('🤝')).toBeInTheDocument();
  });

  it('renders without icons when not provided', () => {
    const itemsWithoutIcons = mockItems.map(({ icon, ...rest }) => rest);
    
    const { container } = render(<TrustBlocks items={itemsWithoutIcons} />);

    expect(screen.getByText('Конфиденциальность')).toBeInTheDocument();
    expect(container.textContent).not.toContain('🔒');
  });

  it('renders correct number of blocks', () => {
    const { container } = render(<TrustBlocks items={mockItems} />);

    // Каждый блок имеет h3
    const blocks = container.querySelectorAll('h3');
    expect(blocks).toHaveLength(2);
  });
});
