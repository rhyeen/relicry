import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AdminRole } from '@/entities/AdminRole';
import { useAuthUser } from '@/lib/client/useAuthUser';
import ProfileClient from './ProfileClient';

vi.mock('@/lib/client/useAuthUser', () => ({
  useAuthUser: vi.fn(),
}));

vi.mock('@/components/client/ImageUploader/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader" />,
}));

const authUser = {
  getIdToken: vi.fn(async () => 'token'),
};

function mockProfileFetch(starterDecksObtained: unknown[]) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => ({
      user: {
        id: 'u/player',
        displayName: 'Player',
        email: 'player@example.com',
        adminRoles: [] as AdminRole[],
        profileImage: {},
      },
      starterDecksObtained,
      activeEvent: null,
      activeEventCurrent: false,
    }),
  })));
}

describe('ProfileClient', () => {
  beforeEach(() => {
    vi.mocked(useAuthUser).mockReturnValue({
      ready: true,
      user: authUser,
    } as ReturnType<typeof useAuthUser>);
  });

  test('renders singular starter deck heading for one claim', async () => {
    mockProfileFetch([{
      id: 'c/focus1',
      title: 'Brave Starter',
      obtainedAt: '2026-05-10T12:00:00.000Z',
      obtainedBy: 'u/admin',
      atEventId: 'e/event',
    }]);

    render(<ProfileClient />);

    await waitFor(() => expect(screen.getByText('Starter deck obtained')).toBeDefined());
    expect(screen.getByText('Brave Starter')).toBeDefined();
  });

  test('renders plural starter decks heading for multiple claims', async () => {
    mockProfileFetch([
      {
        id: 'c/focus1',
        title: 'Brave Starter',
        obtainedAt: '2026-05-10T12:00:00.000Z',
        obtainedBy: 'u/admin',
        atEventId: 'e/event',
      },
      {
        id: 'c/focus2',
        title: 'Wise Starter',
        obtainedAt: '2026-05-10T13:00:00.000Z',
        obtainedBy: 'u/admin',
        atEventId: 'e/event',
      },
    ]);

    render(<ProfileClient />);

    await waitFor(() => expect(screen.getByText('Starter decks obtained')).toBeDefined());
    expect(screen.getByText('Wise Starter')).toBeDefined();
  });
});
