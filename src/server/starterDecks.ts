import 'server-only';

import { VersionedCard } from '@/entities/Card';
import { User } from '@/entities/User';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { normalizeStarterObtainedMap, StarterFocusOption, StarterObtainedView } from '@/lib/starterDecks';
import { CardDB } from '@/server/db/card.db';

export async function getFeaturedStarterFocusOptions(): Promise<StarterFocusOption[]> {
  const cards = await new CardDB(getFirestoreAdmin()).getFeaturedFocusCards();
  return cards
    .filter((card) => card.type === 'focus')
    .map(toStarterFocusOption);
}

export async function getStarterFocusOptionsByIds(ids: string[]): Promise<StarterFocusOption[]> {
  if (ids.length === 0) return [];
  const cardDB = new CardDB(getFirestoreAdmin());
  const options = await Promise.all(ids.map(async (id) => {
    const cards = await cardDB.getFeatured(id);
    const focus = cards.find((card) => card.type === 'focus');
    return focus ? toStarterFocusOption(focus) : { id, title: id };
  }));
  return options;
}

export async function getStarterObtainedViews(user: Pick<User, 'startersObtained'>): Promise<StarterObtainedView[]> {
  const starters = Object.values(normalizeStarterObtainedMap(user.startersObtained));
  if (starters.length === 0) return [];

  const titles = new Map(
    (await getStarterFocusOptionsByIds(starters.map((starter) => starter.id)))
      .map((option) => [option.id, option.title])
  );

  return starters
    .sort((a, b) => a.obtainedAt.getTime() - b.obtainedAt.getTime())
    .map((starter) => ({
      ...starter,
      title: titles.get(starter.id) ?? starter.id,
    }));
}

function toStarterFocusOption(card: VersionedCard): StarterFocusOption {
  return {
    id: card.id,
    title: card.title || card.id,
  };
}
