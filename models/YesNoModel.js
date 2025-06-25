export function YesNoModel(spec = {}) {
  return {
    action: spec.action ?? null,
    title: spec.title ?? 'Title',
    message: spec.message ?? 'Message',
    button: spec.button ?? 'OK',
  };
}
