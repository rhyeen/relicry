import { Aspect } from './Aspect';
import { StoredRoot } from './Root';

export interface Scene extends StoredRoot {
  // sc/a1b2c3d4e5
  id: string;
  title: string;
  description: string;
  paths: ScenePath[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export interface ScenePath {
  title: string;
  description: string;
  paths: ScenePath[] | null;
  trial: SceneTrial | null;
}

export interface SceneSkillTrial extends SceneTrial {
  type: 'skill';
  anyOf: {
    allOf: SceneSkillTrialRequirement[];
  }[];
}

export interface SceneApexTrial extends SceneTrial {
  type: 'apex';
  apexId: string;
}

export interface SceneTrial {
  type: 'skill' | 'apex';
  onSuccess: {
    path?: ScenePath;
    rewardId?: string;
    cardId?: string;
  };
  onFailurePath?: ScenePath;
}

export interface SceneSkillTrialAspectRequirement {
  type: 'aspect';
  aspect: Aspect;
}

export interface SceneSkillTrialRequirement {
  type: 'aspect' | 'card' | 'damage' | 'quell' | 'scrap';
  threshold: number;
  cardLimit?: number;
}
