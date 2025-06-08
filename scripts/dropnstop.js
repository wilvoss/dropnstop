import { saveData, getData, removeData, clearStore } from '../helpers/db-helper.min.js';
import { ModeObject, Modes } from '../models/ModeObject.min.js';
import { Grades } from '../models/GradeObject.min.js';
import { ResultObject } from '../models/ResultObject.min.js';
import { Themes } from '../models/ThemeObject.min.js';

// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app', 'page', 'navbar', 'settings', 'splash', 'splashwrap', 'message', 'notifications', 'speedControls', 'state', 'bank', 'commodity', 'detail', 'gameover', 'listheader', 'listings', 'category', 'name', 'units', 'currentPrice', 'description', 'market', 'currentValue', 'contractSize', 'goldbacking', 'contractUnit'];

var app = new Vue({
  el: '#app',
  data: {
    version: '3.1.007',
    displayMode: 'browser tab',
    isDropping: false,
    isStopped: true,
    isReady: false,
    useDarkPuck: true,
    lastUpdate: null,
    isSuccess: false,
    isPlaying: false,
    puckX: 0,
    puckY: 0,
    puckWidth: 20,
    puckHeight: 10,
    goodGradeThreshold: 84,
    trailWidth: 20,
    trailHeight: 10,
    targetX: 0,
    targetY: 0,
    targetWidth: 100,
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
    showEndGame: true,
    showSettings: false,
    showYesNo: false,
    hasUsedSpaceBar: false,
    spaceBarInUse: false,
    results: [],
    modes: Modes,
    currentMode: Modes[0],
    themes: Themes,
    grades: Grades,
    stageElement: document.getElementsByTagName('stage')[0],
    puckElement: document.getElementsByTagName('puck')[0],
    r: document.querySelector(':root'),
    c: window.getComputedStyle(document.querySelector(':root')),
  },
  methods: {
    ReadyStage() {
      note('Ready stage');
      let stageRect = this.stageElement.getBoundingClientRect();
      if (this.isSuccess) {
        this.dropCount = this.dropMaxCount - 1;
      }
      this.isSuccess = false;
      this.puckY = -this.puckHeight - 2;
      this.dropCount++;
      if (this.dropCount === this.dropMaxCount) {
        this.puckY = -this.puckHeight - 2;
        this.puckX = getRandomInt(this.puckWidth, (window.innerWidth < stageRect.width ? window.innerWidth : stageRect.width) - this.puckWidth);
        this.targetHeight = getRandomInt(20, 100);
        this.targetY = getRandomInt(100 + this.puckHeight, stageRect.height - this.targetHeight);
        this.dropCount = 0;
        this.results.push(new ResultObject({ count: this.dropTotalCount, difficulty: this.currentMode.name }));
      }
      if (this.isFirstRun && window.innerHeight - stageRect.y - this.targetY - this.targetHeight - 2 < 140) {
        log('Adjusting target Y position for first run');
        this.targetY = stageRect.height - this.targetHeight - 140;
      }
    },
    StopPuck() {
      note('Stopping puck');
      if (this.dropTotalCount > 0) {
        const kStyle = window.getComputedStyle(this.puckElement);
        const kMatrix = kStyle.transform;
        const kMatrixValues = kMatrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        this.puckY = kMatrixValues[5];

        let gain = this.score + this.targetValue;

        const puckBottom = Number(this.puckY) + Number(this.puckHeight);
        const targetTop = Number(this.targetY);
        const targetBottom = Number(this.targetY) + Number(this.targetHeight);

        if (puckBottom >= targetTop - 2 && puckBottom <= targetBottom + 2) {
          this.score = gain;
          this.isSuccess = true;
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
        currentResult.ky = this.puckY;
        currentResult.kx = this.puckX;
        currentResult.kh = this.puckHeight;
        currentResult.ty = this.targetY;
        currentResult.th = this.targetHeight;

        this.dropTotalCount--;
        if (this.dropTotalCount === 0) {
          this.lock = true;

          setTimeout(() => {
            this.CreateConfetti();
          }, 200);
        }
      }
    },
    HandleOkayButtonClick() {
      if (this.lock) {
        this.lock = false;
        this.showEndGame = true;
        if (this.finalGrade.threshold > this.goodGradeThreshold) {
          setTimeout(() => {
            this.CreateConfetti(true);
          }, 200);
        }
      } else {
        this.EndGame();
      }
    },
    async SelectMode(incoming) {
      note('Selected mode: ' + incoming.name);
      if (!this.isPlaying) {
        this.modes.forEach((mode) => {
          mode.selected = false;
        });
        incoming.selected = true;
        this.trailHeight = incoming.height;
        this.trailWidth = incoming.width;
        this.puckHeight = incoming.height;
        this.puckWidth = incoming.width;
        await saveData('mode', JSON.stringify(incoming));
        this.speed = incoming.speed;
        this.currentMode = incoming;
      }
    },
    async ToggleInstructions() {
      await saveData('showInstructions', this.showInstructions);
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
    GetHighestPossibleScore() {
      let highest = 0;
      this.results.forEach((result) => {
        let difficulty = this.modes.find((r) => {
          return r.name === result.difficulty;
        });
        let baseValue = parseInt(30 + (100 - Number(result.th)) * Number(this.dropMaxCount));
        let bonus = 481 - result.ty;

        let sum = baseValue ? (parseInt(baseValue + bonus) * difficulty.speed) / this.modes[0].speed : 0;
        highest = highest + sum;
      });
      return highest;
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
    EndGame() {
      note('Ending game');

      this.RemoveConfetti();
      if (this.results.length > 0 && this.results[this.results.length - 1].attempts === 4) {
        this.results.pop();
      }
      this.showYesNo = false;
      this.showSettings = false;
      this.dropTotalCount = 0;
      this.isStopped = true;
      this.isReady = false;
      this.isDropping = false;
      this.isPlaying = false;
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
        this.ReadyStage();
        this.isStopped = false;
        this.isReady = true;
      } else if (this.isReady && action == 'drop') {
        this.isReady = false;
        this.isDropping = true;
      }
    },
    HandlePuckColorButtonClick(event, usedark) {
      event.stopPropagation();
      event.preventDefault();
      this.SetPuckColor(usedark);
    },
    async SetPuckColor(usedark) {
      this.useDarkPuck = usedark;
      this.r.style.setProperty('--puckLuminosity', (this.useDarkPuck ? 0 : 100) + '%');
      await saveData('useDarkPuck', usedark);
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
      await saveData('theme', theme.name);
    },
    UpdateApp(now) {
      if (!this.lastUpdate) this.lastUpdate = now;
      const deltaSeconds = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;

      if (this.isDropping && !this.puckHitBottom) {
        this.puckY = Number(this.puckY) + this.speed * deltaSeconds;
      }
    },
    RestartGame() {
      this.results = [];
      this.dropCount = this.dropMaxCount - 1;
      this.dropTotalCount = this.startingDropCount;
      this.score = 0;
      this.isDropping = false;
      this.isStopped = false;
      this.isReady = true;
      this.isPlaying = true;
      this.showHome = false;
      this.showEndGame = false;
      this.RemoveConfetti();
      this.ReadyStage();
    },
    async GetSettings() {
      const migrationKeys = ['mode', 'theme', 'useDarkPuck'];

      for (const key of migrationKeys) {
        let value = localStorage.getItem(key);
        if (value !== null) {
          await saveData(key, value);
          localStorage.removeItem(key); // Remove old data
        }
      }

      if ((await getData('mode')) != null) {
        var incoming = new ModeObject(JSON.parse(await getData('mode')));
        this.modes.forEach((mode) => {
          if (mode.name == incoming.name) {
            this.SelectMode(mode);
          }
        });
      } else {
        this.SelectMode(this.modes[1]);
      }
      if ((await getData('theme')) != null) {
        this.SelectGameTheme(await getData('theme'));
      }
      if ((await getData('useDarkPuck')) != null) {
        this.SetPuckColor((await getData('useDarkPuck')) == 'true');
      }
    },

    RemoveConfetti() {
      note('RemoveConfetti() called');
      let allConfetti = document.getElementsByTagName('confetti');
      for (let _x = allConfetti.length - 1; _x >= 0; _x--) {
        document.body.removeChild(allConfetti[_x]);
      }
    },

    CreateConfetti(_highlight = false) {
      note('CreateConfetti() called');
      this.RemoveConfetti();
      let domApp = document.getElementsByTagName('app')[0];
      let count = domApp.clientWidth;

      for (let x = 0; x < count; x++) {
        let confetti = document.createElement('confetti');
        let lightness = _highlight ? getRandomInt(66, 84) : getRandomInt(76, 94);

        confetti.style.setProperty('left', getRandomInt(0, domApp.clientWidth) + (window.innerWidth - domApp.clientWidth) / 2 + 'px');
        confetti.style.setProperty('transition-duration', getRandomInt(1600, 3001) + 'ms');
        confetti.style.setProperty('background-color', 'hsl(' + (this.currentTheme.h + (_highlight ? 180 : 0)) + ', ' + (this.currentTheme.s + 40) + '%, ' + lightness + '%)');

        confetti.style.setProperty('transition-delay', getRandomInt(0, 800) + 'ms');
        confetti.style.setProperty('rotate', +'deg');
        let width = getRandomInt(40, 100) / 10;
        let height = getRandomInt(40, 100) / 10;
        confetti.style.setProperty('width', width + 'px');
        confetti.style.setProperty('height', height + 'px');
        document.body.appendChild(confetti);
      }
      window.setTimeout(function () {
        let allConfetti = document.getElementsByTagName('confetti');
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
      if (!this.lock) {
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
            this.SelectMode(this.modes[event.key - 1]);
            break;
          case 'Enter':
            if (this.showYesNo && !this.showEndGame) {
              this.EndGame();
            } else if (this.showEndGame && !this.showHome && !this.showSettings) {
              this.EndGame();
            }
            break;
          case 'Escape':
            if (this.showYesNo) {
              this.showYesNo = false;
            } else if (this.showSettings) {
              this.showSettings = false;
            } else if (this.showHome) {
              this.showSettings = true;
            }
            break;
          case 'Space':
            this.spaceBarInUse = false;

            if (this.isDropping && !this.showEndGame && !this.showHome && !this.showSettings) {
              this.HandleActionButton(event, 'stop');
            } else if ((this.isReady || (this.isStopped && !this.showEndGame)) && !this.showEndGame && !this.showHome && !this.showSettings) {
              this.HandleActionButton(event, 'next');
            } else if (this.showHome && !this.showSettings) {
              this.RestartGame();
            }
        }
      } else if (event.code === 'Enter') {
        this.HandleOkayButtonClick();
      }
    },
    HandleKeyDown(event) {
      if (!this.lock) {
        switch (event.code) {
          case 'Space':
            if (!this.isDropping && this.isReady && !this.showEndGame && !this.isStopped && !this.showHome && !this.showSettings) {
              this.spaceBarInUse = true;
              this.hasUsedSpaceBar = true;
              this.HandleActionButton(event, 'drop');
            }
            break;
        }
      }
    },
    HandleResize() {
      note('Handling resize');
      this.RemoveConfetti();
    },
  },

  mounted() {
    this.stageElement = document.getElementsByTagName('stage')[0];
    this.puckElement = document.getElementsByTagName('puck')[0];

    window.addEventListener('keyup', this.HandleKeyUp);
    window.addEventListener('keydown', this.HandleKeyDown);
    window.addEventListener('resize', this.HandleResize);
    this.GetSettings();
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
      let baseValue = parseInt(30 + (100 - Number(this.targetHeight)) * (Number(this.dropMaxCount) - Number(this.dropCount)));
      let bonus = (481 - this.targetY) / Number(this.dropCount + 1);

      return Math.round((parseInt(baseValue + bonus) * this.currentMode.speed) / this.modes[0].speed);
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
      let text = this.dropTotalCount + (this.dropTotalCount === 1 ? ' drop left' : ' drops left');
      switch (this.dropTotalCount) {
        case 0:
          text = 'game over!';
          break;

        case this.startingDropCount:
          text = 'press and hold "drop" →';
          break;

        default:
          if (!this.hasUsedSpaceBar && !this.isChromeAndiOSoriPadOS && this.dropTotalCount % 4 === 0 && this.isReady) {
            text = text + '<br />(the space bar works too)';
          }
          break;
      }
      return text;
    },
    puckHitBottom() {
      let stageRect = this.stageElement.getBoundingClientRect();

      return this.puckY + this.puckHeight >= stageRect.height - 2;
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
      return !this.isDropping && this.dropTotalCount === this.startingDropCount;
    },
    percentScored() {
      return this.score / this.highestPossibleScore;
    },
    percentOfHitsIn1Drop() {
      return Math.round((100 * this.GetHitsOn(0)) / this.results.length);
    },
    finalScore() {
      let levelFactor = this.results.length / 3; // Normalize grading for smaller runs
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
  },
});
