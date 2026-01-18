import { Aspect } from './Aspect';
import { prefixId, StoredRoot } from './Root';

export type Scene = StoredRoot & {
  // sc/a1b2c3d4e5
  id: string;
  title: string;
  description: string;
  paths: ScenePath[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export type ScenePath = {
  title: string;
  description: string;
  paths: ScenePath[] | null;
  trial: SceneTrial | null;
}

export type SceneSkillTrial = SceneTrial & {
  type: 'skill';
  anyOf: {
    allOf: SceneSkillTrialRequirement[];
  }[];
}

export type SceneApexTrial = SceneTrial & {
  type: 'apex';
  apexId: string;
}

export type SceneTrial = {
  type: 'skill' | 'apex';
  onSuccess: {
    path?: ScenePath;
    rewardId?: string;
    cardId?: string;
  };
  onFailurePath?: ScenePath;
}

export type SceneSkillTrialAspectRequirement = {
  type: 'aspect';
  aspect: Aspect;
}

export type SceneSkillTrialRequirement = {
  type: 'aspect' | 'card' | 'damage' | 'quell' | 'scrap';
  threshold: number;
  cardLimit?: number;
}

export function getSceneId(id: string): string {
  return prefixId('sc', id);
}