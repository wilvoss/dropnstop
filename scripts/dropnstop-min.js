(Vue.config.devtools = !1), (Vue.config.debug = !1), (Vue.config.silent = !0), (Vue.config.ignoredElements = ['app', 'page', 'navbar', 'settings', 'splash', 'splashwrap', 'message', 'notifications', 'speedControls', 'state', 'bank', 'commodity', 'detail', 'gameover', 'listheader', 'listings', 'category', 'name', 'units', 'currentPrice', 'description', 'market', 'currentValue', 'contractSize', 'goldbacking', 'contractUnit']);
var app = new Vue({
  el: '#app',
  data: {
    displayMode: 'browser tab',
    isDropping: !1,
    isStopped: !1,
    isReady: !0,
    useDarkPuck: !1,
    puckX: 0,
    puckY: 0,
    puckWidth: 20,
    puckHeight: 100,
    targetX: 0,
    targetY: 0,
    targetWidth: 100,
    targetHeight: 100,
    speed: 6,
    dropMaxCount: 3,
    dropCount: 0,
    dropTotalCount: 100,
    isSuccess: !1,
    score: 0,
    showInstructions: !0,
    showSettings: !1,
    showYesNo: !1,
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
      this.isSuccess && (this.dropCount = this.dropMaxCount - 1),
        (this.isSuccess = !1),
        (this.puckY = -this.puckHeight),
        this.dropCount++,
        this.dropCount === this.dropMaxCount && ((this.puckY = -this.puckHeight), (this.puckX = getRandomInt(this.puckWidth, (window.innerWidth < 500 ? window.innerWidth : 500) - this.puckWidth)), (this.targetHeight = getRandomInt(20, 100)), (this.targetY = getRandomInt(200 + this.puckHeight, window.innerHeight - 120 - this.targetHeight)), (this.dropCount = 0), this.results.push(new ResultObject(this.dropTotalCount)));
    },
    StopPuck() {
      if (this.dropTotalCount > 0) {
        this.puckElement = document.getElementsByTagName('puck')[0];
        const t = window
          .getComputedStyle(this.puckElement)
          .transform.match(/matrix.*\((.+)\)/)[1]
          .split(', ');
        this.puckY = t[5];
        let e = 30 + Number(this.score) + (100 - Number(this.targetHeight)) * (Number(this.dropMaxCount) - Number(this.dropCount));
        Number(this.puckY) + Number(this.puckHeight) + 1 <= Number(this.targetHeight) + Number(this.targetY) + 2 && Number(this.puckY) + Number(this.puckHeight) + 1 > Number(this.targetY) && ((this.score = e), (this.isSuccess = !0));
        let s = this.results[this.results.length - 1];
        Number(this.puckY) + Number(this.puckHeight) + 1 > Number(this.targetHeight) + Number(this.targetY) + 2 ? s.deltas.push(Number(this.targetHeight) + Number(this.targetY) + 2 - Number(this.puckY) + Number(this.puckHeight) + 1) : Number(this.puckY) + Number(this.puckHeight) + 1 < Number(this.targetY) && s.deltas.push(Number(this.puckY) + Number(this.puckHeight) + 1 - Number(this.targetY)),
          (this.isSuccess || 2 == this.dropCount) && ((s.count = this.dropTotalCount), (s.attempts = this.dropCount), (s.success = this.isSuccess), (s.value = e), (s.ky = this.puckY), (s.kx = this.puckX), (s.kh = this.puckHeight), (s.ty = this.targetY), (s.th = this.targetHeight)),
          this.dropTotalCount--;
      }
    },
    SelectMode(t) {
      this.modes.forEach((t) => {
        t.selected = !1;
      }),
        (t.selected = !0),
        (this.puckHeight = t.height),
        (this.puckWidth = t.width),
        localStorage.setItem('mode', JSON.stringify(t)),
        (this.speed = t.speed),
        (this.currentMode = t),
        this.RestartGame();
    },
    ToggleInstructions() {
      localStorage.setItem('showInstructions', this.showInstructions);
    },
    GetHitsOn(t) {
      let e = 0;
      return (
        this.results.forEach((s) => {
          s.success && s.attempts == t && e++;
        }),
        e
      );
    },
    GetMisses() {
      let t = 0;
      return (
        this.results.forEach((e) => {
          t += e.deltas.length;
        }),
        t
      );
    },
    GetHighestPossibleScore() {
      let t = 0;
      return (
        this.results.forEach((e) => {
          if (null != e.th) {
            let s = 30 + 3 * (100 - Number(e.th));
            t += s;
          }
        }),
        t
      );
    },
    GetMissedByDirection(t) {
      let e = 0;
      return (
        this.results.forEach((s) => {
          for (let i = 0; i < s.deltas.length; i++) {
            const h = s.deltas[i];
            h > 0 && 'below' == t && e++, h < 0 && 'above' == t && e++;
          }
        }),
        Math.round((e / this.GetMisses()) * 100)
      );
    },
    EndGame() {
      (this.showYesNo = !1), (this.showSettings = !1), (this.dropTotalCount = 0), (this.isStopped = !0), (this.isReady = !1), (this.isDropping = !1);
    },
    HandleActionButton(t, e) {
      t.stopPropagation(), t.preventDefault(), log(e), this.showYesNo && 'quit' == e ? this.EndGame() : this.isDropping && 'stop' == e ? (this.StopPuck(), (this.showInstructions = !1), (this.isDropping = !1), (this.isStopped = !0)) : this.isStopped && 'next' == e ? (this.ReadyTheater(), (this.isStopped = !1), (this.isReady = !0)) : this.isReady && 'drop' == e && ((this.isReady = !1), (this.isDropping = !0));
    },
    HandlePuckColorButtonClick(t, e) {
      t.stopPropagation(), t.preventDefault(), this.SetPuckColor(e);
    },
    SetPuckColor(t) {
      (this.useDarkPuck = t), this.r.style.setProperty('--puckLuminosity', (this.useDarkPuck ? 0 : 100) + '%'), localStorage.setItem('useDarkPuck', t);
    },
    HandleThemeButton(t, e) {
      t.stopPropagation(), t.preventDefault(), this.SelectGameTheme(e.name);
    },
    SelectGameTheme(t) {
      var e;
      this.themes.forEach((s) => {
        (s.selected = s.name == t), s.selected && (e = s);
      }),
        null == e && ((e = this.themes[1]).selected = !0),
        this.r.style.setProperty('--hue', e.h),
        this.r.style.setProperty('--saturation', e.s + '%'),
        localStorage.setItem('theme', e.name);
    },
    UpdateApp() {
      this.isDropping && (this.puckY = Number(this.puckY) + this.speed);
    },
    RestartGame() {
      (this.results = []), (this.dropCount = this.dropMaxCount - 1), (this.dropTotalCount = 100), (this.score = 0), (this.isDropping = !1), (this.isStopped = !1), (this.isReady = !0), this.ReadyTheater();
    },
    GetSettings() {
      if (null != localStorage.getItem('mode')) {
        var t = new ModeObject(JSON.parse(localStorage.getItem('mode')));
        this.modes.forEach((e) => {
          e.name == t.name && this.SelectMode(e);
        });
      } else this.SelectMode(Modes[1]);
      null != localStorage.getItem('theme') && this.SelectGameTheme(localStorage.getItem('theme')), null != localStorage.getItem('useDarkPuck') && this.SetPuckColor('true' == localStorage.getItem('useDarkPuck'));
    },
    Share() {
      navigator.share({ title: "Drop 'n Stop!", text: 'The puck stops here.', url: 'https://dropnstop.games' });
    },
    HandleKeyUp(t) {
      let e;
      switch (
        (this.themes.forEach((t, s) => {
          t.selected && (e = s);
        }),
        t.key)
      ) {
        case 'ArrowRight':
          e = e == this.themes.length - 1 ? 0 : e + 1;
          break;
        case 'ArrowLeft':
          e = 0 == e ? this.themes.length - 1 : e - 1;
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          this.SelectMode(this.modes[t.key - 1]);
          break;
        case 'Enter':
          this.showYesNo && this.EndGame();
          break;
        case 'Escape':
          this.showYesNo && (this.showYesNo = !1);
          break;
      }
      null != e && e >= 0 && this.SelectGameTheme(this.themes[e].name);
    },
  },
  mounted() {
    window.addEventListener('keyup', this.HandleKeyUp), this.GetSettings(), (this.updateInterval = window.setInterval(this.UpdateApp, 1));
  },
  computed: {},
});
