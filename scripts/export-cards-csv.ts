import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { orderAspects, type Aspect } from '../src/entities/Aspect';
import { cardEffectToString } from '../src/entities/CardEffectAsString';
import { orderTags, type Tag } from '../src/entities/Tag';

export const CSV_HEADERS = [
  'Name',
  'Card ID',
  'Type',
  'Aspect',
  'Draw Limit',
  'Scrap Cost',
  'Rarity',
  'Effect',
  'Tags',
  'Metadata',
  'Status',
] as const;

export const DEFAULT_INPUT_PATHS = [
  path.resolve(process.cwd(), '.local', 'cards', 'deck-metadata.json'),
  path.resolve(process.cwd(), 'local', 'cards', 'deck-metadata.json'),
];

export const DEFAULT_OUTPUT_PATH = path.resolve(
  process.cwd(),
  '.local',
  'cards',
  'cards-sheet-import.csv',
);

const STATUS_READY = 'Ready for Print';

type CardType = 'deck' | 'focus' | 'gambit';
type CardAspect = Aspect | [Aspect, Aspect];
type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

type CardMetadata = {
  id: string;
  type: CardType;
  title: string;
  rarity: CardRarity;
  effects: Parameters<typeof cardEffectToString>[0][];
  tags: Tag[];
  drawLimit?: number;
  scrapCost?: CardAspect[];
  aspect?: CardAspect;
};

type CardMetadataFile = {
  cards: CardMetadata[];
};

export async function resolveInputPath(explicitPath?: string): Promise<string> {
  const candidates = explicitPath
    ? [path.resolve(process.cwd(), explicitPath)]
    : DEFAULT_INPUT_PATHS;

  for (const candidate of candidates) {
    try {
      const stats = await stat(candidate);
      if (stats.isFile()) {
        return candidate;
      }
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(`Could not find card metadata JSON. Checked: ${candidates.join(', ')}`);
}

export async function readCardMetadataFile(filePath: string): Promise<CardMetadataFile> {
  const raw = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as CardMetadataFile;

  if (!Array.isArray(parsed?.cards)) {
    throw new Error(`Metadata file ${filePath} does not contain a cards array.`);
  }

  return parsed;
}

export function cardToCsvRow(card: CardMetadata): string[] {
  return [
    card.title ?? '',
    card.id ?? '',
    formatType(card.type),
    formatAspect(card.aspect),
    card.type === 'deck' && typeof card.drawLimit === 'number'
      ? `${card.drawLimit}`
      : '',
    formatScrapCost(card.scrapCost ?? []),
    formatRarity(card.rarity),
    formatEffects(card.effects ?? []),
    formatTags(card.tags ?? [], card.type),
    '',
    STATUS_READY,
  ];
}

export function cardsToCsv(cards: CardMetadata[]): string {
  const rows = [
    [...CSV_HEADERS],
    ...cards.map((card) => cardToCsvRow(card)),
  ];

  return `${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')}\n`;
}

export function escapeCsvCell(value: string): string {
  const normalized = `${value ?? ''}`;
  const escaped = normalized.replaceAll('"', '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

export async function exportCardsCsv(options?: {
  inputPath?: string;
  outputPath?: string;
}): Promise<{ inputPath: string; outputPath: string; cardCount: number }> {
  const inputPath = await resolveInputPath(options?.inputPath ?? process.env.CARDS_METADATA_INPUT);
  const outputPath = path.resolve(
    process.cwd(),
    options?.outputPath ?? process.env.CARDS_CSV_OUTPUT ?? DEFAULT_OUTPUT_PATH,
  );
  const metadata = await readCardMetadataFile(inputPath);
  const csv = cardsToCsv(metadata.cards);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, csv, 'utf8');

  return {
    inputPath,
    outputPath,
    cardCount: metadata.cards.length,
  };
}

function formatType(type: CardType): string {
  switch (type) {
    case 'deck':
      return 'Deck';
    case 'focus':
      return 'Focus';
    case 'gambit':
      return 'Gambit';
    default:
      return titleCase(type);
  }
}

function formatRarity(rarity: CardRarity): string {
  switch (rarity) {
    case 'common':
      return 'Common';
    case 'rare':
      return 'Rare';
    case 'epic':
      return 'Epic';
    case 'legendary':
      return 'Legendary';
    default:
      return titleCase(rarity);
  }
}

function formatAspect(aspect?: CardAspect): string {
  if (!aspect) return '';
  if (Array.isArray(aspect)) {
    return orderAspects(aspect).map((part) => titleCase(part)).join(' & ');
  }
  return titleCase(aspect);
}

function formatScrapCost(scrapCost: CardAspect[]): string {
  return scrapCost
    .map((entry) => formatAspect(entry))
    .filter((entry) => entry.length > 0)
    .join(', ');
}

function formatEffects(effects: Parameters<typeof cardEffectToString>[0][]): string {
  return effects.map((effect) => cardEffectToString(effect)).join('\n');
}

function formatTags(tags: Tag[], cardType: CardType): string {
  return orderTags(tags, cardType).map((tag) => titleCase(tag)).join(', ');
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

async function main() {
  const result = await exportCardsCsv();
  console.info(
    [
      `Exported ${result.cardCount} cards to CSV`,
      `Input: ${result.inputPath}`,
      `Output: ${result.outputPath}`,
    ].join('\n'),
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
