export function StageModel(spec = {}) {
  return {
    name: spec.name ?? '',
    subtitle: spec.subtitle ?? '',
    description: spec.description ?? '',
    difficulty: spec.difficulty ?? null,
    kx: spec.kx ?? 0,
    tx: spec.tx ?? 0,
    ty: spec.ty ?? 0,
    tw: spec.tw ?? 500,
    th: spec.th ?? 0,
    hideTarget: spec.hideTarget ?? false,
    startVisible: spec.startVisible ?? false,
    showPuck: spec.showPuck ?? false,
    // this data is restored from the game state database
    finished: spec.finished ?? false,
    score: spec.score ?? 0,
    attempts: spec.attempts ?? 3,
    success: spec.success ?? false,
    grade: spec.grade ?? null,
  };
}
