import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IllustrationArt, WritingArt } from '@/entities/Art';
import { Aspect } from '@/entities/Aspect';
import { VersionedDeckCard } from '@/entities/Card';
import { ImageSize } from '@/entities/Image';
import { Rarity } from '@/entities/Rarity';
import { Tag } from '@/entities/Tag';
import CardDetailClient from './CardDetailClient';

vi.mock('@/components/client/CardCollectionAction.slot', () => ({
  default: () => <div data-testid="collection-action" />,
}));

vi.mock('@/components/client/StoredImage.slot', () => ({
  default: ({ alt }: { alt: string }) => <div aria-label={alt} role="img" />,
}));

describe('CardDetailClient', () => {
  afterEach(() => {
    cleanup();
  });

  it('filters the explanation panel when card parts are clicked', () => {
    render(
      <CardDetailClient
        art={null}
        artist={null}
        awakened={false}
        awakenedArt={null}
        awakenedArtist={null}
        awakenedFlavorTextExtendedArt={null}
        awakenedFlavorTextExtendedArtist={null}
        card={buildDeckCard()}
        flavorTextExtendedArt={null}
        flavorTextExtendedArtist={null}
      />
    );

    expect(screen.getByText('Draw Limit')).toBeDefined();
    expect(screen.getByText('Scrap Cost')).toBeDefined();

    fireEvent.click(screen.getByLabelText('Explain draw limit 6'));
    expect(screen.getByText('Selected detail')).toBeDefined();
    expect(screen.getByText('Draw Limit')).toBeDefined();
    expect(screen.queryByText('Scrap Cost')).toBeNull();

    fireEvent.click(screen.getByText('All details'));
    expect(screen.getByText('Scrap Cost')).toBeDefined();

    fireEvent.click(screen.getByLabelText('Explain card effects'));
    expect(screen.getByText('Effects')).toBeDefined();
    expect(screen.getByText('Draw 1C')).toBeDefined();
    expect(screen.queryByText('Draw Limit')).toBeNull();
  });

  it('opens the shared art detail dialog from illustration and artist card parts', () => {
    render(
      <CardDetailClient
        art={buildIllustrationArt()}
        artist={{
          archivedAt: null,
          createdAt: new Date(),
          id: 'ast/test',
          name: 'Dialog Artist',
          promotedArtIds: [],
          promotedItemIds: [],
          summary: 'Artist summary for the dialog.',
          tags: [],
          updatedAt: new Date(),
          userId: 'user/test',
        }}
        awakened={false}
        awakenedArt={null}
        awakenedArtist={null}
        awakenedFlavorTextExtendedArt={null}
        awakenedFlavorTextExtendedArtist={null}
        card={buildDeckCard()}
        flavorTextExtendedArt={null}
        flavorTextExtendedArtist={null}
      />
    );

    fireEvent.click(screen.getByLabelText('Explain card illustration'));
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getAllByText('Dialog Art').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dialog Artist').length).toBeGreaterThan(0);
    expect(screen.getByText('Artist summary for the dialog.')).toBeDefined();
    expect(screen.getByText('Archive ID')).toBeDefined();
  });

  it('opens the shared writing detail dialog from extended flavor text', () => {
    render(
      <CardDetailClient
        art={null}
        artist={null}
        awakened={false}
        awakenedArt={null}
        awakenedArtist={null}
        awakenedFlavorTextExtendedArt={null}
        awakenedFlavorTextExtendedArtist={null}
        card={buildDeckCard({ extendedFlavorText: true })}
        flavorTextExtendedArt={buildWritingArt()}
        flavorTextExtendedArtist={{
          archivedAt: null,
          createdAt: new Date(),
          id: 'ast/test',
          name: 'Writing Artist',
          promotedArtIds: [],
          promotedItemIds: [],
          summary: 'Artist details for the extended flavor text.',
          tags: [],
          updatedAt: new Date(),
          userId: 'user/test',
        }}
      />
    );

    fireEvent.click(screen.getByLabelText('Explain flavor text'));
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getAllByText('Extended Lore').length).toBeGreaterThan(0);
    expect(screen.getByText('Writing Artist')).toBeDefined();
    expect(screen.getByText('Artist details for the extended flavor text.')).toBeDefined();
    expect(screen.getByText('The readable extended flavor text.')).toBeDefined();
  });
});

function buildDeckCard(
  { extendedFlavorText = false }: Readonly<{ extendedFlavorText?: boolean }> = {}
): VersionedDeckCard {
  return {
    archivedAt: null,
    aspect: Aspect.Cunning,
    drawLimit: 6,
    effects: [
      {
        conditionals: [],
        parts: [
          { type: 'text', text: 'Draw' },
          { type: 'card', amount: 1 },
        ],
      },
    ],
    flavorText: {
      onCard: {
        text: 'A useful test card.',
      },
      ...(extendedFlavorText
        ? {
          extended: {
            artId: 'art/writing',
            artistId: 'ast/test',
          },
        }
        : {}),
    },
    id: 'test',
    illustration: {
      artId: 'art/test',
      artistId: 'ast/test',
    },
    isFeatured: false,
    isSample: false,
    publishedAt: new Date(),
    rarity: Rarity.Rare,
    revealedAt: new Date(),
    scrapCost: [Aspect.Cunning],
    season: 1,
    tags: [Tag.Ability],
    title: 'Interactive Test Card',
    type: 'deck',
    version: 1,
  };
}

function buildWritingArt(): WritingArt {
  return {
    aIGenerated: false,
    archivedAt: null,
    artistId: 'ast/test',
    createdAt: new Date(),
    description: 'Writing art description.',
    id: 'art/writing',
    markdown: 'The readable extended flavor text.',
    title: 'Extended Lore',
    type: 'writing',
    updatedAt: new Date(),
  };
}

function buildIllustrationArt(): IllustrationArt {
  return {
    aIGenerated: false,
    archivedAt: null,
    artistId: 'ast/test',
    createdAt: new Date(),
    description: 'Dialog art description.',
    id: 'art/dialog',
    image: {
      [ImageSize.CardFull]: {
        path: 'art/dialog/full.webp',
        url: '/dialog-full.webp',
      },
    },
    title: 'Dialog Art',
    type: 'illustration',
    updatedAt: new Date(),
  };
}
