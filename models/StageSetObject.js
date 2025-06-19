import { DifficultyObject } from './DifficultyObject';

export function StageSetObject(spec = {}) {
  return {
    name: spec.name ?? '',
    description: spec.description ?? 'Set description',
    startVisible: spec.startVisible ?? true,
    difficulty: spec.difficulty ?? new DifficultyObject({}),
    stages: spec.stages ?? [],
  };
}
