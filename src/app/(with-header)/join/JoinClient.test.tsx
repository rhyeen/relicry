import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import JoinClient from './JoinClient';
import { useUser } from '@/lib/client/useUser';

vi.mock('@/lib/client/useUser', () => ({
  useUser: vi.fn(),
}));

describe('JoinClient', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReset();
  });

  test('opens login dialog from the signed-out CTA', async () => {
    vi.mocked(useUser).mockReturnValue({ ready: true, user: null });

    render(<JoinClient />);

    fireEvent.click(screen.getByRole('button', { name: 'Log in or Sign Up' }));

    expect(await screen.findByText('Sign in or create an account')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Log in with Google' })).toBeDefined();
  });

  test('instructs signed-in players to use profile icon QR', () => {
    vi.mocked(useUser).mockReturnValue({
      ready: true,
      user: {
        id: 'u/abcDef123',
      },
    } as ReturnType<typeof useUser>);

    render(<JoinClient />);

    expect(screen.getByText('You are ready to be scanned.')).toBeDefined();
    expect(screen.getByText(/profile icon/i)).toBeDefined();
  });
});
