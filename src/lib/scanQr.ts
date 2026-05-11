export function buildUniversalScanPath(userId: string): string {
  return `/scan?userId=${encodeURIComponent(userId)}`;
}

export function buildUniversalScanQrImageSrc(userId: string): string {
  const path = buildUniversalScanPath(userId);
  return `/api/qr-code?path=${encodeURIComponent(path)}&preserveCase=1`;
}

export function parseScannedUserId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^u\/[A-Za-z0-9]+$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed, 'https://relicry.local');
    if (url.pathname.toLowerCase() !== '/scan') return null;
    const userId = url.searchParams.get('userId');
    if (!userId || !/^u\/[A-Za-z0-9]+$/.test(userId)) return null;
    return userId;
  } catch {
    return null;
  }
}
