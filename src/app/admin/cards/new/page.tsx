"use client";

import { Suspense, useMemo, useState } from "react";
import { Aspect } from "@/entities/Aspect";
import { Rarity } from "@/entities/Rarity";
import { Tag } from "@/entities/Tag";
import { VersionedDeckCard } from '@/entities/Card';
import DSForm from '@/components/ds/DSForm';
import DSSection from '@/components/ds/DSSection';
import DSField from '@/components/ds/DSField';
import DSSelect from '@/components/ds/DSSelect';
import DSSwitch from '@/components/ds/DSSwitch';
import DSButton from '@/components/ds/DSButton';
import DSToggleGroup from '@/components/ds/DSToggleGroup';

const CURRENT_SEASON = 1;
function enumValues<T extends Record<string, string | number>>(e: T): string[] {
  return Object.values(e).filter((v) => typeof v === "string") as string[];
}

export default function NewCardAdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewCardAdminPageClient />
    </Suspense>
  );
}

function NewCardAdminPageClient() {
  const rarityOptions = useMemo(() => enumValues(Rarity).map((value) => ({ label: value.toLocaleUpperCase(), value })), []);
  const aspectOptions = useMemo(() => enumValues(Aspect).map((value) => ({ label: value.toLocaleUpperCase(), value })), []);
  const tagOptions = useMemo(() => enumValues(Tag).map((value) => ({ label: value.toLocaleUpperCase(), value })), []);

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
    const copiedCard = {
      ...card,
      flavorText: card.flavorText?.onCard ? { ...card.flavorText } : undefined,
      title: card.title.trim(),
      subTitle: card.subTitle?.trim() ? card.subTitle : undefined,
      revealedContext: card.revealedContext?.trim() ? card.revealedContext : undefined,
      publishedContext: card.publishedContext?.trim() ? card.publishedContext : undefined,
      archivedContext: card.archivedContext?.trim() ? card.archivedContext : undefined,
    };
    return JSON.stringify(copiedCard, null, 2);
  };

  return (
    <DSSection>
      <DSForm>
        <DSForm.Title>New Deck Card (Admin)</DSForm.Title>
        <DSForm.Description>
          Create a new deck card version. After previewing the JSON, you can POST it to an admin API route to persist.
        </DSForm.Description>
        <DSField
          label="Card ID"
          value={card.id}
          onChange={(value) => update('id', value)}
          placeholder="e.g. a1b2"
          readonly
          required
        />
        <DSSelect
          label="Rarity"
          options={rarityOptions}
          value={String(card.rarity)}
          onChange={(value) => update('rarity', value as Rarity)}
        />
        <DSSwitch
          label="Is Sample"
          checked={card.isSample}
          onChange={(value) => update('isSample', value)}
        />
        <DSToggleGroup.Text
          label="Tags"
          options={tagOptions}
          multiple
          values={card.tags as unknown as string[]}
          onChange={(values: string[]) => {
            console.log(values);
            setCard((c) => {
              return {
                ...c,
                tags: values as unknown as Tag[],
              };
            });
          }}
        />
        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save" />
          <DSButton onClick={onSave} label="Preview" />
          <DSButton onClick={onSave} label="Cancel" />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}
