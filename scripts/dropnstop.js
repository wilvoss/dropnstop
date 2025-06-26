import { loadGameplayModules } from '../constants/gameplay.js';
import { version } from '/constants/version.js';

//#region MODULE HANDLING
async function loadConstants() {
  const { themes } = await import(`../constants/settings.min.js?${version}`);

  return {
    themes,
  };
}

async function loadHelpers() {
  const { SaveData, GetData, RemoveData, ClearStore } = await import(`../helpers/db-helper.min.js?${version}`);

  return {
    SaveData,
    GetData,
    RemoveData,
    ClearStore,
  };
}

async function LoadAllModules() {
  const gameplayModules = await loadGameplayModules();

  const helpers = await loadHelpers(version);
  const constants = await loadConstants(version);
  return { ...helpers, ...constants, ...gameplayModules };
}
//#endregion

//#region configuration
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;

// prettier-ignore
Vue.config.ignoredElements = ['app', 'page', 'navbar', 'settings', 'splash', 'splashwrap', 'message', 'notifications', 'speedControls', 'state', 'bank', 'commodity', 'detail', 'gameover', 'listheader', 'listings', 'category', 'name', 'units', 'currentPrice', 'description', 'market', 'currentValue', 'contractSize', 'goldbacking', 'contractUnit'];
//#endregion

