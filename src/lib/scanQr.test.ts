import { describe, expect, test } from 'vitest';
import {
  buildUniversalScanPath,
  buildUniversalScanQrImageSrc,
  parseScannedCardPath,
  parseScannedUserId,
} from './scanQr';

describe('scan QR helpers', () => {
  test('builds universal player scan QR paths', () => {
    expect(buildUniversalScanPath('u/abcDef123')).toBe('/scan?userId=u%2FabcDef123');
    expect(buildUniversalScanQrImageSrc('u/abcDef123'))
      .toBe('/api/qr-code?path=%2Fscan%3FuserId%3Du%252FabcDef123&preserveCase=1');
  });

  test('extracts user ID from valid scan URLs', () => {
    expect(parseScannedUserId('https://relicry.com/scan?userId=u%2FabcDef123')).toBe('u/abcDef123');
    expect(parseScannedUserId('/scan?userId=u%2FabcDef123')).toBe('u/abcDef123');
  });

  test('accepts raw user IDs for manual fallback', () => {
    expect(parseScannedUserId(' u/abcDef123 ')).toBe('u/abcDef123');
  });

  test('rejects unrelated URLs and missing user IDs', () => {
    expect(parseScannedUserId('https://relicry.com/starter?userId=u%2FabcDef123')).toBeNull();
    expect(parseScannedUserId('https://relicry.com/scan')).toBeNull();
    expect(parseScannedUserId('not a useful scan')).toBeNull();
  });

  test('extracts card path data from card QR URLs', () => {
    expect(parseScannedCardPath('http://127.0.0.1:3000/c/0003/1')).toEqual({
      cardId: '0003',
      cardVersion: 1,
      cardPathId: 'c/0003/1',
    });
    expect(parseScannedCardPath('https://relicry.com/c/udpgl63bv9c2/12')).toEqual({
      cardId: 'udpgl63bv9c2',
      cardVersion: 12,
      cardPathId: 'c/udpgl63bv9c2/12',
    });
    expect(parseScannedCardPath('/c/0003/1')?.cardPathId).toBe('c/0003/1');
    expect(parseScannedCardPath('c/0003/1')?.cardPathId).toBe('c/0003/1');
  });

  test('rejects invalid card QR inputs', () => {
    expect(parseScannedCardPath('https://relicry.com/scan?userId=u%2FabcDef123')).toBeNull();
    expect(parseScannedCardPath('/c/0003/0')).toBeNull();
    expect(parseScannedCardPath('/c/0003')).toBeNull();
    expect(parseScannedCardPath('not a card')).toBeNull();
  });
});
