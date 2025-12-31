import { Faction } from '@/entities/Faction';
import { VersionedQuest } from '@/entities/Quest';

export const questTestIds = {
  quest1: 'q/111',
  quest2: 'q/112',
  quest3: 'q/113',
};

function defaultVersionedQuest(id: string, faction: Faction, level: number): VersionedQuest {
  return {
    id,
    faction,
    level,
    season: 1,
    revealed: {
      at: new Date(),
    },
  };
}

export function getExampleQuest1() {
  return {
    ...defaultVersionedQuest(questTestIds.quest1, Faction.IronbandGuild, 1),
  };
}

export function getExampleQuest2() {
  return {
    ...defaultVersionedQuest(questTestIds.quest2, Faction.IronbandGuild, 2),
  };
}

export function getExampleQuest3() {
  return {
    ...defaultVersionedQuest(questTestIds.quest3, Faction.NightglassCo, 1),
  };
}
