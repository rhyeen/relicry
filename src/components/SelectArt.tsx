"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Art } from "@/entities/Art";
import { ImageSize, ImageStorage } from "@/entities/Image";
import DSButton from "@/components/ds/DSButton";
import DSDialog from "@/components/ds/DSDialog";
import DSField from "@/components/ds/DSField";
import { useAuthUser } from "@/lib/client/useAuthUser";
import StoredImage from "@/components/client/StoredImage";

type SelectArtProps = Readonly<{
  selectedArtId?: string;
  // @NOTE: onSelect is not called if selectedArtId is set.
  // It is only called when one is selected from the dialog.
  onSelect: (art: Art) => void;
  type?: "illustration" | "writing";
}>;

export default function SelectArt({
  selectedArtId,
  onSelect,
  type = "illustration",
}: SelectArtProps) {
  const authUser = useAuthUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [arts, setArts] = useState<Art[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const selectedArt = useMemo(
    () => arts.find((art) => art.id === selectedArtId) ?? null,
    [arts, selectedArtId],
  );

  const selectedArtDescription = selectedArt
    ? `Selected: ${selectedArt.title ? selectedArt.title : selectedArt.id}`
    : selectedArtId
      ? `Selected: ${selectedArtId}`
      : "No art selected.";

  const loadArts = useCallback(
    async (options?: { force?: boolean }) => {
      if (loading) return;
      if (!options?.force && loaded) return;
      if (!authUser.ready || !authUser.user) {
        setError("Authentication required to load art.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await authUser.user.getIdToken();
        const res = await fetch(`/api/admin/art?type=${type}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || json?.details || `Failed to load art (${res.status})`);
        }
        setArts(Array.isArray(json?.arts) ? (json.arts as Art[]) : []);
        setLoaded(true);
      } catch (err: unknown) {
        setError((err as Error)?.message ?? "Failed to load art.");
      } finally {
        setLoading(false);
      }
    },
    [authUser.ready, authUser.user, loaded, loading, type],
  );

  useEffect(() => {
    if (!dialogOpen && !selectedArtId) return;
    if (!authUser.ready || !authUser.user) return;
    void loadArts();
  }, [dialogOpen, authUser.ready, authUser.user, loadArts, selectedArtId]);

  const filteredArts = useMemo(() => {
    if (!normalizedQuery) return arts;
    return arts.filter((art) => {
      const title = art.title?.toLowerCase() || "";
      const id = art.id?.toLowerCase() || "";
      const artistId = art.artistId?.toLowerCase() || "";
      return (
        title.includes(normalizedQuery) ||
        id.includes(normalizedQuery) ||
        artistId.includes(normalizedQuery)
      );
    });
  }, [arts, normalizedQuery]);

  const handleSelect = (art: Art) => {
    onSelect(art);
    setDialogOpen(false);
  };

  const getPreviewImage = (art: Art | null): ImageStorage | null => {
    if (!art || art.type !== "illustration") return null;
    return (
      art.image?.[ImageSize.CardPreview] ||
      art.image?.[ImageSize.Card] ||
      art.image?.[ImageSize.CardFull] ||
      null
    );
  };

  const noop = () => {};

  const previewImage = getPreviewImage(selectedArt);

  return (
    <>
      <DSField
        label="Illustration Art ID"
        value={selectedArtId || ""}
        onChange={noop}
        placeholder="Select art"
        readonly
        description={selectedArtDescription}
      />

      {previewImage && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StoredImage
            image={previewImage}
            size={{ width: 50, height: 50 }}
            alt={selectedArt?.title || selectedArt?.id}
          />
          <DSField.Root>
            <DSField.Description description="Selected art preview" />
          </DSField.Root>
        </div>
      )}

      <DSButton
        onClick={() => setDialogOpen(true)}
        label={selectedArtId ? "Change Art" : "Select Art"}
      />

      <DSDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Select Art"
        description="Choose the art for this card."
        content={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <DSField
              label="Search Art"
              value={query}
              onChange={setQuery}
              placeholder="Search by title, art ID, or artist ID"
            />

            {loading && (
              <DSField.Root>
                <DSField.Description description="Loading art..." />
              </DSField.Root>
            )}

            {error && (
              <DSField.Root>
                <DSField.Error error={error} />
              </DSField.Root>
            )}

            {!loading && filteredArts.length === 0 && (
              <DSField.Root>
                <DSField.Description
                  description={normalizedQuery ? "No art matches your search." : "No art available."}
                />
              </DSField.Root>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredArts.map((art) => {
                const preview = getPreviewImage(art);
                const label = art.title?.trim()
                  ? `${art.title} (${art.id})`
                  : art.id;
                const isSelected = art.id === selectedArtId;
                return (
                  <div
                    key={art.id}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    {preview && (
                      <StoredImage
                        image={preview}
                        size={{ width: 50, height: 50 }}
                        alt={art.title || art.id}
                      />
                    )}
                    <DSButton
                      label={isSelected ? `${label} (Selected)` : label}
                      onClick={() => handleSelect(art)}
                      disabled={isSelected}
                    />
                  </div>
                );
              })}
            </div>

            {error && (
              <DSButton
                label="Retry Load"
                onClick={() => loadArts({ force: true })}
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
