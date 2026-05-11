import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Aspect } from '@/entities/Aspect';
import { Rarity } from '@/entities/Rarity';
import { CardListAspectFilter, CardListTypeFilter, DEFAULT_CARDS_FILTERS } from '@/lib/cardsList';
import { CardsPreviewResponse } from '@/lib/cardsApi';
import CardsBrowserClient from './CardsBrowserClient';

let currentSearch = '';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

function buildPreviewResponse(title: string): CardsPreviewResponse {
  return {
    items: [
      {
        href: '/c/test/1',
        previewImage: null,
        card: {
          id: 'c/test',
          version: 1,
          title,
          rarity: Rarity.Common,
          type: 'deck',
          drawLimit: 1,
          aspect: Aspect.Brave,
        },
      },
    ],
    page: 1,
    totalPages: 1,
    totalCards: 1,
    pageSize: 24,
    nextCursor: null,
  };
}

describe('CardsBrowserClient', () => {
  beforeEach(() => {
    currentSearch = '';
    vi.restoreAllMocks();
  });

  it('fetches preview results for deep-linked filters after hydration', async () => {
    currentSearch = '?query=filtered&type=focus';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => buildPreviewResponse('Filtered Card'),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <CardsBrowserClient
        initialFilters={DEFAULT_CARDS_FILTERS}
        initialResponse={buildPreviewResponse('Default Card')}
        typeOptions={[
          { label: 'All cards', value: 'all' as CardListTypeFilter },
          { label: 'Focus', value: 'focus' as CardListTypeFilter },
        ]}
        aspectOptions={[
          { label: 'All aspects', value: 'all' as CardListAspectFilter },
          { label: 'Brave', value: Aspect.Brave },
        ]}
      />
    );

    expect(screen.getByText('Default Card')).toBeDefined();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/cards?query=filtered&type=focus&view=preview');
    });

    await waitFor(() => {
      expect(screen.getByText('Filtered Card')).toBeDefined();
    });
  });
});
