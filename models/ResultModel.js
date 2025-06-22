export function ResultModel(spec = {}) {
  return {
    count: spec.count ?? 0,
    difficulty: spec.difficulty ?? 'easy',
    attempts: spec.attempts ?? 4,
    success: spec.success ?? false,
    deltas: spec.deltas ?? [],
    value: spec.value ?? 0,
    speed: spec.speed ?? 900,
    py: spec.ky,
    px: spec.kx,
    ph: spec.kh,
    pw: spec.kw ?? 20,
    ty: spec.ty,
    tx: spec.tx ?? 0,
    th: spec.th,
    tw: spec.tw ?? 500,
  };
}
