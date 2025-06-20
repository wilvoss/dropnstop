export function StageObject(spec = {}) {
  return {
    name: spec.name ?? '',
    description: spec.description ?? '',
    kx: spec.kx ?? 0,
    tx: spec.tx ?? 0,
    ty: spec.ty ?? 0,
    tw: spec.tw ?? 500,
    th: spec.th ?? 0,
    startVisible: spec.startVisible ?? false,
    grade: spec.grade ?? null,
    difficulty: spec.difficulty ?? null,
    score: spec.score ?? 0,
    result: spec.result ?? null,
    finished: spec.finished ?? false,
    showPuck: spec.showPuck ?? false,
    hideTarget: spec.hideTarget ?? false,
  };
}
