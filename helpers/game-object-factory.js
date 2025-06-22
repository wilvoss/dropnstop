// helpers/game-object-factory.js
import StageModel from '../models/StageModel.js';
import SetModel from '../models/SetModel.js';
import CampaignModel from '../models/CampaignModel.js';

const GameObjectFactory = {
  createStageModel(config = {}) {
    return new StageModel({
      kx: config.kx || 0,
      kw: config.kw || 0,
      kh: config.kh || 0,
      tx: config.tx || 0,
      ty: config.ty || 0,
      tw: config.tw || 0,
      th: config.th || 0,
    });
  },

  createStageSet(name = 'Unnamed Set', stageCount = 10) {
    return new SetModel({
      name,
      stages: Array.from({ length: stageCount }, () => GameObjectFactory.createStageModel()),
    });
  },

  createCampaign(name = 'Unnamed Campaign', setCount = 5, stageCountPerSet = 10) {
    return new CampaignModel({
      name,
      sets: Array.from({ length: setCount }, () => GameObjectFactory.createStageSet('Set', stageCountPerSet)),
    });
  },
};

export default GameObjectFactory;
