"use client";

import { Fragment, useMemo, useState } from "react";
import { Aspect, orderAspects, orderComboAspects } from "@/entities/Aspect";
import { orderRarities, Rarity } from "@/entities/Rarity";
import { orderTags, Tag } from "@/entities/Tag";
import { getCardDocId, getCardId, VersionedCard, VersionedDeckCard } from "@/entities/Card";
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
import { useUser } from '@/lib/client/useUser';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import PermissionDenied from '@/app/permission-denied';
import DSLoadingOverlay from '../ds/DSLoadingOverlay';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useRouter } from 'next/navigation';

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
      throw new Error("Not implemented: getDefaultNewFocusCard");
    case "gambit":
      throw new Error("Not implemented: getDefaultNewGambitCard");
    default:
      throw new Error(`Unknown card type: ${type}`);
  }
}

export function getDefaultNewDeckCard(): VersionedDeckCard {
  return {
    title: "",
    tags: [],
    effects: [],
    id: "",
    type: "deck",
    rarity: Rarity.Common,
    drawLimit: 1,
    scrapCost: [],
    aspect: Aspect.Brave,
    version: 1,
    season: CURRENT_SEASON,
    isFeatured: true,
    illustration: { artId: "", artistId: "" },
    flavorText: {
      extended: { artistId: "", artId: "" },
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

type EditCardProps = Readonly<{
  card?: VersionedCard;
  type: "deck" | "focus" | "gambit";
}>;

export default function EditCard({ card: initCard, type }: EditCardProps) {
  // Keyed remount = reset form when switching cards/types (no effect-based setState)
  const editorKey = useMemo(() => {
    if (initCard?.id) return `${type}:${initCard.id}:${initCard.version}`;
    return `${type}:new`;
  }, [type, initCard?.id, initCard?.version]);
  const { user, ready } = useUser();
  if (!ready) {
    return null;
  }
  if (!hasRole(user?.adminRoles, AdminRole.SuperAdmin)) {
    return PermissionDenied();
  }

  return <EditCardInner key={editorKey} initCard={initCard} type={type} />;
}

function EditCardInner({
  initCard,
  type,
}: {
  initCard?: VersionedCard;
  type: "deck" | "focus" | "gambit";
}) {
  const rarityOptions = useMemo(
    () => orderRarities().map((value) => ({ label: value.toLocaleUpperCase(), value })),
    []
  );

  const aspectOptions = useMemo(
    () =>
      [...orderAspects(), ...orderComboAspects()].map((value) => ({
        label:
          typeof value === "string"
            ? value.toLocaleUpperCase()
            : value.map((v) => v.toLocaleUpperCase()).join(" + "),
        value,
      })),
    []
  );

  const tagOptions = useMemo(
    () => orderTags().map((value) => ({ label: value.toLocaleUpperCase(), value })),
    []
  );

  const authUser = useAuthUser();
  const router = useRouter();
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [card, setCard] = useState<VersionedCard>(() => initCard ?? getDefaultNewCard(type));

  const update = <K extends keyof VersionedCard>(key: K, value: VersionedCard[K]) => {
    setCard((c) => ({ ...c, [key]: value }));
  };

  const getFinalCard = (): VersionedCard => {
    return {
      ...card,
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
      title: card.title.trim(),
      subTitle:
        [Rarity.Epic, Rarity.Legendary].includes(card.rarity) && card.subTitle?.trim()
          ? card.subTitle
          : undefined,
      revealedContext: card.revealedContext?.trim() ? card.revealedContext : undefined,
      publishedContext: card.publishedAt && card.publishedContext?.trim() ? card.publishedContext : undefined,
      archivedContext: card.archivedAt && card.archivedContext?.trim() ? card.archivedContext : undefined,
      season: card.isSample ? card.season * -1 : card.season,
      // Remove any trailing spaces from card effect parts
      effects: card.effects.map((e) => stringToCardEffect(cardEffectToString(e))),
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

    const copiedCard = getFinalCard();
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
        <DSForm.Title>New Deck Card (Admin)</DSForm.Title>
        <DSForm.Description>
          Create a new deck card version. Leaving it as a sample card will allow it to be created without validation.
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

        {type === "deck" && (
          <DSSelect
            label="Aspect"
            options={aspectOptions}
            value={card.aspect}
            onChange={(aspect) => {
              console.log(aspect);
              setCard((c) => ({ ...c, aspect }) as VersionedDeckCard);
            }}
            required={!card.isSample}

          />
        )}

        <DSSelect
          label="Draw Limit"
          options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ label: n.toString(), value: n }))}
          value={card.drawLimit}
          onChange={(value) => update("drawLimit", value)}
        />

        {type === "deck" &&
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

        {type === "deck" && (card as VersionedDeckCard).scrapCost.length < 4 && (
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
              value={cardEffectToString(effect, { permitEndingSpace: true })}
              onChange={(value) =>
                setCard((c) => ({
                  ...c,
                  effects: c.effects.map((e, i) =>
                    i === index ? stringToCardEffect(value, { permitEndingSpace: true }) : e
                  ),
                }))
              }
  
            />
            <CardEffectLine effect={effect} ctx={{ type: CardType.Preview }} />
            <DSButton
              key={index}
              onClick={() =>
                setCard((c) => ({
                  ...c,
                  effects: c.effects.filter((_, i) => i !== index),
                }))
              }
              label="Remove"
  
            />
          </Fragment>
        ))}

        <DSButton
          onClick={() =>
            setCard((c) => ({
              ...c,
              effects: [
                ...c.effects,
                {
                  conditionals: [],
                  parts: [],
                },
              ],
            }))
          }
          label="+ Card Effect"
        />

        <DSToggleGroup.Text
          label="Tags"
          options={tagOptions}
          multiple
          values={card.tags}
          onChange={(values: Tag[]) => setCard((c) => ({ ...c, tags: values }))}
          minimum={card.isSample ? undefined : 1}
          error={saveAttempted ? FormErrors.tagsError(card.tags) : undefined}
        />

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
            label="SubTitle"
            value={card.subTitle || ""}
            onChange={(value) => update("subTitle", value)}
            required={!card.isSample}
            error={saveAttempted ? FormErrors.getSubtitleError(card.rarity, card.subTitle) : undefined}

          />
        )}

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

        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save" loading={loading} disabled={!authUser.ready} />

          <DSDialog
            title="Card Preview"
            trigger={<DSButton onClick={onSave} label="Preview" dialogTrigger loading={loading} />}
            content={<Card card={getFinalCard()} ctx={{ type: CardType.Full }} art={null} artist={null} />}
            actions={<DSDialog.Close />}
          />

          <DSButton onClick={onSave} label="Cancel" loading={loading} />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}
