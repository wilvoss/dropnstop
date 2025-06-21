import { version } from '/constants/version.js';
export async function loadGameplayModules() {
  const { DifficultyObject } = await import(`../models/DifficultyObject.min.js?${version}`);
  const { GradeObject } = await import(`../models/GradeObject.min.js?${version}`);
  const { StageObject } = await import(`../models/StageObject.min.js?${version}`);
  const { StageSetObject } = await import(`../models/StageSetObject.min.js?${version}`);
  const { StageCampaignObject } = await import(`../models/StageCampaignObject.min.js?${version}`);
  const { ResultObject } = await import(`../models/ResultObject.min.js?${version}`);

  const grades = [
    new GradeObject({ threshold: 100, grade: `S+`, title: `Drop Deity`, description: `Perfection incarnate!`, emoji: `🏆` }),
    new GradeObject({ threshold: 95, grade: `S`, title: `Drop Dynamo`, description: `Flawless timing — unstoppable precision!`, emoji: `🎯` }),
    new GradeObject({ threshold: 90, grade: `A+`, title: `Stop Sage`, description: `Elite-level reaction speed`, emoji: `🧘` }),
    new GradeObject({ threshold: 85, grade: `A`, title: `Zone Zealot`, description: `Consistently landing in the sweet spot`, emoji: `🔍` }),
    new GradeObject({ threshold: 80, grade: `B+`, title: `Rapid Reacter`, description: `Fast and reliable, on your way`, emoji: `⚡` }),
    new GradeObject({ threshold: 75, grade: `B`, title: `Decent Dropper`, description: `Solid control, occasional missteps`, emoji: `📚` }),
    new GradeObject({ threshold: 70, grade: `C+`, title: `Late Bloomer`, description: `Slow reactions but improving`, emoji: `🌱` }),
    new GradeObject({ threshold: 65, grade: `C`, title: `Hesitant Handler`, description: `Second-guessing leads to misses`, emoji: `🤷` }),
    new GradeObject({ threshold: 60, grade: `D+`, title: `Silly Stopper`, description: `Mostly missing the timing`, emoji: `🫳` }),
    new GradeObject({ threshold: 55, grade: `D`, title: `Chaotic Clicker`, description: `More luck than skill`, emoji: `🎲` }),
    new GradeObject({ threshold: 0, grade: `F`, title: `Miserable Masher`, description: `Drop Disaster!`, emoji: `💥` }),
  ];

  // prettier-ignore
  const difficulties = [
    new DifficultyObject({ name: 'Easy', height: 20, speed: 900, }),
    new DifficultyObject({ name: 'Normal', height: 12, width: 15, speed: 1800, selected: true, }),
    new DifficultyObject({ name: 'Hard', height: 8, width: 10, speed: 3600, }),
    new DifficultyObject({ name: 'Ultra', height: 4, width: 5, speed: 4000, }),
  ];

  var campaigns = [
    new StageCampaignObject({
      name: `Tutorial`,
      subtitle: `Learn the basics of drop 'n stop`,
      selected: true,
      isTutorial: true,
      locked: false,
      sets: [
        new StageSetObject({
          name: `Let's get started!`,
          description: `The goal is to move the puck into the dropzone`,
          difficulty: difficulties[0],
          locked: false,
          // prettier-ignore
          stages: [
              new StageObject({ kx: 215, ty: 220, th: 80, showPuck: true, description: `Press and hold, then release "drop"` }),
              new StageObject({ kx: 0, ty: 200, th: 40, showPuck: true, description: `You get 3 chances to hit the target` }),
            new StageObject({ kx: 420, ty: 400, th: 20, description: `Sometimes the puck won't show until you press "drop"` }),
            new StageObject({ kx: 420, ty: 400, th: 20, showPuck: true, hideTarget: true, description:`Sometimes the target won't show until you press "drop"` }),
            ],
        }),
      ],
    }),
    new StageCampaignObject({
      name: 'Zen Mode',
      subtitle: `Master your stops with endless drops`,
      isEndless: true,
      locked: false,
    }),
    new StageCampaignObject({
      name: `Campaign 1`,
      subtitle: `Things are pretty easy here`,
      selected: true,
      isTutorial: false,
      locked: false,
      sets: [
        new StageSetObject({
          name: `Set 1`,
          description: ``,
          difficulty: difficulties[0],
          locked: false,
          stages: [
            new StageObject({ kx: 240, ty: 420, th: 80 }),
            new StageObject({ kx: 80, ty: 430, th: 80 }),
            new StageObject({ kx: 400, ty: 430, th: 80 }),
            new StageObject({ kx: 240, ty: 440, th: 60 }),
            new StageObject({ kx: 120, ty: 445, th: 60 }),
            new StageObject({ kx: 360, ty: 445, th: 60 }),
            new StageObject({ kx: 240, ty: 450, th: 40 }),
            new StageObject({ kx: 60, ty: 455, th: 40 }),
            new StageObject({ kx: 420, ty: 455, th: 40 }),
            new StageObject({ kx: 300, ty: 470, th: 20 }),
          ],
        }),
        new StageSetObject({
          name: `Set 2`,
          description: ``,
          difficulty: difficulties[0],
          stages: [
            new StageObject({ kx: 240, ty: 400, th: 80 }),
            new StageObject({ kx: 30, ty: 20, th: 100 }),
            new StageObject({ kx: 450, ty: 200, th: 90 }),
            new StageObject({ kx: 250, ty: 100, th: 60 }),
            new StageObject({ kx: 80, ty: 320, th: 70 }),
            new StageObject({ kx: 400, ty: 270, th: 60 }),
            new StageObject({ kx: 240, ty: 40, th: 30 }),
            new StageObject({ kx: 60, ty: 220, th: 35 }),
            new StageObject({ kx: 420, ty: 430, th: 40 }),
            new StageObject({ kx: 320, ty: 300, th: 20 }),
          ],
        }),
      ],
    }),
    new StageCampaignObject({
      name: `Campaign 2`,
      subtitle: `Don't get too comfortable`,
      selected: true,
      isTutorial: false,
      lock: true,
      sets: [
        new StageSetObject({
          name: `Set 1`,
          description: ``,
          difficulty: difficulties[0],
          // prettier-ignore
          stages: [
            new StageObject({ kx: 240, ty: 400, th: 80 }),
            new StageObject({ kx: 30,  ty: 20,  th: 100 }),
            new StageObject({ kx: 450, ty: 200, th: 90 }),
            new StageObject({ kx: 250, ty: 100, th: 60 }),
            new StageObject({ kx: 80,  ty: 320, th: 70 }),
            new StageObject({ kx: 400, ty: 270, th: 60 }),
            new StageObject({ kx: 240, ty: 40,  th: 30 }),
            new StageObject({ kx: 60,  ty: 220, th: 35 }),
            new StageObject({ kx: 420, ty: 430, th: 40 }),
            new StageObject({ kx: 320, ty: 300, th: 20 }),
          ],
        }),
      ],
    }),
  ];

  return {
    grades,
    difficulties,
    campaigns,
    DifficultyObject,
    GradeObject,
    StageObject,
    StageSetObject,
    StageCampaignObject,
    ResultObject,
  };
}
