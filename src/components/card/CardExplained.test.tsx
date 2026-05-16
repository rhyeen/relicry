import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Aspect } from '@/entities/Aspect';
import { VersionedDeckCard, VersionedGambitCard } from '@/entities/Card';
import { Rarity } from '@/entities/Rarity';
import { Tag } from '@/entities/Tag';
import CardExplained from './CardExplained';

const onSelectPart = vi.fn();

describe('CardExplained', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all available deck card sections by default', () => {
    render(
      <CardExplained
        art={null}
        artist={null}
        card={buildDeckCard()}
        onSelectPart={onSelectPart}
        selectedPart="all"
      />
    );

    expect(screen.getByText('Draw Limit')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('Scrap Cost')).toBeDefined();
    expect(screen.getByText('Effects')).toBeDefined();
    expect(screen.getByText('Deal 2D')).toBeDefined();
  });

  it('filters to the selected explanation section', () => {
    render(
      <CardExplained
        art={null}
        artist={null}
        card={buildDeckCard()}
        onSelectPart={onSelectPart}
        selectedPart="drawLimit"
      />
    );

    expect(screen.getByText('Selected detail')).toBeDefined();
    expect(screen.getByText('Draw Limit')).toBeDefined();
    expect(screen.queryByText('Scrap Cost')).toBeNull();
    expect(screen.queryByText('Effects')).toBeNull();
  });

  it('omits deck-only sections for non-deck cards', () => {
    render(
      <CardExplained
        art={null}
        artist={null}
        card={buildGambitCard()}
        onSelectPart={onSelectPart}
        selectedPart="all"
      />
    );

    expect(screen.getAllByText('Gambit').length).toBeGreaterThan(0);
    expect(screen.queryByText('Draw Limit')).toBeNull();
    expect(screen.queryByText('Scrap Cost')).toBeNull();
  });
});

function buildDeckCard(): VersionedDeckCard {
  return {
    archivedAt: null,
    aspect: Aspect.Brave,
    drawLimit: 5,
    effects: [
      {
        conditionals: [],
        parts: [
          { type: 'text', text: 'Deal' },
          { type: 'damage', amount: 2 },
        ],
      },
    ],
    id: 'test',
    illustration: {
      artId: 'art/test',
      artistId: 'ast/test',
    },
    isFeatured: false,
    isSample: false,
    publishedAt: new Date(),
    rarity: Rarity.Epic,
    revealedAt: new Date(),
    scrapCost: [Aspect.Brave],
    season: 1,
    tags: [Tag.Item],
    title: 'Test Deck Card',
    type: 'deck',
    version: 1,
  };
}

function buildGambitCard(): VersionedGambitCard {
  return {
    archivedAt: null,
    effects: [],
    id: 'gambit',
    illustration: {
      artId: 'art/test',
      artistId: 'ast/test',
    },
    isFeatured: false,
    isSample: false,
    publishedAt: new Date(),
    rarity: Rarity.Common,
    revealedAt: new Date(),
    season: 1,
    tags: [Tag.Gambit],
    title: 'Test Gambit Card',
    type: 'gambit',
    version: 1,
  };
}
