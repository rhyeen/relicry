import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { LATEST_DECK_STORAGE_KEY } from '@/lib/decksApi';
import DecksClient from './DecksClient';

const authUser = {
  getIdToken: vi.fn(async () => 'token'),
};

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

vi.mock('@/components/ds/DSActionMenu', () => ({
  default: ({ items, trigger }: {
    items: { label: string; onClick?: () => void; disabled?: boolean }[];
    trigger: React.ReactNode;
  }) => (
    <div>
      {trigger}
      {items.map((item) => (
        <button disabled={item.disabled} key={item.label} onClick={item.onClick} type="button">
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

describe('DecksClient', () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    authUser.getIdToken.mockClear();
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: authUser } as unknown as ReturnType<typeof useAuthUser>);
    vi.stubGlobal('fetch', vi.fn());
  });

  test('shows signed-out login state', () => {
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: null });

    render(<DecksClient />);

    fireEvent.click(screen.getByRole('button', { name: /log in or sign up/i }));
    expect(screen.getByText('Login dialog')).toBeDefined();
  });

  test('loads decks and marks the local latest deck', async () => {
    window.localStorage.setItem(LATEST_DECK_STORAGE_KEY, 'dk/one');
    mockFetchResponses(jsonResponse({
      decks: [makeDeck('dk/one', 'Quest Build', 4, 3)],
    }));

    render(<DecksClient />);

    expect(await screen.findByText('Quest Build')).toBeDefined();
    expect(screen.getByText('Latest deck')).toBeDefined();
    expect(screen.getByText('4 cards')).toBeDefined();
    expect(screen.getByRole('link', { name: /open deck/i }).getAttribute('href')).toBe('/dk/one');
  });

  test('creates a deck and stores it as the latest deck', async () => {
    mockFetchResponses(
      jsonResponse({ decks: [] }),
      jsonResponse({ deck: makeDeck('dk/new', 'New Build', 0, 0).deck }),
      jsonResponse({ decks: [makeDeck('dk/new', 'New Build', 0, 0)] }),
    );

    render(<DecksClient />);

    fireEvent.click(await screen.findByRole('button', { name: /create deck/i }));
    const dialog = screen.getByRole('dialog', { name: /create deck/i });
    fireEvent.change(within(dialog).getByLabelText('Deck name'), { target: { value: 'New Build' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /^create deck$/i }));

    await waitFor(() => expect(window.localStorage.getItem(LATEST_DECK_STORAGE_KEY)).toBe('dk/new'));
    expect((vi.mocked(fetch).mock.calls[1]?.[1] as RequestInit).method).toBe('POST');
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

function makeDeck(id: string, name: string, cardCount: number, uniqueCardCount: number) {
  return {
    deck: {
      id,
      name,
      userId: 'u/1',
      cardPathIds: [],
      version: 1,
      isLatest: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
    },
    cardCount,
    uniqueCardCount,
    previews: [],
  };
}
