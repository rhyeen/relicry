export const isProduction = process.env.NODE_ENV === 'production';

function isEnabled(value: string | undefined) {
  return value === 'true' || value === '1';
}

const noEmulatorOverride = process.env.NEXT_PUBLIC_NO_EMULATOR;
const emulatorPreference = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;

export const isEmulated = !isEnabled(noEmulatorOverride) && isEnabled(emulatorPreference);
