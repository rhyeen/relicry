import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useUser } from '@/lib/client/useUser';
import { signOutUser } from '@/lib/client/signInClient';
import { buildUniversalScanQrImageSrc } from '@/lib/scanQr';
import ProfileMenu from './ProfileMenu';

vi.mock('@/lib/client/useUser', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/lib/client/signInClient', () => ({
  signOutUser: vi.fn(async () => undefined),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('ProfileMenu', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({
      ready: true,
      user: {
        id: 'u/abcDef123',
        displayName: 'Player',
      },
    } as ReturnType<typeof useUser>);
    vi.mocked(signOutUser).mockClear();
  });

  test('opens a QR dialog with profile and sign out actions', async () => {
    render(<ProfileMenu displayName="Player" />);

    fireEvent.click(screen.getByRole('button', { name: 'Player profile menu' }));

    const qr = await screen.findByAltText('Relicry player scan QR code');
    expect(qr.getAttribute('src')).toBe(buildUniversalScanQrImageSrc('u/abcDef123'));
    expect(screen.getByRole('link', { name: /view profile/i }).getAttribute('href')).toBe('/profile');
    expect(screen.getByRole('button', { name: /sign out/i })).toBeDefined();
  });

  test('signs out from the dialog', async () => {
    render(<ProfileMenu displayName="Player" />);

    fireEvent.click(screen.getByRole('button', { name: 'Player profile menu' }));
    fireEvent.click(await screen.findByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(signOutUser).toHaveBeenCalledTimes(1));
  });
});