LoadAllModules().then((modules) => {
  console.log('Modules loaded:', modules);

  window.app = new Vue({
    el: '#app',
    data() {
      return {
        version: version,
        isLoading: false,
        isDropping: false,
        isStopped: true,
        isReady: false,
        useDarkPuck: false,
        lastUpdate: null,
        isSuccess: false,
        isPlaying: false,
        stageScale: 1,
        campaigns: modules.campaigns,
        currentCampaign: null,
        currentSet: null,
        potentialSet: null,
        currentStage: null,
        previousCampaign: null,
        previousSet: null,
        previousStage: null,
        puckX: 0,
        puckY: 0,
        puckWidth: 20,
        puckHeight: 10,
        goodGradeThreshold: 84,
        trailWidth: 20,
        trailHeight: 10,
        targetX: 0,
        targetY: 0,
        targetWidth: 500,
        targetHeight: 100,
        speed: 6,
        dropMaxCount: 3,
        dropCount: 0,
        dropTotalCount: 0,
        startingDropCount: UseDebug ? 5 : 20,
        score: 0,
        lock: false,
        currentYesNo: null,
        showInstructions: true,
        showSplat: false,
        showHome: true,
        showEndSet: true,
        spaceBarCooldown: false,
        showSettings: false,
        showYesNo: false,
        showSets: false,
        showCampaigns: false,
        showInterstitial: false,
        showAnnouncement: true,
        hasUsedSpaceBar: false,
        spaceBarInUse: false,
        results: [],
        difficulties: modules.difficulties,
        currentDifficulty: modules.difficulties[0],
        themes: modules.themes,
        grades: modules.grades,
        resizeDebounceTimer: null,
        stageElement: document.getElementsByTagName('stage')[0],
        puckElement: document.getElementsByTagName('puck')[0],
        r: document.querySelector(':root'),
        c: window.getComputedStyle(document.querySelector(':root')),
      };
    },

    methods: {
      /**
       * Finalizes the current stage (records result, checks for completion)
       * and prepares the next stage (or set/campaign) as appropriate.
       */
      CompleteStageAndReadyNext() {
        note('Ready stage');
        this.RemoveConfetti();

        let stageRect = this.stageElement.getBoundingClientRect();
        const endless = this.currentCampaign.isEndless;

        // If the last drop was a success, mark the stage as finished
        if (this.isSuccess) {
          this.currentStage.finished = true;
        }

        // Always reset success for the next drop
        this.isSuccess = false;
        this.puckY = -this.puckHeight - 2;

        // Check if stage is complete (either by success or by max attempts)
        const stageComplete = this.currentStage.finished || this.dropCount >= this.dropMaxCount;

        if (stageComplete) {
          // Record result for the stage
          if (this.results.length > 0) {
            const result = this.results[this.results.length - 1];
            this.currentStage.success = result.success;
            this.currentStage.attempts = result.attempts;
          }
          // If not endless, queue the next set and reset difficulty
          if (!endless) {
            this.QueueSet();
            this.SelectDifficulty(this.currentStage.difficulty);
            this.showInstructions = this.currentSetIndex !== 0;
            this.showAnnouncement = this.currentStageIndex === 0;
          }
          // Reset for next stage
          this.puckY = -this.puckHeight - 2;
          this.puckX = endless ? getRandomInt(this.puckWidth / 2, stageRect.width - this.puckWidth / 2) : this.currentStage.kx;
          this.targetHeight = endless ? getRandomInt(20, 100) : this.currentStage.th;
          this.targetY = endless ? getRandomInt(100 + this.puckHeight, stageRect.height - this.targetHeight) : this.currentStage.ty;
          this.dropCount = 0;
          this.results.push(
            new modules.ResultModel({
              count: this.dropTotalCount,
              difficulty: this.currentDifficulty.name,
            }),
          );
        }

        // Endless mode: ensure rng target is not too close to the bottom
        if (endless && window.innerHeight - stageRect.y - this.targetY - this.targetHeight - 2 < 100) {
          log('Adjusting target Y position for first run');
          this.targetY = stageRect.height - this.targetHeight - 100;
        }
      },
      QueueSet() {
        note('Queue set');
        // Find the first unfinished set, or undefined if all are finished
        this.currentSet = this.currentCampaign.sets.find((set) => !set.finished);
        if (!this.currentSet) {
          // All sets are finished: stop recursion, maybe trigger end-of-campaign logic
          note('All sets complete!');
          this.currentCampaign.sets.forEach((set) => {
            set.locked = false;
          });
          // Optionally: this.QueueCampaign(); or show end screen, etc.
          return;
        }

        this.currentSet.locked = false;

        const unfinishedDropCount = this.currentSet.stages.filter((stage) => !stage.finished).length;

        if (unfinishedDropCount === 0) {
          this.currentSet.finished = true;
          this.QueueSet(); // Try next set
        } else {
          this.QueueStage();
        }
      },

      QueueStage() {
        note('Queue stage');
        this.currentStage = this.currentSet.stages.find((stage) => !stage.finished) || this.currentSet.stages[0];
      },

      /**
       * Queues the next campaign based on the current state.
       * - Called when the game is started or restarted.
       * - If the current campaign is endless or tutorial, does nothing.
       * - If the current campaign is not endless or tutorial, queues the next campaign in the list.
       * - If the current campaign is the last one, it queues the first campaign in the list.
       * - If there are no campaigns, it does nothing.
       */
      QueueCampaign() {
        note('Queue campaign');
        let currentCampaignIndex = this.campaigns.findIndex((campaign) => campaign.selected);
        if (currentCampaignIndex === -1) {
          this.currentCampaign = this.campaigns[0];
          this.currentCampaign.selected = true;
          return;
        }

        const currentCampaign = this.campaigns[currentCampaignIndex];
        if (currentCampaign.isEndless) {
          // Ignore action for endless or tutorial campaigns
          return;
        }

        if (currentCampaignIndex !== this.campaigns.length - 1) {
          this.currentCampaign = this.campaigns[currentCampaignIndex + 1];
        } else {
          this.currentCampaign = this.campaigns[0];
        }
      },
      ReadyCampaign(_campaign) {},
      StopPuck() {
        note('Stopping puck');
        const kStyle = window.getComputedStyle(this.puckElement);
        const kMatrix = kStyle.transform;
        const kMatrixValues = kMatrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        this.puckY = kMatrixValues[5];

        let gain = this.score + this.targetValue;

        const puckBottom = Number(this.puckY) + Number(this.puckHeight);
        const targetTop = Number(this.targetY);
        const targetBottom = Number(this.targetY) + Number(this.targetHeight);

        // Check for success
        if (puckBottom >= targetTop - 2 && puckBottom <= targetBottom + 2) {
          this.score = gain;
          this.isSuccess = true;
          this.currentStage.finished = true;
        }

        if (!this.currentCampaign.isEndless) {
          if (this.dropCount === 3 && !this.isSuccess) {
            this.currentStage.finished = true;
          }
        }

        let currentResult = this.results[this.results.length - 1];

        if (Number(this.puckY) + Number(this.puckHeight) + 1 > Number(this.targetHeight) + Number(this.targetY) + 2) {
          currentResult.deltas.push(Number(this.targetHeight) + Number(this.targetY) + 2 - Number(this.puckY) + Number(this.puckHeight) + 1);
        } else if (Number(this.puckY) + Number(this.puckHeight) + 1 < Number(this.targetY)) {
          currentResult.deltas.push(Number(this.puckY) + Number(this.puckHeight) + 1 - Number(this.targetY));
        }

        currentResult.attempts = this.dropCount;
        currentResult.success = this.isSuccess;
        currentResult.value = gain;
        currentResult.speed = this.currentDifficulty.speed;
        currentResult.py = this.puckY;
        currentResult.px = this.puckX;
        currentResult.ph = this.puckHeight;
        currentResult.pw = this.puckWidth;
        currentResult.ty = this.targetY;
        currentResult.th = this.targetHeight;
        currentResult.tw = this.targetWidth;

        this.dropTotalCount++;

        // Handle set/campaign completion and interstitial in one place
        if (!this.currentCampaign.isEndless && this.IsSetComplete(this.currentSet)) {
          note('Set complete, Unlocking next set');
          this.lock = true;

          this.currentSet.finished = true;
          this.currentStage.finished = true;
          this.currentStage.success = currentResult.success;
          this.currentStage.attempts = currentResult.attempts;
          this.showEndSet = true; // Only show end game if campaign is complete

          this.UnlockNextSet(this.currentCampaign, this.currentSet);

          if (this.IsCampaignComplete(this.currentCampaign)) {
            this.currentCampaign.finished = true;

            this.UnlockNextCampaign(this.currentCampaign);
          }

          const colorConfetti = this.finalGrade.threshold > this.goodGradeThreshold;
          this.SaveGameState();
          this.UpdateScores();

          setTimeout(() => this.CreateConfetti(colorConfetti), 300);
        }
      },
      SetScale() {
        note('Set stage scale');
        if (window.innerWidth < 500) {
          this.stageScale = window.innerWidth / 500;
        } else {
          this.stageScale = 1;
        }
      },
      ShowCampaignsModal() {
        note('Showing campaigns modal');
        this.showCampaigns = true;
      },
      HandleAnnouncementClick() {
        note('Announcement clicked');
        if (this.showAnnouncement && this.announcement !== '') {
          this.showAnnouncement = false;
          this.showInstructions = true;
          return;
        }
        this.showAnnouncement = false;
        this.showInstructions = false;
      },
      HandleQuitButtonClick() {
        note('Quit button clicked');
        this.NewYesNo('Quit?', 'quit', 'your current progress will be lost');
      },
      HandleOkayButtonClick() {
        note('Okay button clicked');
        this.EndGame();
        if (!this.currentCampaign.isEndless && !this.currentCampaign.isTutorial) {
          if (this.IsCampaignComplete(this.currentCampaign)) {
            this.showCampaigns = true;
          } else {
            this.showSets = true;
          }
        }
      },
      HandleNextButtonClick(_e) {
        note('Next button clicked');
        const nextSet = this.GetNextSet(this.currentCampaign, this.currentSet);
        if (nextSet) {
          this.HandleSelectSetButtonClick(_e, nextSet);
        }
      },
      async SelectDifficulty(_incoming) {
        note('Selected difficulty: ' + _incoming.name);
        this.difficulties.forEach((difficulty) => {
          difficulty.selected = false;
        });
        _incoming.selected = true;
        this.trailHeight = _incoming.height;
        this.trailWidth = _incoming.width;
        this.puckHeight = _incoming.height;
        this.puckWidth = _incoming.width;
        await modules.SaveData('difficulty', JSON.stringify(_incoming));
        this.speed = _incoming.speed;
        this.currentDifficulty = _incoming;
      },
      GetHitsOn(value) {
        let hitcount = 0;
        this.results.forEach((result) => {
          if (result.success && result.attempts == value) {
            hitcount++;
          }
        });
        return hitcount;
      },
      GetMisses() {
        let misscount = 0;
        this.results.forEach((result) => {
          misscount = misscount + result.deltas.length;
        });
        return misscount;
      },
      GetMissedByDirection(_direction) {
        let number = 0;
        this.results.forEach((result) => {
          for (let x = 0; x < result.deltas.length; x++) {
            const delta = result.deltas[x];
            if (delta > 0 && _direction == 'below') {
              number++;
            }
            if (delta < 0 && _direction == 'above') {
              number++;
            }
          }
        });
        let misses = this.GetMisses();
        if (misses === 0) {
          return 0;
        }
        return Math.round((number / this.GetMisses()) * 100);
      },
      ResetTheater() {
        this.showEndSet = false;
        this.isPlaying = true;
        this.isReady = true;
        this.lock = false;
        this.spaceBarCooldown = false;
        this.showYesNo = false;
        this.showSettings = false;
        this.dropTotalCount = 0;
        this.isStopped = false;
        this.isDropping = false;
        this.StopAnimationLoop();

        this.isPlaying = false;
        this.showInstructions = false;
      },
      EndGame() {
        note('Ending game');

        this.RemoveConfetti();
        if (this.results.length > 0 && this.results[this.results.length - 1].attempts === 4) {
          this.results.pop();
        }
        this.ResetTheater();
        this.isPlaying = false;
        this.isReady = false;
        this.isStopped = true;
        this.showHome = true;
      },
      HideAllModalsAndOverlays() {
        note('Hiding all modals and overlays');
        this.showSettings = false;
        this.showCampaigns = false;
        this.showHome = false;
        this.showSets = false;
      },
      HandleBackButtonClick(_e) {
        note('Back button clicked');
        // _e.stopPropagation();
        // _e.preventDefault();

        if (this.showSettings) {
          this.HideAllModalsAndOverlays();
          this.showHome = !this.isPlaying;
          return;
        }
        if (this.showCampaigns) {
          this.HideAllModalsAndOverlays();
          this.showHome = true;
          return;
        }
        if (this.showSets) {
          this.HideAllModalsAndOverlays();
          if (this.currentCampaign && !this.currentCampaign.isEndless && !this.currentCampaign.isTutorial) {
            this.showCampaigns = true;
          } else {
            this.showHome = true;
          }
          return;
        }
      },
      NewYesNo(_title, _action, _message = null) {
        note('Showing Yes/No dialog for action: ' + _action);
        this.showYesNo = true;
        this.currentYesNo = modules.YesNoModel({
          action: _action,
          title: _title || 'Are you sure?',
          message: _message || 'Are you sure you want to ' + _action + '? This action cannot be undone.',
        });
      },
      HandleDropButtonPointerUp(_e) {
        note('Drop button pointer up');
        if (!this.lock) {
          if (this.isDropping && !this.showEndSet && !this.showHome && !this.showSettings) {
            this.HandleActionButton(_e, 'stop');
          }
        }
      },
      HandleActionButton(_e, _action) {
        // if (_e) {
        //   _e.stopPropagation();
        //   _e.preventDefault();
        // }

        if (this.showYesNo) {
          this.showYesNo = false;

          if (_action === 'quit') {
            this.EndGame();
            return;
          }

          if (_action === 'clear') {
            this.ClearAllData();
            return;
          }

          if (_action === 'playAgain') {
            this.SelectSet(this.potentialSet, true);
            return;
          }
          return;
        }

        if (_action === 'stop') {
          this.StopPuck();
          this.isDropping = false;
          this.StopAnimationLoop();
          this.isStopped = true;
          return;
        }

        if (_action === 'next') {
          if (this.showEndSet && !this.isLastSet && this.currentCampaign && !this.currentCampaign.finished) {
            this.ResetTheater();
            this.CompleteStageAndReadyNext();
          } else {
            this.CompleteStageAndReadyNext();
            this.isStopped = false;
            this.isReady = true;
          }
          return;
        }

        if (this.isReady && _action === 'drop') {
          this.isReady = false;
          this.isDropping = true;
          this.StartAnimationLoop();
          // Only increment dropCount if the stage isn't already finished
          if (this.currentStage && !this.currentStage.finished) {
            this.dropCount++;
          }
          return;
        }
      },
      HandlePuckColorButtonClick(_e, _usedark) {
        // _e.stopPropagation();
        // _e.preventDefault();
        this.SetPuckColor(_usedark);
      },
      async SetPuckColor(_usedark) {
        note('Set puck dark: ' + _usedark);
        this.useDarkPuck = _usedark;
        this.r.style.setProperty('--puckLuminosity', (this.useDarkPuck ? 0 : 100) + '%');
        await modules.SaveData('useDarkPuck', _usedark);
      },
      HandleThemeButton(_e, _theme) {
        // _e.stopPropagation();
        // _e.preventDefault();
        this.SelectGameTheme(_theme.name);
      },
      async SelectGameTheme(_name) {
        note('Selecting theme: ' + _name);
        var theme;
        this.themes.forEach((t) => {
          t.selected = t.name == _name;
          if (t.selected) {
            theme = t;
          }
        });
        if (theme == undefined) {
          theme = this.themes[1];
          theme.selected = true;
        }
        this.r.style.setProperty('--hue', theme.h);
        this.r.style.setProperty('--saturation', theme.s + '%');
        document.getElementById('themeColor').setAttribute('content', 'hsl(' + theme.h + ', ' + theme.s + '%, 61%)');
        await modules.SaveData('theme', theme.name);
      },
      UpdateApp(_now) {
        if (!this.lastUpdate) this.lastUpdate = _now;
        const deltaSeconds = (_now - this.lastUpdate) / 1000;
        this.lastUpdate = _now;

        if (this.isDropping && !this.puckHitBottom) {
          this.puckY = Number(this.puckY) + this.speed * deltaSeconds;
        }
      },
      RestartGame(_campaign = null) {
        note('Restarting game');
        this.isSuccess = false;
        this.lock = false;
        this.results = [];
        this.dropCount = 3;

        this.dropTotalCount = 0;
        this.score = 0;
        this.isDropping = false;
        this.StopAnimationLoop();
        this.isStopped = false;
        this.isReady = true;
        this.isPlaying = true;
        this.showHome = false;
        this.showEndSet = false;
        this.showCampaigns = false;
        this.showSettings = false;
        this.showYesNo = false;
        this.showSets = false;
        this.CompleteStageAndReadyNext();
      },
      StartCampaign(_campaign) {
        this.SelectCampaign(_campaign);
        this.showCampaigns = false;
        if (this.currentCampaign.isEndless) {
          this.RestartGame(_campaign);
        } else {
          this.showSets = true;
        }
      },
      HandleSelectSetButtonClick(_e, _set) {
        note('Select set button clicked: ' + _set.name);
        // _e.stopPropagation();
        // _e.preventDefault();

        if (_set.finished) {
          this.potentialSet = _set;
          if (this.currentCampaign.isTutorial) {
            this.NewYesNo('Replay?', 'playAgain', 'This will start the tutorial over');
            return;
          }
          this.NewYesNo('Replay?', 'playAgain', `This will erase the saved score for  ${_set.name}`);
          return;
        }

        this.SelectSet(_set);
      },

      SelectSet(_set, _ignoreConfirm = false) {
        log('Select set: ' + _set.name);
        this.potentialSet = null;

        this.currentCampaign.finished = false;

        this.currentSet = _set;
        this.currentSet.selected = true;

        this.ClearSet(_set);
        this.QueueSet();
        this.RestartGame();
      },
      ClearSet(_set) {
        note('Clearing set: ' + _set.name);
        _set.stages.forEach((stage) => {
          stage.success = false;
          stage.attempts = 0;
          stage.finished = false;
          stage.score = 0;
          stage.grade = null;
        });
        _set.finished = false;
        _set.score = 0;
        _set.grade = null;
        _set.locked = false;
        this.results = [];
      },
      SelectCampaign(_campaign) {
        note('Select campaign: ' + _campaign.name);

        this.campaigns.forEach((campaign) => {
          campaign.selected = false;
        });

        this.currentCampaign = _campaign;
        this.currentCampaign.selected = true;
        if (!this.currentCampaign.isEndless) {
          this.difficulty = this.currentCampaign.difficulty;
        }
      },
      ApplyDifficultyInheritance() {
        note('Applying difficulty inheritance');
        this.campaigns.forEach((campaign) =>
          campaign.sets.forEach((set) =>
            set.stages.forEach((stage) => {
              if (!stage.difficulty) {
                stage.difficulty = set.difficulty;
              }
              if (stage.showPuck === null) {
                stage.showPuck = set.showPuck;
              }
              if (stage.hideTarget === null) {
                stage.hideTarget = set.hideTarget;
              }
            }),
          ),
        );
      },
      IsSetComplete(_set) {
        const complete = _set.stages.every((stage) => stage.finished);
        note('Set ' + _set.name + ' complete: ' + complete);
        return complete;
      },
      IsCampaignComplete(_campaign) {
        const complete = _campaign.sets.every((set) => this.IsSetComplete(set));
        note('Campaign ' + _campaign.name + ' complete: ' + complete);
        return complete;
      },
      IsGameComplete() {
        return this.campaigns.every((campaign) => this.IsCampaignComplete(campaign));
      },
      GetNextSet(_campaign, _set) {
        note('Unlocking next set in campaign: ' + _campaign.name + ', current set: ' + _set.name);
        const sets = _campaign.sets;
        const currentIndex = sets.indexOf(_set);
        if (currentIndex !== -1 && currentIndex < sets.length - 1) {
          sets[currentIndex + 1];
          return sets[currentIndex + 1];
        }
        this.UpdateScores();
        return null;
      },
      UnlockNextSet(_campaign, _set) {
        note('Unlocking next set in campaign: ' + _campaign.name + ', current set: ' + _set.name);
        const sets = _campaign.sets;
        const currentIndex = sets.indexOf(_set);
        if (currentIndex !== -1 && currentIndex < sets.length - 1) {
          sets[currentIndex + 1].locked = false;
          return sets[currentIndex + 1];
        }
        this.UpdateScores();
        return null;
      },
      UnlockNextCampaign(_campaign) {
        note('Unlocking next campaign after: ' + _campaign.name);
        const campaigns = this.campaigns;
        const currentIndex = campaigns.indexOf(_campaign);
        if (currentIndex !== -1 && currentIndex < campaigns.length - 1) {
          campaigns[currentIndex + 1].locked = false;
          return campaigns[currentIndex + 1];
        }
        this.UpdateScores();
        return null;
      },
      GetScoreForStage(_stage, _highestPossibleScore = false) {
        // If the stage has no result, return 0
        if (!_stage.finished || _stage.attempts === 0 || (!_stage.success && !_highestPossibleScore)) return 0;
        const attemptPenalty = _highestPossibleScore ? 1 : _stage.attempts;
        const stageSize = (500 * 500) / 2;
        const targetArea = (Number(_stage.th) * Number(_stage.tw)) / 2;
        const targetSizeBonus = (stageSize - targetArea) / 20;
        const yBonus = 500 - Number(_stage.ty);
        const puckArea = (Number(_stage.difficulty.height) * Number(_stage.difficulty.width)) / 2;
        const puckSizeBonus = Math.max(1, (400 - puckArea) / 200);

        const speedBonus = _stage.difficulty.speed;

        // Calculate base value
        let baseValue =
          targetSizeBonus + // bonus for smaller target
          speedBonus + // bonus for higher speed
          yBonus; // penalize for lower Y position

        baseValue = baseValue * puckSizeBonus; // Apply puck size bonus

        baseValue = baseValue / (attemptPenalty * 10); // Divide by attempts to scale value
        baseValue = Math.max(10, baseValue);
        return Math.round(baseValue);
      },
      UpdateScores() {
        note('Updating scores for campaigns and sets');
        this.campaigns.forEach((campaign) => {
          if (campaign.sets && Array.isArray(campaign.sets)) {
            campaign.sets.forEach((set) => {
              if (set.stages && Array.isArray(set.stages)) {
                set.stages.forEach((stage) => {
                  stage.score = this.GetScoreForStage(stage);
                });
                set.score = set.stages.reduce((sum, stage) => sum + (stage.score || 0), 0);
              } else {
                set.score = 0;
              }
            });
            campaign.score = campaign.sets.reduce((sum, set) => sum + (set.score || 0), 0);
          } else {
            campaign.score = 0;
          }
        });
      },
      GetHighestPossibleScore() {
        let highest = 0;
        this.currentSet.stages.forEach((stage) => {
          highest += this.GetScoreForStage(stage, true);
        });
        return Math.round(highest);
      },
      async GetSettings() {
        note('Get settings from localStorage');
        const migrationKeys = ['difficulty', 'theme', 'useDarkPuck'];

        for (const key of migrationKeys) {
          let value = localStorage.getItem(key);
          if (value !== null) {
            await modules.SaveData(key, value);
            localStorage.removeItem(key); // Remove old data
          }
        }

        const difficultyData = await modules.GetData('difficulty');
        if (typeof difficultyData === 'string' && difficultyData.trim() !== '' && difficultyData !== 'undefined') {
          var incoming = new modules.DifficultyModel(JSON.parse(difficultyData));
          this.difficulties.forEach((difficulty) => {
            if (difficulty.name == incoming.name) {
              this.SelectDifficulty(difficulty);
            }
          });
        } else {
          this.SelectDifficulty(this.difficulties[0]);
        }
        const themeData = await modules.GetData('theme');
        if (typeof themeData === 'string' && themeData.trim() !== '' && themeData !== 'undefined') {
          this.SelectGameTheme(themeData);
        } else {
          this.SelectGameTheme(this.themes[3].name);
        }
        const useDarkPuckData = await modules.GetData('useDarkPuck');
        if (typeof useDarkPuckData === 'boolean') {
          this.SetPuckColor(useDarkPuckData);
        } else {
          this.SetPuckColor(false);
        }

        const hasUsedSpaceBarData = await modules.GetData('hasUsedSpaceBar');
        if (typeof hasUsedSpaceBarData === 'useDarkPuck') {
          this.hasUsedSpaceBar = hasUsedSpaceBarData;
        } else {
          this.hasUsedSpaceBar = false;
        }
      },
      RemoveConfetti() {
        note('Remove confetti');
        const confetti = document.getElementsByTagName('confetti')[0];
        if (confetti) {
          confetti.innerHTML = '';
        }
      },
      CreateConfetti(_highlight = false) {
        note('Create confetti');
        this.RemoveConfetti();
        let domConfetti = document.getElementsByTagName('confetti')[0];
        let count = domConfetti.clientWidth;

        for (let x = 0; x < count; x++) {
          let confetto = document.createElement('confetto');
          let lightness = _highlight ? getRandomInt(66, 84) : getRandomInt(76, 94);

          confetto.style.setProperty('left', getRandomInt(0, domConfetti.clientWidth) + (window.innerWidth - domConfetti.clientWidth) / 2 + 'px');
          confetto.style.setProperty('transition-duration', getRandomInt(1600, 3001) + 'ms');
          confetto.style.setProperty('background-color', 'hsl(' + (this.currentTheme.h + (_highlight ? 180 : 0)) + ', ' + (this.currentTheme.s + 40) + '%, ' + lightness + '%)');

          confetto.style.setProperty('transition-delay', getRandomInt(0, 800) + 'ms');
          confetto.style.setProperty('rotate', +'deg');
          let width = getRandomInt(40, 100) / 10;
          let height = getRandomInt(40, 100) / 10;
          confetto.style.setProperty('width', width + 'px');
          confetto.style.setProperty('height', height + 'px');
          domConfetti.appendChild(confetto);
        }
        window.setTimeout(function () {
          let allConfetti = document.getElementsByTagName('confetto');
          for (let _x = 0; _x < allConfetti.length; _x++) {
            const confetti = allConfetti[_x];
            confetti.style.setProperty('transform', 'translate(' + parseInt(getRandomInt(-20, 20)) + 'px, ' + parseInt(document.body.clientHeight - confetti.clientHeight + 20) + 'px) rotate(' + getRandomInt(-360, 360) + 'deg)');
            confetti.className = 'drop';
          }
        });
      },
      Share() {
        navigator.share({
          title: "Drop 'n Stop!",
          text: 'The puck stops here.',
          url: 'https://dropnstop.games',
        });
      },
      HandleKeyUp(_e) {
        let currentThemeIndex;
        this.themes.forEach((theme, i) => {
          if (theme.selected) {
            currentThemeIndex = i;
          }
        });
        switch (_e.code) {
          case 'ArrowRight':
            currentThemeIndex = currentThemeIndex == this.themes.length - 1 ? 0 : currentThemeIndex + 1;
            if (currentThemeIndex != undefined && currentThemeIndex >= 0) {
              this.SelectGameTheme(this.themes[currentThemeIndex].name);
            }
            break;
          case 'ArrowLeft':
            currentThemeIndex = currentThemeIndex == 0 ? this.themes.length - 1 : currentThemeIndex - 1;
            if (currentThemeIndex != undefined && currentThemeIndex >= 0) {
              this.SelectGameTheme(this.themes[currentThemeIndex].name);
            }
            break;
          case 'Enter':
            if (!this.lock) {
              if (this.showYesNo && !this.showEndSet) {
                this.EndGame();
              } else if (this.showEndSet && !this.showHome && !this.showSettings) {
                this.EndGame();
              }
            }
            break;
          case 'Escape':
            if (!this.lock) {
              if (this.showYesNo) {
                this.showYesNo = false;
              } else if (this.showSettings) {
                this.showSettings = false;
              } else if (this.showHome) {
                this.showSettings = true;
              }
            }
            break;
          case 'Space':
            if (!this.lock) {
              this.spaceBarInUse = false;

              if (this.isDropping && !this.showEndSet && !this.showHome && !this.showSettings) {
                this.HandleActionButton(_e, 'stop');
              } else if (
                !this.spaceBarCooldown && // <-- ADD THIS LINE
                (this.isReady || (this.isStopped && !this.showEndSet)) &&
                !this.showEndSet &&
                !this.showHome &&
                !this.showSettings
              ) {
                this.HandleActionButton(_e, 'next');
              }
            }
            break;
        }
      },
      HandleKeyDown(_e) {
        if (this.showAnnouncement) {
          this.HandleAnnouncementClick();
        } else if (!this.lock) {
          switch (_e.code) {
            case 'Space':
              if (!this.spaceBarCooldown && !this.isDropping && this.isReady && !this.showEndSet && !this.isStopped && !this.showHome && !this.showSettings) {
                this.spaceBarInUse = true;
                this.hasUsedSpaceBar = true;
                modules.SaveData('hasUsedSpaceBar', true);
                this.HandleActionButton(_e, 'drop');
                // Start cooldown
                this.spaceBarCooldown = true;
                setTimeout(() => {
                  this.spaceBarCooldown = false;
                }, 350); // 250ms debounce, adjust as needed
              }
              break;
          }
        }
      },
      HandleResize() {
        clearTimeout(this.resizeDebounceTimer);
        this.resizeDebounceTimer = setTimeout(() => {
          note('Handling resize');
          this.SetScale();
          this.RemoveConfetti();
        }, 100);
      },
      async SaveGameState() {
        note('Saving game state');
        await modules.SaveData(
          'gameState',
          JSON.stringify({
            campaigns: this.campaigns,
            // currentCampaignIndex: this.campaigns.indexOf(this.currentCampaign),
            // currentSetIndex: this.currentCampaign ? this.currentCampaign.sets.indexOf(this.currentSet) : null,
            // currentStageIndex: this.currentSet ? this.currentSet.stages.indexOf(this.currentStage) : null,
            // add any other state you want to persist
          }),
        );
      },
      async GetGameState() {
        note('Restoring game state');
        const saved = await modules.GetData('gameState');
        if (typeof saved === 'string' && saved.trim() !== '' && saved !== 'undefined') {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.campaigns) {
              // Merge progress fields from saved campaigns into code-defined campaigns
              this.MergeCampaignProgress(this.campaigns, parsed.campaigns);

              // Optionally, re-select the first campaign as current
              this.currentCampaign = this.campaigns[0];
              this.currentSet = this.currentCampaign.sets ? this.currentCampaign.sets[0] : null;
              this.currentStage = this.currentSet && this.currentSet.stages ? this.currentSet.stages[0] : null;
              note('Game state merged from IndexedDB');
            }
          } catch (e) {
            console.error('Failed to parse saved game state:', e);
          }
        } else {
          note('No saved game state found');
        }
      },
      MergeCampaignProgress(codeCampaigns, savedCampaigns) {
        codeCampaigns.forEach((codeCampaign) => {
          const savedCampaign = savedCampaigns.find((c) => c.name === codeCampaign.name);
          if (savedCampaign) {
            // Merge progress fields
            codeCampaign.locked = savedCampaign.locked;
            codeCampaign.finished = savedCampaign.finished;
            codeCampaign.score = savedCampaign.score;
            codeCampaign.grade = savedCampaign.grade;
            // Merge sets
            if (codeCampaign.sets && savedCampaign.sets) {
              codeCampaign.sets.forEach((codeSet, setIdx) => {
                const savedSet = savedCampaign.sets[setIdx];
                if (savedSet) {
                  codeSet.locked = savedSet.locked;
                  codeSet.finished = savedSet.finished;
                  codeSet.score = savedSet.score;
                  codeSet.grade = savedSet.grade;
                  // Merge stages
                  if (codeSet.stages && savedSet.stages) {
                    codeSet.stages.forEach((codeStage, stageIdx) => {
                      const savedStage = savedSet.stages[stageIdx];
                      if (savedStage) {
                        codeStage.finished = savedStage.finished;
                        codeStage.success = savedStage.success;
                        codeStage.attempts = savedStage.attempts;
                        codeStage.score = savedStage.score;
                        codeStage.grade = savedStage.grade;
                      }
                    });
                  }
                }
              });
            }
          }
        });
      },
      HandleClearDataButtonClick() {
        note('Clear data button clicked');
        this.NewYesNo('Clear Data?', 'clear', 'This will reset all scores and game locks');
      },
      async ClearAllData() {
        note('Clearing all game data');

        this.campaigns.forEach((campaign) => {
          // Determine unlock status
          const isTutorial = campaign.isTutorial;
          const isEndless = campaign.isEndless;
          const isFirstCampaign = campaign.id === 2;

          // Unlock tutorial, endless, and first campaign
          campaign.locked = !(isTutorial || isEndless || isFirstCampaign);
          campaign.finished = false;
          campaign.score = 0;
          campaign.grade = null;

          campaign.sets.forEach((set, sIdx) => {
            // Unlock all sets in tutorial, all in endless, and first set in first campaign
            const unlockSet = isTutorial || isEndless || sIdx === 0;

            set.locked = !unlockSet;
            set.finished = false;
            set.score = 0;
            set.grade = null;

            set.stages.forEach((stage) => {
              stage.finished = false;
              stage.success = false;
              stage.attempts = 0;
              stage.score = 0;
              stage.grade = null;
            });
          });
        });

        this.EndGame();
        this.HideAllModalsAndOverlays();
        this.showHome = true;
        await modules.RemoveData('gameState');
      },
      StartAnimationLoop() {
        note('Starting animation loop');
        if (this._animationFrame) return; // Prevent multiple loops
        const update = (now) => {
          this.UpdateApp(now);
          this._animationFrame = requestAnimationFrame(update);
        };
        this._animationFrame = requestAnimationFrame(update);
      },
      StopAnimationLoop() {
        note('Stopping animation loop');
        if (this._animationFrame) {
          cancelAnimationFrame(this._animationFrame);
          this._animationFrame = null;
        }
        this.lastUpdate = null; // Reset lastUpdate so next animation starts fresh
      },
    },

    async mounted() {
      this.isLoading = true;
      this.stageElement = document.getElementsByTagName('stage')[0];
      this.puckElement = document.getElementsByTagName('puck')[0];

      window.addEventListener('keyup', this.HandleKeyUp);
      window.addEventListener('keydown', this.HandleKeyDown);
      window.addEventListener('resize', this.HandleResize);
      window.addEventListener('beforeunload', this.SaveGameState);
      this.SetScale();
      this.GetSettings();
      await this.GetGameState();
      this.ApplyDifficultyInheritance();
      this.UpdateScores();

      this.isLoading = false;
    },

    beforeDestroy() {
      this.SaveGameState();
      cancelAnimationFrame(this._animationFrame);
      window.removeEventListener('keyup', this.HandleKeyUp);
      window.removeEventListener('keydown', this.HandleKeyDown);
      window.removeEventListener('resize', this.HandleResize);
    },

    watch: {
      showAnnouncement() {
        highlight('showAnnouncement: ' + this.showAnnouncement);
      },
      spaceBarInUse() {
        highlight('spaceBarInUse: ' + this.spaceBarInUse);
      },
    },

    computed: {
      targetValue() {
        const stageSize = (500 * 500) / 2;
        // Only decrease value after a failed attempt and reset (i.e., when dropCount > 0 and isReady)
        // dropCount increments on each new attempt, so use dropCount as a penalty multiplier
        const attemptPenalty = this.isReady ? this.dropCount + 1 : this.dropCount; // 0 for first attempt, 1 for second, etc.

        // Target size bonus: smaller target = more value
        const targetArea = (Number(this.targetHeight) * Number(this.targetWidth)) / 2;
        const targetSizeBonus = (stageSize - targetArea) / 20; // Scale down the bonus

        // Target Y bonus: higher up = more value (relative to 500px stage)
        const yBonus = 500 - Number(this.targetY);

        // Puck size penalty: smaller puck = more value
        const puckArea = (Number(this.puckHeight) * Number(this.puckWidth)) / 2;
        const puckSizeBonus = Math.max(1, (400 - puckArea) / 200);

        // Puck speed penalty: faster = less value
        const speedBonus = this.currentDifficulty.speed;

        // Base value calculation
        let baseValue =
          targetSizeBonus + // bonus for smaller target
          speedBonus + // bonus for higher speed
          yBonus; // penalize for lower Y position

        baseValue = baseValue * puckSizeBonus; // Apply puck size bonus

        baseValue = baseValue / (attemptPenalty * 10); // Divide by attempts to scale value
        // Clamp to minimum value
        baseValue = Math.max(10, baseValue);

        return Math.round(baseValue);
      },
      hitsOnOne() {
        return this.totalZonesClearedSucccessfully === 0 ? 0 : Math.round((100 * this.GetHitsOn(1)) / this.results.length) + '%';
      },
      hitsOnTwo() {
        return this.totalZonesClearedSucccessfully === 0 ? 0 : Math.round((100 * this.GetHitsOn(2)) / this.results.length) + '%';
      },
      hitsOnThree() {
        return this.totalZonesClearedSucccessfully === 0 ? 0 : Math.round((100 * this.GetHitsOn(3)) / this.results.length) + '%';
      },
      totalZonesClearedSucccessfully() {
        return this.GetHitsOn(1) + this.GetHitsOn(2) + this.GetHitsOn(3);
      },
      misses() {
        return this.GetMisses();
      },
      highestPossibleScore() {
        return this.GetHighestPossibleScore();
      },
      missedAbove() {
        return this.GetMissedByDirection('above') + '%';
      },
      missedBelow() {
        return this.GetMissedByDirection('below') + '%';
      },
      userLocale() {
        return navigator.language || 'en-US';
      },
      currentStageIndex() {
        return this.currentSet ? this.currentSet.stages.indexOf(this.currentStage) : -1;
      },
      currentSetIndex() {
        return this.currentCampaign ? this.currentCampaign.sets.indexOf(this.currentSet) : -1;
      },
      instructions() {
        if (this.currentStage && this.currentStage.description && this.dropCount === 0 && this.showInstructions && this.announcement === '') {
          if (!this.currentStage.name) {
            return `<span>${this.currentStage.description}</span> <button class="tertiary">okay</button>`;
          }
          return `${this.currentStage.name}<br /><span>${this.currentStage.description}</span> <button class="tertiary">okay</button>`;
        }
        return '';
      },
      announcement() {
        if (this.currentSet && this.currentSet.name && this.dropCount === 0 && this.showAnnouncement && this.currentStageIndex === 0) {
          return `${this.currentSet.name}<br /><span>${this.currentSet.description}</span> <button class="tertiary">${this.currentStage.description ? 'Next' : 'Okay'}</button>`;
        }
        return '';
      },
      levelInfo() {
        if (this.currentSet && this.currentStage) {
          return `Level ${this.currentStageIndex + 1} of ${this.currentSet.stages.length}`;
        }
        return '';
      },
      puckHitBottom() {
        if (!this.isDropping) {
          return false;
        }
        let stageRect = this.stageElement.getBoundingClientRect();
        // Use the scale factor from your data
        const scale = this.stageScale || 1;
        // Convert the DOM height to unscaled "game" units
        const unscaledStageHeight = stageRect.height / scale;
        let hitBottom = this.puckY + this.puckHeight >= unscaledStageHeight - 2;
        return hitBottom;
      },
      isChromeAndiOSoriPadOS() {
        var userAgent = navigator.userAgent || window.opera;
        var isChromeIOS = /CriOS/.test(userAgent) || /iPhone|iPad|iPod/.test(userAgent);
        var isFirefoxAndroid = /Firefox/.test(userAgent) && /Android/.test(userAgent);

        return isChromeIOS || isFirefoxAndroid;
      },
      currentTheme() {
        let theme = this.themes.find((t) => t.selected);
        if (theme === undefined) {
          theme = this.themes[1];
          theme.selected = true;
        }
        return theme;
      },
      isFirstRun() {
        return !this.isDropping && this.dropTotalCount === 0 && this.currentCampaign && this.currentCampaign.isTutorial;
      },
      percentScored() {
        return this.score / this.highestPossibleScore;
      },
      percentOfHitsIn1Drop() {
        return Math.round((100 * this.GetHitsOn(0)) / this.results.length);
      },
      finalScore() {
        let missRate = (this.startingDropCount - this.misses) / this.startingDropCount;
        let modifiedPercentScored = 100 * ((this.percentScored + missRate) / 2);

        return modifiedPercentScored;
      },
      finalGrade() {
        let clearRate = this.totalZonesClearedSucccessfully / this.results.length;
        let hitRate = (this.startingDropCount - this.misses) / this.startingDropCount;
        let modifiedPercentScored = (this.percentScored + clearRate + hitRate) / 3;
        let finalGrade = 100 * (modifiedPercentScored > this.percentScored ? modifiedPercentScored : this.percentScored);

        return this.grades.find((g) => finalGrade >= g.threshold) || this.grades[this.grades.length - 1];
      },
      thisYear() {
        return new Date().getFullYear();
      },
      currentStageIndex() {
        return this.currentSet ? this.currentSet.stages.indexOf(this.currentStage) : -1;
      },
      isLastSet() {
        return this.currentCampaign ? this.currentCampaign.sets.indexOf(this.currentSet) === this.currentCampaign.sets.length - 1 : false;
      },
      isFirstSetAndFirstStage() {
        return this.currentCampaign && this.currentCampaign.sets.length > 0 && this.currentSet && this.currentSet.stages.length > 0 && this.currentCampaign.sets.indexOf(this.currentSet) === 0 && this.currentSet.stages.indexOf(this.currentStage) === 0;
      },
      isFirstStageOfSet() {
        return this.currentSet && this.currentSet.stages.length > 0 && this.currentSet.stages.indexOf(this.currentStage) === 0;
      },
      nextSet() {
        return this.UnlockNextSet(this.currentCampaign, this.currentSet);
      },

      nextCampaign() {
        return this.UnlockNextCampaign(this.currentCampaign);
      },
      fontScale() {
        return `${1 / this.stageScale}`;
      },
      showOverlay() {
        return this.isPlaying && !this.showEndSet && !this.lock && !this.isDropping && (this.announcement !== '' || this.instructions !== '');
      },
    },
  });
});
