import { ThemeModel } from '../models/models.min.js';

// prettier-ignore
const themes = [
    new ThemeModel({ name: 'red', h: 360, s: 38 }),
    new ThemeModel({ name: 'orange', h: 27, s: 56 }),
    new ThemeModel({ name: 'yellow', h: 52, s: 54 }),
    new ThemeModel({ name: 'green', h: 148, s: 34, selected: true }),
    new ThemeModel({ name: 'blue', h: 200, s: 44 }),
    new ThemeModel({ name: 'purple', h: 256, s: 32 }),
    new ThemeModel({ name: 'magenta', h: 300, s: 28 }),
  ];

// Export the class and Modes array for use in other modules
export { themes };
