import { Aspect } from './Aspect';
import { LocaleMap } from './LocaleMap';

export interface Scene {
  id: string;
  title: LocaleMap;
  description: LocaleMap;
  paths: ScenePath[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
}

export interface ScenePath {
  title: LocaleMap;
  description: LocaleMap;
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
