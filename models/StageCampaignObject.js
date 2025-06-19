export function StageCampaignObject(spec = {}) {
  return {
    id: spec.id,
    name: spec.name ?? 'Campaign Title',
    sets: spec.sets ?? [],
    score: spec.score ?? 0,
    grade: spec.grade ?? null,
    selected: spec.selected ?? false,
    finished: spec.finished ?? false,
    allowUserSelectedDifficulty: spec.allowUserSelectedDifficulty ?? false,
    difficulty: spec.difficulty ?? null,
    nextCampaignId: spec.nextCampaignId ?? null,
    isEndless: spec.isEndless ?? false,
  };
}
