class ModeObject {
  constructor(spec) {
    this.name = spec.name == undefined ? '' : spec.name;
    this.height = spec.height == undefined ? 100 : spec.height;
    this.width = spec.width == undefined ? 20 : spec.width;
    this.selected = spec.selected == undefined ? false : spec.selected;
    this.speed = spec.speed = undefined ? 6 : spec.speed;
  }
}

var Modes = [
  new ModeObject({
    name: 'Easy',
    height: 16,
    speed: 3,
  }),
  new ModeObject({
    name: 'Normal',
    height: 50,
    width: 15,
    speed: 6,
    selected: true,
  }),
  new ModeObject({
    name: 'Hard',
    height: 75,
    width: 10,
    speed: 12,
  }),
  new ModeObject({
    name: 'Ultra',
    height: 100,
    width: 5,
    speed: 12,
  }),
];
