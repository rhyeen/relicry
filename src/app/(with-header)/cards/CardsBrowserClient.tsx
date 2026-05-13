'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CardPreviewItem from '@/components/CardPreviewItem';
import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSection from '@/components/ds/DSSection';
import {
  areCardsFiltersEqual,
  buildCardsQueryString,
  CardListAspectFilter,
  CardListFilters,
  CardListTypeFilter,
  DEFAULT_CARDS_FILTERS,
  parseCardsFilters,
} from '@/lib/cardsList';
import { CardsPreviewResponse } from '@/lib/cardsApi';
import CardsToolbar from './CardsToolbar';

type Props = Readonly<{
  initialFilters: CardListFilters;
  initialResponse: CardsPreviewResponse;
  typeOptions: { label: string; value: CardListTypeFilter }[];
  aspectOptions: { label: string; value: CardListAspectFilter }[];
}>;

export default function CardsBrowserClient({
  initialFilters,
  initialResponse,
  typeOptions,
  aspectOptions,
}: Props) {
  const [draftQuery, setDraftQuery] = useState(initialFilters.query);
  const [draftType, setDraftType] = useState<CardListTypeFilter>(initialFilters.type);
  const [draftAspect, setDraftAspect] = useState<CardListAspectFilter>(initialFilters.aspect);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [response, setResponse] = useState(initialResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setDraftQuery(activeFilters.query);
    setDraftType(activeFilters.type);
    setDraftAspect(activeFilters.aspect);
  }, [activeFilters]);

  const handleLocationFilters = useCallback(async (nextFilters: CardListFilters) => {
    if (areCardsFiltersEqual(nextFilters, activeFilters)) {
      return;
    }

    setActiveFilters(nextFilters);
    setError(null);

    if (areCardsFiltersEqual(nextFilters, initialFilters)) {
      requestIdRef.current += 1;
      setLoading(false);
      setResponse(initialResponse);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const queryString = buildCardsQueryString(nextFilters);
      const url = `/api/cards${queryString ? `${queryString}&view=preview` : '?view=preview'}`;
      const result = await fetch(url).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`);
        }
        return res.json() as Promise<CardsPreviewResponse>;
      });

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setResponse(result);
    } catch (fetchError) {
      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load cards.');
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [activeFilters, initialFilters, initialResponse]);

  const updateUrl = (nextFilters: CardListFilters) => {
    const queryString = buildCardsQueryString(nextFilters);
    const nextUrl = queryString ? `/cards${queryString}` : '/cards';
    window.history.pushState(null, '', nextUrl);
  };

  const applyFilters = () => {
    updateUrl({
      query: draftQuery,
      type: draftType,
      aspect: draftAspect,
      cursor: null,
      history: [],
    });
  };

  const clearFilters = () => {
    setDraftQuery(DEFAULT_CARDS_FILTERS.query);
    setDraftType(DEFAULT_CARDS_FILTERS.type);
    setDraftAspect(DEFAULT_CARDS_FILTERS.aspect);
    updateUrl(DEFAULT_CARDS_FILTERS);
  };

  const page = response.page;
  const previousFilters: CardListFilters = {
    query: activeFilters.query,
    type: activeFilters.type,
    aspect: activeFilters.aspect,
    cursor: activeFilters.history.at(-1) ?? null,
    history: activeFilters.history.slice(0, -1),
  };
  const nextFilters: CardListFilters = {
    query: activeFilters.query,
    type: activeFilters.type,
    aspect: activeFilters.aspect,
    cursor: response.nextCursor,
    history: [...activeFilters.history, activeFilters.cursor],
  };

  return (
    <DSSection>
      <Suspense fallback={null}>
        <CardsSearchParamsSync onFiltersChange={handleLocationFilters} />
      </Suspense>
      <DSLoadingOverlay loading={loading} error={error} dismissError={setError} />

      <CardsToolbar
        query={draftQuery}
        type={draftType}
        aspect={draftAspect}
        typeOptions={typeOptions}
        aspectOptions={aspectOptions}
        onQueryChange={setDraftQuery}
        onTypeChange={setDraftType}
        onAspectChange={setDraftAspect}
        onApply={applyFilters}
        onClear={clearFilters}
        disabled={loading}
      />

      {response.totalCards === 0 ? (
        <DSSection.Card>
          <DSText.Body tone="muted">No cards matched the current filters.</DSText.Body>
        </DSSection.Card>
      ) : (
        <>
          <DSSection.Text>
            <DSText.Caption>
              Showing {response.items.length} of {response.totalCards} featured cards
            </DSText.Caption>
            <DSText.Caption>
              Page {page} of {response.totalPages}
            </DSText.Caption>
          </DSSection.Text>
          <DSSection.Grid columns={4}>
            {response.items.map((item) => (
              <CardPreviewItem key={`${item.card.id}_v${item.card.version}`} item={item} />
            ))}
          </DSSection.Grid>
          <DSSection.Actions>
            <DSButton
              onClick={() => updateUrl(previousFilters)}
              label="Previous"
              disabled={page <= 1 || loading}
            />
            <DSButton
              onClick={() => updateUrl(nextFilters)}
              label="Next"
              disabled={!response.nextCursor || loading}
            />
          </DSSection.Actions>
        </>
      )}
    </DSSection>
  );
}

function CardsSearchParamsSync({
  onFiltersChange,
}: Readonly<{
  onFiltersChange: (filters: CardListFilters) => void;
}>) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onFiltersChange(parseCardsFilters(searchParams));
  }, [onFiltersChange, searchParams]);

  return null;
}
