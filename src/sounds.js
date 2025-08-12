const sfx = {
  move: new Audio('assets/sfx/move.mp3'),
  capture: new Audio('assets/sfx/capture.mp3'),
  extra: new Audio('assets/sfx/extra_turn.mp3'),
  end: new Audio('assets/sfx/end.mp3')
};

let enabled = true;

export function setEnabled(val) {
  enabled = val;
}

export function toggleEnabled() {
  enabled = !enabled;
  return enabled;
}

export function play(name) {
  if (!enabled) return;
  const a = sfx[name];
  if (!a) return;
  a.currentTime = 0;
  a.play();
}
