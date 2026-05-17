import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createAccountWithEmailPassword,
  signInWithEmailPassword,
  signInWithGoogle,
} from '@/lib/client/signInClient';
import LoginPanel from './LoginPanel';

vi.mock('@/lib/client/signInClient', () => ({
  createAccountWithEmailPassword: vi.fn(async () => undefined),
  sendPasswordReset: vi.fn(async () => undefined),
  signInWithEmailPassword: vi.fn(async () => undefined),
  signInWithGoogle: vi.fn(async () => undefined),
}));

describe('LoginPanel', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(createAccountWithEmailPassword).mockClear();
    vi.mocked(signInWithEmailPassword).mockClear();
    vi.mocked(signInWithGoogle).mockClear();
  });

  test('signs in with Google', async () => {
    const onSignedIn = vi.fn();
    render(<LoginPanel onSignedIn={onSignedIn} />);

    fireEvent.click(screen.getByRole('button', { name: 'Log in with Google' }));

    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalledTimes(1));
    expect(onSignedIn).toHaveBeenCalledTimes(1);
  });

  test('logs in with email and password', async () => {
    const onSignedIn = vi.fn();
    const { container } = render(<LoginPanel onSignedIn={onSignedIn} />);
    const panel = within(container);

    fireEvent.change(panel.getByLabelText('Email address *'), { target: { value: 'player@example.com' } });
    fireEvent.change(panel.getByLabelText('Password *'), { target: { value: 'password123' } });
    fireEvent.click(panel.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(signInWithEmailPassword).toHaveBeenCalledWith('player@example.com', 'password123');
    });
    expect(onSignedIn).toHaveBeenCalledTimes(1);
  });

  test('shows invalid email errors under the email field without calling Firebase', () => {
    const { container } = render(<LoginPanel />);
    const panel = within(container);

    expect(container.querySelector('form')?.hasAttribute('novalidate')).toBe(true);

    fireEvent.change(panel.getByLabelText('Email address *'), { target: { value: 'not-an-email' } });
    fireEvent.change(panel.getByLabelText('Password *'), { target: { value: 'password123' } });
    fireEvent.click(panel.getByRole('button', { name: 'Log in' }));

    expect(panel.getByText('Enter a valid email address.')).toBeDefined();
    expect(signInWithEmailPassword).not.toHaveBeenCalled();
  });

  test('keeps email login disabled until required fields are filled', () => {
    const { container } = render(<LoginPanel />);
    const panel = within(container);

    const submit = panel.getByRole('button', { name: 'Log in' });
    expect(submit.hasAttribute('disabled')).toBe(true);

    fireEvent.change(panel.getByLabelText('Email address *'), { target: { value: 'player@example.com' } });
    expect(submit.hasAttribute('disabled')).toBe(true);

    fireEvent.change(panel.getByLabelText('Password *'), { target: { value: 'password123' } });
    expect(submit.hasAttribute('disabled')).toBe(false);
  });

  test('creates an email and password account from the sign up tab', async () => {
    const onSignedIn = vi.fn();
    const { container } = render(<LoginPanel onSignedIn={onSignedIn} />);
    const panel = within(container);

    fireEvent.click(panel.getByRole('tab', { name: 'Sign up' }));
    expect(panel.getByRole('button', { name: 'Sign up with Google' })).toBeDefined();
    fireEvent.change(panel.getByLabelText('Display name *'), { target: { value: 'Relic Player' } });
    fireEvent.change(panel.getByLabelText('Email address *'), { target: { value: 'new@example.com' } });
    fireEvent.change(panel.getByLabelText('Password *'), { target: { value: 'password123' } });
    fireEvent.change(panel.getByLabelText('Confirm password *'), { target: { value: 'password123' } });
    fireEvent.click(panel.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(createAccountWithEmailPassword).toHaveBeenCalledWith({
        displayName: 'Relic Player',
        email: 'new@example.com',
        password: 'password123',
      });
    });
    expect(onSignedIn).toHaveBeenCalledTimes(1);
  });

  test('requires two letters in the signup display name', () => {
    const { container } = render(<LoginPanel />);
    const panel = within(container);

    fireEvent.click(panel.getByRole('tab', { name: 'Sign up' }));
    fireEvent.change(panel.getByLabelText('Display name *'), { target: { value: '  C.  ' } });
    fireEvent.change(panel.getByLabelText('Email address *'), { target: { value: 'new@example.com' } });
    fireEvent.change(panel.getByLabelText('Password *'), { target: { value: 'password123' } });
    fireEvent.change(panel.getByLabelText('Confirm password *'), { target: { value: 'password123' } });

    expect(panel.getByRole('button', { name: 'Create account' }).hasAttribute('disabled')).toBe(true);
  });
});
