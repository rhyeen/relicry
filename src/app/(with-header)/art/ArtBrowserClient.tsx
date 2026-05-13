"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ArtPreviewItem from "@/components/ArtPreviewItem";
import DSButton from "@/components/ds/DSButton";
import DSLoadingOverlay from "@/components/ds/DSLoadingOverlay";
import DSSection from "@/components/ds/DSSection";
import DSText from "@/components/ds/DSText";
import type { ArtPreviewResponse } from "@/lib/artApi";
import {
  areArtFiltersEqual,
  ArtListFilters,
  ArtListGenerationFilter,
  ArtListTypeFilter,
  buildArtQueryString,
  DEFAULT_ART_FILTERS,
  parseArtFilters,
} from "@/lib/artList";
import ArtToolbar from "./ArtToolbar";

type ArtBrowserClientProps = Readonly<{
  initialFilters: ArtListFilters;
  initialResponse: ArtPreviewResponse;
  typeOptions: { label: string; value: ArtListTypeFilter }[];
  generationOptions: { label: string; value: ArtListGenerationFilter }[];
}>;

export default function ArtBrowserClient({
  initialFilters,
  initialResponse,
  typeOptions,
  generationOptions,
}: ArtBrowserClientProps) {
  return (
    <Suspense fallback={null}>
      <ArtSearchParamsSync
        initialFilters={initialFilters}
        initialResponse={initialResponse}
        typeOptions={typeOptions}
        generationOptions={generationOptions}
      />
    </Suspense>
  );
}

function ArtSearchParamsSync(props: ArtBrowserClientProps) {
  const searchParams = useSearchParams();

  return (
    <ArtBrowserContent
      {...props}
      locationFilters={parseArtFilters(searchParams)}
    />
  );
}

function ArtBrowserContent({
  initialFilters,
  initialResponse,
  typeOptions,
  generationOptions,
  locationFilters,
}: ArtBrowserClientProps & Readonly<{
  locationFilters: ArtListFilters;
}>) {
  const [draftQuery, setDraftQuery] = useState(initialFilters.query);
  const [draftType, setDraftType] = useState<ArtListTypeFilter>(initialFilters.type);
  const [draftGeneration, setDraftGeneration] = useState<ArtListGenerationFilter>(initialFilters.generation);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [response, setResponse] = useState(initialResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setDraftQuery(activeFilters.query);
    setDraftType(activeFilters.type);
    setDraftGeneration(activeFilters.generation);
  }, [activeFilters]);

  const handleLocationFilters = useCallback(async (nextFilters: ArtListFilters) => {
    if (areArtFiltersEqual(nextFilters, activeFilters)) {
      return;
    }

    setActiveFilters(nextFilters);
    setError(null);

    if (areArtFiltersEqual(nextFilters, initialFilters)) {
      requestIdRef.current += 1;
      setLoading(false);
      setResponse(initialResponse);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const queryString = buildArtQueryString(nextFilters);
      const url = `/api/art${queryString}`;
      const result = await fetch(url).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`);
        }
        return res.json() as Promise<ArtPreviewResponse>;
      });

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setResponse(result);
    } catch (fetchError) {
      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load art.');
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, [activeFilters, initialFilters, initialResponse]);

  useEffect(() => {
    void handleLocationFilters(locationFilters);
  }, [handleLocationFilters, locationFilters]);

  const updateUrl = (nextFilters: ArtListFilters) => {
    const queryString = buildArtQueryString(nextFilters);
    window.history.pushState(null, "", queryString ? `/art${queryString}` : "/art");
  };

  const applyFilters = () => {
    updateUrl({
      query: draftQuery,
      type: draftType,
      generation: draftGeneration,
      cursor: null,
      history: [],
    });
  };

  const clearFilters = () => {
    setDraftQuery(DEFAULT_ART_FILTERS.query);
    setDraftType(DEFAULT_ART_FILTERS.type);
    setDraftGeneration(DEFAULT_ART_FILTERS.generation);
    updateUrl(DEFAULT_ART_FILTERS);
  };

  const page = response.page;
  const previousFilters: ArtListFilters = {
    query: activeFilters.query,
    type: activeFilters.type,
    generation: activeFilters.generation,
    cursor: activeFilters.history.at(-1) ?? null,
    history: activeFilters.history.slice(0, -1),
  };
  const nextFilters: ArtListFilters = {
    query: activeFilters.query,
    type: activeFilters.type,
    generation: activeFilters.generation,
    cursor: response.nextCursor,
    history: [...activeFilters.history, activeFilters.cursor],
  };

  return (
    <DSSection>
      <DSLoadingOverlay loading={loading} error={error} dismissError={setError} />

      <ArtToolbar
        query={draftQuery}
        type={draftType}
        generation={draftGeneration}
        typeOptions={typeOptions}
        generationOptions={generationOptions}
        onQueryChange={setDraftQuery}
        onTypeChange={setDraftType}
        onGenerationChange={setDraftGeneration}
        onApply={applyFilters}
        onClear={clearFilters}
        disabled={loading}
      />

      {response.totalArts === 0 ? (
        <DSSection.Card>
          <DSText.Body tone="muted">No art matched the current filters.</DSText.Body>
        </DSSection.Card>
      ) : (
        <>
          <DSSection.Text>
            <DSText.Caption>
              Showing {response.items.length} of {response.totalArts} art entries
            </DSText.Caption>
            <DSText.Caption>
              Page {page} of {response.totalPages}
            </DSText.Caption>
          </DSSection.Text>
          <DSSection.Grid columns={3}>
            {response.items.map((item) => (
              <ArtPreviewItem
                key={item.art.id}
                art={item.art}
                href={item.href}
                artistName={item.artistName}
              />
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
