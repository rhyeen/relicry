"use client";

import { Fragment, useMemo, useState } from "react";
import { Aspect, orderAspects, orderComboAspects } from "@/entities/Aspect";
import { orderRarities, Rarity } from "@/entities/Rarity";
import { orderTags, Tag } from "@/entities/Tag";
import { getCardDocId, Card as ExtendableCard, VersionedCard, VersionedDeckCard, VersionedFocusCard, Version, VersionedGambitCard } from "@/entities/Card";
import DSForm from "@/components/ds/DSForm";
import DSSection from "@/components/ds/DSSection";
import DSField, { fromDateOnlyString, toDateOnlyString } from "@/components/ds/DSField";
import DSSelect from "@/components/ds/DSSelect";
import DSSwitch from "@/components/ds/DSSwitch";
import DSButton from "@/components/ds/DSButton";
import DSToggleGroup from "@/components/ds/DSToggleGroup";
import CardEffectLine from "@/components/card/card-effects/CardEffectLine";
import { CardType } from "@/entities/CardContext";
import { cardEffectToString, stringToCardEffect } from "@/entities/CardEffectAsString";
import DSDialog from "@/components/ds/DSDialog";
import Card from "@/components/card/Card";
import SelectArt from "@/components/SelectArt";
import { useUser } from '@/lib/client/useUser';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import PermissionDenied from '@/app/permission-denied';
import DSLoadingOverlay from '../ds/DSLoadingOverlay';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useRouter } from 'next/navigation';
import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';

const CURRENT_SEASON = 1;

const FormErrors = {
  tagsError: (tags: Tag[]): string | undefined => {
    const TYPE_TAGS = [Tag.Ability, Tag.Item, Tag.Gambit, Tag.Focus] as const;
    const typeCount = tags.filter((t) => TYPE_TAGS.includes(t as (typeof TYPE_TAGS)[number])).length;
    let error: string | undefined;
    if (tags.length < 1) {
      error = "At least one tag is required.";
    } else if (typeCount < 1) {
      error = "Tags must include one of: Ability, Item, Gambit, or Focus.";
    } else if (typeCount > 1) {
      error = "Only one of Ability, Item, Gambit, or Focus tag is allowed.";
    } else {
      error = undefined;
    }
    return error;
  },
  getSubtitleError: (rarity: Rarity, subTitle: string | undefined): string | undefined => {
    if ([Rarity.Epic, Rarity.Legendary].includes(rarity) && !subTitle?.trim()) {
      return "SubTitle is required for Epic and Legendary cards.";
    }
    return undefined;
  },
  getTitleError: (title: string): string | undefined => {
    if (!title.trim()) {
      return "Title is required.";
    }
    return undefined;
  },
  getVersionError: (version: number): string | undefined => {
    if (isNaN(version) || !Number.isInteger(version)) {
      return "Version must be a integer.";
    }
    if (version < 1) {
      return "Version must be at least 1. If this is a sample card, it will automatically be converted to a negative season.";
    }
    return undefined;
  },
};

export function getDefaultNewCard(type: "deck" | "focus" | "gambit"): VersionedCard {
  switch (type) {
    case "deck":
      return getDefaultNewDeckCard();
    case "focus":
      return getDefaultNewFocusCard();
    case "gambit":
      return getDefaultNewGambitCard();
    default:
      throw new Error(`Unknown card type: ${type}`);
  }
}

function getDefaultCard(): ExtendableCard {
  return {
    title: "",
    tags: [],
    effects: [],
    id: "",
    type: "deck",
    rarity: Rarity.Common,
  };
}

function getDefaultVersion(): Version {
  return {
    version: 1,
    season: CURRENT_SEASON,
    isFeatured: true,
    illustration: { artId: "", artistId: "" },
    flavorText: {
      extended: null,
      onCard: { text: "", source: "" },
    },
    subTitle: "",
    revealedAt: null,
    revealedContext: "",
    publishedAt: null,
    publishedContext: "",
    archivedAt: null,
    archivedContext: "",
    isSample: true,
  };
}

