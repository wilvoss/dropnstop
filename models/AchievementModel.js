export function AchievementModel(spec = {}) {
  return {
    name: spec.name || '',
    description: spec.description || '',
    points: spec.points || 0,
    unlocked: spec.unlocked || false,
    dateUnlocked: spec.dateUnlocked || null,
  };
}
