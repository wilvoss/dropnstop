// helpers/game-object-factory.js
import StageObject from '../models/StageObject.js';
import StageSetObject from '../models/StageSetObject.js';
import StageCampaignObject from '../models/StageCampaignObject.js';

const GameObjectFactory = {
  createStageObject(config = {}) {
    return new StageObject({
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
    return new StageSetObject({
      name,
      stages: Array.from({ length: stageCount }, () => GameObjectFactory.createStageObject()),
    });
  },

  createCampaign(name = 'Unnamed Campaign', setCount = 5, stageCountPerSet = 10) {
    return new StageCampaignObject({
      name,
      sets: Array.from({ length: setCount }, () => GameObjectFactory.createStageSet('Set', stageCountPerSet)),
    });
  },
};

export default GameObjectFactory;
