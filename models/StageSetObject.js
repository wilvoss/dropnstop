export function StageSetObject(spec = {}) {
  return {
    id: spec.id,
    name: spec.name ?? '',
    description: spec.description ?? 'Set description',
    startVisible: spec.startVisible ?? true,
    difficulty: spec.difficulty ?? null,
    stages: spec.stages ?? [],
    finished: spec.finished ?? false,
  };
}
