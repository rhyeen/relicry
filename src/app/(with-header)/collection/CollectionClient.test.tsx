import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Aspect } from '@/entities/Aspect';
import { Rarity } from '@/entities/Rarity';
import { PlayerCardCondition, PlayerCardLanguage, PlayerCardOwnership } from '@/entities/PlayerCard';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import CollectionClient from './CollectionClient';

let currentSearch = '';
let cachedSearch = '';
let cachedSearchParams = new URLSearchParams();

const authUser = {
  getIdToken: vi.fn(async () => 'token'),
};

vi.mock('next/navigation', () => ({
  useSearchParams: () => {
    const search = window.location.search || currentSearch;
    if (search !== cachedSearch) {
      cachedSearch = search;
      cachedSearchParams = new URLSearchParams(search);
    }
    return cachedSearchParams;
  },
}));

vi.mock('@/lib/client/useAuthUser', () => ({
  useAuthUser: vi.fn(),
}));

vi.mock('@/lib/client/useUser', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/components/client/LoginDialog', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Login dialog</div> : null,
}));

vi.mock('../cards/CardsToolbar', () => ({
  default: ({ disabled, onApply, onClear, onQueryChange }: {
    disabled?: boolean;
    onApply: () => void;
    onClear: () => void;
    onQueryChange: (value: string) => void;
  }) => (
    <div>
      <button disabled={disabled} onClick={() => {
        onQueryChange('Deck');
      }} type="button">Set mocked filter</button>
      <button disabled={disabled} onClick={onApply} type="button">Apply mocked filter</button>
      <button disabled={disabled} onClick={onClear} type="button">Clear mocked filter</button>
    </div>
  ),
}));

vi.mock('@/components/CardPreviewItem', () => ({
  default: ({ item }: { item: { card: { title: string } } }) => (
    <button type="button">{item.card.title}</button>
  ),
}));

vi.mock('@/components/client/CardCollectionAction', () => ({
  default: ({ cardId, initialPlayerCard, onPlayerCardChange, trigger }: {
    cardId: string;
    initialPlayerCard: unknown;
    onPlayerCardChange: (value: ReturnType<typeof makePlayerCard> | null) => void;
    trigger: ReactNode;
  }) => (
    <div>
      {trigger}
      <button
        type="button"
        onClick={() => onPlayerCardChange(initialPlayerCard ? null : makePlayerCard(cardId, PlayerCardOwnership.Owned))}
      >
        {initialPlayerCard ? 'Remove mocked card' : 'Save mocked card'}
      </button>
    </div>
  ),
}));

