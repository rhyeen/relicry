import { Art } from '@/entities/Art';
import { Artist } from '@/entities/Artist';
import { Aspect } from '@/entities/Aspect';
import { getCardDocId, VersionedCard, VersionedDeckCard, VersionedFocusCard } from '@/entities/Card';
import { cardEffectToString } from '@/entities/CardEffectAsString';
import { Rarity } from '@/entities/Rarity';
import { orderTags, Tag } from '@/entities/Tag';
import type { FlavorText } from '@/entities/FlavorText';
import DSButton from '@/components/ds/DSButton';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import { aspectAsArray } from './card-parts/aspectsAsArray';
import type { CardExplanationPart } from './cardExplanationParts';
import styles from './CardExplained.module.css';

type Props = Readonly<{
  art: Art | null;
  artist: Artist | null;
  awakened?: boolean;
  card: VersionedCard;
  language?: string;
  onSelectPart: (part: CardExplanationPart) => void;
  selectedPart: CardExplanationPart;
}>;

type ExplanationSection = {
  body: string[];
  id: CardExplanationPart;
  title: string;
  value?: string;
  values?: string[];
};

export default function CardExplained({
  art,
  artist,
  awakened = false,
  card,
  language = 'EN',
  onSelectPart,
  selectedPart,
}: Props) {
  const sections = buildCardExplanationSections({ art, artist, awakened, card, language });
  const visibleSections = selectedPart === 'all'
    ? sections
    : sections.filter((section) => section.id === selectedPart);

  return (
    <section className={styles.root} aria-live="polite">
      <div className={styles.intro}>
        <DSSection.Heading>
          <DSText.Eyebrow>{selectedPart === 'all' ? 'Card explained' : 'Selected detail'}</DSText.Eyebrow>
          <DSText.Heading as="h2" size="xl">{card.title}</DSText.Heading>
        </DSSection.Heading>
        <DSText.Body tone="muted">
          {selectedPart === 'all'
            ? 'Select a highlighted part of the card to focus this explanation.'
            : 'Only the selected card detail is shown.'}
        </DSText.Body>
        {selectedPart !== 'all' && (
          <DSSection.Actions>
            <DSButton label="All details" variant="ghost" onClick={() => onSelectPart('all')} />
          </DSSection.Actions>
        )}
      </div>

      {visibleSections.length > 0 ? (
        <div className={styles.sections}>
          {visibleSections.map((section) => (
            <ExplanationSectionCard
              key={section.id}
              section={section}
              active={selectedPart === section.id}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <DSText.Body tone="muted">No explanation is available for this part on this card.</DSText.Body>
        </div>
      )}
    </section>
  );
}

export function buildCardExplanationSections({
  art,
  artist,
  awakened = false,
  card,
  language = 'EN',
}: Readonly<{
  art: Art | null;
  artist: Artist | null;
  awakened?: boolean;
  card: VersionedCard;
  language?: string;
}>): ExplanationSection[] {
  const displaySide = card.type === 'focus' && awakened ? (card as VersionedFocusCard).awakened : card;
  const displayVersion = card.type === 'focus' && awakened ? (card as VersionedFocusCard).awakenedVersion : card;
  const tags = orderTags(displaySide.tags, card.type);
  const sections: ExplanationSection[] = [
    {
      id: 'title',
      title: 'Title',
      value: [card.title, card.subTitle].filter(Boolean).join(': '),
      body: [
        'The title names the card. A subtitle gives extra identity or story context when the card has one.',
      ],
    },
    {
      id: 'type',
      title: 'Type',
      value: labelCardType(card.type),
      body: [
        card.type === 'deck'
          ? 'Deck cards are the cards players draw, play, and may scrap during a quest.'
          : card.type === 'focus'
            ? 'Focus cards represent a persistent character or role. When awakened, the visible tags and effects change to the awakened side.'
            : 'Gambit cards represent special tactical plays with their own gambit frame and rules identity.',
      ],
    },
    {
      id: 'rarity',
      title: 'Rarity',
      value: labelRarity(card.rarity),
      body: [
        'Rarity communicates how special or uncommon the card is within the collection and drives the frame and gem treatment.',
      ],
    },
  ];

  if (card.type === 'deck' || card.type === 'focus') {
    sections.push({
      id: 'aspect',
      title: 'Aspect',
      value: formatAspect(card.aspect),
      body: [
        'The aspect is the card color identity. It helps define which themes, costs, and deck-building patterns the card belongs to.',
      ],
    });
  } else {
    sections.push({
      id: 'aspect',
      title: 'Aspect',
      value: 'Gambit',
      body: [
        'Gambit cards use the gambit identity instead of a standard aspect pair.',
      ],
    });
  }

  sections.push(
    {
      id: 'tags',
      title: 'Tags',
      values: tags.length ? tags.map(labelTag) : ['No tags'],
      body: [
        'Tags describe what the card is or what rule families it belongs to. Other effects can reference these tags.',
      ],
    },
    {
      id: 'effects',
      title: 'Effects',
      values: displaySide.effects.length ? displaySide.effects.map((effect) => cardEffectToString(effect)) : ['No effects'],
      body: [
        'Effects are the rules text of the card. Symbols are rendered on the card, while this panel shows the same effect as readable text.',
      ],
    },
  );

  if (displayVersion.flavorText?.onCard) {
    sections.push({
      id: 'flavorText',
      title: 'Flavor Text',
      value: formatFlavorText(displayVersion.flavorText),
      body: [
        'Flavor text adds story, voice, or world context. It does not change the card rules unless an effect says so.',
      ],
    });
  }

  sections.push(
    {
      id: 'illustration',
      title: 'Illustration',
      value: art?.title?.trim() || art?.id || 'Example illustration',
      body: [
        art?.description || 'The illustration is the main visual identity of the card.',
        art?.aIGenerated ? 'This card is using AI generated art.' : 'The card art is credited through the artist line when artist data is available.',
      ],
    },
    {
      id: 'artist',
      title: 'Artist',
      value: art?.aIGenerated ? 'AI Generated Art' : artist?.name || art?.artistId || 'Unknown artist',
      body: [
        artist?.summary || 'The artist line credits the creator of the illustration shown on the card.',
      ],
    },
    {
      id: 'metadata',
      title: 'Metadata',
      values: [
        `Language: ${language}`,
        `Season: ${card.season}`,
        `Card ID: ${getCardDocId(card.id, card.version)}`,
      ],
      body: [
        'Metadata identifies this exact printed or digital version of the card.',
      ],
    },
  );

  if (card.type === 'deck') {
    const deckCard = card as VersionedDeckCard;
    sections.push(
      {
        id: 'drawLimit',
        title: 'Draw Limit',
        value: deckCard.drawLimit === -1 ? '*' : String(deckCard.drawLimit),
        body: [
          deckCard.drawLimit === -1
            ? 'The draw limit uses a special value on this card instead of a standard number.'
            : `The draw limit determines how many copies of this card can be drawn or included under the card limit rule. This card has a draw limit of ${deckCard.drawLimit}.`,
        ],
      },
      {
        id: 'scrapCost',
        title: 'Scrap Cost',
        values: deckCard.scrapCost.length ? deckCard.scrapCost.map(formatAspect) : ['No scrap cost'],
        body: [
          'The scrap cost shows the aspect symbols required when this card is scrapped for its scrap interaction.',
        ],
      },
    );
  }

  sections.push({
    id: 'qrCode',
    title: 'QR Code',
    value: getCardDocId(card.id, card.version),
    body: [
      'The QR code points back to this card detail page so a physical card can be scanned and opened online.',
    ],
  });

  return sections;
}

function ExplanationSectionCard({
  active,
  section,
}: Readonly<{
  active: boolean;
  section: ExplanationSection;
}>) {
  return (
    <article className={styles.section} data-active={active ? 'true' : undefined}>
      <div className={styles.labelRow}>
        <DSText.Eyebrow>{section.title}</DSText.Eyebrow>
        {section.value && <span className={styles.value}>{section.value}</span>}
      </div>
      {section.values && (
        <ul className={styles.list}>
          {section.values.map((value, index) => (
            <li key={`${value}-${index}`} className={styles.pill}>{value}</li>
          ))}
        </ul>
      )}
      <div className={styles.body}>
        {section.body.map((line) => (
          <DSText.Body key={line} tone="muted" size="sm">{line}</DSText.Body>
        ))}
      </div>
    </article>
  );
}

function formatAspect(aspect: Aspect | [Aspect, Aspect]): string {
  const [first, second] = aspectAsArray(aspect);

  if (first === second) {
    return labelAspect(first);
  }

  return `${labelAspect(first)} / ${labelAspect(second)}`;
}

function formatFlavorText(flavorText: FlavorText): string {
  if (!flavorText.onCard) {
    return '';
  }

  const source = flavorText.onCard.source?.trim();
  const text = flavorText.onCard.text.trim();

  return source ? `${text} - ${source}` : text;
}

function labelAspect(aspect: Aspect): string {
  return capitalize(aspect);
}

function labelCardType(type: VersionedCard['type']): string {
  return capitalize(type);
}

function labelRarity(rarity: Rarity): string {
  return capitalize(rarity);
}

function labelTag(tag: Tag): string {
  return capitalize(tag);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
