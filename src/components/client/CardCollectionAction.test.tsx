import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlayerCardCondition, PlayerCardLanguage, PlayerCardOwnership } from '@/entities/PlayerCard';
import { useAuthUser } from '@/lib/client/useAuthUser';
import CardCollectionAction from './CardCollectionAction';

const authUser = {
  getIdToken: vi.fn(async () => 'token'),
};

vi.mock('@/lib/client/useAuthUser', () => ({
  useAuthUser: vi.fn(),
}));

vi.mock('@/lib/client/signInClient', () => ({
  signOutUser: vi.fn(async () => undefined),
}));

vi.mock('@/components/client/LoginDialog', () => ({
  default: ({ open }: { open: boolean }) => open ? <div role="dialog">Login dialog</div> : null,
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
  default: ({ children, items, trigger }: {
    children?: React.ReactNode;
    items: { label: string; href?: string; onClick?: () => void; disabled?: boolean }[];
    trigger: React.ReactNode;
  }) => (
    <div>
      {trigger}
      {children}
      {items.map((item) => item.href ? (
        <a href={item.href} key={item.label}>{item.label}</a>
      ) : (
        <button disabled={item.disabled} key={item.label} onClick={item.onClick} type="button">
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/ds/DSNumberField', () => ({
  default: ({ disabled, label, onChange, value }: {
    disabled?: boolean;
    label: string;
    onChange?: (value: number | null) => void;
    value?: number | null;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        disabled={disabled}
        type="number"
        value={value ?? ''}
        onChange={(event) => onChange?.(Number(event.currentTarget.value))}
      />
    </label>
  ),
}));

describe('CardCollectionAction', () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: authUser } as unknown as ReturnType<typeof useAuthUser>);
    authUser.getIdToken.mockClear();
    vi.stubGlobal('fetch', vi.fn());
  });

  test('shows login guidance and opens the login dialog for signed out players', () => {
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: null });

    render(<CardCollectionAction cardId="0001" cardVersionId={1} />);

    fireEvent.click(screen.getByRole('button', { name: /log in to save this card/i }));
    expect(screen.getByText(/log in or create an account/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(screen.getByText('Login dialog')).toBeDefined();
  });

  test('saves selected physical copy quantity for unsaved cards', async () => {
    mockFetchResponses(
      jsonResponse({ playerCard: null }),
      jsonResponse({ playerCard: makePlayerCard(PlayerCardOwnership.Owned, 3) }),
    );

    render(<CardCollectionAction cardId="0001" cardVersionId={1} />);

    fireEvent.change(await screen.findByLabelText('Quantity'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /save physical copy/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse((vi.mocked(fetch).mock.calls[1]?.[1] as RequestInit).body as string);
    expect(body.individuals).toHaveLength(3);
    expect(body.individuals[0].ownership).toBe(PlayerCardOwnership.Owned);
  });

  test('saves wishlist entries for unsaved cards', async () => {
    mockFetchResponses(
      jsonResponse({ playerCard: null }),
      jsonResponse({ playerCard: makePlayerCard(PlayerCardOwnership.WishList, 1) }),
    );

    render(<CardCollectionAction cardId="0001" cardVersionId={1} />);

    fireEvent.click(await screen.findByRole('button', { name: /wishlist it/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse((vi.mocked(fetch).mock.calls[1]?.[1] as RequestInit).body as string);
    expect(body.individuals).toHaveLength(1);
    expect(body.individuals[0].ownership).toBe(PlayerCardOwnership.WishList);
  });

  test('shows saved-card actions and removes the card', async () => {
    mockFetchResponses(
      jsonResponse({ playerCard: makePlayerCard(PlayerCardOwnership.Owned, 2) }),
      jsonResponse({ ok: true }),
    );

    render(<CardCollectionAction cardId="0001" cardVersionId={1} />);

    expect(await screen.findByText('2 copies saved')).toBeDefined();
    expect((await screen.findByRole('link', { name: /view collection/i })).getAttribute('href')).toBe('/collection');

    fireEvent.click(screen.getByRole('button', { name: /edit details/i }));
    expect(screen.getByRole('dialog', { name: /edit collection details/i })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /remove from collection/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect((vi.mocked(fetch).mock.calls[1]?.[1] as RequestInit).method).toBe('DELETE');
  });

  test('shows an error FAB that reveals recovery details', async () => {
    mockFetchResponses(new Response('{}', { status: 500 }));

    render(<CardCollectionAction cardId="0001" cardVersionId={1} />);

    fireEvent.click(await screen.findByRole('button', { name: /review collection error/i }));
    expect(screen.getByText(/log out and log back in/i)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /dismiss error/i }));
    expect(screen.getByRole('button', { name: /save physical copy/i })).toBeDefined();
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

function makePlayerCard(ownership: PlayerCardOwnership, quantity: number) {
  return {
    userId: 'u/player',
    cardId: '0001',
    cardVersion: 1,
    updatedAt: new Date().toISOString(),
    individuals: Array.from({ length: quantity }, () => ({
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
    })),
  };
}
