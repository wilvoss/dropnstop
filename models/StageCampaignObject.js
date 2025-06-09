export function StageCampaignObject(spec = {}) {
  return {
    name: spec.name ?? 'Campaign Title',
    sets: spec.sets ?? [],
  };
}
