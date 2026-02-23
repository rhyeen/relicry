import { Faction } from '@/entities/Faction';
import { getQuestDocId, QuestToken, VersionedQuest } from '@/entities/Quest';

export const questTestIds = {
  quest1: 'q/001',
  quest2: 'q/002',
  quest3: 'q/003',
};

export const questTokenIds = {
  token1: 't/1',
  token2: 't/2',
  token3: 't/3',
  token4: 't/4',
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

function defaultQuestToken(questId: string, questTokenId: string, faction: Faction): QuestToken {
  return {
    id: questTokenId,
    questId,
    faction,
    season: 1,
  };
}

export function getExampleQuestToken1() {
  return defaultQuestToken(
    getQuestDocId(questTestIds.quest1, 1),
    questTokenIds.token1,
    Faction.IronbandGuild,
  );
}

export function getExampleQuestToken2() {
  return defaultQuestToken(
    getQuestDocId(questTestIds.quest2, 1),
    questTokenIds.token2,
    Faction.OrdoAether,
  );
}

export function getExampleQuestToken3() {
  return defaultQuestToken(
    getQuestDocId(questTestIds.quest3, 1),
    questTokenIds.token3,
    Faction.BridlewildKin,
  );
}

export function getExampleQuestToken4() {
  return defaultQuestToken(
    getQuestDocId(questTestIds.quest3, 1),
    questTokenIds.token4,
    Faction.NightglassCo,
  );
}
