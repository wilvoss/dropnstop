// Define the ResultObject class
class ResultObject {
  constructor(spec = {}) {
    this.count = spec.count ?? 0;
    this.difficulty = spec.difficulty ?? 'easy';
    this.attempts = spec.attempts ?? 4;
    this.success = spec.success ?? false;
    this.deltas = spec.deltas ?? [];
    this.value = spec.value ?? 0;
    this.ky = spec.ky;
    this.kx = spec.kx;
    this.kh = spec.kh;
    this.ty = spec.ty;
    this.th = spec.th;
  }
}

// Export the ResultObject class for use in other modules
export { ResultObject };