export function getDefaultNewGambitCard(): VersionedGambitCard {
  return {
    ...getDefaultCard(),
    ...getDefaultVersion(),
    type: "gambit",
  };
}

export function getDefaultNewFocusCard(): VersionedFocusCard {
  return {
    ...getDefaultCard(),
    ...getDefaultVersion(),
    type: "focus",
    aspect: Aspect.Brave,
    awakened: {
      title: "",
      tags: [],
      effects: [],
    },
    awakenedVersion: {
      illustration: { artId: "", artistId: "" },
      flavorText: {
        extended: null,
        onCard: { text: "", source: "" },
      },
    },
  };
}

export function getDefaultNewDeckCard(): VersionedDeckCard {
  return {
    ...getDefaultCard(),
    ...getDefaultVersion(),
    type: 'deck',
    drawLimit: 1,
    scrapCost: [],
    aspect: Aspect.Brave,
  };
}

type EditCardProps = Readonly<{
  card?: VersionedCard;
}>;

export default function EditCard({ card: initCard }: EditCardProps) {
  // Keyed remount = reset form when switching cards/types (no effect-based setState)
  const editorKey = useMemo(() => {
    if (initCard?.id) return `${initCard.id}:${initCard.version}`;
    return 'new';
  }, [initCard?.id, initCard?.version]);
  const { user, ready } = useUser();
  if (!ready) {
    return null;
  }
  if (!hasRole(user?.adminRoles, AdminRole.SuperAdmin)) {
    return PermissionDenied();
  }

  return <EditCardInner key={editorKey} initCard={initCard} />;
}

