export function SetModel(spec = {}) {
  return {
    id: spec.id,
    name: spec.name ?? '',
    subtitle: spec.subtitle ?? '',
    description: spec.description ?? '',
    showPuck: spec.showPuck ?? false,
    hideTarget: spec.hideTarget ?? false,
    startVisible: spec.startVisible ?? true,
    difficulty: spec.difficulty ?? null,
    stages: spec.stages ?? [],
    // this data is restored from the game state database
    finished: spec.finished ?? false,
    locked: spec.locked ?? true,
    score: spec.score ?? 0,
    grade: spec.grade ?? null,
  };
}
