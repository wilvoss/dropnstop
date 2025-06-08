// Define the ModeObject class
class ModeObject {
  constructor(spec = {}) {
    this.name = spec.name ?? '';
    this.height = spec.height ?? 100;
    this.width = spec.width ?? 20;
    this.selected = spec.selected ?? false;
    this.speed = spec.speed ?? 6;
  }
}

// Define an array of Modes
const Modes = [
  new ModeObject({
    name: 'Easy',
    height: 20,
    speed: 3,
  }),
  new ModeObject({
    name: 'Normal',
    height: 12,
    width: 15,
    speed: 6,
    selected: true,
  }),
  new ModeObject({
    name: 'Hard',
    height: 8,
    width: 10,
    speed: 12,
  }),
  new ModeObject({
    name: 'Ultra',
    height: 4,
    width: 5,
    speed: 12,
  }),
];

// Export the class and Modes array for use in other modules
export { ModeObject, Modes };
