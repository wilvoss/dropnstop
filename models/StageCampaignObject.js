export function StageCampaignObject(spec = {}) {
  return {
    name: spec.name ?? 'Campaign Title',
    sets: spec.sets ?? [],
    selected: spec.selected ?? false,
    finished: spec.finished ?? false,
  };
}
