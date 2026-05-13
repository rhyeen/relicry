import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageSize } from '@/entities/Image';
import { ArtListFilters, DEFAULT_ART_FILTERS } from '@/lib/artList';
import type { ArtPreviewListItem, ArtPreviewResponse } from '@/lib/artApi';
import ArtBrowserClient from './ArtBrowserClient';

let currentSearch = '';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

function buildIllustration(id: string, title: string, aIGenerated = false): ArtPreviewListItem {
  return {
    href: `/${id}`,
    artistName: `Artist ${id.at(-1)}`,
    art: {
      id,
      type: 'illustration',
      artistId: `ast/artist${id.at(-1)}`,
      title,
      image: {
        [ImageSize.CardPreview]: {
          path: `test/${id}.webp`,
          url: `https://example.com/${id}.webp`,
        },
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      archivedAt: null,
      aIGenerated,
    },
  };
}

function buildWriting(id: string, title: string, description: string): ArtPreviewListItem {
  return {
    href: `/${id}`,
    artistName: `Writer ${id.at(-1)}`,
    art: {
      id,
      type: 'writing',
      artistId: `ast/writer${id.at(-1)}`,
      title,
      description,
      markdown: '# Hidden markdown',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      archivedAt: null,
      aIGenerated: false,
    },
  };
}

function buildResponse(
  items: ArtPreviewListItem[],
  overrides: Partial<ArtPreviewResponse> = {},
): ArtPreviewResponse {
  return {
    items,
    page: 1,
    totalPages: 1,
    totalArts: items.length,
    pageSize: 22,
    ...overrides,
  };
}

function renderArtBrowser(
  initialResponse: ArtPreviewResponse,
  initialFilters: ArtListFilters = DEFAULT_ART_FILTERS,
) {
  return render(
    <ArtBrowserClient
      initialFilters={initialFilters}
      initialResponse={initialResponse}
      typeOptions={[
        { label: 'All art', value: 'all' },
        { label: 'Illustration', value: 'illustration' },
        { label: 'Writing', value: 'writing' },
      ]}
      generationOptions={[
        { label: 'Any generation', value: 'all' },
        { label: 'AI generated', value: 'ai' },
        { label: 'Original', value: 'original' },
      ]}
    />,
  );
}

describe('ArtBrowserClient', () => {
  beforeEach(() => {
    currentSearch = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('features two illustration items and leaves the remaining page items in the grid', () => {
    const items = [
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
      buildIllustration('art/0000000002', 'Amber Signal'),
      buildWriting('art/0000000003', 'Field Notes', 'A small story fragment.'),
    ];

    renderArtBrowser(buildResponse(items));

    expect(screen.getByText('Illustration art')).toBeDefined();
    expect(screen.getByText('See more art')).toBeDefined();
    expect(screen.getByText('1 shown in this section')).toBeDefined();
    expect(screen.getByText('Field Notes')).toBeDefined();
    expect(screen.getByText('A small story fragment.')).toBeDefined();
  });

  it('hides featured art when fewer than two illustrations are available', () => {
    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
      buildWriting('art/0000000002', 'Field Notes', 'A small story fragment.'),
    ]));

    expect(screen.queryByText('Illustration art')).toBeNull();
    expect(screen.getByText('See more art')).toBeDefined();
    expect(screen.getByText('2 shown in this section')).toBeDefined();
  });

  it('hides featured art when filters are active', () => {
    const filters: ArtListFilters = {
      query: 'sunlit',
      artistId: '',
      type: 'all',
      generation: 'all',
      page: 1,
    };
    currentSearch = '?query=sunlit';

    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
    ]), filters);

    expect(screen.queryByText('Illustration art')).toBeNull();
    expect(screen.getByText('Art results')).toBeDefined();
    expect(screen.getByText('1 shown in this section')).toBeDefined();
  });

  it('shows an AI badge only for AI-generated art', () => {
    const filters: ArtListFilters = {
      query: 'generated',
      artistId: '',
      type: 'all',
      generation: 'ai',
      page: 1,
    };
    currentSearch = '?query=generated&generation=ai';

    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Generated Vista', true),
    ]), filters);

    expect(screen.getByLabelText('AI generated')).toBeDefined();
  });

  it('shows an AI badge on featured AI-generated art', () => {
    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Generated Vista', true),
      buildIllustration('art/0000000002', 'Original Vista'),
      buildWriting('art/0000000003', 'Field Notes', 'A small story fragment.'),
    ]));

    expect(screen.getByText('Illustration art')).toBeDefined();
    expect(screen.getByLabelText('AI generated')).toBeDefined();
  });

  it('writes page numbers into the URL when paginating', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
    ], {
      page: 1,
      totalPages: 2,
      totalArts: 28,
    }));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/art?page=2');
  });

  it('preserves artist filters when paginating', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const filters: ArtListFilters = {
      query: '',
      artistId: 'ast/sbgv1mxyml',
      type: 'all',
      generation: 'all',
      page: 1,
    };
    currentSearch = '?artistId=ast%2Fsbgv1mxyml';

    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
    ], {
      page: 1,
      totalPages: 2,
      totalArts: 28,
    }), filters);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/art?artistId=ast%2Fsbgv1mxyml&page=2');
  });

  it('propagates URL artist filters into the filter dialog', () => {
    const filters: ArtListFilters = {
      query: '',
      artistId: 'ast/sbgv1mxyml',
      type: 'all',
      generation: 'all',
      page: 1,
    };
    currentSearch = '?artistId=ast%2Fsbgv1mxyml';

    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
    ]), filters);

    fireEvent.click(screen.getByText('Filters'));

    expect(screen.getByLabelText('Artist ID')).toHaveProperty('value', 'ast/sbgv1mxyml');
  });

  it('applies artist filter draft values to the URL', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
    ]));

    fireEvent.click(screen.getByText('Filters'));
    fireEvent.change(screen.getByLabelText('Artist ID'), {
      target: { value: 'sbgv1mxyml' },
    });
    fireEvent.click(screen.getByText('Apply'));

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/art?artistId=ast%2Fsbgv1mxyml');
  });

  it('clears artist filters from the URL with all other filters', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const filters: ArtListFilters = {
      query: '',
      artistId: 'ast/sbgv1mxyml',
      type: 'all',
      generation: 'all',
      page: 1,
    };
    currentSearch = '?artistId=ast%2Fsbgv1mxyml';

    renderArtBrowser(buildResponse([
      buildIllustration('art/0000000001', 'Sunlit Salvage'),
    ]), filters);

    fireEvent.click(screen.getByText('Filters'));
    fireEvent.click(screen.getByText('Clear'));

    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/art');
  });
});
