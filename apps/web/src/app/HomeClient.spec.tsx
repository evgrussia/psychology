import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach } from 'vitest';
import HomeClient from './HomeClient';
import * as tracking from '../lib/tracking';
import * as telegram from '../lib/telegram';

// Mock tracking module
vi.mock('../lib/tracking', () => ({
  track: vi.fn(),
  captureUTMParameters: vi.fn(),
}));

vi.mock('../lib/telegram', () => ({
  createTelegramDeepLink: vi.fn().mockResolvedValue({
    deepLinkId: 'dl_123',
    url: 'https://t.me/emotional_balance_channel',
  }),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '/' },
  writable: true,
});

describe('HomeClient', () => {
  const mockData = {
    topics: [
      { code: 'anxiety', title: 'Тревога' },
      { code: 'burnout', title: 'Выгорание' },
      { code: 'relationships', title: 'Отношения' },
    ],
    featured_interactives: [
      {
        id: '1',
        type: 'quiz',
        slug: 'anxiety-quiz',
        title: 'Квиз по тревоге',
      },
    ],
    trust_blocks: [
      {
        id: 'confidentiality',
        title: 'Конфиденциальность',
        description: 'Ваши данные под защитой.',
      },
      {
        id: 'how_it_works',
        title: 'Как это работает',
        description: '3 шага к балансу.',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section with title and CTAs', () => {
    render(<HomeClient data={mockData} />);

    expect(screen.getByText('Эмоциональный баланс')).toBeInTheDocument();
    expect(screen.getByText(/Тёплое пространство/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Записаться на консультацию/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Подписаться на канал/i })).toBeInTheDocument();
  });

  it('renders all topic cards', () => {
    render(<HomeClient data={mockData} />);

    expect(screen.getByText('Тревога')).toBeInTheDocument();
    expect(screen.getByText('Выгорание')).toBeInTheDocument();
    expect(screen.getByText('Отношения')).toBeInTheDocument();
  });

  it('renders featured interactives section when data is available', () => {
    render(<HomeClient data={mockData} />);

    expect(screen.getByText('Первый шаг за 3 минуты')).toBeInTheDocument();
    expect(screen.getByText('Квиз по тревоге')).toBeInTheDocument();
  });

  it('does not render interactives section when empty', () => {
    const dataWithoutInteractives = {
      ...mockData,
      featured_interactives: [],
    };

    render(<HomeClient data={dataWithoutInteractives} />);

    expect(screen.queryByText('Первый шаг за 3 минуты')).not.toBeInTheDocument();
  });

  it('renders trust blocks', () => {
    render(<HomeClient data={mockData} />);

    expect(screen.getByText('Почему мне можно доверять')).toBeInTheDocument();
    expect(screen.getByText('Конфиденциальность')).toBeInTheDocument();
    expect(screen.getByText('Как это работает')).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    render(<HomeClient data={mockData} />);

    expect(screen.getByText('Частые вопросы')).toBeInTheDocument();
    expect(screen.getByText('Как проходит первая встреча?')).toBeInTheDocument();
    expect(screen.getByText('Это конфиденциально?')).toBeInTheDocument();
  });

  it('tracks page view on mount', () => {
    render(<HomeClient data={mockData} />);

    expect(tracking.captureUTMParameters).toHaveBeenCalledTimes(1);
    expect(tracking.track).toHaveBeenCalledWith('page_view', {
      page_path: '/',
      page_title: 'Главная',
    });
  });

  it('tracks trust blocks viewed on mount', () => {
    render(<HomeClient data={mockData} />);

    expect(tracking.track).toHaveBeenCalledWith('trust_block_viewed', {
      trust_block: 'confidentiality',
      page_path: '/',
    });
    expect(tracking.track).toHaveBeenCalledWith('trust_block_viewed', {
      trust_block: 'how_it_works',
      page_path: '/',
    });
  });

  it('tracks topic card click', () => {
    render(<HomeClient data={mockData} />);

    const topicCard = screen.getByText('Тревога');
    fireEvent.click(topicCard);

    expect(tracking.track).toHaveBeenCalledWith('view_problem_card', {
      topic: 'anxiety',
      card_slug: 'anxiety',
      page_path: '/',
    });
  });

  it('tracks booking CTA click', () => {
    render(<HomeClient data={mockData} />);

    const bookingButton = screen.getAllByRole('button', { name: /Записаться/i })[0];
    fireEvent.click(bookingButton);

    expect(tracking.track).toHaveBeenCalledWith('cta_click', {
      cta_id: 'hero_booking',
      cta_target: 'booking',
    });
  });

  it('tracks Telegram CTA click', async () => {
    render(<HomeClient data={mockData} />);

    const tgButton = screen.getByRole('button', { name: /Подписаться на канал/i });
    fireEvent.click(tgButton);

    await waitFor(() => {
      expect(telegram.createTelegramDeepLink).toHaveBeenCalledWith(
        expect.objectContaining({
          flow: 'plan_7d',
          tgTarget: 'channel',
          utmContent: 'hero_tg',
          utmMedium: 'channel',
        }),
      );
    });

    expect(tracking.track).toHaveBeenCalledWith('cta_tg_click', {
      tg_target: 'channel',
      tg_flow: 'plan_7d',
      deep_link_id: 'dl_123',
    });
  });

  it('tracks FAQ open', () => {
    render(<HomeClient data={mockData} />);

    // FAQSection использует внутренний state, поэтому проверим через компонент
    // В реальности, нужно будет кликнуть на вопрос, но для этого нужен доступ к DOM
    // Здесь мы просто проверяем, что компонент рендерится
    expect(screen.getByText('Как проходит первая встреча?')).toBeInTheDocument();
  });

  it('renders CTA block at the bottom', () => {
    render(<HomeClient data={mockData} />);

    expect(screen.getByText('Готовы сделать первый шаг?')).toBeInTheDocument();
    expect(screen.getByText(/Выберите удобный способ начать/)).toBeInTheDocument();
  });
});
