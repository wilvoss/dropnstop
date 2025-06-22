export function DifficultyModel(spec = {}) {
  return {
    name: spec.name ?? '',
    height: spec.height ?? 20,
    width: spec.width ?? 20,
    selected: spec.selected ?? false,
    speed: spec.speed ?? 6,
  };
}
