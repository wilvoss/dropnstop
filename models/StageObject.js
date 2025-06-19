export function StageObject(spec = {}) {
  return {
    name: spec.name ?? 'Stage',
    description: spec.description ?? 'Stage description',
    kx: spec.kx ?? 0,
    tx: spec.tx ?? 0,
    ty: spec.ty ?? 0,
    tw: spec.tw ?? 0,
    th: spec.th ?? 0,
    startVisible: spec.startVisible ?? false,
    speed: spec.speed ?? 900,
    difficulty: spec.difficulty ?? null,
  };
}
