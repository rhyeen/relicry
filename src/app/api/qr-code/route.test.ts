import { describe, expect, test } from 'vitest';
import { buildQrCodeUrl } from './route';

describe('QR code URL building', () => {
  test('uppercases card-style QR URLs by default', () => {
    expect(buildQrCodeUrl('/c/abcd/1', 'https://relicry.com')).toBe('HTTPS://RELICRY.COM/C/ABCD/1');
  });

  test('preserves case for universal scan QR query parameters', () => {
    expect(buildQrCodeUrl('/scan?userId=u%2FabCd', 'https://relicry.com', true))
      .toBe('https://relicry.com/scan?userId=u%2FabCd');
  });
});
