export function ThemeModel(spec = {}) {
  return {
    name: spec.name ?? '',
    h: spec.h ?? 100,
    s: spec.s ?? 20,
    pl: spec.pl ?? 6,
    selected: spec.selected ?? false,
  };
}
