export function AchievementModel(spec = {}) {
  return {
    id: spec.id || '',
    name: spec.name || '',
    description: spec.description || '',
    points: spec.points || 0,
    unlocked: spec.unlocked || false,
    dateUnlocked: spec.dateUnlocked || null,
    // Optional: add a check function for dynamic achievements
    check: spec.check || null, // (gameState) => boolean
  };
}
