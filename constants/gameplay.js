import { version } from '/constants/version.js';
export async function loadGameplayModules() {
  const { DifficultyModel } = await import(`../models/DifficultyModel.min.js?${version}`);
  const { GradeModel } = await import(`../models/GradeModel.min.js?${version}`);
  const { StageModel } = await import(`../models/StageModel.min.js?${version}`);
  const { SetModel } = await import(`../models/SetModel.min.js?${version}`);
  const { CampaignModel } = await import(`../models/CampaignModel.min.js?${version}`);
  const { ResultModel } = await import(`../models/ResultModel.min.js?${version}`);

  const grades = [
    new GradeModel({ threshold: 100, grade: `S+`, title: `Drop Deity`, description: `Perfection incarnate!`, emoji: `🏆` }),
    new GradeModel({ threshold: 95, grade: `S`, title: `Drop Dynamo`, description: `Flawless timing — unstoppable precision!`, emoji: `🎯` }),
    new GradeModel({ threshold: 90, grade: `A+`, title: `Stop Sage`, description: `Elite-level reaction speed`, emoji: `🧘` }),
    new GradeModel({ threshold: 85, grade: `A`, title: `Zone Zealot`, description: `Consistently landing in the sweet spot`, emoji: `🔍` }),
    new GradeModel({ threshold: 80, grade: `B+`, title: `Rapid Reacter`, description: `Fast and reliable, on your way`, emoji: `⚡` }),
    new GradeModel({ threshold: 75, grade: `B`, title: `Decent Dropper`, description: `Solid control, occasional missteps`, emoji: `📚` }),
    new GradeModel({ threshold: 70, grade: `C+`, title: `Late Bloomer`, description: `Slow reactions but improving`, emoji: `🌱` }),
    new GradeModel({ threshold: 65, grade: `C`, title: `Hesitant Handler`, description: `Second-guessing leads to misses`, emoji: `🤷` }),
    new GradeModel({ threshold: 60, grade: `D+`, title: `Silly Stopper`, description: `Mostly missing the timing`, emoji: `🫳` }),
    new GradeModel({ threshold: 55, grade: `D`, title: `Chaotic Clicker`, description: `More luck than skill`, emoji: `🎲` }),
    new GradeModel({ threshold: 0, grade: `F`, title: `Miserable Masher`, description: `Drop Disaster!`, emoji: `💥` }),
  ];

  // prettier-ignore
  const difficulties = [
    new DifficultyModel({ name: 'Easy', height: 20, speed: 900, }),
    new DifficultyModel({ name: 'Normal', height: 12, width: 15, speed: 1800, selected: true, }),
    new DifficultyModel({ name: 'Hard', height: 8, width: 10, speed: 3600, }),
    new DifficultyModel({ name: 'Ultra', height: 4, width: 5, speed: 4000, }),
  ];

  var campaigns = [
    new CampaignModel({
      name: `Tutorial`,
      subtitle: `Learn the basics of drop 'n stop`,
      selected: true,
      isTutorial: true,
      locked: false,
      sets: [
        new SetModel({
          name: `The basics`,
          description: `Your goal is to stop the puck within the dropzone`,
          difficulty: difficulties[0],
          locked: false,
          // prettier-ignore
          stages: [
              new StageModel({ kx: 215, ty: 50, th: 190, showPuck: true, name: `you control the puck`, description: `the puck only falls while you press the "drop" button` }),
              new StageModel({ kx: 0, ty: 200, th: 40, showPuck: true, description: `You get 3 chances per level, each miss lowers the dropzone value` }),
            new StageModel({ kx: 420, ty: 100, th: 120, description: `As an added challenge, sometimes the puck won't appear unless you are pressing "drop"` }),
            new StageModel({ kx: 420, ty: 220, th: 170, showPuck: true, hideTarget: true, description:`Likewise, sometimes the dropzone won't appear unless you are pressing "drop"` }),
            ],
        }),
      ],
    }),
    new CampaignModel({
      name: 'Zen Mode',
      subtitle: `Master your stops with endless drops`,
      isEndless: true,
      locked: false,
    }),
    new CampaignModel({
      name: `Campaign 1`,
      subtitle: `Things are pretty easy here`,
      selected: true,
      isTutorial: false,
      locked: false,
      sets: [
        new SetModel({
          name: `Set 1`,
          description: ``,
          difficulty: difficulties[0],
          locked: false,
          // prettier-ignore
          stages: [
            new StageModel({ kx: 240, ty: 420, th: 80 }),
            new StageModel({ kx: 400, ty: 430, th: 80 }),
            new StageModel({ kx: 120, ty: 445, th: 60 }),
            new StageModel({ kx: 420, ty: 455, th: 40 }),
            new StageModel({ kx: 300, ty: 470, th: 20 }),
          ],
        }),
        new SetModel({
          name: `Set 2`,
          description: ``,
          difficulty: difficulties[0],
          stages: [new StageModel({ kx: 240, ty: 400, th: 80 }), new StageModel({ kx: 30, ty: 20, th: 100 }), new StageModel({ kx: 450, ty: 200, th: 90 }), new StageModel({ kx: 250, ty: 100, th: 60 }), new StageModel({ kx: 80, ty: 320, th: 70 }), new StageModel({ kx: 400, ty: 270, th: 60 }), new StageModel({ kx: 240, ty: 40, th: 30 }), new StageModel({ kx: 60, ty: 220, th: 35 }), new StageModel({ kx: 420, ty: 430, th: 40 }), new StageModel({ kx: 320, ty: 300, th: 20 })],
        }),
      ],
    }),
    new CampaignModel({
      name: `Campaign 2`,
      subtitle: `Don't get too comfortable`,
      selected: true,
      isTutorial: false,
      lock: true,
      sets: [
        new SetModel({
          name: `Set 1`,
          description: ``,
          difficulty: difficulties[0],
          // prettier-ignore
          stages: [
            new StageModel({ kx: 240, ty: 400, th: 80 }),
            new StageModel({ kx: 30,  ty: 20,  th: 100 }),
            new StageModel({ kx: 450, ty: 200, th: 90 }),
            new StageModel({ kx: 250, ty: 100, th: 60 }),
            new StageModel({ kx: 80,  ty: 320, th: 70 }),
            new StageModel({ kx: 400, ty: 270, th: 60 }),
            new StageModel({ kx: 240, ty: 40,  th: 30 }),
            new StageModel({ kx: 60,  ty: 220, th: 35 }),
            new StageModel({ kx: 420, ty: 430, th: 40 }),
            new StageModel({ kx: 320, ty: 300, th: 20 }),
          ],
        }),
      ],
    }),
  ];

  return {
    grades,
    difficulties,
    campaigns,
    DifficultyModel,
    GradeModel,
    StageModel,
    SetModel,
    CampaignModel,
    ResultModel,
  };
}
