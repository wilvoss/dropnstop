import { ModeModel } from '../models/ModeModel.js';
import { GameObjectFactory } from '../helpers/game-object-factory.js';

const TutorialMode = new ModeModel({
  name: 'Tutorial',
  campaignList: [GameObjectFactory.createCampaign('Tutorial Basics', 1, 5)],
});

const ChallengeMode = new ModeModel({
  name: 'Challenge',
  campaignList: [GameObjectFactory.createCampaign('Novice Challenge', 5, 10), GameObjectFactory.createCampaign('Advanced Challenge', 5, 15)],
});

const EndlessMode = new ModeModel({
  name: 'Endless',
  campaignList: [],
  stageGenerationMethod: () => GameObjectFactory.createStageModel({ randomize: true }),
});

export const Modes = { TutorialMode, ChallengeMode, EndlessMode };
