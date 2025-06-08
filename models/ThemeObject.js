// Define the ThemeObject class
class ThemeObject {
  constructor(spec = {}) {
    this.name = spec.name ?? '';
    this.h = spec.h ?? 100;
    this.s = spec.s ?? 20;
    this.pl = spec.pl ?? 6;
    this.selected = spec.selected ?? false;
  }
}

// prettier-ignore
const Themes = [
  new ThemeObject({ name: 'r', h: 360, s: 38, pl: 83 }),
  new ThemeObject({ name: '0', h: 27, s: 46, pl: 17 }),
  new ThemeObject({ name: 'y', h: 52, s: 50, pl: 17 }),
  new ThemeObject({ name: 'g', h: 148, s: 34, pl: 83, selected: true }),
  new ThemeObject({ name: 'b', h: 200, s: 44, pl: 83 }),
  new ThemeObject({ name: 'p', h: 256, s: 36, pl: 83 }),
  new ThemeObject({ name: 'm', h: 300, s: 38, pl: 83 }),
];

// Export the class and Themes array for use in other modules
export { ThemeObject, Themes };
