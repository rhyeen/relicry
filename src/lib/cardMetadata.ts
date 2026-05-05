import { VersionedCard, VersionedFocusCard } from '@/entities/Card';

type NonFocusCardMetadata = Omit<Exclude<VersionedCard, VersionedFocusCard>, 'illustration'>;

type FocusCardMetadata = Omit<VersionedFocusCard, 'illustration' | 'awakenedVersion'> & {
  awakenedVersion: Omit<VersionedFocusCard['awakenedVersion'], 'illustration'>;
};

export type CardMetadata = NonFocusCardMetadata | FocusCardMetadata;

export function toCardMetadata(card: VersionedCard): CardMetadata {
  if (card.type === 'focus') {
    const { illustration, awakenedVersion, ...rest } = card;
    const { illustration: awakenedIllustration, ...awakenedVersionMetadata } = awakenedVersion;
    void illustration;
    void awakenedIllustration;

    return {
      ...rest,
      awakenedVersion: awakenedVersionMetadata,
    };
  }

  const { illustration, ...rest } = card;
  void illustration;
  return rest;
}
