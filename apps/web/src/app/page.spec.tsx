import { render, screen, waitFor } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach } from 'vitest';
import Page from './page';

// Mock fetch globally
global.fetch = vi.fn();

// Mock HomeClient component
vi.mock('./HomeClient', () => ({
  default: ({ data }: any) => (
    <div data-testid="home-client">
      <h1>Mocked HomeClient</h1>
      <div data-testid="topics-count">{data.topics.length}</div>
      <div data-testid="interactives-count">{data.featured_interactives.length}</div>
      <div data-testid="trust-blocks-count">{data.trust_blocks.length}</div>
    </div>
  ),
}));

describe('Home Page (Server Component)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with API data successfully', async () => {
    const mockApiResponse = {
      topics: [
        { code: 'anxiety', title: 'Тревога' },
        { code: 'burnout', title: 'Выгорание' },
      ],
      featured_interactives: [
        { id: '1', type: 'quiz', slug: 'test-quiz', title: 'Test Quiz' },
      ],
      trust_blocks: [
        { id: 'confidentiality', title: 'Конфиденциальность', description: 'Test' },
        { id: 'how_it_works', title: 'Как это работает', description: 'Test' },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const PageComponent = await Page();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByTestId('home-client')).toBeInTheDocument();
      expect(screen.getByTestId('topics-count')).toHaveTextContent('2');
      expect(screen.getByTestId('interactives-count')).toHaveTextContent('1');
      expect(screen.getByTestId('trust-blocks-count')).toHaveTextContent('2');
    });
  });

  it('renders with fallback data when API fails', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

    const PageComponent = await Page();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByTestId('home-client')).toBeInTheDocument();
      // Fallback should have 3 topics
      expect(screen.getByTestId('topics-count')).toHaveTextContent('3');
      // Fallback should have 0 interactives
      expect(screen.getByTestId('interactives-count')).toHaveTextContent('0');
      // Fallback should have 2 trust blocks
      expect(screen.getByTestId('trust-blocks-count')).toHaveTextContent('2');
    });
  });

  it('handles API timeout gracefully', async () => {
    (global.fetch as any).mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
    );

    const PageComponent = await Page();
    render(PageComponent);

    await waitFor(() => {
      expect(screen.getByTestId('home-client')).toBeInTheDocument();
      // Should use fallback data
      expect(screen.getByTestId('topics-count')).toHaveTextContent('3');
    });
  });
});

