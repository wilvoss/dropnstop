class ThemeObject {
  constructor(spec) {
    this.name = spec.name == undefined ? '' : spec.name;
    this.h = spec.h == undefined ? 100 : spec.h;
    this.s = spec.s == undefined ? 20 : spec.s;
    this.pl = spec.pl = undefined ? 6 : spec.pl;
    this.selected = spec.selected == undefined ? false : spec.selected;
  }
}

var Themes = [
  // new ThemeObject({
  //   name: 'lem',
  //   h: 52,
  //   s: 46,
  //   pl: 0,
  // }),
  new ThemeObject({
    name: 'r',
    h: 350,
    s: 34,
    pl: 100,
  }),
  new ThemeObject({
    name: 'g',
    h: 148,
    s: 34,
    pl: 100,
    selected: true,
  }),
  new ThemeObject({
    name: 'b',
    h: 200,
    s: 54,
    pl: 100,
  }),
];
