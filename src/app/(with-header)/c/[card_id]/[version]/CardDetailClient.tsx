'use client';

import { useState } from 'react';
import ArtDetail from '@/components/art/ArtDetail';
import CardCollectionActionSlot from '@/components/client/CardCollectionAction.slot';
import Card from '@/components/card/Card';
import CardExplained from '@/components/card/CardExplained';
import type { CardExplanationPart } from '@/components/card/cardExplanationParts';
import DSDialog from '@/components/ds/DSDialog';
import DSSection from '@/components/ds/DSSection';
import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { VersionedCard } from '@/entities/Card';
import { CardSize, CardType } from '@/entities/CardContext';
import styles from './page.module.css';

type Props = Readonly<{
  art: Art | null;
  artist: Artist | null;
  awakened: boolean;
  awakenedArt: Art | null;
  awakenedArtist: Artist | null;
  awakenedFlavorTextExtendedArt: Art | null;
  awakenedFlavorTextExtendedArtist: Artist | null;
  card: VersionedCard;
  flavorTextExtendedArt: Art | null;
  flavorTextExtendedArtist: Artist | null;
  size?: CardSize;
}>;

export default function CardDetailClient({
  art,
  artist,
  awakened,
  awakenedArt,
  awakenedArtist,
  awakenedFlavorTextExtendedArt,
  awakenedFlavorTextExtendedArtist,
  card,
  flavorTextExtendedArt,
  flavorTextExtendedArtist,
  size,
}: Props) {
  const [selectedPart, setSelectedPart] = useState<CardExplanationPart>('all');
  const [artDialogOpen, setArtDialogOpen] = useState(false);
  const [dialogArt, setDialogArt] = useState<Art | null>(null);
  const [dialogArtist, setDialogArtist] = useState<Artist | null>(null);
  const displayArt = card.type === 'focus' && awakened ? awakenedArt || art : art;
  const displayArtist = card.type === 'focus' && awakened ? awakenedArtist || artist : artist;
  const displayFlavorTextExtendedArt = card.type === 'focus' && awakened
    ? awakenedFlavorTextExtendedArt || flavorTextExtendedArt
    : flavorTextExtendedArt;
  const displayFlavorTextExtendedArtist = card.type === 'focus' && awakened
    ? awakenedFlavorTextExtendedArtist || flavorTextExtendedArtist
    : flavorTextExtendedArtist;
  const openArtDialog = (nextArt: Art, nextArtist: Artist | null) => {
    setDialogArt(nextArt);
    setDialogArtist(nextArtist);
    setArtDialogOpen(true);
  };
  const handleDialogOpenChange = (open: boolean) => {
    setArtDialogOpen(open);
    if (!open) {
      setDialogArt(null);
      setDialogArtist(null);
    }
  };
  const handlePartSelect = (part: CardExplanationPart) => {
    if ((part === 'illustration' || part === 'artist') && displayArt) {
      setSelectedPart(part);
      openArtDialog(displayArt, displayArtist);
      return;
    }

    if (part === 'flavorText' && displayFlavorTextExtendedArt) {
      setSelectedPart(part);
      openArtDialog(displayFlavorTextExtendedArt, displayFlavorTextExtendedArtist);
      return;
    }

    setSelectedPart(part);
  };

  return (
    <DSSection className={styles.root}>
      {dialogArt && (
        <DSDialog
          open={artDialogOpen}
          onOpenChange={handleDialogOpenChange}
          onClose={() => handleDialogOpenChange(false)}
          title={dialogArt.title?.trim() || 'Art detail'}
          size="wide"
          content={<ArtDetail art={dialogArt} artist={dialogArtist} mode="dialog" />}
        />
      )}

      <div className={styles.detailGrid}>
        <div className={styles.cardColumn}>
          <div className={styles.cardStage}>
            <Card
              card={card}
              art={art}
              artist={artist}
              ctx={{
                type: CardType.Full,
                size,
              }}
              awakenedArt={awakenedArt}
              awakenedArtist={awakenedArtist}
              flavorTextExtendedArt={flavorTextExtendedArt}
              flavorTextExtendedArtist={flavorTextExtendedArtist}
              awakenedFlavorTextExtendedArt={awakenedFlavorTextExtendedArt}
              awakenedFlavorTextExtendedArtist={awakenedFlavorTextExtendedArtist}
              awakened={awakened}
              selectedPart={selectedPart}
              onPartSelect={handlePartSelect}
            />
          </div>
          <CardCollectionActionSlot cardId={card.id} cardVersionId={card.version} />
        </div>

        <aside className={styles.explanationColumn}>
          <DSSection.Card background="dark">
            <CardExplained
              art={displayArt}
              artist={displayArtist}
              awakened={awakened}
              card={card}
              onSelectPart={handlePartSelect}
              selectedPart={selectedPart}
            />
          </DSSection.Card>
        </aside>
      </div>
    </DSSection>
  );
}
