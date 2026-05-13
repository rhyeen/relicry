"use client";

import DSButton from "@/components/ds/DSButton";
import DSField from "@/components/ds/DSField";
import DSSection from "@/components/ds/DSSection";
import DSSelect from "@/components/ds/DSSelect";
import type { ArtListGenerationFilter, ArtListTypeFilter } from "@/lib/artList";

type ArtToolbarProps = Readonly<{
  query: string;
  type: ArtListTypeFilter;
  generation: ArtListGenerationFilter;
  typeOptions: { label: string; value: ArtListTypeFilter }[];
  generationOptions: { label: string; value: ArtListGenerationFilter }[];
  onQueryChange: (value: string) => void;
  onTypeChange: (value: ArtListTypeFilter) => void;
  onGenerationChange: (value: ArtListGenerationFilter) => void;
  onApply: () => void;
  onClear: () => void;
  disabled?: boolean;
}>;

export default function ArtToolbar({
  query,
  type,
  generation,
  typeOptions,
  generationOptions,
  onQueryChange,
  onTypeChange,
  onGenerationChange,
  onApply,
  onClear,
  disabled = false,
}: ArtToolbarProps) {
  return (
    <DSSection.Card background="dark" padding="normal">
      <DSSection.Grid columns={4}>
        <DSField
          label="Search by art or artist"
          value={query}
          onChange={onQueryChange}
          placeholder="Search art, artists, or IDs"
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
        <DSSection.Actions>
          <DSButton onClick={onApply} label="Apply" disabled={disabled} />
          <DSButton onClick={onClear} label="Clear" disabled={disabled} />
        </DSSection.Actions>
      </DSSection.Grid>
    </DSSection.Card>
  );
}
