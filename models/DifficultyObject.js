export function DifficultyObject(spec = {}) {
  return {
    name: spec.name ?? '',
    height: spec.height ?? 100,
    width: spec.width ?? 20,
    selected: spec.selected ?? false,
    speed: spec.speed ?? 6,
  };
}
