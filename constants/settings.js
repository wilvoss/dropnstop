import { DifficultyObject } from '../models/DifficultyObject.min.js';
import { ThemeObject } from '../models/ThemeObject.min.js';

// prettier-ignore
const difficulties = [
  new DifficultyObject({ name: 'Easy', height: 20, speed: 900, }),
  new DifficultyObject({ name: 'Normal', height: 12, width: 15, speed: 1800, selected: true, }),
  new DifficultyObject({ name: 'Hard', height: 8, width: 10, speed: 3600, }),
  new DifficultyObject({ name: 'Ultra', height: 4, width: 5, speed: 4000, }),
];

// prettier-ignore
const themes = [
    new ThemeObject({ name: 'red', h: 360, s: 38, pl: 83 }),
    new ThemeObject({ name: 'orange', h: 27, s: 46, pl: 17 }),
    new ThemeObject({ name: 'yellow', h: 52, s: 50, pl: 17 }),
    new ThemeObject({ name: 'green', h: 148, s: 34, pl: 83, selected: true }),
    new ThemeObject({ name: 'blue', h: 200, s: 44, pl: 83 }),
    new ThemeObject({ name: 'purple', h: 256, s: 36, pl: 83 }),
    new ThemeObject({ name: 'magenta', h: 300, s: 38, pl: 83 }),
  ];

// Export the class and Modes array for use in other modules
export { difficulties, themes };
