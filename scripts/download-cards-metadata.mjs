import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BASE_URL = process.env.CARDS_BASE_URL
  ?? process.env.NEXT_PUBLIC_SITE_URL
  // @NOTE: We assume the default of the prod instance so we can get actual cards from the prod database—even if running locally.
  ?? 'https://relicry.com';
const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), '.local', 'cards', 'deck-metadata.json');

async function fetchCardsPage(baseUrl, page) {
  const url = new URL('/api/cards', ensureTrailingSlash(baseUrl));
  if (page) {
    url.searchParams.set('cursor', page);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function ensureTrailingSlash(url) {
  return url.endsWith('/') ? url : `${url}/`;
}

async function main() {
  const baseUrl = DEFAULT_BASE_URL;
  const outputPath = path.resolve(process.env.CARDS_METADATA_OUTPUT ?? DEFAULT_OUTPUT_PATH);
  const cards = [];
  let cursor = null;
  let lastPage = null;

  do {
    lastPage = await fetchCardsPage(baseUrl, cursor);
    cards.push(...lastPage.cards);
    cursor = lastPage.nextCursor;
  } while (cursor);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify({
      fetchedAt: new Date().toISOString(),
      source: `${ensureTrailingSlash(baseUrl)}api/cards`,
      totalCards: cards.length,
      totalPages: lastPage?.totalPages ?? 1,
      cards,
    }, null, 2)}\n`,
    'utf8',
  );

  console.info(`Saved ${cards.length} cards to ${outputPath}`);
}

main().catch((error) => {
  console.error(
    'Unable to download card metadata. Make sure the app is running and reachable via CARDS_BASE_URL.',
  );
  console.error(error);
  process.exitCode = 1;
});
