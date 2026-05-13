"use client";

import { useState } from "react";
import DSButton from "@/components/ds/DSButton";
import DSDialog from "@/components/ds/DSDialog";
import DSField from "@/components/ds/DSField";
import DSSelect from "@/components/ds/DSSelect";
import type { ArtListGenerationFilter, ArtListTypeFilter } from "@/lib/artList";
import styles from "./ArtBrowserClient.module.css";

type ArtToolbarProps = Readonly<{
  query: string;
  artistId: string;
  type: ArtListTypeFilter;
  generation: ArtListGenerationFilter;
  typeOptions: { label: string; value: ArtListTypeFilter }[];
  generationOptions: { label: string; value: ArtListGenerationFilter }[];
  onQueryChange: (value: string) => void;
  onArtistIdChange: (value: string) => void;
  onTypeChange: (value: ArtListTypeFilter) => void;
  onGenerationChange: (value: ArtListGenerationFilter) => void;
  onApply: () => void;
  onClear: () => void;
  disabled?: boolean;
}>;

export default function ArtToolbar({
  query,
  artistId,
  type,
  generation,
  typeOptions,
  generationOptions,
  onQueryChange,
  onArtistIdChange,
  onTypeChange,
  onGenerationChange,
  onApply,
  onClear,
  disabled = false,
}: ArtToolbarProps) {
  const [open, setOpen] = useState(false);
  const applyAndClose = () => {
    onApply();
    setOpen(false);
  };
  const clearAndClose = () => {
    onClear();
    setOpen(false);
  };

  return (
    <>
      <DSButton
        label="Filters"
        variant="primary"
        disabled={disabled}
        onClick={() => setOpen(true)}
      />
      <DSDialog
        open={open}
        onOpenChange={setOpen}
        onClose={() => setOpen(false)}
        title="Filter art"
        description="Search by art, artist, or ID, then narrow the gallery by type or generation."
        content={
          <div className={styles.filterContent}>
            <DSField
              label="Search by art or artist"
              value={query}
              onChange={onQueryChange}
              placeholder="Search art, artists, or IDs"
              disabled={disabled}
            />
            <DSField
              label="Artist ID"
              value={artistId}
              onChange={onArtistIdChange}
              placeholder="ast/sbgv1mxyml or sbgv1mxyml"
              disabled={disabled}
            />
            <DSSelect
              label="Type"
              options={typeOptions}
              value={type}
              onChange={onTypeChange}
              disabled={disabled}
            />
            <DSSelect
              label="Generation"
              options={generationOptions}
              value={generation}
              onChange={onGenerationChange}
              disabled={disabled}
            />
          </div>
        }
        actions={
          <div className={styles.filterActions}>
            <DSButton onClick={clearAndClose} label="Clear" disabled={disabled} variant="ghost" />
            <DSButton onClick={applyAndClose} label="Apply" disabled={disabled} variant="primary" />
          </div>
        }
      />
    </>
  );
}
