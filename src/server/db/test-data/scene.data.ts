import { Scene, ScenePath } from '@/entities/Scene';

export const sceneTestIds = {
  scene1: 'sc/1111111111',
  scene2: 'sc/1111111112',
  scene3: 'sc/1111111113',
};

function defaultScene(
  id: string,
  title: string,
  description: string,
): Scene {
  return {
    id,
    title,
    description,
    paths: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

function defaultScenePath(
  title: string,
  description: string,
): ScenePath {
  return {
    title,
    description,
    paths: null,
    trial: null,
  };
}

export function getExampleScene1() {
  return {
    ...defaultScene(
      sceneTestIds.scene1,
      'Scene 1',
      'Description for Scene 1',
    ),
    paths: [ defaultScenePath('Path 1', 'Description for Path 1') ],
  };
}

export function getExampleScene2() {
  return {
    ...defaultScene(
      sceneTestIds.scene2,
      'Scene 2',
      'Description for Scene 2',
    ),
    paths: [ defaultScenePath('Path 2', 'Description for Path 2') ],
  };
}

export function getExampleScene3() {
  return {
    ...defaultScene(
      sceneTestIds.scene3,
      'Scene 3',
      'Description for Scene 3',
    ),
    paths: [ defaultScenePath('Path 3', 'Description for Path 3') ],
  };
}
