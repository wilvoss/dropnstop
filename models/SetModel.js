export function SetModel(spec = {}) {
  return {
    id: spec.id,
    name: spec.name ?? '',
    subtitle: spec.subtitle ?? '',
    description: spec.description ?? '',
    startVisible: spec.startVisible ?? true,
    difficulty: spec.difficulty ?? null,
    stages: spec.stages ?? [],
    finished: spec.finished ?? false,
    locked: spec.locked ?? true,
    score: spec.score ?? 0,
    grade: spec.grade ?? null,
  };
}
