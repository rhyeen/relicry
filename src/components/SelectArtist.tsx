"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Artist } from "@/entities/Artist";
import DSButton from "@/components/ds/DSButton";
import DSDialog from "@/components/ds/DSDialog";
import DSField from "@/components/ds/DSField";
import { useAuthUser } from "@/lib/client/useAuthUser";

type SelectArtistProps = Readonly<{
  selectedArtistId?: string;
  onSelect: (artist: Artist) => void;
}>;

export default function SelectArtist({
  selectedArtistId,
  onSelect,
}: SelectArtistProps) {
  const authUser = useAuthUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const selectedArtist = useMemo(
    () => artists.find((artist) => artist.id === selectedArtistId) ?? null,
    [artists, selectedArtistId],
  );

  const selectedArtistDescription = selectedArtist
    ? `Selected: ${selectedArtist.name}`
    : selectedArtistId
      ? `Selected: ${selectedArtistId}`
      : "No artist selected.";

  const loadArtists = useCallback(
    async (options?: { force?: boolean }) => {
      if (loading) return;
      if (!options?.force && loaded) return;
      if (!authUser.ready || !authUser.user) {
        setError("Authentication required to load artists.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await authUser.user.getIdToken();
        const res = await fetch("/api/admin/artists", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || json?.details || `Failed to load artists (${res.status})`);
        }
        setArtists(Array.isArray(json?.artists) ? (json.artists as Artist[]) : []);
        setLoaded(true);
      } catch (err: unknown) {
        setError((err as Error)?.message ?? "Failed to load artists.");
      } finally {
        setLoading(false);
      }
    },
    [authUser.ready, authUser.user, loaded, loading],
  );

  useEffect(() => {
    if (!dialogOpen) return;
    if (!authUser.ready || !authUser.user) return;
    void loadArtists();
  }, [dialogOpen, authUser.ready, authUser.user, loadArtists]);

  const filteredArtists = useMemo(() => {
    if (!normalizedQuery) return artists;
    return artists.filter((artist) => {
      const name = artist.name?.toLowerCase() || "";
      const id = artist.id?.toLowerCase() || "";
      return name.includes(normalizedQuery) || id.includes(normalizedQuery);
    });
  }, [artists, normalizedQuery]);

  const handleSelect = (artist: Artist) => {
    onSelect(artist);
    setDialogOpen(false);
  };

  const noop = () => {};

  return (
    <>
      <DSField
        label="Artist ID"
        value={selectedArtistId || ""}
        onChange={noop}
        placeholder="Select an artist"
        readonly
        description={selectedArtistDescription}
      />

      <DSButton
        onClick={() => setDialogOpen(true)}
        label={selectedArtistId ? "Change Artist" : "Select Artist"}
      />

      <DSDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Select Artist"
        description="Choose the artist for this art piece."
        content={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <DSField
              label="Search Artists"
              value={query}
              onChange={setQuery}
              placeholder="Search by name or ID"
            />

            {loading && (
              <DSField.Root>
                <DSField.Description description="Loading artists..." />
              </DSField.Root>
            )}

            {error && (
              <DSField.Root>
                <DSField.Error error={error} />
              </DSField.Root>
            )}

            {!loading && filteredArtists.length === 0 && (
              <DSField.Root>
                <DSField.Description
                  description={normalizedQuery ? "No artists match your search." : "No artists available."}
                />
              </DSField.Root>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredArtists.map((artist) => {
                const label = artist.name?.trim()
                  ? `${artist.name} (${artist.id})`
                  : artist.id;
                const isSelected = artist.id === selectedArtistId;
                return (
                  <DSButton
                    key={artist.id}
                    label={isSelected ? `${label} (Selected)` : label}
                    onClick={() => handleSelect(artist)}
                    disabled={isSelected}
                  />
                );
              })}
            </div>

            {error && (
              <DSButton
                label="Retry Load"
                onClick={() => loadArtists({ force: true })}
                disabled={loading}
              />
            )}
          </div>
        }
        actions={<DSDialog.Close onClick={() => setDialogOpen(false)} />}
      />
    </>
  );
}
