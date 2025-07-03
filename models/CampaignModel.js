export function CampaignModel(spec = {}) {
  return {
    id: spec.id,
    name: spec.name ?? '',
    subtitle: spec.subtitle ?? '',
    sets: spec.sets ?? [],
    grade: spec.grade ?? null,
    selected: spec.selected ?? false,
    allowUserSelectedDifficulty: spec.allowUserSelectedDifficulty ?? false,
    difficulty: spec.difficulty ?? null,
    nextCampaignId: spec.nextCampaignId ?? null,
    isEndless: spec.isEndless ?? false,
    isTutorial: spec.isTutorial ?? false,
    // this data is restored from the game state database
    finished: spec.finished ?? false,
    locked: spec.locked ?? true,
    highestPossibleScore: spec.highestPossibleScore ?? 0,
    score: spec.score ?? 0,
    grade: spec.grade ?? null,
  };
}
