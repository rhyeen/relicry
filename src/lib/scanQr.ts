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

export type ScannedCardPath = {
  cardId: string;
  cardVersion: number;
  cardPathId: string;
};

export function parseScannedCardPath(input: string): ScannedCardPath | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const rawPath = getPossibleCardPath(trimmed);
  if (!rawPath) return null;

  const match = rawPath.match(/^\/?c\/([A-Za-z0-9]+)\/([1-9]\d*)\/?$/);
  if (!match) return null;

  const cardId = match[1]!;
  const cardVersion = Number(match[2]);
  if (!Number.isInteger(cardVersion) || cardVersion < 1) return null;

  return {
    cardId,
    cardVersion,
    cardPathId: `c/${cardId}/${cardVersion}`,
  };
}

function getPossibleCardPath(input: string): string | null {
  if (/^\/?c\/[A-Za-z0-9]+\/[1-9]\d*\/?$/.test(input)) {
    return input;
  }

  try {
    return new URL(input, 'https://relicry.local').pathname;
  } catch {
    return null;
  }
}
