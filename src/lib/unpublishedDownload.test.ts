import { describe, expect, it } from 'vitest';
import {
  buildDownloadUnpublishedCardHref,
  buildDownloadUnpublishedRedirectHref,
  getUnpublishedCardCursor,
  isLocalHostname,
  isLocalRequestHost,
  normalizeDownloadUnpublishedSP,
  normalizeUnpublishedModeSP,
  normalizeUnpublishedCursorSP,
} from './unpublishedDownload';

describe('unpublished download helpers', () => {
  it('normalizes the download mode and cursor search params', () => {
    expect(normalizeDownloadUnpublishedSP({
      downloadUnpublished: 'true',
      unpublishedCursor: 'c.test.7',
      unpublishedMode: 'current',
    })).toBe(true);

    expect(normalizeUnpublishedCursorSP({
      unpublishedCursor: 'c.test.7',
    })).toBe('c.test.7');

    expect(normalizeUnpublishedModeSP({
      unpublishedMode: 'current',
    })).toBe('current');
  });

  it('builds the redirect and card hrefs', () => {
    expect(buildDownloadUnpublishedRedirectHref({
      cursor: 'c.test.3',
      mode: 'current',
    })).toBe('/local/cards/download-unpublished?unpublishedCursor=c.test.3&unpublishedMode=current');

    expect(getUnpublishedCardCursor('c/test', 2)).toBe('c.test.2');

    expect(buildDownloadUnpublishedCardHref({
      cardId: 'c/test',
      version: 2,
      cursor: 'c.test.2',
      awakened: true,
    })).toBe('/c/test/2?size=800dpi&downloadUnpublished=true&unpublishedCursor=c.test.2&awakened=true');
  });

  it('recognizes local hostnames and host headers', () => {
    expect(isLocalHostname('localhost')).toBe(true);
    expect(isLocalHostname('::1')).toBe(true);
    expect(isLocalHostname('relicry.com')).toBe(false);

    expect(isLocalRequestHost('localhost:3000')).toBe(true);
    expect(isLocalRequestHost('[::1]:3000')).toBe(true);
    expect(isLocalRequestHost('relicry.com')).toBe(false);
  });
});
