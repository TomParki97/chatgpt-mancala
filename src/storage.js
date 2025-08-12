const KEY = 'mancala_settings_v1';

const DEFAULTS = {
  p1Name: 'Player 1',
  p2Name: 'Player 2',
  seedsPerPit: 4,
  firstPlayer: 0,
  theme: 'light',
  sound: true
};

export function loadSettings() {
  try {
    const obj = JSON.parse(localStorage.getItem(KEY));
    return {...DEFAULTS, ...obj};
  } catch (e) {
    return {...DEFAULTS};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
