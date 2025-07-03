export function GradeModel(spec = {}) {
  return {
    threshold: spec.threshold ?? 0,
    value: spec.value ?? 'Z',
    title: spec.title ?? 'Title',
    description: spec.description ?? 'Description',
    emoji: spec.emoji ?? '👏',
  };
}
