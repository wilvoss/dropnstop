class ResultObject {
  constructor(spec) {
    this.count = spec.count;
    this.difficulty = spec.difficulty == undefined ? 'easy' : spec.difficulty;
    this.attempts = spec.attempts == undefined ? 4 : spec.attempts;
    this.success = spec.success == undefined ? false : spec.success;
    this.delta = spec.delta == undefined ? 0 : spec.delta;
    this.value = spec.value == undefined ? 0 : spec.value;
    this.ky = spec.ky;
    this.kx = spec.kx;
    this.kh = spec.kh;
    this.ty = spec.ty;
    this.th = spec.th;
  }
}
