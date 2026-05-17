import { describe, expect, test } from 'vitest';
import { ImageSize } from '@/entities/Image';
import { getUserAvatarFallback, getUserAvatarImage } from './DSAvatar';

describe('DSAvatar', () => {
  test('uses display name initials as the fallback', () => {
    expect(getUserAvatarFallback({ displayName: 'Player One' })).toBe('PO');
    expect(getUserAvatarFallback({ displayName: '  Player  ' })).toBe('P');
  });

  test('falls back to a question mark without a display name', () => {
    expect(getUserAvatarFallback({ displayName: '' })).toBe('?');
    expect(getUserAvatarFallback(null)).toBe('?');
  });

  test('prefers the profile thumbnail image', () => {
    const thumb = { path: 'thumb.webp', url: 'https://example.test/thumb.webp' };
    const banner = { path: 'banner.webp', url: 'https://example.test/banner.webp' };

    expect(getUserAvatarImage({
      profileImage: {
        [ImageSize.Banner]: banner,
        [ImageSize.Thumb]: thumb,
      },
    })).toBe(thumb);
  });
});
