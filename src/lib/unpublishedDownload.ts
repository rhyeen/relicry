import { CardSize } from '@/entities/CardContext';
import { getCardDocId } from '@/entities/Card';
import { conformDocId } from '@/lib/firestoreConform';
import { SearchParams } from 'next/dist/server/request/search-params';
import { ReadonlyURLSearchParams } from 'next/navigation';

export const DOWNLOAD_UNPUBLISHED_PARAM = 'downloadUnpublished';
export const DOWNLOAD_UNPUBLISHED_CURSOR_PARAM = 'unpublishedCursor';
export const DOWNLOAD_UNPUBLISHED_HISTORY_PARAM = 'unpublishedHistory';
export const DOWNLOAD_UNPUBLISHED_MODE_PARAM = 'unpublishedMode';

export type DownloadUnpublishedMode = 'next' | 'current';

type SupportedSearchParams = SearchParams | ReadonlyURLSearchParams;

function readSearchParam(
  sp: SupportedSearchParams | undefined,
  key: string,
): string | null {
  if (!sp) return null;

  if (typeof sp.get === 'function') {
    return sp.get(key);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (sp as any)[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export function normalizeDownloadUnpublishedSP(sp?: SupportedSearchParams): boolean {
  return readSearchParam(sp, DOWNLOAD_UNPUBLISHED_PARAM) === 'true';
}

export function normalizeUnpublishedCursorSP(sp?: SupportedSearchParams): string | null {
  const raw = readSearchParam(sp, DOWNLOAD_UNPUBLISHED_CURSOR_PARAM);
  return raw?.trim() || null;
}

export function normalizeUnpublishedHistorySP(sp?: SupportedSearchParams): string[] {
  const raw = readSearchParam(sp, DOWNLOAD_UNPUBLISHED_HISTORY_PARAM);
  if (!raw) return [];

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function normalizeUnpublishedModeSP(sp?: SupportedSearchParams): DownloadUnpublishedMode {
  return readSearchParam(sp, DOWNLOAD_UNPUBLISHED_MODE_PARAM) === 'current'
    ? 'current'
    : 'next';
}

export function buildDownloadUnpublishedRedirectHref(params?: {
  cursor?: string | null;
  history?: string[];
  mode?: DownloadUnpublishedMode;
}): string {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set(DOWNLOAD_UNPUBLISHED_CURSOR_PARAM, params.cursor);
  }
  if (params?.history && params.history.length > 0) {
    searchParams.set(DOWNLOAD_UNPUBLISHED_HISTORY_PARAM, params.history.join(','));
  }
  if (params?.mode && params.mode !== 'next') {
    searchParams.set(DOWNLOAD_UNPUBLISHED_MODE_PARAM, params.mode);
  }

  const queryString = searchParams.toString();
  return queryString
    ? `/local/cards/download-unpublished?${queryString}`
    : '/local/cards/download-unpublished';
}

export function getUnpublishedCardCursor(cardId: string, version: number): string {
  return conformDocId(getCardDocId(cardId, version));
}

export function buildDownloadUnpublishedCardHref(params: {
  cardId: string;
  version: number;
  cursor: string;
  history?: string[];
  awakened?: boolean;
}): string {
  const routeCardId = params.cardId.startsWith('c/')
    ? params.cardId.slice(2)
    : params.cardId;
  const searchParams = new URLSearchParams();
  searchParams.set('size', CardSize.PrintSize);
  searchParams.set(DOWNLOAD_UNPUBLISHED_PARAM, 'true');
  searchParams.set(DOWNLOAD_UNPUBLISHED_CURSOR_PARAM, params.cursor);
  if (params.history && params.history.length > 0) {
    searchParams.set(DOWNLOAD_UNPUBLISHED_HISTORY_PARAM, params.history.join(','));
  }

  if (params.awakened) {
    searchParams.set('awakened', 'true');
  }

  return `/c/${routeCardId}/${params.version}?${searchParams.toString()}`;
}

export function isLocalHostname(hostname: string): boolean {
  const normalizedHostname = hostname.trim().toLowerCase().replace(/^\[/, '').replace(/\]$/, '');
  return normalizedHostname === 'localhost'
    || normalizedHostname === '127.0.0.1'
    || normalizedHostname === '0.0.0.0'
    || normalizedHostname === '::1';
}

export function isLocalRequestHost(hostHeader: string | null | undefined): boolean {
  if (!hostHeader) return false;

  const trimmed = hostHeader.trim();
  if (!trimmed) return false;

  const withoutPort = trimmed.startsWith('[')
    ? trimmed.slice(1, trimmed.indexOf(']'))
    : trimmed.split(':')[0] ?? trimmed;

  return isLocalHostname(withoutPort);
}
