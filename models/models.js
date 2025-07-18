export class AchievementModel {
  constructor(spec = {}) {
    this.id = spec.id || '';
    this.name = spec.name || '';
    this.description = spec.description || '';
    this.points = spec.points || 0;
    this.unlocked = spec.unlocked || false;
    this.dateUnlocked = spec.dateUnlocked || null;
    this.check = spec.check || null;
  }
}
export class CampaignModel {
  constructor(spec = {}) {
    this.id = spec.id;
    this.name = spec.name ?? '';
    this.subtitle = spec.subtitle ?? '';
    this.sets = spec.sets ?? [];
    this.grade = spec.grade ?? null;
    this.selected = spec.selected ?? false;
    this.allowUserSelectedDifficulty = spec.allowUserSelectedDifficulty ?? false;
    this.difficulty = spec.difficulty ?? null;
    this.nextCampaignId = spec.nextCampaignId ?? null;
    this.isEndless = spec.isEndless ?? false;
    this.isTutorial = spec.isTutorial ?? false;
    this.finished = spec.finished ?? false;
    this.locked = spec.locked ?? true;
    this.highestPossibleScore = spec.highestPossibleScore ?? 0;
    this.score = spec.score ?? 0;
    this.grade = spec.grade ?? null;
    this.isDirty = spec.isDirty ?? false;
  }
}
export class DifficultyModel {
  constructor(spec = {}) {
    this.id = spec.id ?? null;
    this.name = spec.name ?? '';
    this.height = spec.height ?? 20;
    this.width = spec.width ?? 20;
    this.selected = spec.selected ?? false;
    this.speed = spec.speed ?? 6;
  }
}
export class GradeModel {
  constructor(spec = {}) {
    this.threshold = spec.threshold ?? 0;
    this.value = spec.value ?? 'Z';
    this.title = spec.title ?? 'Title';
    this.description = spec.description ?? 'Description';
    this.emoji = spec.emoji ?? '👏';
  }
}
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
export class ResultModel {
  constructor(spec = {}) {
    this.count = spec.count ?? 0;
    this.difficulty = spec.difficulty ?? 'easy';
    this.attempts = spec.attempts ?? 4;
    this.success = spec.success ?? false;
    this.deltas = spec.deltas ?? [];
    this.value = spec.value ?? 0;
    this.speed = spec.speed ?? 900;
    this.py = spec.ky;
    this.px = spec.kx;
    this.ph = spec.kh;
    this.pw = spec.kw ?? 20;
    this.ty = spec.ty;
    this.tx = spec.tx ?? 0;
    this.th = spec.th ?? 0;
    this.tw = spec.tw ?? 500;
  }
}
export class SetModel {
  constructor(spec = {}) {
    this.id = spec.id;
    this.name = spec.name ?? '';
    this.subtitle = spec.subtitle ?? '';
    this.description = spec.description ?? '';
    this.showPuck = spec.showPuck ?? false;
    this.hideTarget = spec.hideTarget ?? false;
    this.startVisible = spec.startVisible ?? true;
    this.difficulty = spec.difficulty ?? null;
    this.stages = spec.stages ?? [];
    // this data is restored from the game state database
    this.finished = spec.finished ?? false;
    this.locked = spec.locked ?? true;
    this.highestPossibleScore = spec.highestPossibleScore ?? 0;
    this.score = spec.score ?? 0;
    this.grade = spec.grade ?? null;
    this.percent = spec.percent ?? 0;
    this.passed = spec.passed ?? false;
    this.isDirty = spec.isDirty ?? false;
  }
}
export class StageModel {
  constructor(spec = {}) {
    this.name = spec.name ?? '';
    this.subtitle = spec.subtitle ?? '';
    this.description = spec.description ?? '';
    this.difficulty = spec.difficulty ?? null;
    this.kx = spec.kx ?? 0;
    this.tx = spec.tx ?? 0;
    this.ty = spec.ty ?? 0;
    this.tw = spec.tw ?? 500;
    this.th = spec.th ?? 0;
    this.hideTarget = spec.hideTarget ?? null;
    this.startVisible = spec.startVisible ?? false;
    this.showPuck = spec.showPuck ?? null;
    // this data is restored from the game state database
    this.finished = spec.finished ?? false;
    this.score = spec.score ?? 0;
    this.attempts = spec.attempts ?? 3;
    this.success = spec.success ?? false;
    this.grade = spec.grade ?? null;
  }
}
export class ThemeModel {
  constructor(spec = {}) {
    this.name = spec.name ?? '';
    this.h = spec.h ?? 100;
    this.s = spec.s ?? 20;
    this.pl = spec.pl ?? 6;
    this.selected = spec.selected ?? false;
  }
}
export class YesNoModel {
  constructor(spec = {}) {
    this.action = spec.action ?? null;
    this.title = spec.title ?? 'Title';
    this.message = spec.message ?? 'Message';
    this.button = spec.button ?? 'OK';
  }
}
