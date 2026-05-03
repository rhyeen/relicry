import { afterEach, describe, expect, it, vi } from 'vitest';

const originalNoEmulator = process.env.NEXT_PUBLIC_NO_EMULATOR;
const originalUseEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;

async function loadIsEmulated() {
  vi.resetModules();
  const environment = await import('./environment');
  return environment.isEmulated;
}

afterEach(() => {
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
