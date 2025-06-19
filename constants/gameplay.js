import { GradeObject } from '../models/GradeObject.min.js';
import { StageObject } from '../models/StageObject.min.js';
import { StageSetObject } from '../models/StageSetObject.min.js';
import { StageCampaignObject } from '../models/StageCampaignObject.min.js';
import { DifficultyObject } from '../models/DifficultyObject.js';

const grades = [
  new GradeObject({ threshold: 95, grade: 'S', title: 'Drop Dynamo', description: 'Flawless timing—unstoppable precision!', emoji: '🎯' }),
  new GradeObject({ threshold: 90, grade: 'A+', title: 'Stop Sage', description: 'Elite-level reaction speed', emoji: '🧘' }),
  new GradeObject({ threshold: 85, grade: 'A', title: 'Zone Zealot', description: 'Consistently landing in the sweet spot', emoji: '🔍' }),
  new GradeObject({ threshold: 80, grade: 'B+', title: 'Rapid Reacter', description: 'Fast and reliable, on your way', emoji: '⚡' }),
  new GradeObject({ threshold: 75, grade: 'B', title: 'Decent Dropper', description: 'Solid control, occasional missteps', emoji: '📚' }),
  new GradeObject({ threshold: 70, grade: 'C+', title: 'Late Bloomer', description: 'Slow reactions but improving', emoji: '🌱' }),
  new GradeObject({ threshold: 65, grade: 'C', title: 'Hesitant Handler', description: 'Second-guessing leads to misses', emoji: '🤷' }),
  new GradeObject({ threshold: 60, grade: 'D+', title: 'Silly Stopper', description: 'Mostly missing the timing', emoji: '🫳' }),
  new GradeObject({ threshold: 55, grade: 'D', title: 'Chaotic Clicker', description: 'More luck than skill', emoji: '🎲' }),
  new GradeObject({ threshold: 0, grade: 'F', title: 'Miserable Masher', description: 'Drop Disaster!', emoji: '💥' }),
];

var campaigns = Array.from(
  { length: 100 },
  () =>
    new StageCampaignObject({
      name: 'Tutorial',
      description: `Welcome to drop 'n stop, let's get started with the basics.`,
      selected: true,
      sets: [
        new StageSetObject({
          name: 'The Basics',
          description: `The goal is to move the puck into the zone down below,`,
          difficulty: new DifficultyObject({ name: 'Easy', height: 20, speed: 900 }),
          stages: [
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 1`, description: `A` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `B` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `C` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `D` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `E` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `F` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `G` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `H` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `I` }),
            new StageObject({ kx: 0, tx: 0, ty: 0, tw: 0, th: 0, speed: 900, name: `Stage 2`, description: `J` }),
          ],
        }),
      ],
    }),
);

export { grades, campaigns };
