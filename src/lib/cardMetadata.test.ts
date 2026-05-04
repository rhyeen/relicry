import { describe, expect, it } from 'vitest';

import { Aspect } from '@/entities/Aspect';
import { Tag } from '@/entities/Tag';
import { Rarity } from '@/entities/Rarity';
import { VersionedCard } from '@/entities/Card';
import { toCardMetadata } from './cardMetadata';

describe('toCardMetadata', () => {
  it('removes illustration metadata from deck cards', () => {
    const card: VersionedCard = {
      id: 'c/test',
      type: 'deck',
      title: 'Test Deck',
      rarity: Rarity.Common,
      tags: [Tag.Item],
      effects: [],
      drawLimit: 1,
      scrapCost: [Aspect.Brave],
      aspect: Aspect.Brave,
      version: 1,
      season: 1,
      isFeatured: true,
      illustration: {
        artId: 'ast/123',
        artistId: 'art/123',
      },
      revealedAt: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      archivedAt: null,
      isSample: false,
    };

    const metadata = toCardMetadata(card);

    expect(metadata).not.toHaveProperty('illustration');
    expect(metadata).toMatchObject({
      id: 'c/test',
      type: 'deck',
      title: 'Test Deck',
      drawLimit: 1,
      aspect: Aspect.Brave,
    });
  });

  it('removes illustration metadata from focus awakened versions', () => {
    const card: VersionedCard = {
      id: 'c/focus',
      type: 'focus',
      title: 'Test Focus',
      rarity: Rarity.Epic,
      tags: [Tag.Focus],
      effects: [],
      aspect: [Aspect.Brave, Aspect.Wise],
      awakened: {
        tags: [Tag.Focus],
        effects: [],
      },
      awakenedVersion: {
        illustration: {
          artId: 'ast/awakened',
          artistId: 'art/awakened',
        },
        flavorText: {
          extended: null,
          onCard: {
            text: 'Awakened.',
          },
        },
      },
      version: 2,
      season: 3,
      isFeatured: true,
      illustration: {
        artId: 'ast/base',
        artistId: 'art/base',
      },
      revealedAt: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      archivedAt: null,
      isSample: false,
    };

    const metadata = toCardMetadata(card);

    expect(metadata).not.toHaveProperty('illustration');
    expect('awakenedVersion' in metadata).toBe(true);
    if (!('awakenedVersion' in metadata)) {
      throw new Error('Expected focus metadata to include awakenedVersion');
    }
    expect(metadata.awakenedVersion).not.toHaveProperty('illustration');
    expect(metadata.awakenedVersion).toEqual({
      flavorText: {
        extended: null,
        onCard: {
          text: 'Awakened.',
        },
      },
    });
  });
});
