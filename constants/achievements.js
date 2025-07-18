import { AchievementModel } from '/models/models.min.js';

export const achievements = [
  // Progression
  new AchievementModel({
    id: 'first_drop',
    name: 'First Drop',
    description: 'Complete your first stage.',
    points: 5,
    check: (gameState) => gameState.campaigns.some((c) => c.sets?.some((s) => s.stages?.some((st) => st.finished))),
  }),
  new AchievementModel({
    id: 'primer_complete',
    name: 'Precision Primer',
    description: 'Complete the "Precision Primer" campaign.',
    points: 10,
    check: (gameState) => gameState.campaigns.find((c) => c.name === 'Precision Primer')?.finished,
  }),
  new AchievementModel({
    id: 'edge_complete',
    name: 'Edge of Expectation',
    description: 'Complete the "Edge of Expectation" campaign.',
    points: 15,
    check: (gameState) => gameState.campaigns.find((c) => c.name === 'Edge of Expectation')?.finished,
  }),
  new AchievementModel({
    id: 'sight_complete',
    name: 'Sight Unseen',
    description: 'Complete the "Sight Unseen" campaign.',
    points: 20,
    check: (gameState) => gameState.campaigns.find((c) => c.name === 'Sight Unseen')?.finished,
  }),
  new AchievementModel({
    id: 'collapse_complete',
    name: 'Precision Collapse',
    description: 'Complete the "Precision Collapse" campaign.',
    points: 25,
    check: (gameState) => gameState.campaigns.find((c) => c.name === 'Precision Collapse')?.finished,
  }),
  new AchievementModel({
    id: 'unraveled_complete',
    name: 'Unraveled Intent',
    description: 'Complete the "Unraveled Intent" campaign.',
    points: 30,
    check: (gameState) => gameState.campaigns.find((c) => c.name === 'Unraveled Intent')?.finished,
  }),
  new AchievementModel({
    id: 'shattered_complete',
    name: 'Precision Shattered',
    description: 'Complete the "Precision Shattered" campaign.',
    points: 40,
    check: (gameState) => gameState.campaigns.find((c) => c.name === 'Precision Shattered')?.finished,
  }),
  new AchievementModel({
    id: 'all_campaigns',
    name: 'Drop ’n Stop Master',
    description: 'Complete all campaigns.',
    points: 100,
    check: (gameState) => gameState.campaigns.every((c) => c.finished),
  }),

  // Skill
  new AchievementModel({
    id: 'perfect_stage',
    name: 'Perfect Stage',
    description: 'Clear any stage on your first attempt.',
    points: 10,
    check: (gameState) => gameState.campaigns.some((c) => c.sets?.some((s) => s.stages?.some((st) => st.finished && st.success && st.attempts === 1))),
  }),
  new AchievementModel({
    id: 'flawless_set',
    name: 'Flawless Set',
    description: 'Complete a set with all stages cleared on the first attempt.',
    points: 20,
    check: (gameState) => gameState.campaigns.some((c) => c.sets?.some((s) => s.finished && s.stages?.every((st) => st.finished && st.success && st.attempts === 1))),
  }),
  new AchievementModel({
    id: 'no_misses',
    name: 'No Misses',
    description: 'Complete any set without missing a single drop.',
    points: 15,
    check: (gameState) => gameState.campaigns.some((c) => c.sets?.some((s) => s.finished && s.stages?.every((st) => st.finished && st.success))),
  }),
  new AchievementModel({
    id: 'ultra_clear',
    name: 'Ultra Clear',
    description: 'Complete a stage on Ultra difficulty.',
    points: 15,
    check: (gameState) => gameState.campaigns.some((c) => c.sets?.some((s) => s.stages?.some((st) => st.finished && st.difficulty?.name === 'Ultra'))),
  }),
  new AchievementModel({
    id: 'hidden_hero',
    name: 'Hidden Hero',
    description: 'Clear a stage where the puck or dropzone is hidden.',
    points: 10,
    check: (gameState) => gameState.campaigns.some((c) => c.sets?.some((s) => s.stages?.some((st) => st.finished && st.success && (st.hideTarget || st.showPuck === false)))),
  }),

  // Endurance & Misc
  new AchievementModel({
    id: 'zen_100',
    name: 'Zen 100',
    description: 'Clear 100 stages in Zen Mode.',
    points: 20,
    check: (gameState) => {
      const zen = gameState.campaigns.find((c) => c.name === 'Zen Mode');
      return zen && zen.stagesCleared >= 100;
    },
  }),
  new AchievementModel({
    id: 'comeback',
    name: 'Comeback Kid',
    description: 'Clear a stage after missing twice (on your last attempt).',
    points: 10,
    check: (gameState) => gameState.campaigns.some((c) => c.sets?.some((s) => s.stages?.some((st) => st.finished && st.success && st.attempts === 3))),
  }),
  new AchievementModel({
    id: 'persistent',
    name: 'Persistent',
    description: 'Fail a stage 10 times (across all play).',
    points: 5,
    check: (gameState) => {
      let fails = 0;
      gameState.campaigns.forEach((c) =>
        c.sets?.forEach((s) =>
          s.stages?.forEach((st) => {
            if (st.finished && !st.success) fails++;
          }),
        ),
      );
      return fails >= 10;
    },
  }),
];
