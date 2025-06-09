export function StageObject(spec = {}) {
  return {
    kx: spec.kx ?? 0,
    kw: spec.kw ?? 0,
    kh: spec.kh ?? 0,
    tx: spec.tx ?? 0,
    ty: spec.ty ?? 0,
    tw: spec.tw ?? 0,
    th: spec.th ?? 0,
  };
}
