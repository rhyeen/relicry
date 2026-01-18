import { CardEffect, defaultHideCardEffect, defineCardEffect } from './CardEffect';
import { FlavorText } from './FlavorText';
import { prefixId, StoredRoot } from './Root';

export type RootApex = {
  // ax/a1b2c3
  id: string;
  season: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export type RevealedApex = RootApex & RootRevealedApex & {
  type: 'revealed';
}

export type HiddenApex = RootApex & RootHiddenApex & {
  type: 'hidden';
}

// @NOTE: The difference between DefinedApex and RevealedApex is that a
// DefinedApex is fixed with exact values for a specific apex encounter with
// a player group. Whereas a RevealedApex might still have some variability
// between encounters.
export type DefinedApex = RootApex & {
  type: 'defined';
  revealed: RootRevealedApex;
  health: number;
  effects: CardEffect[];
}

export type RootRevealedApex = {
  title: string;
  health: number | {
    from: number;
    to: number;
  };
  illustration: {
    artId: string;
    artistId: string;
  };
  flavorText?: FlavorText;
  effects: CardEffect[];
}

export type RootHiddenApex = {
  title?: string;
  health: {
    from: number;
    to: number;
  };
  // @NOTE: Could be different from the 'revealed'
  illustration?: {
    artId: string;
    artistId: string;
  };
  // @NOTE: Could be different from the 'revealed'
  flavorText?: FlavorText;
  // @NOTE: Could be different from the 'revealed'
  effects: CardEffect[];
}

export type StoredApex = RootApex & StoredRoot & {
  revealed: RootRevealedApex;
  hidden: RootHiddenApex;
}

export function defaultHealthRange(health: number): { from: number; to: number } {
  // In increments of 10
  const from = Math.floor(health / 10) * 10;
  // @NOTE: from + 10 is technically exclusive, but we treat it as inclusive for readability
  const to = from + 10;
  return { from, to };
}

export function defaultHideCardEffects(effects: CardEffect[]): CardEffect[] {
  return effects.map(effect => defaultHideCardEffect(effect));
}

export function defineApex(revealed: RevealedApex): DefinedApex {
  return {
    type: 'defined',
    revealed: revealed,
    health: defineHealth(revealed.health),
    effects: defineCardEffects(revealed.effects),
    id: revealed.id,
    season: revealed.season,
    version: revealed.version,
    createdAt: revealed.createdAt,
    updatedAt: revealed.updatedAt,
    archivedAt: revealed.archivedAt,
  };
}

export function defineHealth(health: number | { from: number; to: number }): number {
  if (typeof health === 'number') {
    return health;
  }
  // pick a random number within the range
  return Math.floor(Math.random() * (health.to - health.from + 1)) + health.from;
}

export function defineCardEffects(effects: CardEffect[]): CardEffect[] {
  return effects.map(effect => defineCardEffect(effect));
}

export function getApexId(id: string): string {
  return prefixId('ax', id);
}

export function getApexDocId(id: string, version: number): string {
  return `${getApexId(id)}/${version}`;
}
