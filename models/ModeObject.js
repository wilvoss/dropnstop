class ModeObject {
  constructor(spec) {
    this.name = spec.name == undefined ? '' : spec.name;
    this.height = spec.height == undefined ? 100 : spec.height;
    this.width = spec.width == undefined ? 20 : spec.width;
    this.selected = spec.selected == undefined ? false : spec.selected;
  }
}

var Modes = [
  new ModeObject({
    name: 'Easy',
    height: 100,
    selected: true,
  }),
  new ModeObject({
    name: 'Normal',
    height: 50,
    width: 15,
  }),
  new ModeObject({
    name: 'Hard',
    height: 25,
    width: 10,
  }),
  new ModeObject({
    name: 'Ultra',
    height: 0,
    width: 5,
  }),
];
