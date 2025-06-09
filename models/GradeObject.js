export function GradeObject(spec = {}) {
  return {
    threshold: spec.threshold ?? 0,
    grade: spec.grade ?? 'Z',
    title: spec.title ?? 'Title',
    description: spec.description ?? 'Description',
    emoji: spec.emoji ?? '👏',
  };
}
