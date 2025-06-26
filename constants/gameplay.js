import { version } from '/constants/version.js';
export async function loadGameplayModules() {
  const { DifficultyModel } = await import(`../models/DifficultyModel.min.js?${version}`);
  const { GradeModel } = await import(`../models/GradeModel.min.js?${version}`);
  const { StageModel } = await import(`../models/StageModel.min.js?${version}`);
  const { SetModel } = await import(`../models/SetModel.min.js?${version}`);
  const { CampaignModel } = await import(`../models/CampaignModel.min.js?${version}`);
  const { ResultModel } = await import(`../models/ResultModel.min.js?${version}`);
  const { YesNoModel } = await import(`../models/YesNoModel.min.js?${version}`);

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
          id: 0,
          name: `The basics`,
          description: `Your goal is to stop the puck within the dropzone`,
          difficulty: difficulties[0],
          locked: false,
          // prettier-ignore
          stages: [
              new StageModel({ kx: 215, ty: 50, th: 190, showPuck: true, name: `you control gravity`, description: `the puck falls when you press/hold the "drop" button` }),
              new StageModel({ kx: 0, ty: 200, th: 40, showPuck: true, name: `you get 3 chances`, description: `each miss lowers the dropzone's value` }),
            new StageModel({ kx: 420, ty: 100, th: 120, name: `hidden puck!`, description: `sometimes the puck won't appear unless you are pressing the "drop" button` }),
            new StageModel({ kx: 420, ty: 220, th: 170, showPuck: true, hideTarget: true,  name: `hidden dropzone!`, description:`sometimes the dropzone won't appear unless you are pressing the "drop" button` }),
            ],
        }),
      ],
    }),
    new CampaignModel({
      id: 1,
      name: 'Zen Mode',
      subtitle: `Master your stops with endless drops`,
      isEndless: true,
      locked: false,
    }),
    new CampaignModel({
      id: 2,
      name: `Precision Primer`,
      subtitle: `Things are pretty easy here`,
      selected: true,
      isTutorial: false,
      locked: false,
      sets: [
        new SetModel({
          name: `First Drops`,
          description: `Learn the basics with full visibility and easy timing`,
          difficulty: difficulties[0],
          showPuck: true,
          hideTarget: false,
          locked: false,
          stages: [new StageModel({ kx: 200, ty: 300, th: 80 }), new StageModel({ kx: 260, ty: 320, th: 80 }), new StageModel({ kx: 180, ty: 340, th: 80 }), new StageModel({ kx: 240, ty: 360, th: 80 })],
        }),

        new SetModel({
          name: `Shifting Heights`,
          description: `The drop distance changes, but everything stays visible`,
          difficulty: difficulties[0],
          showPuck: true,
          hideTarget: false,
          stages: [new StageModel({ kx: 220, ty: 280, th: 80 }), new StageModel({ kx: 270, ty: 360, th: 80 }), new StageModel({ kx: 160, ty: 400, th: 80 }), new StageModel({ kx: 230, ty: 450, th: 80 }), new StageModel({ kx: 180, ty: 380, th: 80 })],
        }),

        new SetModel({
          name: `Now You See It`,
          description: `We’ll start to hide the puck or dropzone before the drop`,
          difficulty: difficulties[0],
          showPuck: true,
          hideTarget: false,
          stages: [new StageModel({ kx: 200, ty: 400, th: 80, showPuck: false }), new StageModel({ kx: 150, ty: 350, th: 80, hideTarget: true }), new StageModel({ kx: 270, ty: 420, th: 80, showPuck: false }), new StageModel({ kx: 190, ty: 380, th: 80, hideTarget: true }), new StageModel({ kx: 250, ty: 360, th: 80 }), new StageModel({ kx: 230, ty: 440, th: 80 })],
        }),

        new SetModel({
          name: `Surprise Drops`,
          description: `Expect shorter drops and faster decisions — but nothing too tricky`,
          difficulty: difficulties[0],
          showPuck: false,
          hideTarget: true,
          stages: [new StageModel({ kx: 180, ty: 280, th: 80 }), new StageModel({ kx: 260, ty: 240, th: 80 }), new StageModel({ kx: 200, ty: 300, th: 80 })],
        }),

        new SetModel({
          name: `Find Your Flow`,
          description: `Build rhythm and trust your instincts with mixed visibility`,
          difficulty: difficulties[0],
          showPuck: true,
          hideTarget: false,
          stages: [new StageModel({ kx: 210, ty: 320, th: 80 }), new StageModel({ kx: 240, ty: 380, th: 80, hideTarget: true }), new StageModel({ kx: 190, ty: 300, th: 80, showPuck: false }), new StageModel({ kx: 170, ty: 430, th: 80 }), new StageModel({ kx: 260, ty: 410, th: 80 }), new StageModel({ kx: 150, ty: 350, th: 80 }), new StageModel({ kx: 280, ty: 390, th: 80, hideTarget: true })],
        }),

        new SetModel({
          name: `Proving Ground`,
          description: `Drop height, visibility, and timing all mix in — take your time and trust your feel`,
          difficulty: difficulties[0],
          showPuck: false,
          hideTarget: true,
          stages: [new StageModel({ kx: 210, ty: 320, th: 80 }), new StageModel({ kx: 250, ty: 400, th: 80 }), new StageModel({ kx: 180, ty: 440, th: 80 }), new StageModel({ kx: 230, ty: 300, th: 80, showPuck: true, hideTarget: false }), new StageModel({ kx: 190, ty: 360, th: 80 })],
        }),
      ],
    }),
    new CampaignModel({
      id: 3,
      name: `Timing Trials`,
      subtitle: `Things are a little harder now`,
      selected: false,
      isTutorial: false,
      locked: true,
      sets: [
        new SetModel({
          name: `Early Pressure`,
          description: `Drop distance gets shorter, and the target may not wait around.`,
          difficulty: difficulties[0],
          showPuck: true,
          hideTarget: false,
          locked: false,
          stages: [new StageModel({ kx: 180, ty: 260, th: 60 }), new StageModel({ kx: 200, ty: 240, th: 60 }), new StageModel({ kx: 160, ty: 300, th: 60, hideTarget: true }), new StageModel({ kx: 140, ty: 280, th: 60 })],
        }),

        new SetModel({
          name: `Hidden Starts`,
          description: `You won’t always see what’s falling—or what it’s falling toward.`,
          difficulty: difficulties[0],
          showPuck: false,
          hideTarget: false,
          stages: [new StageModel({ kx: 260, ty: 350, th: 60 }), new StageModel({ kx: 230, ty: 320, th: 60, hideTarget: true }), new StageModel({ kx: 190, ty: 400, th: 60 }), new StageModel({ kx: 210, ty: 330, th: 60, hideTarget: true }), new StageModel({ kx: 240, ty: 370, th: 60 })],
        }),

        new SetModel({
          name: `Steady Hands`,
          description: `You’ll need better aim as the puck gets smaller and falls faster.`,
          difficulty: difficulties[1],
          showPuck: true,
          hideTarget: false,
          stages: [new StageModel({ kx: 170, ty: 280, th: 50 }), new StageModel({ kx: 290, ty: 300, th: 50 }), new StageModel({ kx: 210, ty: 350, th: 50, showPuck: false }), new StageModel({ kx: 230, ty: 400, th: 50 }), new StageModel({ kx: 260, ty: 360, th: 50 }), new StageModel({ kx: 200, ty: 380, th: 50 })],
        }),

        new SetModel({
          name: `Precision Zones`,
          description: `The puck is faster. The target is smaller. You’ve got this.`,
          difficulty: difficulties[1],
          showPuck: false,
          hideTarget: true,
          stages: [new StageModel({ kx: 250, ty: 220, th: 40 }), new StageModel({ kx: 180, ty: 250, th: 40 }), new StageModel({ kx: 220, ty: 280, th: 40 }), new StageModel({ kx: 200, ty: 260, th: 40 })],
        }),

        new SetModel({
          name: `Flow and Focus`,
          description: `You’ll need to rely on feel now—sight won’t save you every time.`,
          difficulty: difficulties[1],
          showPuck: false,
          hideTarget: false,
          stages: [new StageModel({ kx: 190, ty: 390, th: 50, hideTarget: true }), new StageModel({ kx: 240, ty: 420, th: 50 }), new StageModel({ kx: 210, ty: 370, th: 50, showPuck: true, hideTarget: true }), new StageModel({ kx: 260, ty: 400, th: 50 }), new StageModel({ kx: 170, ty: 430, th: 50 }), new StageModel({ kx: 280, ty: 410, th: 50 })],
        }),
      ],
    }),
    new CampaignModel({
      id: 4,
      name: `Reflex and Rhythm`,
      subtitle: `It’s all about timing now`,
      selected: false,
      isTutorial: false,
      locked: true,
      sets: [
        new SetModel({
          name: `Sharper Edges`,
          description: `The puck moves faster—and the target gets smaller.`,
          difficulty: difficulties[1], // Normal
          showPuck: true,
          hideTarget: false,
          locked: false,
          stages: [new StageModel({ kx: 210, ty: 300, th: 40 }), new StageModel({ kx: 180, ty: 320, th: 40 }), new StageModel({ kx: 250, ty: 340, th: 40 }), new StageModel({ kx: 190, ty: 360, th: 40 })],
        }),

        new SetModel({
          name: `Trust the Drop`,
          description: `More is hidden now—trust your instincts and don’t blink.`,
          difficulty: difficulties[1],
          showPuck: false,
          hideTarget: true,
          stages: [new StageModel({ kx: 200, ty: 280, th: 40 }), new StageModel({ kx: 170, ty: 250, th: 40 }), new StageModel({ kx: 230, ty: 300, th: 40 }), new StageModel({ kx: 260, ty: 270, th: 40 }), new StageModel({ kx: 240, ty: 290, th: 40 })],
        }),

        new SetModel({
          name: `Fast Falls`,
          description: `Speed and height come together—you’ll need quick hands.`,
          difficulty: difficulties[2], // Hard
          showPuck: false,
          hideTarget: true,
          stages: [new StageModel({ kx: 150, ty: 420, th: 30 }), new StageModel({ kx: 290, ty: 450, th: 30 }), new StageModel({ kx: 180, ty: 400, th: 30 }), new StageModel({ kx: 240, ty: 430, th: 30 })],
        }),

        new SetModel({
          name: `Feeling the Flow`,
          description: `You’ll need timing, rhythm, and a bit of trust.`,
          difficulty: difficulties[2],
          showPuck: false,
          hideTarget: false,
          stages: [new StageModel({ kx: 220, ty: 390, th: 30 }), new StageModel({ kx: 200, ty: 360, th: 30, hideTarget: true }), new StageModel({ kx: 260, ty: 410, th: 30 }), new StageModel({ kx: 190, ty: 370, th: 30, showPuck: true }), new StageModel({ kx: 170, ty: 440, th: 30 })],
        }),

        new SetModel({
          name: `Final Stretch`,
          description: `Everything you’ve learned—every drop, every delay—comes together now.`,
          difficulty: difficulties[3], // Ultra
          showPuck: false,
          hideTarget: true,
          stages: [new StageModel({ kx: 240, ty: 260, th: 20 }), new StageModel({ kx: 160, ty: 300, th: 20 }), new StageModel({ kx: 280, ty: 240, th: 20 }), new StageModel({ kx: 200, ty: 220, th: 20 }), new StageModel({ kx: 230, ty: 280, th: 20 }), new StageModel({ kx: 180, ty: 250, th: 20 })],
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
    YesNoModel,
  };
}