describe('CollectionClient', () => {
  beforeEach(() => {
    cleanup();
    currentSearch = '';
    cachedSearch = '';
    cachedSearchParams = new URLSearchParams();
    window.history.replaceState(null, '', '/collection');
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: authUser } as unknown as ReturnType<typeof useAuthUser>);
    vi.mocked(useUser).mockReturnValue({
      ready: true,
      user: {
        id: 'u/player',
        displayName: 'Player',
      },
    } as ReturnType<typeof useUser>);
    authUser.getIdToken.mockClear();
    vi.stubGlobal('fetch', vi.fn());
  });

  test('asks signed-out players to log in', () => {
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: null });
    vi.mocked(useUser).mockReturnValue({ ready: true, user: null } as ReturnType<typeof useUser>);

    render(<CollectionClient />);

    expect(screen.getByRole('heading', { name: /log in to view your collection/i })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /log in or sign up/i }));
    expect(screen.getByText('Login dialog')).toBeDefined();
  });

  test('loads the signed-in collection by default', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(buildListResponse([
      makeCollectionItem('0001', 'Deck Card 1', makePlayerCard('0001', PlayerCardOwnership.Owned)),
    ])));

    render(<CollectionClient />);

    expect(await screen.findByText('Deck Card 1')).toBeDefined();
    expect(fetch).toHaveBeenCalledWith('/api/player-card', expect.objectContaining({
      headers: { Authorization: 'Bearer token' },
    }));
    expect(screen.getByText('Owned')).toBeDefined();
    expect(screen.getByText('1x')).toBeDefined();
  });

  test('applies filters through the collection URL and request', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(buildListResponse([
        makeCollectionItem('0001', 'Deck Card 1', makePlayerCard('0001', PlayerCardOwnership.Owned)),
      ])))
      .mockResolvedValueOnce(jsonResponse(buildListResponse([
        makeCollectionItem('0002', 'Filtered Deck', makePlayerCard('0002', PlayerCardOwnership.LookingToSell)),
      ])));

    render(<CollectionClient />);

    expect(await screen.findByText('Deck Card 1')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /set mocked filter/i }));
    fireEvent.click(screen.getByRole('button', { name: /apply mocked filter/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith('/api/player-card?query=Deck', expect.anything());
    });
    expect(window.location.pathname + window.location.search).toBe('/collection?query=Deck');
  });

  test('toggles to all cards and desaturates unsaved cards', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(buildListResponse([
        makeCollectionItem('0001', 'Deck Card 1', makePlayerCard('0001', PlayerCardOwnership.Owned)),
      ])))
      .mockResolvedValueOnce(jsonResponse(buildListResponse([
        makeCollectionItem('0001', 'Deck Card 1', makePlayerCard('0001', PlayerCardOwnership.Owned)),
        makeCollectionItem('0002', 'Unsaved Card', null),
      ])));

    render(<CollectionClient />);

    expect(await screen.findByText('Deck Card 1')).toBeDefined();
    fireEvent.click(screen.getByRole('tab', { name: /all cards/i }));

    expect(await screen.findByText('Unsaved Card')).toBeDefined();
    expect(fetch).toHaveBeenLastCalledWith('/api/player-card?scope=all', expect.anything());
    expect(screen.getByText('Not saved')).toBeDefined();
  });

  test('updates visible items when collection actions change a card', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(buildListResponse([
      makeCollectionItem('0001', 'Deck Card 1', makePlayerCard('0001', PlayerCardOwnership.Owned)),
    ])));

    render(<CollectionClient />);

    expect(await screen.findByText('Deck Card 1')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /remove mocked card/i }));

    expect(await screen.findByRole('heading', { name: /no saved cards matched/i })).toBeDefined();
  });

  test('shows an error state and retries', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(jsonResponse(buildListResponse([])));

    render(<CollectionClient />);

    expect(await screen.findByRole('heading', { name: /collection unavailable/i })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildListResponse(items: ReturnType<typeof makeCollectionItem>[]) {
  return {
    playerCards: items.map((item) => item.playerCard).filter(Boolean),
    items,
    page: 1,
    totalPages: 1,
    totalCards: items.length,
    pageSize: 24,
    nextCursor: null,
  };
}

function makeCollectionItem(
  id: string,
  title: string,
  playerCard: ReturnType<typeof makePlayerCard> | null,
) {
  return {
    playerCard,
    preview: {
      card: {
        id,
        version: 1,
        title,
        rarity: Rarity.Common,
        type: 'deck' as const,
        drawLimit: 1,
        aspect: Aspect.Brave,
      },
      href: `/c/${id}/1`,
      previewImage: null,
    },
  };
}

function makePlayerCard(cardId: string, ownership: PlayerCardOwnership) {
  return {
    userId: 'u/player',
    cardId,
    cardVersion: 1,
    updatedAt: new Date().toISOString(),
    individuals: [{
      condition: PlayerCardCondition.NearMint,
      language: PlayerCardLanguage.English,
      graded: null,
      signedByIllustrator: false,
      signedByAuthor: false,
      notes: '',
      acquiredAt: new Date().toISOString(),
      acquiredFrom: '',
      foiled: false,
      ownership,
    }],
  };
}
