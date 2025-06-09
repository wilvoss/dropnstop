import { ModeObject } from '../models/ModeObject.js';
import { GameObjectFactory } from '../helpers/game-object-factory.js';

const TutorialMode = new ModeObject({
  name: 'Tutorial',
  campaignList: [GameObjectFactory.createCampaign('Tutorial Basics', 1, 5)],
});

const ChallengeMode = new ModeObject({
  name: 'Challenge',
  campaignList: [GameObjectFactory.createCampaign('Novice Challenge', 5, 10), GameObjectFactory.createCampaign('Advanced Challenge', 5, 15)],
});

const EndlessMode = new ModeObject({
  name: 'Endless',
  campaignList: [],
  stageGenerationMethod: () => GameObjectFactory.createStageObject({ randomize: true }),
});

export const Modes = { TutorialMode, ChallengeMode, EndlessMode };
