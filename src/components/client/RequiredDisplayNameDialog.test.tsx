import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { signOutUser } from '@/lib/client/signInClient';
import { reloadCurrentPage } from '@/lib/client/pageRefresh';
import RequiredDisplayNameDialog from './RequiredDisplayNameDialog';

vi.mock('@/lib/client/useAuthUser', () => ({
  useAuthUser: vi.fn(),
}));

vi.mock('@/lib/client/signInClient', () => ({
  signOutUser: vi.fn(async () => undefined),
}));

vi.mock('@/lib/client/pageRefresh', () => ({
  reloadCurrentPage: vi.fn(),
}));

const authUser = {
  getIdToken: vi.fn(async () => 'token'),
};

const namelessUser = {
  id: 'u/player',
  firebaseUid: 'firebase-player',
  displayName: '',
  email: 'player@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  archivedAt: null,
  adminRoles: [],
  startersObtained: {},
  activeEvent: null,
};

describe('RequiredDisplayNameDialog', () => {
  beforeEach(() => {
    authUser.getIdToken.mockClear();
    vi.mocked(signOutUser).mockClear();
    vi.mocked(reloadCurrentPage).mockClear();
    vi.mocked(useAuthUser).mockReturnValue({
      ready: true,
      user: authUser,
    } as unknown as ReturnType<typeof useAuthUser>);
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ user: { ...namelessUser, displayName: 'Player One' } }),
    })));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test('requires saving a display name or signing out', () => {
    render(<RequiredDisplayNameDialog ready user={namelessUser} />);

    expect(screen.getByText('Choose a Display Name')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Close dialog' })).toBeNull();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /save name/i }));

    expect(screen.getByText('Enter a display name.')).toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('shows an error when the display name has fewer than two letters', () => {
    render(<RequiredDisplayNameDialog ready user={namelessUser} />);

    fireEvent.change(screen.getByRole('textbox', { name: /display name/i }), {
      target: { value: '  c.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save name/i }));

    expect(screen.getByText('Display name must contain at least 2 letters.')).toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('saves the display name and refreshes the page', async () => {
    const onSaved = vi.fn();
    render(<RequiredDisplayNameDialog ready user={namelessUser} onSaved={onSaved} />);

    fireEvent.change(screen.getByRole('textbox', { name: /display name/i }), {
      target: { value: '  Player One  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save name/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ displayName: 'Player One' }),
    })));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('Player One'));
    expect(reloadCurrentPage).toHaveBeenCalledTimes(1);
  });

  test('signs out from the forced dialog', async () => {
    render(<RequiredDisplayNameDialog ready user={namelessUser} />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(signOutUser).toHaveBeenCalledTimes(1));
  });
});
