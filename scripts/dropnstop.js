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
        showInstructions: true,
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
            this.currentStage.result = this.results[this.results.length - 1];
          }
          // If not endless, queue the next set and reset difficulty
          if (!endless) {
            this.QueueSet();
            this.SelectDifficulty(this.currentStage.difficulty);
          }
          // Reset for next stage
          this.puckY = -this.puckHeight - 2;
          this.puckX = endless ? getRandomInt(this.puckWidth / 2, stageRect.width - this.puckWidth / 2) : this.currentStage.kx;
          this.targetHeight = endless ? getRandomInt(20, 100) : this.currentStage.th;
          this.targetY = endless ? getRandomInt(100 + this.puckHeight, stageRect.height - this.targetHeight) : this.currentStage.ty;
          this.dropCount = 0;
          this.results.push(
            new modules.ResultObject({
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
        highlight(this.currentSet.name);

        this.currentSet.locked = false;

        const unfinishedDropCount = this.currentSet.stages.filter((stage) => stage.result == null).length;

        if (unfinishedDropCount === 0) {
          this.currentSet.finished = true;
          this.QueueSet(); // Try next set
        } else {
          this.QueueStage();
        }
      },

      QueueStage() {
        note('Queue stage');
        this.currentStage = this.currentSet.stages.find((stage) => stage.result == null) || this.currentSet.stages[0];
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

        currentResult.count = this.dropTotalCount;
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
          this.showEndSet = true; // Only show end game if campaign is complete

          this.UnlockNextSet(this.currentCampaign, this.currentSet);

          if (this.IsCampaignComplete(this.currentCampaign)) {
            this.currentCampaign.finished = true;

            this.UnlockNextCampaign(this.currentCampaign);
          }

          const colorConfetti = this.finalGrade.threshold > this.goodGradeThreshold;

          setTimeout(() => this.CreateConfetti(colorConfetti), 200);
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
      HandleAnnouncementClick() {
        note('Announcement clicked');
        this.showAnnouncement = false;
      },
      HandleOkayButtonClick() {
        if (this.lock) {
          this;
          if (this.finalGrade.threshold > this.goodGradeThreshold) {
            setTimeout(() => {
              this.CreateConfetti(true);
            }, 200);
          }
        } else {
          this.EndGame();
        }
      },
      HandleQuitButtonClick() {
        this.EndGame();
        if (!this.currentCampaign.isEndless && !this.currentCampaign.isTutorial) {
          if (this.IsCampaignComplete(this.currentCampaign)) {
            this.showCampaigns = true;
          } else {
            this.showSets = true;
          }
        }
      },
      HandleNextButtonClick() {
        this.ResetTheater();
        this.CompleteStageAndReadyNext();
      },
      async SelectDifficulty(incoming) {
        note('Selected difficulty: ' + incoming.name);
        // if (!this.isPlaying) {
        this.difficulties.forEach((difficulty) => {
          difficulty.selected = false;
        });
        incoming.selected = true;
        this.trailHeight = incoming.height;
        this.trailWidth = incoming.width;
        this.puckHeight = incoming.height;
        this.puckWidth = incoming.width;
        await modules.SaveData('difficulty', JSON.stringify(incoming));
        this.speed = incoming.speed;
        this.currentDifficulty = incoming;
        // }
      },
      async ToggleInstructions() {
        await modules.SaveData('showInstructions', this.showInstructions);
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
      GetHighestPossibleScore2() {
        let highest = 0;
        this.results.forEach((result) => {
          let difficulty = this.difficulties.find((r) => {
            return r.name === result.difficulty;
          });
          let baseValue = parseInt(30 + (100 - Number(result.th)) * Number(this.dropMaxCount));
          let bonus = 481 - result.ty;

          let sum = baseValue ? (parseInt(baseValue + bonus) * difficulty.speed) / this.difficulties[0].speed : 0;
          highest = highest + sum;
        });
        return highest;
      },
      GetHighestPossibleScore() {
        let highest = 0;
        this.results.forEach((result) => {
          const stageSize = (500 * 500) / 2;
          const attemptPenalty = 1; // 0 for first attempt, 1 for second, etc.
          const targetArea = (Number(result.th) * Number(result.tw)) / 2;
          const targetSizeBonus = (stageSize - targetArea) / 20; // Scale down the bonus
          const yBonus = 500 - Number(result.ty);
          const puckArea = (Number(result.pw) * Number(result.ph)) / 2;
          const puckSizeBonus = Math.max(1, (400 - puckArea) / 200);
          const speedBonus = result.speed;

          let baseValue =
            targetSizeBonus + // bonus for smaller target
            speedBonus + // bonus for higher speed
            yBonus; // penalize for lower Y position

          baseValue = baseValue * puckSizeBonus; // Apply puck size bonus

          baseValue = baseValue / (attemptPenalty * 10); // Divide by attempts to scale value
          baseValue = Math.max(10, baseValue);

          highest += baseValue;
        });
        return Math.round(highest);
      },
      GetMissedByDirection(direction) {
        let number = 0;
        this.results.forEach((result) => {
          for (let x = 0; x < result.deltas.length; x++) {
            const delta = result.deltas[x];
            if (delta > 0 && direction == 'below') {
              number++;
            }
            if (delta < 0 && direction == 'above') {
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
        this.isPlaying = false;
        this.showInstructions = true;
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
      HandleActionButton(event, action) {
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }
        if (this.showYesNo && action == 'quit') {
          this.EndGame();
        } else if (this.isDropping && action == 'stop') {
          this.StopPuck();
          this.showInstructions = false;
          this.isDropping = false;
          this.isStopped = true;
        } else if (this.isStopped && action == 'next') {
          this.CompleteStageAndReadyNext();
          this.isStopped = false;
          this.isReady = true;
        } else if (this.isReady && action == 'drop') {
          this.isReady = false;
          this.isDropping = true;

          // Only increment dropCount if the stage isn't already finished
          if (this.currentStage && !this.currentStage.finished) {
            this.dropCount++;
          }
        }
      },
      HandlePuckColorButtonClick(event, usedark) {
        event.stopPropagation();
        event.preventDefault();
        this.SetPuckColor(usedark);
      },
      async SetPuckColor(usedark) {
        note('Set puck dark: ' + usedark);
        this.useDarkPuck = usedark;
        this.r.style.setProperty('--puckLuminosity', (this.useDarkPuck ? 0 : 100) + '%');
        await modules.SaveData('useDarkPuck', usedark);
      },
      HandleThemeButton(event, theme) {
        event.stopPropagation();
        event.preventDefault();
        this.SelectGameTheme(theme.name);
      },
      async SelectGameTheme(name) {
        note('Selecting theme: ' + name);
        var theme;
        this.themes.forEach((t) => {
          t.selected = t.name == name;
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
      UpdateApp(now) {
        if (!this.lastUpdate) this.lastUpdate = now;
        const deltaSeconds = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        if (this.isDropping && !this.puckHitBottom) {
          this.puckY = Number(this.puckY) + this.speed * deltaSeconds;
        }
      },
      RestartGame(_campaign = null) {
        note('Restarting game');
        this.lock = false;
        this.results = [];
        this.dropCount = 3;

        this.dropTotalCount = 0;
        this.score = 0;
        this.isDropping = false;
        this.isStopped = false;
        this.isReady = true;
        this.isPlaying = true;
        this.showHome = false;
        this.showEndSet = false;
        this.showCampaigns = false;
        this.showSettings = false;
        this.showYesNo = false;
        this.showSets = false;
        this.RemoveConfetti();
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
      SelectSet(_set, _ignoreConfirm = false) {
        log('Select set: ' + _set.name, true);
        if (_set.finished && !_ignoreConfirm) {
          let confirm = window.confirm('This set is already finished. Do you want to play it again?');
          if (!confirm) {
            return;
          }
        }
        this.showAnnouncement = true;
        this.currentCampaign.finished = false;

        this.ClearSet(_set);

        this.currentSet = _set;
        this.currentSet.selected = true;
        this.QueueSet();
        this.RestartGame();
      },
      ClearSet(_set) {
        note('Clearing set: ' + _set.name);
        _set.stages.forEach((stage) => {
          stage.result = null;
          stage.finished = false;
          stage.score = 0;
          stage.grade = null;
        });
        _set.finished = false;
        _set.score = 0;
        _set.grade = null;
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
      async GetCurrentGameState() {
        note('Get current game state');
        const currentGameStateData = await modules.GetData('currentGameState');
        if (typeof currentGameStateData === 'string' && currentGameStateData.trim() !== '' && currentGameStateData !== 'undefined') {
          return JSON.parse(currentGameStateData);
        } else {
          this.SelectCampaign(this.campaigns[0]);
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
            }),
          ),
        );
      },
      IsSetComplete(set) {
        const complete = set.stages.every((stage) => stage.finished);
        note('Set ' + set.name + ' complete: ' + complete);
        return complete;
      },
      IsCampaignComplete(campaign) {
        const complete = campaign.sets.every((set) => this.IsSetComplete(set));
        note('Campaign ' + campaign.name + ' complete: ' + complete);
        return complete;
      },
      IsGameComplete() {
        return this.campaigns.every((campaign) => this.IsCampaignComplete(campaign));
      },
      UnlockNextSet(currentCampaign, currentSet) {
        const sets = currentCampaign.sets;
        const currentIndex = sets.indexOf(currentSet);
        if (currentIndex !== -1 && currentIndex < sets.length - 1) {
          sets[currentIndex + 1].locked = false;
          return sets[currentIndex + 1];
        }
        return null;
      },
      UnlockNextCampaign(currentCampaign) {
        const campaigns = this.campaigns;
        const currentIndex = campaigns.indexOf(currentCampaign);
        if (currentIndex !== -1 && currentIndex < campaigns.length - 1) {
          campaigns[currentIndex + 1].locked = false;
          return campaigns[currentIndex + 1];
        }
        return null;
      },
      async GetSettings() {
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
          var incoming = new modules.DifficultyObject(JSON.parse(difficultyData));
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
        if (typeof useDarkPuckData === 'string' && useDarkPuckData.trim() !== '' && useDarkPuckData !== 'undefined') {
          this.SetPuckColor(useDarkPuckData);
        } else {
          this.SetPuckColor(false);
        }

        const hasUsedSpaceBarData = await modules.GetData('hasUsedSpaceBar');
        if (typeof hasUsedSpaceBarData === 'string' && hasUsedSpaceBarData.trim() !== '' && hasUsedSpaceBarData !== 'undefined') {
          this.hasUsedSpaceBar = hasUsedSpaceBarData;
        } else {
          this.hasUsedSpaceBar = false;
        }
      },
      RemoveConfetti() {
        note('Remove confetti');
        let confetti = document.getElementsByTagName('confetti')[0];
        let allConfetti = document.getElementsByTagName('confetto');
        for (let _x = allConfetti.length - 1; _x >= 0; _x--) {
          confetti.removeChild(allConfetti[_x]);
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
      HandleKeyUp(event) {
        let currentThemeIndex;
        this.themes.forEach((theme, i) => {
          if (theme.selected) {
            currentThemeIndex = i;
          }
        });
        switch (event.code) {
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
          case '1':
          case '2':
          case '3':
          case '4':
            this.SelectDifficulty(this.difficulties[event.key - 1]);
            break;
          case 'Enter':
            if (!this.lock) {
              if (this.showYesNo && !this.showEndSet) {
                this.EndGame();
              } else if (this.showEndSet && !this.showHome && !this.showSettings) {
                this.EndGame();
              }
            } else {
              this.HandleOkayButtonClick();
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
                this.HandleActionButton(event, 'stop');
              } else if (
                !this.spaceBarCooldown && // <-- ADD THIS LINE
                (this.isReady || (this.isStopped && !this.showEndSet)) &&
                !this.showEndSet &&
                !this.showHome &&
                !this.showSettings
              ) {
                this.HandleActionButton(event, 'next');
              } else if (this.showHome && !this.showSettings) {
                // this.RestartGame();
              }
            }
            break;
        }
      },
      HandleKeyDown(event) {
        if (this.showAnnouncement) {
          this.HandleAnnouncementClick();
        } else if (!this.lock) {
          switch (event.code) {
            case 'Space':
              if (!this.spaceBarCooldown && !this.isDropping && this.isReady && !this.showEndSet && !this.isStopped && !this.showHome && !this.showSettings) {
                this.spaceBarInUse = true;
                this.hasUsedSpaceBar = true;
                modules.SaveData('hasUsedSpaceBar', true);
                this.HandleActionButton(event, 'drop');
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
    },

    async mounted() {
      this.stageElement = document.getElementsByTagName('stage')[0];
      this.puckElement = document.getElementsByTagName('puck')[0];

      window.addEventListener('keyup', this.HandleKeyUp);
      window.addEventListener('keydown', this.HandleKeyDown);
      window.addEventListener('resize', this.HandleResize);
      this.SetScale();
      this.GetSettings();
      await this.GetCurrentGameState();
      this.ApplyDifficultyInheritance();
      const update = (now) => {
        this.UpdateApp(now);
        this._animationFrame = requestAnimationFrame(update);
      };
      this._animationFrame = requestAnimationFrame(update);
    },

    beforeDestroy() {
      cancelAnimationFrame(this._animationFrame);
      window.removeEventListener('keyup', this.HandleKeyUp);
      window.removeEventListener('keydown', this.HandleKeyDown);
      window.removeEventListener('resize', this.HandleResize);
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
        return this.totalZonesClearedSucccessfully === 0 ? 0 : Math.round((100 * this.GetHitsOn(0)) / this.results.length) + '%';
      },
      hitsOnTwo() {
        return this.totalZonesClearedSucccessfully === 0 ? 0 : Math.round((100 * this.GetHitsOn(1)) / this.results.length) + '%';
      },
      hitsOnThree() {
        return this.totalZonesClearedSucccessfully === 0 ? 0 : Math.round((100 * this.GetHitsOn(2)) / this.results.length) + '%';
      },
      totalZonesClearedSucccessfully() {
        return this.GetHitsOn(0) + this.GetHitsOn(1) + this.GetHitsOn(2);
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
      instructions() {
        if (this.currentStage && this.currentStage.description && this.dropCount === 0) {
          // return this.currentStage.description;
          if (!this.currentStage.name) {
            return `<span>${this.currentStage.description}</span>`;
          }
          return `${this.currentStage.name}<br /><span>${this.currentStage.description}</span>`;
        }
        return '';
      },
      announcement() {
        if (this.currentSet && this.currentSet.name && this.dropCount === 0) {
          return `${this.currentCampaign.name} — ${this.currentSet.name}<br /><span>${this.currentSet.description}</span>`;
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
        if (hitBottom) {
          log('Checking if puck hit bottom', true);
          highlight('Puck Y: ' + this.puckY + ', Puck Height: ' + this.puckHeight + ', Stage Height (unscaled): ' + unscaledStageHeight);
        }
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
        return !this.isDropping && this.dropTotalCount === 0;
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
    },
  });
});

const a = window.app;
