import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { cardEffectToString as repoCardEffectToString } from '../src/entities/CardEffectAsString';
import {
  cardToCsvRow,
  cardsToCsv,
  CSV_HEADERS,
  escapeCsvCell,
  exportCardsCsv,
  readCardMetadataFile,
} from './export-cards-csv';

describe('export cards csv helpers', () => {
  it('formats representative cards into CSV rows', () => {
    const deckCard = {
      id: 'c/deck',
      type: 'deck' as const,
      title: 'Arc Spark',
      rarity: 'rare' as const,
      aspect: ['wise', 'brave'] as const,
      drawLimit: 4,
      scrapCost: ['brave', ['wise', 'charming']] as const,
      tags: ['weapon', 'item', 'magic'] as const,
      effects: [
        {
          conditionals: ['infinite'] as const,
          parts: [
            { type: 'text', text: 'Deal' },
            { type: 'damage', amount: 2 },
          ],
        },
      ],
    };

    const focusCard = {
      id: 'c/focus',
      type: 'focus' as const,
      title: 'Centering',
      rarity: 'common' as const,
      aspect: 'charming' as const,
      tags: ['focus'] as const,
      effects: [
        {
          conditionals: [],
          parts: [
            { type: 'text', text: 'Draw' },
            { type: 'card', amount: 1 },
          ],
        },
      ],
    };

    expect(cardToCsvRow(deckCard)).toEqual([
      'Arc Spark',
      'c/deck',
      'Deck',
      'Brave & Wise',
      '4',
      'Brave, Wise & Charming',
      'Rare',
      'INF? Deal 2D',
      'Item, Magic, Weapon',
      '',
      'Ready for Print',
    ]);

    expect(cardToCsvRow(focusCard)).toEqual([
      'Centering',
      'c/focus',
      'Focus',
      'Charming',
      '',
      '',
      'Common',
      'Draw 1C',
      'Focus',
      '',
      'Ready for Print',
    ]);
  });

  it('matches repo effect formatting for multi-effect cards', () => {
    const effects = [
      {
        conditionals: ['pvp', 'turnEnd'] as const,
        aura: { from: 1, to: 2 },
        parts: [
          { type: 'text', text: 'Deal' },
          { type: 'damage', amount: 3 },
          { type: 'flip' },
        ],
      },
      {
        conditionals: ['drawEnd'] as const,
        parts: [
          { type: 'text', text: 'If' },
          { type: 'tag', tag: 'weapon' },
          { type: 'text', text: ',' },
          { type: 'flip' },
          { type: 'text', text: '.' },
        ],
      },
    ];

    const card = {
      id: 'c/effects',
      type: 'deck' as const,
      title: 'Effects',
      rarity: 'epic' as const,
      aspect: 'wise' as const,
      drawLimit: 2,
      scrapCost: [],
      tags: ['item'] as const,
      effects,
    };

    expect(cardToCsvRow(card)[7]).toBe(
      effects.map((effect) => repoCardEffectToString(effect)).join('\n'),
    );
  });

  it('escapes commas, quotes, and newlines in CSV output', () => {
    expect(escapeCsvCell('hello')).toBe('hello');
    expect(escapeCsvCell('hello,world')).toBe('"hello,world"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');

    const csv = cardsToCsv([
      {
        id: 'c/csv',
        type: 'deck',
        title: 'Comma, Quote " Test',
        rarity: 'legendary',
        aspect: 'brave',
        drawLimit: 1,
        scrapCost: [],
        tags: ['item'],
        effects: [{ conditionals: [], parts: [{ type: 'text', text: 'Line1\nLine2' }] }],
      },
    ]);

    expect(csv.startsWith(CSV_HEADERS.join(','))).toBe(true);
    expect(csv).toContain('"Comma, Quote "" Test"');
    expect(csv).toContain('"Line1\nLine2"');
  });

  it('reads metadata files and writes the CSV export', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'cards-csv-'));
    const inputPath = path.join(tempDir, 'deck-metadata.json');
    const outputPath = path.join(tempDir, 'cards-sheet-import.csv');
    const metadata = {
      cards: [
        {
          id: 'c/test',
          type: 'gambit',
          title: 'Boom',
          rarity: 'epic',
          effects: [{ conditionals: [], parts: [{ type: 'text', text: 'Boom' }] }],
          tags: ['gambit'],
        },
      ],
    };

    await writeFile(inputPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

    const parsed = await readCardMetadataFile(inputPath);
    expect(parsed.cards).toHaveLength(1);

    const result = await exportCardsCsv({ inputPath, outputPath });
    const csv = await readFile(outputPath, 'utf8');

    expect(result.cardCount).toBe(1);
    expect(result.outputPath).toBe(outputPath);
    expect(csv).toContain(CSV_HEADERS.join(','));
    expect(csv).toContain('Boom');
    expect(csv).toContain('Ready for Print');
  });
});
