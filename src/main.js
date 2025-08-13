import {createGame, applyMove} from './engine.js';
import {initBoard, updateBoard, animateSow} from './ui.js';
import {loadSettings, saveSettings} from './storage.js';
import {applyTheme, toggleTheme} from './theme.js';
import {setEnabled as setSoundEnabled, toggleEnabled as toggleSound, play} from './sounds.js';
import {registerShortcuts} from './accessibility.js';

let settings = loadSettings();
applyTheme(settings.theme);
setSoundEnabled(settings.sound);

const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const boardContainer = document.getElementById('board-container');
const turnBanner = document.getElementById('turn-banner');

// populate home inputs
const p1Input = document.getElementById('p1-name');
const p2Input = document.getElementById('p2-name');
const seedSelect = document.getElementById('seed-count');
const firstSelect = document.getElementById('first-player');
const speedSelect = document.getElementById('anim-speed');
p1Input.value = settings.p1Name; p2Input.value = settings.p2Name;
seedSelect.value = settings.seedsPerPit;
firstSelect.value = settings.firstPlayer;
speedSelect.value = settings.animSpeed;

let gameState = null; let inputLocked = false;

function startGame() {
  settings.p1Name = p1Input.value || 'Player 1';
  settings.p2Name = p2Input.value || 'Player 2';
  settings.seedsPerPit = parseInt(seedSelect.value,10);
  settings.firstPlayer = firstSelect.value;
  settings.animSpeed = speedSelect.value;
  saveSettings(settings);
  let first = settings.firstPlayer;
  if (first === 'rand') first = Math.random() < 0.5 ? 0 : 1;
  else first = parseInt(first,10);
  gameState = createGame({seedsPerPit: settings.seedsPerPit, firstPlayer:first});
  initBoard(boardContainer, gameState, pit => handlePit(pit));
  updateTurnBanner();
  showScreen(gameScreen);
}

function showScreen(el) {
  [homeScreen, gameScreen, endScreen].forEach(s=>s.hidden=true);
  el.hidden=false;
}

function updateTurnBanner() {
  const name = gameState.currentPlayer === 0 ? settings.p1Name : settings.p2Name;
  turnBanner.textContent = `${name}'s turn`;
}

function handlePit(pitIndex) {
  if (inputLocked) return;
  const result = applyMove(gameState, pitIndex);
  inputLocked = true;
  animateSow(gameState, pitIndex, result.summary, result.state, settings.animSpeed).then(()=>{
    gameState = result.state;
    inputLocked = false;
    if (result.summary.capture) play('capture');
    if (result.summary.extraTurn) play('extra');
    if (result.summary.ended) {
      play('end');
      showEnd(result.summary.winner);
    } else {
      updateTurnBanner();
    }
  });
}

function showEnd(winner) {
  const title = document.getElementById('end-title');
  const scores = document.getElementById('end-scores');
  const p1 = gameState.pits[6]; const p2 = gameState.pits[13];
  if (winner === 'tie') title.textContent = "It's a tie!";
  else title.textContent = `${winner===0?settings.p1Name:settings.p2Name} wins!`;
  scores.textContent = `${settings.p1Name}: ${p1} – ${settings.p2Name}: ${p2}`;
  showScreen(endScreen);
}

// Button bindings
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => startGame());
document.getElementById('home-btn').addEventListener('click', ()=> showScreen(homeScreen));
document.getElementById('play-again-btn').addEventListener('click', startGame);
document.getElementById('end-home-btn').addEventListener('click', ()=> showScreen(homeScreen));

document.getElementById('theme-toggle').addEventListener('click', ()=>{
  settings.theme = toggleTheme(settings.theme);
  saveSettings(settings);
});

document.getElementById('sound-toggle').addEventListener('click', ()=>{
  settings.sound = toggleSound();
  saveSettings(settings);
});

function cycleAnimSpeed() {
  const order = ['normal', 'fast', 'instant'];
  const idx = order.indexOf(settings.animSpeed);
  settings.animSpeed = order[(idx + 1) % order.length];
  speedSelect.value = settings.animSpeed;
  saveSettings(settings);
}

registerShortcuts({
  restart: startGame,
  mute: ()=>{settings.sound=toggleSound();saveSettings(settings);},
  cycleSpeed: () => { if (!gameScreen.hidden) cycleAnimSpeed(); }
});
