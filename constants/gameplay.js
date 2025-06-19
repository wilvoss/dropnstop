import { version } from '/constants/version.js';
export async function loadGameplayModules() {
  const { DifficultyObject } = await import(`../models/DifficultyObject.min.js?${version}`);
  const { GradeObject } = await import(`../models/GradeObject.min.js?${version}`);
  const { StageObject } = await import(`../models/StageObject.min.js?${version}`);
  const { StageSetObject } = await import(`../models/StageSetObject.min.js?${version}`);
  const { StageCampaignObject } = await import(`../models/StageCampaignObject.min.js?${version}`);
  const { ResultObject } = await import(`../models/ResultObject.min.js?${version}`);

  const grades = [
    new GradeObject({ threshold: 95, grade: `S`, title: `Drop Dynamo`, description: `Flawless timing—unstoppable precision!`, emoji: `🎯` }),
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

  var campaigns = Array.from(
    { length: 1 },
    () =>
      new StageCampaignObject({
        id: 0,
        name: `Tutorial`,
        description: `Welcome to drop 'n stop, let's get started with the basics.`,
        selected: true,
        sets: [
          new StageSetObject({
            id: 0,
            name: `The Basics`,
            description: `The goal is to move the puck into the zone down below,`,
            difficulty: difficulties[0],
            // prettier-ignore
            stages: [
              new StageObject({ kx: 215, tx: 320, ty: 0, tw: 0, th: 0 }),
              new StageObject({ kx: 0, tx: 40, ty: 0, tw: 0, th: 0 }),
              new StageObject({ kx: 20, tx: 80, ty: 0, tw: 0, th: 0 }),
            ],
          }),
        ],
      }),
  );

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
