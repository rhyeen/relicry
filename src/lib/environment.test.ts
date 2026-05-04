import { afterEach, describe, expect, it, vi } from 'vitest';

const originalNodeEnv = process.env.NODE_ENV;
const originalNoEmulator = process.env.NEXT_PUBLIC_NO_EMULATOR;
const originalUseEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

async function loadIsEmulated() {
  vi.resetModules();
  const environment = await import('./environment');
  return environment.isEmulated;
}

async function loadBackendSiteOrigin(requestOrigin: string) {
  vi.resetModules();
  const environment = await import('./environment');
  return environment.getBackendSiteOrigin(requestOrigin, true);
}

async function loadBackendSiteOriginWithWww(requestOrigin: string) {
  vi.resetModules();
  const environment = await import('./environment');
  return environment.getBackendSiteOrigin(requestOrigin, false);
}

async function loadNormalizedSiteOrigin(url: string, excludeWww: boolean) {
  vi.resetModules();
  const environment = await import('./environment');
  return environment.normalizeSiteOrigin(url, excludeWww);
}

function setNodeEnv(value: string | undefined) {
  if (value === undefined) {
    delete (process.env as Record<string, string | undefined>).NODE_ENV;
    return;
  }

  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

afterEach(() => {
  setNodeEnv(originalNodeEnv);

  if (originalNoEmulator === undefined) {
    delete process.env.NEXT_PUBLIC_NO_EMULATOR;
  } else {
    process.env.NEXT_PUBLIC_NO_EMULATOR = originalNoEmulator;
  }

  if (originalUseEmulator === undefined) {
    delete process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;
  } else {
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = originalUseEmulator;
  }

  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe('isEmulated', () => {
  it('uses the emulator flag when enabled', async () => {
    delete process.env.NEXT_PUBLIC_NO_EMULATOR;
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = '1';

    await expect(loadIsEmulated()).resolves.toBe(true);
  });

  it('disables emulators when NEXT_PUBLIC_NO_EMULATOR is enabled', async () => {
    process.env.NEXT_PUBLIC_NO_EMULATOR = '1';
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = '1';

    await expect(loadIsEmulated()).resolves.toBe(false);
  });

  it('leaves emulators off when both flags are disabled', async () => {
    process.env.NEXT_PUBLIC_NO_EMULATOR = '0';
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = '0';

    await expect(loadIsEmulated()).resolves.toBe(false);
  });
});

describe('getBackendSiteOrigin', () => {
  it('uses the configured production site origin when the backend is running in production', async () => {
    setNodeEnv('production');
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.relicry.com/';

    await expect(loadBackendSiteOrigin('http://localhost:3000')).resolves.toBe('https://relicry.com');
  });

  it('falls back to the request origin during local development', async () => {
    setNodeEnv('development');
    delete process.env.NEXT_PUBLIC_SITE_URL;

    await expect(loadBackendSiteOrigin('http://localhost:3000/')).resolves.toBe('http://localhost:3000');
  });

  it('keeps www when excludeWww is false', async () => {
    setNodeEnv('production');
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.relicry.com/';

    await expect(loadBackendSiteOriginWithWww('http://localhost:3000')).resolves.toBe('https://www.relicry.com');
  });
});

describe('normalizeSiteOrigin', () => {
  it('removes www when excludeWww is true', async () => {
    await expect(loadNormalizedSiteOrigin('https://www.relicry.com/some/path?x=1', true))
      .resolves.toBe('https://relicry.com');
  });

  it('keeps www when excludeWww is false', async () => {
    await expect(loadNormalizedSiteOrigin('https://www.relicry.com/some/path?x=1', false))
      .resolves.toBe('https://www.relicry.com');
  });

  it('leaves non-www hosts unchanged', async () => {
    await expect(loadNormalizedSiteOrigin('http://localhost:3000/path', true))
      .resolves.toBe('http://localhost:3000');
  });

  it('returns the input when the URL cannot be parsed', async () => {
    await expect(loadNormalizedSiteOrigin('not a valid url', true))
      .resolves.toBe('not a valid url');
  });
});
