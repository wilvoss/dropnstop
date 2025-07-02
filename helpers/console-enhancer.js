var UseDebug = document.location.href.indexOf('staging') != -1 || document.location.href.indexOf('debug=true') != -1;

function highlight(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:#97FF90;');
}

function warn(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:orange;');
}

function error(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:red;');
}

function note(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:gray;');
}

function log(text, isolate, color) {
  text = text.toString();

  color = color == undefined ? 'black' : color;

  isolate = isolate == undefined ? false : isolate;
  var ms = new Date(Date.now()).getMilliseconds();
  ms = ms < 10 ? ms * 100 : ms;
  ms = ms < 100 ? ms * 10 : ms;
  if (UseDebug || isolate) {
    if (isolate) {
      console.log('◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦');
    }
    if (warn) {
      console.log('%c' + new Date(Date.now()).toLocaleTimeString('en-US').replace(/ AM/, '').replace(/ PM/, '') + '.' + ms + ' \t%c' + text, 'color:lightgray;', color);
    } else {
      console.log('%c' + new Date(Date.now()).toLocaleTimeString('en-US').replace(/ AM/, '').replace(/ PM/, '') + '.' + ms + text + ' \t' + text);
    }
    if (isolate) {
      console.log('◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦');
    }
  }
}

function getHashValue(key) {
  var matches = location.hash.match(new RegExp(key + '=([^&]*)'));
  return matches ? matches[1] : null;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
