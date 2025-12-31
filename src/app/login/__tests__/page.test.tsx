import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('Login page', () => {
  test('renders login button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in with Google')).toBeDefined();
  });
});
