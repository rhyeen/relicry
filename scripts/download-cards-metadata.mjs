import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BASE_URL = process.env.CARDS_BASE_URL
  ?? process.env.NEXT_PUBLIC_SITE_URL
  ?? 'https://relicry.com';
const DEFAULT_OUTPUT_PATH = path.join(process.cwd(), '.local', 'cards', 'metadata.json');

async function fetchCardsPage(baseUrl, page) {
  const url = new URL('/api/cards', ensureTrailingSlash(baseUrl));
  url.searchParams.set('page', String(page));

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
  const firstPage = await fetchCardsPage(baseUrl, 1);
  const cards = [...firstPage.cards];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await fetchCardsPage(baseUrl, page);
    cards.push(...nextPage.cards);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify({
      fetchedAt: new Date().toISOString(),
      source: `${ensureTrailingSlash(baseUrl)}api/cards`,
      totalCards: cards.length,
      totalPages: firstPage.totalPages,
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
