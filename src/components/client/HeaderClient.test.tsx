import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useAuthUser } from '@/lib/client/useAuthUser';
import HeaderClient from './HeaderClient';

vi.mock('@/lib/client/useAuthUser', () => ({
  useAuthUser: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/cards',
  useSearchParams: () => new URLSearchParams('query=focus'),
}));

vi.mock('./ProfileMenu', () => ({
  default: () => <div>Profile menu</div>,
}));

describe('HeaderClient', () => {
  beforeEach(() => {
    vi.mocked(useAuthUser).mockReset();
  });

  test('opens login dialog instead of navigating away', async () => {
    vi.mocked(useAuthUser).mockReturnValue({ ready: true, user: null });

    render(<HeaderClient />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    expect(screen.queryByRole('link', { name: 'Open login page' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDefined();
  });
});
