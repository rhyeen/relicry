import { describe, expect, it } from 'vitest';
import {
  buildDownloadUnpublishedCardHref,
  buildDownloadUnpublishedRedirectHref,
  buildDownloadUnpublishedUniqueRewardHref,
  buildDownloadUnpublishedUniqueRewardRedirectHref,
  buildRewardHref,
  getUnpublishedCardCursor,
  getUnpublishedUniqueRewardCursor,
  isLocalHostname,
  isLocalRequestHost,
  normalizeDownloadUnpublishedSP,
  normalizeUnpublishedModeSP,
  normalizeUnpublishedCursorSP,
  normalizeUnpublishedRewardEventIdSP,
  normalizeUnpublishedRewardLevelSP,
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

    expect(normalizeUnpublishedRewardEventIdSP({
      rewardEventId: 'e/test',
    })).toBe('e/test');

    expect(normalizeUnpublishedRewardLevelSP({
      rewardLevel: '2',
    })).toBe(2);
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

    expect(buildDownloadUnpublishedUniqueRewardRedirectHref({
      eventId: 'e/test',
      level: 3,
      cursor: 'ur/test-3',
      mode: 'current',
    })).toBe('/local/unique-rewards/download-unpublished?rewardEventId=e%2Ftest&rewardLevel=3&unpublishedCursor=ur%2Ftest-3&unpublishedMode=current');

    expect(getUnpublishedUniqueRewardCursor('ur/test-3')).toBe('ur/test-3');

    expect(buildDownloadUnpublishedUniqueRewardHref({
      id: 'ur/test-3',
      cursor: 'ur/test-3',
    })).toBe('/ur/test-3?size=800dpi&side=back&downloadUnpublished=true&unpublishedCursor=ur%2Ftest-3');

    expect(buildRewardHref({
      eventId: 'e/test',
      level: 3,
    })).toBe('/e/test/r/3');
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
