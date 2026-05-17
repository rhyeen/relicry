import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Aspect } from '@/entities/Aspect';
import { Rarity } from '@/entities/Rarity';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { LATEST_DECK_STORAGE_KEY } from '@/lib/decksApi';
import DeckDetailClient from './DeckDetailClient';

const authUser = {
  getIdToken: vi.fn(async () => 'token'),
};
const routerPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@zxing/browser', () => ({
  BrowserQRCodeReader: class {
    async decodeFromVideoDevice() {
      return { stop: vi.fn() };
    }
  },
}));

vi.mock('@/lib/client/useAuthUser', () => ({
  useAuthUser: vi.fn(),
}));

vi.mock('@/components/client/LoginDialog', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Login dialog</div> : null,
}));

vi.mock('@/components/CardPreviewItem', () => ({
  default: ({ item }: { item: { card: { title: string } } }) => <div>{item.card.title}</div>,
}));

vi.mock('@/components/ds/DSDialog', () => ({
  default: ({ actions, content, open, title }: {
    actions?: React.ReactNode;
    content?: React.ReactNode;
    open?: boolean;
    title?: string;
  }) => open ? (
    <div role="dialog" aria-label={title}>
      <h2>{title}</h2>
      {content}
      {actions}
    </div>
  ) : null,
}));

describe('DeckDetailClient', () => {
  beforeEach(() => {
    cleanup();
    routerPush.mockClear();
    authUser.getIdToken.mockClear();
    window.localStorage.clear();
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: authUser } as unknown as ReturnType<typeof useAuthUser>);
    vi.stubGlobal('fetch', vi.fn());
  });

  test('loads deck details and stores the deck as latest', async () => {
    mockFetchResponses(jsonResponse(makeDetail()));

    render(<DeckDetailClient deckId="one" />);

    expect(await screen.findByText('Quest Build')).toBeDefined();
    expect(screen.getByText('Deck Card')).toBeDefined();
    expect(screen.getByText('2x')).toBeDefined();
    expect(window.localStorage.getItem(LATEST_DECK_STORAGE_KEY)).toBe('dk/one');
  });

  test('adds a manually scanned card URL to the deck', async () => {
    mockFetchResponses(
      jsonResponse(makeDetail()),
      jsonResponse({ deck: makeDetail().deck }),
      jsonResponse(makeDetail()),
    );

    render(<DeckDetailClient deckId="one" />);

    await screen.findByText('Quest Build');
    fireEvent.change(screen.getByLabelText('Card QR URL'), { target: { value: 'https://relicry.com/c/0003/1' } });
    fireEvent.click(screen.getByRole('button', { name: /add card/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    const request = vi.mocked(fetch).mock.calls[1]!;
    expect(request[0]).toBe('/api/decks/one/cards');
    expect((request[1] as RequestInit).method).toBe('POST');
    expect(JSON.parse((request[1] as RequestInit).body as string)).toMatchObject({
      cardId: '0003',
      cardVersion: 1,
    });
  });

  test('imports missing deck cards into collection', async () => {
    mockFetchResponses(
      jsonResponse(makeDetail()),
      jsonResponse({ created: 1, existing: 1, skipped: 0 }),
    );

    render(<DeckDetailClient deckId="one" />);

    fireEvent.click(await screen.findByRole('button', { name: /add all missing to collection/i }));

    await waitFor(() => expect(screen.getByText(/added 1 missing cards/i)).toBeDefined());
    expect(vi.mocked(fetch).mock.calls[1]?.[0]).toBe('/api/decks/one/collection-import');
  });
});

function mockFetchResponses(...responses: Response[]) {
  vi.mocked(fetch).mockImplementation(async () => {
    const response = responses.shift();
    if (!response) throw new Error('Unexpected fetch');
    return response;
  });
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeDetail() {
  return {
    deck: {
      id: 'dk/one',
      name: 'Quest Build',
      userId: 'u/1',
      cardPathIds: ['c/0001/1', 'c/0001/1'],
      version: 1,
      isLatest: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
    entries: [{
      cardPathId: 'c/0001/1',
      cardId: '0001',
      cardVersion: 1,
      count: 2,
      preview: {
        card: {
          id: '0001',
          version: 1,
          title: 'Deck Card',
          rarity: Rarity.Common,
          type: 'deck' as const,
          aspect: Aspect.Brave,
          drawLimit: 1,
          scrapCost: [],
        },
        href: '/c/0001/1',
        previewImage: null,
      },
    }],
    cardCount: 2,
    uniqueCardCount: 1,
    skippedCardPathIds: [],
  };
}
