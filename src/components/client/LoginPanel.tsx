'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSSegmentedControl from '@/components/ds/DSSegmentedControl';
import DSText from '@/components/ds/DSText';
import {
  createAccountWithEmailPassword,
  sendPasswordReset,
  signInWithEmailPassword,
  signInWithGoogle,
} from '@/lib/client/signInClient';
import styles from './LoginPanel.module.css';

type AuthMode = 'login' | 'signup';
type FieldName = 'displayName' | 'email' | 'password' | 'confirmPassword';
type FieldErrors = Partial<Record<FieldName, string>>;

type LoginPanelProps = Readonly<{
  title?: string;
  subtitle?: string;
  onSignedIn?: () => void;
  showIntro?: boolean;
}>;

export default function LoginPanel({
  title = 'Welcome to Relicry',
  onSignedIn,
  showIntro = true,
}: LoginPanelProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loading = emailLoading || googleLoading || resetLoading;
  const emailReady = mode === 'signup'
    ? !!displayName.trim() && !!email.trim() && !!password && !!confirmPassword
    : !!email.trim() && !!password;
  const googleLabel = mode === 'signup' ? 'Sign up with Google' : 'Log in with Google';

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFieldErrors({});
    setGoogleError(null);
    setNotice(null);
  };

  const updateField = (field: FieldName, value: string) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setNotice(null);
    switch (field) {
      case 'displayName':
        setDisplayName(value);
        return;
      case 'email':
        setEmail(value);
        return;
      case 'password':
        setPassword(value);
        return;
      case 'confirmPassword':
        setConfirmPassword(value);
        return;
    }
  };

  const handleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    setNotice(null);
    try {
      await signInWithGoogle();
      onSignedIn?.();
    } catch (e) {
      setGoogleError(formatGoogleAuthError(e, mode === 'signup' ? 'Unable to sign up with Google.' : 'Unable to log in with Google.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setGoogleError(null);
    setNotice(null);

    const validationErrors = validateEmailForm({
      confirmPassword,
      displayName,
      email,
      mode,
      password,
    });
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setEmailLoading(true);
    try {
      const trimmedEmail = email.trim();
      if (mode === 'signup') {
        const trimmedDisplayName = displayName.trim();
        await createAccountWithEmailPassword({
          displayName: trimmedDisplayName,
          email: trimmedEmail,
          password,
        });
      } else {
        await signInWithEmailPassword(trimmedEmail, password);
      }

      onSignedIn?.();
    } catch (e) {
      const fieldError = formatEmailAuthError(e, mode === 'signup' ? 'Unable to create account.' : 'Unable to log in.');
      setFieldErrors({ [fieldError.field]: fieldError.message });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const trimmedEmail = email.trim();
    setFieldErrors({});
    setGoogleError(null);
    setNotice(null);
    if (!trimmedEmail) {
      setFieldErrors({ email: 'Enter your email address first.' });
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordReset(trimmedEmail);
      setNotice('Password reset email sent.');
    } catch (e) {
      const fieldError = formatEmailAuthError(e, 'Unable to send password reset email.');
      setFieldErrors({ [fieldError.field]: fieldError.message });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      {showIntro && (
        <div className={styles.intro}>
          <DSText.Heading as="h1" size="display" align="center" className={styles.title}>
            {title}
          </DSText.Heading>
        </div>
      )}
      <DSSegmentedControl
        ariaLabel="Authentication mode"
        className={styles.tabs}
        options={[
          { label: 'Log in', value: 'login' },
          { label: 'Sign up', value: 'signup' },
        ]}
        value={mode}
        onChange={handleModeChange}
      />
      <DSButton
        className={styles.primaryAction}
        onClick={handleSignIn}
        label={googleLabel}
        loading={googleLoading}
        disabled={loading}
        variant="primary"
      />
      {googleError && <div className={styles.error}>{googleError}</div>}
      <div className={styles.divider}><span>or</span></div>
      <form className={styles.form} onSubmit={handleEmailSubmit} noValidate>
        {mode === 'signup' && (
          <DSField
            className={styles.field}
            label="Display name"
            value={displayName}
            onChange={(value) => updateField('displayName', value)}
            required
            disabled={loading}
            error={fieldErrors.displayName}
          />
        )}
        <DSField
          className={styles.field}
          label="Email address"
          type="email"
          value={email}
          onChange={(value) => updateField('email', value)}
          required
          disabled={loading}
          error={fieldErrors.email}
        />
        <DSField
          className={styles.field}
          label="Password"
          type="password"
          value={password}
          onChange={(value) => updateField('password', value)}
          placeholder={mode === 'signup' ? '8+ characters' : undefined}
          required
          disabled={loading}
          error={fieldErrors.password}
        />
        {mode === 'signup' && (
          <DSField
            className={styles.field}
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(value) => updateField('confirmPassword', value)}
            required
            disabled={loading}
            error={fieldErrors.confirmPassword}
          />
        )}
        {mode === 'login' && (
          <DSButton
            className={styles.inlineAction}
            label="I forgot my password"
            onClick={handlePasswordReset}
            loading={resetLoading}
            disabled={loading}
            variant="ghost"
          />
        )}
        {notice && <div className={styles.notice}>{notice}</div>}
        <DSButton
          className={styles.primaryAction}
          label={mode === 'signup' ? 'Create account' : 'Log in'}
          loading={emailLoading}
          disabled={loading || !emailReady}
          type="submit"
          variant="primary"
        />
      </form>
    </div>
  );
}

function validateEmailForm({
  confirmPassword,
  displayName,
  email,
  mode,
  password,
}: {
  confirmPassword: string;
  displayName: string;
  email: string;
  mode: AuthMode;
  password: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (mode === 'signup' && !displayName.trim()) {
    errors.displayName = 'Enter a display name.';
  }
  if (!email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Enter your password.';
  } else if (mode === 'signup' && password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  if (mode === 'signup') {
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }
  return errors;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function formatGoogleAuthError(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
  const message = (error as Error)?.message;

  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was closed before it finished.';
  }

  return message || fallback;
}

function formatEmailAuthError(error: unknown, fallback: string): { field: FieldName; message: string } {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
  const message = (error as Error)?.message;

  switch (code) {
    case 'auth/email-already-in-use':
      return { field: 'email', message: 'An account already exists for that email address.' };
    case 'auth/invalid-email':
      return { field: 'email', message: 'Enter a valid email address.' };
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return { field: 'password', message: 'Email or password is incorrect.' };
    case 'auth/weak-password':
      return { field: 'password', message: 'Choose a stronger password.' };
    default:
      return { field: 'password', message: message || fallback };
  }
}
