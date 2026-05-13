"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ArtPreviewItem from "@/components/ArtPreviewItem";
import AdminPageAction from "@/components/client/AdminPageAction";
import StoredImage from "@/components/client/StoredImage";
import DSLoadingOverlay from "@/components/ds/DSLoadingOverlay";
import DSPagination from "@/components/ds/DSPagination";
import DSSection from "@/components/ds/DSSection";
import DSText from "@/components/ds/DSText";
import { AdminRole } from "@/entities/AdminRole";
import { ImageSize, ImageStorage } from "@/entities/Image";
import type { ArtPreviewListItem, ArtPreviewResponse } from "@/lib/artApi";
import {
  areArtFiltersEqual,
  ArtListFilters,
  ArtListGenerationFilter,
  ArtListTypeFilter,
  buildArtQueryString,
  DEFAULT_ART_FILTERS,
  hasActiveArtFilters,
  parseArtFilters,
} from "@/lib/artList";
import ArtToolbar from "./ArtToolbar";
import styles from "./ArtBrowserClient.module.css";

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
  const [draftArtistId, setDraftArtistId] = useState(initialFilters.artistId);
  const [draftType, setDraftType] = useState<ArtListTypeFilter>(initialFilters.type);
  const [draftGeneration, setDraftGeneration] = useState<ArtListGenerationFilter>(initialFilters.generation);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [response, setResponse] = useState(initialResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setDraftQuery(activeFilters.query);
    setDraftArtistId(activeFilters.artistId);
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
      artistId: draftArtistId,
      type: draftType,
      generation: draftGeneration,
      page: 1,
    });
  };

  const clearFilters = () => {
    setDraftQuery(DEFAULT_ART_FILTERS.query);
    setDraftArtistId(DEFAULT_ART_FILTERS.artistId);
    setDraftType(DEFAULT_ART_FILTERS.type);
    setDraftGeneration(DEFAULT_ART_FILTERS.generation);
    updateUrl(DEFAULT_ART_FILTERS);
  };

  const page = response.page;
  const totalPages = response.totalPages;
  const previousFilters: ArtListFilters = {
    query: activeFilters.query,
    artistId: activeFilters.artistId,
    type: activeFilters.type,
    generation: activeFilters.generation,
    page: Math.max(1, page - 1),
  };
  const nextFilters: ArtListFilters = {
    query: activeFilters.query,
    artistId: activeFilters.artistId,
    type: activeFilters.type,
    generation: activeFilters.generation,
    page: Math.min(totalPages, page + 1),
  };
  const activeFilterState = hasActiveArtFilters(activeFilters);
  const featuredItems = useMemo(() => {
    if (activeFilterState) {
      return [];
    }

    const pickedItems = pickFeaturedItems(response.items, page);
    return pickedItems.length === 2 ? pickedItems : [];
  }, [activeFilterState, page, response.items]);
  const featuredIds = useMemo(
    () => new Set(featuredItems.map((item) => item.art.id)),
    [featuredItems],
  );
  const gridItems = featuredIds.size > 0
    ? response.items.filter((item) => !featuredIds.has(item.art.id))
    : response.items;

  return (
    <DSSection className={styles.gallery}>
      <DSLoadingOverlay loading={loading} error={error} dismissError={setError} />

      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Browse the Gallery</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Illustrations & Writing</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Explore Relicry art, from card illustrations to the stories that shape the world of Relicry and beyond.
          </DSText.Body>
        </DSSection.Text>
        <DSSection.Actions>
          <ArtToolbar
            query={draftQuery}
            artistId={draftArtistId}
            type={draftType}
            generation={draftGeneration}
            typeOptions={typeOptions}
            generationOptions={generationOptions}
            onQueryChange={setDraftQuery}
            onArtistIdChange={setDraftArtistId}
            onTypeChange={setDraftType}
            onGenerationChange={setDraftGeneration}
            onApply={applyFilters}
            onClear={clearFilters}
            disabled={loading}
          />
          <AdminPageAction href="/art/new" label="New Art" requiredRole={AdminRole.SuperAdmin} />
        </DSSection.Actions>
      </DSSection.Card>

      {response.totalArts === 0 ? (
        <DSSection.Card>
          <DSText.Body tone="muted">No art matched the current filters.</DSText.Body>
        </DSSection.Card>
      ) : (
        <>
          {featuredItems.length > 0 ? (
            <DSSection>
              <DSSection.Heading>
                <DSText.Eyebrow>Featured</DSText.Eyebrow>
                <DSText.Heading as="h2" size="xl">Illustration art</DSText.Heading>
              </DSSection.Heading>
              <div className={styles.featuredGrid}>
                {featuredItems.map((item) => (
                  <FeaturedArtCard key={item.art.id} item={item} />
                ))}
              </div>
            </DSSection>
          ) : null}

          <DSSection>
            <div className={styles.sectionHeader}>
              <DSSection.Heading>
                <DSText.Heading as="h2" size="xl">
                  {activeFilterState ? 'Art results' : 'See more art'}
                </DSText.Heading>
              </DSSection.Heading>
              <DSText.Caption>{gridItems.length} shown in this section</DSText.Caption>
            </div>
            <div className={styles.galleryGrid}>
              {gridItems.map((item) => (
                <ArtPreviewItem
                  key={item.art.id}
                  art={item.art}
                  href={item.href}
                  artistName={item.artistName}
                />
              ))}
            </div>
          </DSSection>

          <DSPagination>
            <DSPagination.Totals
              shown={response.items.length}
              total={response.totalArts}
              label="art entries"
            />
            <DSPagination.PageIndex page={page} totalPages={totalPages} />
            <DSPagination.Actions
              onPrevious={() => updateUrl(previousFilters)}
              onNext={() => updateUrl(nextFilters)}
              previousDisabled={page <= 1 || loading}
              nextDisabled={page >= totalPages || loading}
            />
          </DSPagination>
        </>
      )}
    </DSSection>
  );
}

function FeaturedArtCard({ item }: Readonly<{ item: ArtPreviewListItem }>) {
  const title = item.art.title?.trim() || "Untitled";
  const artist = item.artistName?.trim() || item.art.artistId || "Unassigned";
  const image = getFeaturedImage(item);

  if (!image) {
    return null;
  }

  return (
    <Link href={item.href} className={styles.featuredCard}>
      <div className={styles.featuredImageFrame}>
        <StoredImage
          image={image}
          size={ImageSize.Card}
          alt={title}
          className={styles.featuredImage}
          eager
        />
        <div className={styles.featuredContent}>
          <span className={styles.featuredTitle}>{title}</span>
          <span className={styles.featuredArtist}>{artist}</span>
        </div>
        {item.art.aIGenerated ? (
          <span className={styles.featuredAiBadge} aria-label="AI generated">AI</span>
        ) : null}
      </div>
    </Link>
  );
}

function pickFeaturedItems(items: ArtPreviewListItem[], page: number): ArtPreviewListItem[] {
  return items
    .filter((item) => getFeaturedImage(item))
    .map((item) => ({
      item,
      score: seededScore(`art-gallery:${page}:${item.art.id}`),
    }))
    .sort((left, right) => left.score - right.score)
    .slice(0, 2)
    .map(({ item }) => item);
}

function getFeaturedImage(item: ArtPreviewListItem): ImageStorage | null {
  const { art } = item;
  if (art.type !== "illustration") return null;
  return (
    art.image?.[ImageSize.Card] ||
    art.image?.[ImageSize.CardPreview] ||
    art.image?.[ImageSize.CardFull] ||
    null
  );
}

function seededScore(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
