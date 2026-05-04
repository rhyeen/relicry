export const isProduction = process.env.NODE_ENV === 'production';

function isEnabled(value: string | undefined) {
  return value === 'true' || value === '1';
}

const noEmulatorOverride = process.env.NEXT_PUBLIC_NO_EMULATOR;
const emulatorPreference = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;

export const isEmulated = !isEnabled(noEmulatorOverride) && isEnabled(emulatorPreference);

export function normalizeSiteOrigin(url: string, excludeWww: boolean): string {
  try {
    const parsed = new URL(url);
    const hostname = excludeWww && parsed.hostname.startsWith('www.')
      ? parsed.hostname.slice(4)
      : parsed.hostname;
    const port = parsed.port ? `:${parsed.port}` : '';
    return `${parsed.protocol}//${hostname}${port}`;
  } catch {
    return url;
  }
}

export function getBackendSiteOrigin(requestOrigin: string, excludeWww: boolean): string {
  if (process.env.NODE_ENV === 'production') {
    return normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://relicry.com', excludeWww);
  }

  return normalizeSiteOrigin(requestOrigin, excludeWww);
}
