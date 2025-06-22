// models/mode-object.js
export default class ModeModel {
  constructor({ name, campaignList, stageGenerationMethod }) {
    this.name = name;
    this.campaignList = campaignList;
    this.stageGenerationMethod = stageGenerationMethod; // How stages are handled per mode
  }

  getNextCampaign(currentCampaignIndex) {
    return this.campaignList[currentCampaignIndex + 1] || null;
  }

  generateStageData() {
    return this.stageGenerationMethod ? this.stageGenerationMethod() : null;
  }
}
