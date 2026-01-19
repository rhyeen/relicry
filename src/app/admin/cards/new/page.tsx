"use client";

import { Suspense, useMemo, useState } from "react";
import { Aspect, orderAspects, orderComboAspects } from "@/entities/Aspect";
import { orderRarities, Rarity } from "@/entities/Rarity";
import { orderTags, Tag } from "@/entities/Tag";
import { VersionedDeckCard } from '@/entities/Card';
import DSForm from '@/components/ds/DSForm';
import DSSection from '@/components/ds/DSSection';
import DSField from '@/components/ds/DSField';
import DSSelect from '@/components/ds/DSSelect';
import DSSwitch from '@/components/ds/DSSwitch';
import DSButton from '@/components/ds/DSButton';
import DSToggleGroup from '@/components/ds/DSToggleGroup';

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

export default function NewCardAdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewCardAdminPageClient />
    </Suspense>
  );
}

function NewCardAdminPageClient() {
  const rarityOptions = useMemo(() => orderRarities().map((value) => ({ label: value.toLocaleUpperCase(), value })), []);
  const aspectOptions = useMemo(() => [ ...orderAspects(), ...orderComboAspects()].map((value) => ({
    label: Array.isArray(value) ? value.map(v => v.toLocaleUpperCase()).join(' + ') : value.toLocaleUpperCase(),
    value,
  })), []);
  const tagOptions = useMemo(() => orderTags().map((value) => ({ label: value.toLocaleUpperCase(), value })), []);
  const [saveAttempted, setSaveAttempted] = useState(false);

  const [card, setCard] = useState<VersionedDeckCard>(() => ({
    title: '',
    tags: [],
    effects: [],
    id: '',
    type: 'deck',
    rarity: Rarity.Common,
    drawLimit: 1,
    scrapCost: [],
    aspect: Aspect.Brave,
    version: 1,
    season: CURRENT_SEASON,
    isFeatured: true,
    illustration: { artId: '', artistId: '' },
    flavorText: { extended: null, onCard: null },
    subTitle: '',
    revealedAt: new Date(),
    revealedContext: '',
    publishedAt: null,  
    publishedContext: '',
    archivedAt: null,
    archivedContext: '',
    isSample: true,
  }));

  const update = <K extends keyof VersionedDeckCard>(key: K, value: VersionedDeckCard[K]) => {
    setCard((c) => ({ ...c, [key]: value }));
  };

  const onSave = () => {
    const hasErrors = card.isSample ? false : (
      !!FormErrors.tagsError(card.tags) ||
      !!FormErrors.getTitleError(card.title) ||
      !!FormErrors.getSubtitleError(card.rarity, card.subTitle) ||
      !!FormErrors.getVersionError(card.version)
    );
    if (hasErrors) {
      setSaveAttempted(true);
      return;
    }
    const copiedCard = {
      ...card,
      flavorText: card.flavorText?.onCard ? { ...card.flavorText } : undefined,
      title: card.title.trim(),
      subTitle: [Rarity.Epic, Rarity.Legendary].includes(card.rarity) && card.subTitle?.trim() ? card.subTitle : undefined,
      revealedContext: card.revealedContext?.trim() ? card.revealedContext : undefined,
      publishedContext: card.publishedContext?.trim() ? card.publishedContext : undefined,
      archivedContext: card.archivedContext?.trim() ? card.archivedContext : undefined,
      aspect: card.aspect[0] === card.aspect[1] ? card.aspect[0] : [ ...card.aspect ],
      season: card.isSample ? card.season * -1 : card.season,
    };
    return JSON.stringify(copiedCard, null, 2);
  };

  return (
    <DSSection>
      <DSForm>
        <DSForm.Title>New Deck Card (Admin)</DSForm.Title>
        <DSForm.Description>
          Create a new deck card version.
          Leaving it as a sample card will allow it to be created without validation.
        </DSForm.Description>
        <DSField
          label="Card ID"
          value={card.id}
          onChange={(value) => update('id', value)}
          placeholder="Will be generated if new card"
          readonly
        />
        <DSSwitch
          label="Is Sample"
          checked={card.isSample}
          onChange={(value) => update('isSample', value)}
        />
        <DSSwitch
          label="Is Featured"
          checked={card.isFeatured}
          onChange={(value) => update('isFeatured', value)}
        />
        <DSSelect
          label="Aspect"
          options={aspectOptions}
          value={card.aspect}
          onChange={aspect => setCard((c) => ({ ...c, aspect }))}
          required={!card.isSample}
        />
        <DSSelect
          label="Draw Limit"
          options={[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ label: n.toString(), value: n }))}
          value={card.drawLimit}
          onChange={(value) => update('drawLimit', value)}
        />
        { card.scrapCost.map((cost, index) => (
          <DSSelect
            key={index}
            label={`Scrap Cost #${index + 1}`}
            options={[
              ...aspectOptions,
              { label: 'Remove', value: 'REMOVE' as unknown as Aspect },
            ]}
            value={cost}
            onChange={(value) => {
              if (value as unknown === 'REMOVE') {
                setCard(c => ({
                  ...c,
                  scrapCost: c.scrapCost.filter((_, i) => i !== index),
                }));
              } else {
                setCard(c => ({
                  ...c,
                  scrapCost: c.scrapCost.map((cost, i) => i === index ? value : cost),
                }));
              }
            }}
          />
        )) }
        <DSButton onClick={() => setCard(c => ({ ...c, scrapCost: [...c.scrapCost, Aspect.Brave] }))} label="+ Scrap Cost" />
        
        <CardEffects />
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
          onChange={(value) => update('rarity', value as Rarity)}
        />
        <DSField
          label="Title"
          value={card.title}
          onChange={(value) => update('title', value)}
          required={!card.isSample}
          error={saveAttempted ? FormErrors.getTitleError(card.title) : undefined}
        />
        { [Rarity.Epic, Rarity.Legendary].includes(card.rarity) &&
          <DSField
            label="SubTitle"
            value={card.subTitle || ''}
            onChange={(value) => update('subTitle', value)}
            required={!card.isSample}
            error={saveAttempted ? FormErrors.getSubtitleError(card.rarity, card.subTitle) : undefined}
          />
        }
        <DSField
          label="Version"
          value={card.version.toString()}
          onChange={(value) => update('version', parseInt(value))}
          required
          error={saveAttempted ? FormErrors.getVersionError(card.version) : undefined}
        />
        <IllustrationBinding />
        <FlavorText />
        <Published, Revealed, and Archived />
        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save" />
          <DSButton onClick={onSave} label="Preview" />
          <DSButton onClick={onSave} label="Cancel" />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}
