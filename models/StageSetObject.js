export function StageSetObject(spec = {}) {
  return {
    name: spec.name ?? '',
    stages: spec.stages ?? [],
  };
}
