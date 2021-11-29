// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app', 'page', 'navbar', 'settings', 'splash', 'splashwrap', 'message', 'notifications', 'speedControls', 'state', 'bank', 'commodity', 'detail', 'gameover', 'listheader', 'listings', 'category', 'name', 'units', 'currentPrice', 'description', 'market', 'currentValue', 'contractSize', 'goldbacking', 'contractUnit'];

var app = new Vue({
  el: '#app',
  data: {
    isDropping: false,
    isStopped: false,
    isReady: true,
    knifeX: 0,
    knifeY: 0,
    knifeWidth: 10,
    knifeHeight: 100,
    targetX: 0,
    targetY: 0,
    targetWidth: 100,
    targetHeight: 100,
    dropMaxCount: 3,
    dropCount: 2,
    dropTotalCount: 100,
    isSuccess: false,
    score: 0,
    knifeElement: document.getElementsByTagName('knife')[0],
    r: document.querySelector(':root'),
    c: window.getComputedStyle(document.querySelector(':root')),
  },
  methods: {
    ReadyStage() {
      this.isSuccess = false;
      this.knifeY = -this.knifeHeight;
      this.dropCount++;
      if (this.dropCount === this.dropMaxCount) {
        this.knifeWidth = getRandomInt(4, 20);
        this.knifeHeight = getRandomInt(this.knifeWidth, 200);
        this.knifeY = -this.knifeHeight;
        this.knifeX = getRandomInt(this.knifeWidth, (window.innerWidth < 500 ? window.innerWidth : 500) - this.knifeWidth);
        // this.r.style.setProperty('--targetX', this.knifeX + this.knifeWidth / 2 - 250 + 'px');
        this.targetHeight = getRandomInt(10, 100);
        this.targetY = getRandomInt(200 + this.knifeHeight, window.innerHeight - 120 - this.targetHeight);
        this.dropCount = 0;
      }
    },
    StopKnife() {
      if (this.dropTotalCount > 0) {
        this.knifeElement = document.getElementsByTagName('knife')[0];
        const kStyle = window.getComputedStyle(this.knifeElement);
        const kMatrix = kStyle.transform;
        const kMatrixValues = kMatrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        this.knifeY = kMatrixValues[5];
        if (Number(this.knifeY) + Number(this.knifeHeight) - 1 < Number(this.targetHeight) + Number(this.targetY) && Number(this.knifeY) + Number(this.knifeHeight) + 1 > Number(this.targetY)) {
          this.score = Number(this.score) + -1 * (100 - Number(this.targetHeight) * Number(this.dropMaxCount) - Number(this.dropCount));
          this.dropCount = this.dropMaxCount - 1;
          this.isSuccess = true;
        }
        this.dropTotalCount--;
      }
    },
    HandleActionButton(event) {
      event.stopPropagation();
      event.preventDefault();
      if (this.isDropping) {
        this.StopKnife();
        this.isDropping = false;
        this.isStopped = true;
      } else if (this.isStopped) {
        this.ReadyStage();
        this.isStopped = false;
        this.isReady = true;
      } else if (this.isReady) {
        this.isReady = false;
        this.isDropping = true;
      }
    },
    UpdateApp() {
      if (this.isDropping) {
        this.knifeY = Number(this.knifeY) + 6;
      }
    },
    RestartGame() {
      this.dropCount = this.dropMaxCount - 1;
      this.dropTotalCount = 100;
      this.score = 0;
      this.isDropping = false;
      this.isStopped = false;
      this.isReady = true;
      this.ReadyStage();
    },
  },

  mounted() {
    this.ReadyStage();
    this.updateInterval = window.setInterval(this.UpdateApp, 2);
  },

  computed: {},
});
