import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlayerCardCondition, PlayerCardLanguage, PlayerCardOwnership } from '@/entities/PlayerCard';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import CollectionClient from './CollectionClient';
import Link from 'next/link';

const authUser = {
  getIdToken: vi.fn(async () => 'token'),
};

vi.mock('@/lib/client/useAuthUser', () => ({
  useAuthUser: vi.fn(),
}));

vi.mock('@/lib/client/useUser', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/components/client/LoginDialog', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Login dialog</div> : null,
}));

vi.mock('@/components/CardPreviewItem', () => ({
  default: ({ item }: { item: { card: { title: string } } }) => (
    <Link href="/c/0001/1">{item.card.title}</Link>
  ),
}));

describe('CollectionClient', () => {
  beforeEach(() => {
    cleanup();
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

  test('renders an empty state', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ playerCards: [], items: [] }));

    render(<CollectionClient />);

    expect(await screen.findByRole('heading', { name: /no saved cards yet/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /find cards/i }).getAttribute('href')).toBe('/cards');
  });

  test('renders saved collection items', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({
      playerCards: [makePlayerCard()],
      items: [{
        playerCard: makePlayerCard(),
        preview: {
          card: {
            id: '0001',
            version: 1,
            title: 'Lantern Knight',
            rarity: 'common',
            type: 'deck',
          },
          href: '/c/0001/1',
          previewImage: null,
        },
      }],
    }));

    render(<CollectionClient />);

    expect(await screen.findByText('Lantern Knight')).toBeDefined();
    expect(screen.getByText('Owned')).toBeDefined();
    expect(screen.getByText('1x')).toBeDefined();
  });

  test('shows an error state and retries', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(jsonResponse({ playerCards: [], items: [] }));

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

function makePlayerCard() {
  return {
    userId: 'u/player',
    cardId: '0001',
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
      ownership: PlayerCardOwnership.Owned,
    }],
  };
}