function EditCardInner({
  initCard,
}: {
  initCard?: VersionedCard;
}) {
  const rarityOptions = useMemo(
    () => orderRarities().map((value) => ({ label: value.toLocaleUpperCase(), value })),
    []
  );

  const authUser = useAuthUser();
  const router = useRouter();
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [card, setCard] = useState<VersionedCard>(() => initCard ?? getDefaultNewCard("deck"));
  const [effectDrafts, setEffectDrafts] = useState<string[]>(() =>
    (initCard ?? getDefaultNewCard("deck")).effects.map((effect) =>
      cardEffectToString(effect, { permitEndingSpace: true })
    )
  );
  const [awakenedEffectDrafts, setAwakenedEffectDrafts] = useState<string[]>(() => {
    const baseCard = initCard ?? getDefaultNewCard("deck");
    if (baseCard.type !== "focus") return [];
    return (baseCard as VersionedFocusCard).awakened.effects.map((effect) =>
      cardEffectToString(effect, { permitEndingSpace: true })
    );
  });
  const [previewArt, setPreviewArt] = useState<Art | null>(null);
  const [previewArtist, setPreviewArtist] = useState<Artist | null>(null);
  const [previewAwakenedArt, setPreviewAwakenedArt] = useState<Art | null>(null);
  const [previewAwakenedArtist, setPreviewAwakenedArtist] = useState<Artist | null>(null);
  const cardType = card.type;

  const tagOptions = useMemo(
    () => orderTags(undefined, cardType).map((value) => ({ label: value.toLocaleUpperCase(), value })),
    [cardType]
  );

  const aspectOptions = useMemo(() =>
    [...orderAspects(), ...(cardType === 'deck' ? orderComboAspects() : [])].map((value) => ({
      label:
        typeof value === "string"
          ? value.toLocaleUpperCase()
          : value.map((v) => v.toLocaleUpperCase()).join(" + "),
      value,
    })),
    [cardType]
  );

  const update = <K extends keyof VersionedCard>(key: K, value: VersionedCard[K]) => {
    setCard((c) => ({ ...c, [key]: value }));
  };

  const loadPreviewParts = async () => {
    if (!card.illustration?.artId && !card.illustration?.artistId) return;
    setLoading(true);
    try {
      const token = await authUser.user?.getIdToken();
      const [artRes, artistRes, awakenedArtRes, awakenedArtistRes] = await Promise.all([
        fetch(`/api/${card.illustration.artId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        fetch(`/api/${card.illustration.artistId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        (card as VersionedFocusCard).awakenedVersion?.illustration?.artId
          ? fetch(`/api/${(card as VersionedFocusCard).awakenedVersion?.illustration?.artId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })
          : Promise.resolve({ ok: false, json: async () => ({}), status: 204 }),
        (card as VersionedFocusCard).awakenedVersion?.illustration?.artistId
          ? fetch(`/api/${(card as VersionedFocusCard).awakenedVersion?.illustration?.artistId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })
          : Promise.resolve({ ok: false, json: async () => ({}), status: 204 }),
      ]);
      const [ artJson, artistJson, awakenedArtJson, awakenedArtistJson ] = await Promise.all([
        artRes.json().catch(() => ({})),
        artistRes.json().catch(() => ({})),
        awakenedArtRes.json().catch(() => ({})),
        awakenedArtistRes.json().catch(() => ({})),
      ]);
      if (!artRes.ok) {
        throw new Error(artJson?.error || artJson?.details || `Failed to load art (${artRes.status})`);
      }
      if (!artistRes.ok) {
        throw new Error(artistJson?.error || artistJson?.details || `Failed to load artist (${artistRes.status})`);
      }
      if (awakenedArtRes.ok && !awakenedArtJson?.art) {
        throw new Error(awakenedArtJson?.error || awakenedArtJson?.details || `Failed to load awakened art (${awakenedArtRes.status})`);
      }
      if (awakenedArtistRes.ok && !awakenedArtistJson?.artist) {
        throw new Error(awakenedArtistJson?.error || awakenedArtistJson?.details || `Failed to load awakened artist (${awakenedArtistRes.status})`);
      }
      setPreviewArt(artJson.art as Art);
      setPreviewArtist(artistJson.artist as Artist);
      setPreviewAwakenedArt(awakenedArtJson.art as Art);
      setPreviewAwakenedArtist(awakenedArtistJson.artist as Artist);
    } catch (err: unknown) {
      console.error("Failed to load preview art or artist:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFinalVersionedCard = (): VersionedCard => {
    switch (card.type) {
      case "deck":
        return getFinalDeckCard(card as VersionedDeckCard);
      case "focus":
        return getFinalFocusCard(card as VersionedFocusCard);
      case "gambit":
        return getFinalGambitCard(card as VersionedGambitCard);
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error(`Unknown card type: ${(card as any).type}`);
    }
  };

  const getFinalDeckCard = (card: VersionedDeckCard): VersionedDeckCard => {
    return {
      ...getFinalCard(card),
      ...getFinalVersion(card),
      type: 'deck',
      drawLimit: card.drawLimit,
      scrapCost: [...card.scrapCost],
      aspect: Array.isArray(card.aspect) ? [ ...card.aspect ] : card.aspect,
    };
  };

  const getFinalFocusCard = (card: VersionedFocusCard): VersionedFocusCard => {
    return {
      ...getFinalCard(card),
      ...getFinalVersion(card),
      type: 'focus',
      aspect: Array.isArray(card.aspect) ? [ ...card.aspect ] : card.aspect,
      awakened: {
        title: card.awakened?.title?.trim(),
        tags: [...(card.awakened?.tags ?? [])],
        effects: card.awakened?.effects.map((e) => stringToCardEffect(cardEffectToString(e))) ?? [],
      },
      awakenedVersion: {
        illustration: card.awakenedVersion?.illustration ? { ...card.awakenedVersion.illustration } : { artId: "", artistId: "" },
        flavorText: card.awakenedVersion?.flavorText?.onCard?.text
        ? {
            extended: card.awakenedVersion.flavorText.extended?.artId ? { ...card.awakenedVersion.flavorText.extended } : null,
            onCard: card.awakenedVersion.flavorText.onCard.text.trim()
              ? {
                  text: card.awakenedVersion.flavorText.onCard.text.trim(),
                  source: card.awakenedVersion.flavorText.onCard.source?.trim()
                    ? card.awakenedVersion.flavorText.onCard.source.trim()
                    : undefined,
                }
              : null,
          }
        : undefined,
      }
    };
  };

  const getFinalGambitCard = (card: VersionedGambitCard): VersionedGambitCard => {
    return {
      ...getFinalCard(card),
      ...getFinalVersion(card),
      type: 'gambit',
    };
  };

  const getFinalCard = (card: VersionedCard): ExtendableCard => {
    return {
      id: card.id,
      type: card.type,
      title: card.title.trim(),
      rarity: card.rarity,
      // Remove any trailing spaces from card effect parts
      effects: card.effects.map((e) => stringToCardEffect(cardEffectToString(e))),
      tags: [...card.tags],
    };
  };

  const getFinalVersion = (card: VersionedCard): Version => {
    return {
      version: card.version,
      season: card.isSample ? card.season * -1 : card.season,
      isFeatured: card.isFeatured,
      illustration: card.illustration ? { ...card.illustration } : { artId: "", artistId: "" },
      flavorText: card.flavorText?.onCard?.text
        ? {
            extended: card.flavorText.extended?.artId ? { ...card.flavorText.extended } : null,
            onCard: card.flavorText.onCard.text.trim()
              ? {
                  text: card.flavorText.onCard.text.trim(),
                  source: card.flavorText.onCard.source?.trim()
                    ? card.flavorText.onCard.source.trim()
                    : undefined,
                }
              : null,
          }
        : undefined,
      subTitle:
        [Rarity.Epic, Rarity.Legendary].includes(card.rarity) && card.subTitle?.trim()
          ? card.subTitle
          : undefined,
      revealedAt: card.revealedAt ? new Date(card.revealedAt) : null,
      revealedContext: card.revealedContext?.trim() ? card.revealedContext : undefined,
      publishedAt: card.publishedAt ? new Date(card.publishedAt) : null,
      publishedContext: card.publishedAt && card.publishedContext?.trim() ? card.publishedContext : undefined,
      archivedAt: card.archivedAt ? new Date(card.archivedAt) : null,
      archivedContext: card.archivedAt && card.archivedContext?.trim() ? card.archivedContext : undefined,
      isSample: card.isSample,
    };
  };

  const onSave = async () => {
    if (!authUser.ready || !authUser.user || loading) return;
    const hasErrors = card.isSample
      ? false
      : !!FormErrors.tagsError(card.tags) ||
        !!FormErrors.getTitleError(card.title) ||
        !!FormErrors.getSubtitleError(card.rarity, card.subTitle) ||
        !!FormErrors.getVersionError(card.version);

    if (hasErrors) {
      setSaveAttempted(true);
      return;
    }

    const copiedCard = getFinalVersionedCard();
    setLoading(true);
    setSaveError(null);

    try {
      const token = await authUser.user.getIdToken();
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ card: copiedCard }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Save failed (${res.status})`);
      }
      const { id, version } = json.card as { id: string; version: number };
      router.push(`/${getCardDocId(id, version)}`);
      // @NOTE: ensures fresh data if the destination is cached
      router.refresh();
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DSSection>
      <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
      <DSForm>
        <DSForm.Title>Edit Card</DSForm.Title>
        <DSForm.Description>
          Edit or create a card version. Leaving it as a sample card will allow it to be created without validation.
        </DSForm.Description>

        <DSField
          label="Card ID"
          value={card.id}
          onChange={(value) => update("id", value)}
          placeholder="Will be generated if new card"
          readonly
        />

        <DSSwitch
          label="Is Sample"
          checked={card.isSample}
          onChange={(value) => update("isSample", value)}
        />

        <DSSwitch
          label="Is Featured"
          checked={card.isFeatured}
          onChange={(value) => update("isFeatured", value)}
        />

        <DSSelect
          label="Type"
          options={[
            { label: "Deck", value: "deck" },
            { label: "Focus", value: "focus" },
            { label: "Gambit", value: "gambit" },
          ]}
          value={card.type}
          onChange={(type) => setCard((c) => {
            const newCard = {
            ...(type === 'deck' ? getDefaultNewDeckCard() :
            type === 'focus' ? getDefaultNewFocusCard() :
              getDefaultNewGambitCard()),
            ...c,
            type,
            } as VersionedDeckCard | VersionedFocusCard | VersionedGambitCard;
            // @NOTE: Focuses cannot have two aspects.
            if (newCard.type === 'focus') {
              if (Array.isArray((newCard as VersionedFocusCard).aspect)) {
                (newCard as VersionedFocusCard).aspect = Aspect.Brave;
              }
              newCard.tags = [
                Tag.Focus,
                ...(newCard.tags.filter((t) => (
                  t !== Tag.Ability &&
                  t !== Tag.Item &&
                  t !== Tag.Gambit &&
                  // @NOTE: Added above
                  t !== Tag.Focus
                ))),
              ];
              newCard.awakened.tags = [
                Tag.Focus,
                ...(newCard.awakened.tags.filter((t) => (
                  t !== Tag.Ability &&
                  t !== Tag.Item &&
                  t !== Tag.Gambit &&
                  // @NOTE: Added above
                  t !== Tag.Focus
                ))),
              ];
            }
            // @NOTE: Gambits only have the Gambit tag.
            if (newCard.type === 'gambit') {
              newCard.tags = [Tag.Gambit];
            }
            if (newCard.type === 'deck') {
              newCard.tags = [
                ...(newCard.tags.filter((t) => (
                  t !== Tag.Gambit &&
                  t !== Tag.Focus
                ))),
              ];
            }
            return newCard;
          })}
        />

        {(card.type === "deck" || card.type === "focus") && (
          <DSSelect
            label="Aspect"
            options={aspectOptions}
            value={card.aspect}
            onChange={(aspect) => setCard((c) => ({ ...c, aspect }) as VersionedDeckCard | VersionedFocusCard )}
            required={!card.isSample}
          />
        )}

        {card.type === "deck" &&
          <DSSelect
            label="Draw Limit"
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ label: n.toString(), value: n }))}
            value={card.drawLimit}
            onChange={(value) => update("drawLimit", value)}
          />
        }

        {card.type === "deck" &&
          (card as VersionedDeckCard).scrapCost.map((cost, index) => (
            <DSSelect
              key={index}
              label={`Scrap Cost #${index + 1}`}
              options={[...aspectOptions, { label: "Remove", value: "REMOVE" as unknown as Aspect }]}
              value={cost}
              onChange={(value) => {
                if ((value as unknown) === "REMOVE") {
                  setCard((c) => ({
                    ...c,
                    scrapCost: (c as VersionedDeckCard).scrapCost.filter((_, i) => i !== index),
                  }));
                } else {
                  setCard((c) => ({
                    ...c,
                    scrapCost: (c as VersionedDeckCard).scrapCost.map((cost, i) => (i === index ? value : cost)),
                  }));
                }
              }}
  
            />
          ))}

        {card.type === "deck" && (card as VersionedDeckCard).scrapCost.length < 4 && (
          <DSButton
            onClick={() =>
              setCard((c) => ({ ...c, scrapCost: [...(c as VersionedDeckCard).scrapCost, Aspect.Brave] }))
            }
            label="+ Scrap Cost"
          />
        )}

        {card.effects.map((effect, index) => (
          <Fragment key={index}>
            <DSField
              label="Card Effect As Text"
              value={effectDrafts[index] ?? ""}
              onChange={(value) => {
                setEffectDrafts((current) => current.map((draft, i) => (i === index ? value : draft)));
                setCard((c) => ({
                  ...c,
                  effects: c.effects.map((e, i) =>
                    i === index ? stringToCardEffect(value, { permitEndingSpace: true }) : e
                  ),
                }));
              }}
  
            />
            <CardEffectLine effect={effect} ctx={{ type: CardType.Preview }} />
            <DSButton
              key={index}
              onClick={() => {
                setEffectDrafts((current) => current.filter((_, i) => i !== index));
                setCard((c) => ({
                  ...c,
                  effects: c.effects.filter((_, i) => i !== index),
                }));
              }}
              label="Remove"
  
            />
          </Fragment>
        ))}

        <DSButton
          onClick={() => {
            setEffectDrafts((current) => [...current, ""]);
            setCard((c) => ({
              ...c,
              effects: [
                ...c.effects,
                {
                  conditionals: [],
                  parts: [],
                },
              ],
            }));
          }}
          label="+ Card Effect"
        />

        { card.type !== "gambit" &&
          <DSToggleGroup.Text
            label="Tags"
            options={tagOptions}
            multiple
            values={card.tags}
            onChange={(values: Tag[]) => setCard((c) => ({ ...c, tags: values }))}
            minimum={card.isSample ? undefined : 1}
            error={saveAttempted ? FormErrors.tagsError(card.tags) : undefined}
          />
        }

        <DSSelect
          label="Rarity"
          options={rarityOptions}
          value={card.rarity}
          onChange={(value) => update("rarity", value as Rarity)}
          required={!card.isSample}
        />

        <DSField
          label="Title"
          value={card.title}
          onChange={(value) => update("title", value)}
          required={!card.isSample}
          error={saveAttempted ? FormErrors.getTitleError(card.title) : undefined}
        />

        {[Rarity.Epic, Rarity.Legendary].includes(card.rarity) && (
          <DSField
            label="Subtitle"
            value={card.subTitle || ""}
            onChange={(value) => update("subTitle", value)}
            required={!card.isSample}
            error={saveAttempted ? FormErrors.getSubtitleError(card.rarity, card.subTitle) : undefined}
          />
        )}

        <SelectArt
          selectedArtId={card.illustration?.artId}
          onSelect={(art) =>
            setCard((c) => ({
              ...c,
              illustration: {
                artId: art.id,
                artistId: art.artistId,
              },
            }))
          }
          type="illustration"
          required={!card.isSample}
        />

        <DSField
          label="Version"
          value={card.version.toString()}
          onChange={(value) => update("version", parseInt(value))}
          type="number"
          required
          error={saveAttempted ? FormErrors.getVersionError(card.version) : undefined}
        />

        <DSField
          label="Flavor Text"
          value={card.flavorText?.onCard?.text || ""}
          onChange={(value) =>
            setCard((c) => ({
              ...c,
              flavorText: {
                ...c.flavorText,
                extended: c.flavorText?.extended || { artistId: "", artId: "" },
                onCard: { text: value },
              },
            }))
          }
        />

        <DSField
          label="Flavor Text Source"
          value={card.flavorText?.onCard?.source || ""}
          onChange={(value) =>
            setCard((c) => ({
              ...c,
              flavorText: {
                ...c.flavorText,
                extended: c.flavorText?.extended || { artistId: "", artId: "" },
                onCard: { source: value, text: c.flavorText?.onCard?.text || "" },
              },
            }))
          }
        />

        <DSSwitch
          label="Extended Flavor Text?"
          checked={card.flavorText?.extended?.artId !== undefined}
          onChange={(value) =>
            setCard((c) => ({
              ...c,
              flavorText: {
                ...c.flavorText,
                extended: value ? c.flavorText?.extended || { artistId: "", artId: "" } : null,
                onCard: c.flavorText?.onCard || { text: "", source: "" },
              },
            }))
          }
        />

        {card.flavorText?.extended && (
          <SelectArt
            selectedArtId={card.flavorText.extended.artId}
            onSelect={(art) =>
              setCard((c) => ({
                ...c,
                flavorText: {
                  ...c.flavorText,
                  extended: {
                    artId: art.id,
                    artistId: art.artistId,
                  },
                  onCard: c.flavorText?.onCard || { text: "", source: "" },
                },
              }))
            }
            type="writing"
          />
        )}

        <DSSwitch
          label="Revealed?"
          checked={card.revealedAt !== null}
          onChange={(value) => update("revealedAt", value ? new Date() : null)}
          disabled={card.isSample}
        />

        {card.revealedAt && (
          <>
            <DSField
              label="Revealed At"
              type="date"
              value={toDateOnlyString(card.revealedAt)}
              onChange={(value) => update("revealedAt", fromDateOnlyString(value) || new Date())}
  
            />
            <DSField
              label="Revealed Context"
              value={card.revealedContext || ""}
              onChange={(value) => update("revealedContext", value)}
  
            />
          </>
        )}

        <DSSwitch
          label="Published?"
          checked={card.publishedAt !== null}
          onChange={(value) => update("publishedAt", value ? new Date() : null)}
          disabled={card.isSample}
        />

        {card.publishedAt && (
          <>
            <DSField
              label="Published At"
              type="date"
              value={toDateOnlyString(card.publishedAt)}
              onChange={(value) => update("publishedAt", fromDateOnlyString(value) || new Date())}
  
            />
            <DSField
              label="Published Context"
              value={card.publishedContext || ""}
              onChange={(value) => update("publishedContext", value)}
  
            />
          </>
        )}

        <DSSwitch
          label="Archived?"
          checked={card.archivedAt !== null}
          onChange={(value) => update("archivedAt", value ? new Date() : null)}
          disabled={card.isSample}
        />

        {card.archivedAt && (
          <>
            <DSField
              label="Archived At"
              type="date"
              value={toDateOnlyString(card.archivedAt)}
              onChange={(value) => update("archivedAt", fromDateOnlyString(value) || new Date())}
  
            />
            <DSField
              label="Archived Context"
              value={card.archivedContext || ""}
              onChange={(value) => update("archivedContext", value)}
  
            />
          </>
        )}


        {card.type === "focus" &&
          <>
            <h1>Awakened Version</h1>
            {card.awakened.effects.map((effect, index) => (
              <Fragment key={index}>
                <DSField
                  label="Awakened Card Effect As Text"
                  value={awakenedEffectDrafts[index] ?? ""}
                  onChange={(value) => {
                    setAwakenedEffectDrafts((current) => current.map((draft, i) => (i === index ? value : draft)));
                    setCard((c) => ({
                      ...c,
                      awakened: {
                        ...((c as VersionedFocusCard).awakened),
                        effects: (c as VersionedFocusCard).awakened.effects.map((e, i) =>
                          i === index ? stringToCardEffect(value, { permitEndingSpace: true }) : e
                        ),
                      },
                    }));
                  }}
      
                />
                <CardEffectLine effect={effect} ctx={{ type: CardType.Preview }} />
                <DSButton
                  key={index}
                  onClick={() => {
                    setAwakenedEffectDrafts((current) => current.filter((_, i) => i !== index));
                    setCard((c) => ({
                      ...c,
                      awakened: {
                        ...((c as VersionedFocusCard).awakened),
                        effects: (c as VersionedFocusCard).awakened.effects.filter((_, i) => i !== index),
                      },
                    }));
                  }}
                  label="Remove"
      
                />
              </Fragment>
            ))}

            <DSButton
              onClick={() => {
                setAwakenedEffectDrafts((current) => [...current, ""]);
                setCard((c) => ({
                  ...c,
                  awakened: {
                    ...((c as VersionedFocusCard).awakened),
                    effects: [
                      ...((c as VersionedFocusCard).awakened.effects),
                      {
                        conditionals: [],
                        parts: [],
                      },
                    ],
                  },
                }));
              }}
              label="+ Awakened Card Effect"
            />

            <DSToggleGroup.Text
              label="Awakened Tags"
              options={tagOptions}
              multiple
              values={card.awakened.tags}
              onChange={(values: Tag[]) => setCard((c) => ({ ...c, awakened: { ...((c as VersionedFocusCard).awakened), tags: values } }))}
              minimum={card.isSample ? undefined : 1}
              error={saveAttempted ? FormErrors.tagsError(card.tags) : undefined}
            />

            <DSField
              label="Awakened Title"
              value={card.awakened.title || ''}
              onChange={(value) =>
                setCard((c) => ({
                  ...c,
                  awakened: {
                    ...((c as VersionedFocusCard).awakened),
                    title: value,
                  },
                }))
              }
            />

            <SelectArt
              selectedArtId={card.awakenedVersion.illustration?.artId}
              onSelect={(art) =>
                setCard((c) => ({
                  ...c,
                  awakenedVersion: {
                    ...(c as VersionedFocusCard).awakenedVersion,
                    illustration: {
                      artId: art.id,
                      artistId: art.artistId,
                    },
                  },
                }))
              }
              type="illustration"
              label="Awakened Illustration (if different)"
            />

            <DSField
              label="Awakened Flavor Text"
              value={card.awakenedVersion?.flavorText?.onCard?.text || ""}
              onChange={(value) =>
                setCard((c) => ({
                  ...c,
                  awakenedVersion: {
                    ...(c as VersionedFocusCard).awakenedVersion,
                    flavorText: {
                      ...(c as VersionedFocusCard).awakenedVersion?.flavorText || { extended: null, onCard: { text: "", source: "" } },
                      onCard: { text: value },
                    },
                  },
                }))
              }
            />

            <DSField
              label="Awakened Flavor Text Source"
              value={card.awakenedVersion?.flavorText?.onCard?.source || ""}
              onChange={(value) =>
                setCard((c) => ({
                  ...c,
                  awakenedVersion: {
                    ...(c as VersionedFocusCard).awakenedVersion,
                    flavorText: {
                      ...(c as VersionedFocusCard).awakenedVersion?.flavorText || { extended: null, onCard: { text: "", source: "" } },
                      onCard: { ...((c as VersionedFocusCard).awakenedVersion?.flavorText?.onCard || { text: "", source: "" }), source: value },
                    },
                  },
                }))
              }
            />

            <DSSwitch
              label="Extended Awakened Flavor Text?"
              checked={card.awakenedVersion?.flavorText?.extended?.artId !== undefined}
              onChange={(value) =>
                setCard((c) => ({
                  ...c,
                  awakenedVersion: {
                    ...(c as VersionedFocusCard).awakenedVersion,
                    flavorText: {
                      ...(c as VersionedFocusCard).awakenedVersion?.flavorText || { extended: null, onCard: { text: "", source: "" } },
                      extended: value ? (c as VersionedFocusCard).awakenedVersion?.flavorText?.extended || { artistId: "", artId: "" } : null,
                    },
                  },
                }))
              }
            />

            {card.awakenedVersion?.flavorText?.extended && (
              <SelectArt
                selectedArtId={card.awakenedVersion.flavorText.extended.artId}
                onSelect={(art) =>
                  setCard((c) => ({
                    ...c,
                    awakenedVersion: {
                      ...(c as VersionedFocusCard).awakenedVersion,
                      flavorText: {
                        ...(c as VersionedFocusCard).awakenedVersion?.flavorText || { extended: null, onCard: { text: "", source: "" } },
                        extended: {
                          artId: art.id,
                          artistId: art.artistId,
                        },
                      },
                    },
                  }))
                }
                type="writing"
              />
            )}
          </>
        }

        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save" loading={loading} disabled={!authUser.ready} />

          <DSDialog
            title="Card Preview"
            trigger={
              <DSButton
                onClick={loadPreviewParts}
                label="Preview"
                dialogTrigger
                loading={loading}
              />
            }
            content={
              <Card
                card={getFinalVersionedCard()}
                ctx={{ type: CardType.Full }}
                art={previewArt}
                artist={previewArtist}
                awakenedArt={previewAwakenedArt}
                awakenedArtist={previewAwakenedArtist}
                awakened={false}
                flavorTextExtendedArt={null}
                flavorTextExtendedArtist={null}
                awakenedFlavorTextExtendedArt={null}
                awakenedFlavorTextExtendedArtist={null}
              />
            }
            actions={<DSDialog.Close />}
            loading={loading}
          />

          { card.type === "focus" &&
            <DSDialog
              title="Awakened Card Preview"
              trigger={
                <DSButton
                  onClick={loadPreviewParts}
                  label="Preview Awakened"
                  dialogTrigger
                  loading={loading}
                />
              }
              content={
                <Card
                  card={getFinalVersionedCard()}
                  ctx={{ type: CardType.Full }}
                  art={previewArt}
                  artist={previewArtist}
                  awakenedArt={previewAwakenedArt}
                  awakenedArtist={previewAwakenedArtist}
                  awakened={true}
                  flavorTextExtendedArt={null}
                  flavorTextExtendedArtist={null}
                  awakenedFlavorTextExtendedArt={null}
                  awakenedFlavorTextExtendedArtist={null}
                />
              }
              actions={<DSDialog.Close />}
              loading={loading}
            />
          }

          <DSButton onClick={onSave} label="Cancel" loading={loading} />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}
