/// <reference path="../models/ResultObject.js" />
/// <reference path="../models/ModeObject.js" />

// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app', 'page', 'navbar', 'settings', 'splash', 'splashwrap', 'message', 'notifications', 'speedControls', 'state', 'bank', 'commodity', 'detail', 'gameover', 'listheader', 'listings', 'category', 'name', 'units', 'currentPrice', 'description', 'market', 'currentValue', 'contractSize', 'goldbacking', 'contractUnit'];

var app = new Vue({
  el: '#app',
  data: {
    version: '3.0.002',
    displayMode: 'browser tab',
    isDropping: false,
    isStopped: false,
    isReady: true,
    useDarkPuck: false,
    puckX: 0,
    puckY: 0,
    puckWidth: 20,
    puckHeight: 10,
    trailWidth: 20,
    trailHeight: 10,
    targetX: 0,
    targetY: 0,
    targetWidth: 100,
    targetHeight: 100,
    speed: 6,
    dropMaxCount: 3,
    dropCount: 0,
    dropTotalCount: 100,
    isSuccess: false,
    score: 0,
    showInstructions: true,
    showGameEnd: false,
    isPlaying: true,
    showSettings: false,
    showYesNo: false,
    results: [],
    modes: Modes,
    currentMode: Modes[1],
    themes: Themes,
    puckElement: document.getElementsByTagName('puck')[0],
    r: document.querySelector(':root'),
    c: window.getComputedStyle(document.querySelector(':root')),
  },
  methods: {
    ReadyTheater() {
      let stage = document.getElementsByTagName('stage')[0];
      let stageRect = stage.getBoundingClientRect();
      if (this.isSuccess) {
        this.dropCount = this.dropMaxCount - 1;
      }
      this.isSuccess = false;
      this.puckY = -this.puckHeight;
      this.dropCount++;
      if (this.dropCount === this.dropMaxCount) {
        this.puckY = -this.puckHeight;
        this.puckX = getRandomInt(this.puckWidth, (window.innerWidth < stageRect.width ? window.innerWidth : stageRect.width) - this.puckWidth);
        this.targetHeight = getRandomInt(20, 100);
        this.targetY = getRandomInt(100 + this.puckHeight, stageRect.height - this.targetHeight);
        this.dropCount = 0;
        this.results.push(new ResultObject({ count: this.dropTotalCount, difficulty: this.currentMode.name }));
      }
    },
    StopPuck() {
      if (this.dropTotalCount > 0) {
        this.puckElement = document.getElementsByTagName('puck')[0];
        const kStyle = window.getComputedStyle(this.puckElement);
        const kMatrix = kStyle.transform;
        const kMatrixValues = kMatrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        this.puckY = kMatrixValues[5];

        let gain = this.score + this.targetValue;

        if (Number(this.puckY) + Number(this.puckHeight) + 1 <= Number(this.targetHeight) + Number(this.targetY) + 2 && Number(this.puckY) + Number(this.puckHeight) + 1 > Number(this.targetY)) {
          this.score = gain;
          this.isSuccess = true;
        }

        let currentResult = this.results[this.results.length - 1];

        if (Number(this.puckY) + Number(this.puckHeight) + 1 > Number(this.targetHeight) + Number(this.targetY) + 2) {
          currentResult.deltas.push(Number(this.targetHeight) + Number(this.targetY) + 2 - Number(this.puckY) + Number(this.puckHeight) + 1);
        } else if (Number(this.puckY) + Number(this.puckHeight) + 1 < Number(this.targetY)) {
          currentResult.deltas.push(Number(this.puckY) + Number(this.puckHeight) + 1 - Number(this.targetY));
        }
        if (this.isSuccess || this.dropCount == 2) {
          currentResult.count = this.dropTotalCount;
          currentResult.attempts = this.dropCount;
          currentResult.success = this.isSuccess;
          currentResult.value = gain;
          currentResult.ky = this.puckY;
          currentResult.kx = this.puckX;
          currentResult.kh = this.puckHeight;
          currentResult.ty = this.targetY;
          currentResult.th = this.targetHeight;
        }

        this.dropTotalCount--;
      }
    },
    SelectMode(incoming) {
      this.modes.forEach((mode) => {
        mode.selected = false;
      });
      incoming.selected = true;
      this.trailHeight = incoming.height;
      this.trailWidth = incoming.width;
      this.puckHeight = incoming.height;
      this.puckWidth = incoming.width;
      localStorage.setItem('mode', JSON.stringify(incoming));
      this.speed = incoming.speed;
      this.currentMode = incoming;
      if (this.isPlaying) {
        this.EndGame();
      }
    },
    ToggleInstructions() {
      //this.showInstructions = !this.showInstructions;
      localStorage.setItem('showInstructions', this.showInstructions);
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
        if (result.th != undefined) {
          let value = 30 + (100 - Number(result.th)) * 3;
          highest = highest + value;
        }
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
      return Math.round((number / this.GetMisses()) * 100);
    },
    EndGame() {
      // var confirmed = window.confirm('Are you sure you want to quit?');
      this.showYesNo = false;
      this.showSettings = false;
      this.dropTotalCount = 0;
      this.isStopped = true;
      this.isReady = false;
      this.isDropping = false;
      this.isPlaying = false;
      this.showGameEnd = true;
    },
    HandleActionButton(event, action) {
      event.stopPropagation();
      event.preventDefault();
      log(action);
      if (this.showYesNo && action == 'quit') {
        this.EndGame();
      } else if (this.isDropping && action == 'stop') {
        this.StopPuck();
        this.showInstructions = false;
        this.isDropping = false;
        this.isStopped = true;
      } else if (this.isStopped && action == 'next') {
        this.ReadyTheater();
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
    SetPuckColor(usedark) {
      this.useDarkPuck = usedark;
      this.r.style.setProperty('--puckLuminosity', (this.useDarkPuck ? 17 : 100) + '%');
      localStorage.setItem('useDarkPuck', usedark);
    },
    HandleThemeButton(event, theme) {
      event.stopPropagation();
      event.preventDefault();
      this.SelectGameTheme(theme.name);
    },
    SelectGameTheme(name) {
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
      localStorage.setItem('theme', theme.name);
    },
    UpdateApp() {
      if (this.isDropping) {
        this.puckY = Number(this.puckY) + this.speed;
      }
    },
    RestartGame() {
      this.results = [];
      this.dropCount = this.dropMaxCount - 1;
      this.dropTotalCount = 100;
      this.score = 0;
      this.isDropping = false;
      this.isStopped = false;
      this.isReady = true;
      this.isPlaying = true;
      this.showGameEnd = false;
      this.ReadyTheater();
    },
    GetSettings() {
      // this.showInstructions = localStorage.getItem('showInstructions') == 'false' ? false : true;
      if (localStorage.getItem('mode') != null) {
        var incoming = new ModeObject(JSON.parse(localStorage.getItem('mode')));
        this.modes.forEach((mode) => {
          if (mode.name == incoming.name) {
            this.SelectMode(mode);
          }
        });
      } else {
        this.SelectMode(Modes[1]);
      }
      if (localStorage.getItem('theme') != null) {
        this.SelectGameTheme(localStorage.getItem('theme'));
      }
      if (localStorage.getItem('useDarkPuck') != null) {
        this.SetPuckColor(localStorage.getItem('useDarkPuck') == 'true');
      }
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
          break;
        case 'ArrowLeft':
          currentThemeIndex = currentThemeIndex == 0 ? this.themes.length - 1 : currentThemeIndex - 1;
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          this.SelectMode(this.modes[event.key - 1]);
          break;
        case 'Enter':
          if (this.showYesNo) {
            this.EndGame();
          }
          break;
        case 'Escape':
          if (this.showYesNo) {
            this.showYesNo = false;
          }
          break;
        case 'Space':
          if (this.isDropping) {
            this.HandleActionButton(event, 'stop');
          } else if (this.isReady || this.isStopped) {
            this.HandleActionButton(event, 'next');
          }
      }
      if (currentThemeIndex != undefined && currentThemeIndex >= 0) {
        this.SelectGameTheme(this.themes[currentThemeIndex].name);
      }
    },
    HandleKeyDown(event) {
      switch (event.code) {
        case 'Space':
          if (!this.isDropping && this.isReady) {
            this.HandleActionButton(event, 'drop');
          }
          break;
      }
    },
  },

  mounted() {
    window.addEventListener('keyup', this.HandleKeyUp);
    window.addEventListener('keydown', this.HandleKeyDown);
    this.GetSettings();
    this.updateInterval = window.setInterval(this.UpdateApp, 1);
  },

  computed: {
    targetValue: function () {
      let baseValue = parseInt(30 + (100 - Number(this.targetHeight)) * (Number(this.dropMaxCount) - Number(this.dropCount)));
      let bonus = (500 - this.targetY) / Number(this.dropCount + 1);

      return (parseInt(baseValue + bonus) * this.currentMode.speed) / this.modes[0].speed;
    },
    hitsOnOne: function () {
      return this.GetHitsOn(0);
    },
    hitsOnTwo: function () {
      return this.GetHitsOn(1);
    },
    hitsOnThree: function () {
      return this.GetHitsOn(2);
    },
    misses: function () {
      return this.GetMisses();
    },
    highestPossibleScore: function () {
      return this.GetHighestPossibleScore();
    },
    missedAbove: function () {
      return this.GetMissedByDirection('above') + '%';
    },
    missedBelow: function () {
      return this.GetMissedByDirection('below') + '%';
    },
  },
});
