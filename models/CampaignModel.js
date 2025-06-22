export function CampaignModel(spec = {}) {
  return {
    id: spec.id,
    name: spec.name ?? '',
    subtitle: spec.subtitle ?? '',
    sets: spec.sets ?? [],
    score: spec.score ?? 0,
    grade: spec.grade ?? null,
    selected: spec.selected ?? false,
    finished: spec.finished ?? false,
    allowUserSelectedDifficulty: spec.allowUserSelectedDifficulty ?? false,
    difficulty: spec.difficulty ?? null,
    nextCampaignId: spec.nextCampaignId ?? null,
    isEndless: spec.isEndless ?? false,
    isTutorial: spec.isTutorial ?? false,
    locked: spec.locked ?? true,
    score: spec.score ?? 0,
    grade: spec.grade ?? null,
  };
}
