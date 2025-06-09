export function ResultObject(spec = {}) {
  return {
    count: spec.count ?? 0,
    difficulty: spec.difficulty ?? 'easy',
    attempts: spec.attempts ?? 4,
    success: spec.success ?? false,
    deltas: spec.deltas ?? [],
    value: spec.value ?? 0,
    py: spec.ky,
    px: spec.kx,
    ph: spec.kh,
    ty: spec.ty,
    th: spec.th,
  };
}
