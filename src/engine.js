import {deepClone, oppositePit} from './utils.js';

export function createGame(config = {}) {
  const seeds = config.seedsPerPit ?? 4;
  const pits = new Array(14).fill(0);
  for (let i = 0; i < 6; i++) pits[i] = pits[i + 7] = seeds;
  return {
    pits,
    currentPlayer: config.firstPlayer ?? 0,
    seedsPerPit: seeds,
    history: []
  };
}

export function getLegalMoves(state) {
  const offset = state.currentPlayer === 0 ? 0 : 7;
  const moves = [];
  for (let i = 0; i < 6; i++) {
    const idx = offset + i;
    if (state.pits[idx] > 0) moves.push(idx);
  }
  return moves;
}

export function applyMove(state, pitIndex) {
  if (!getLegalMoves(state).includes(pitIndex)) throw new Error('Illegal move');
  const snapshot = {...state, history: []};
  const st = deepClone(snapshot);
  st.history = deepClone(state.history);
  st.history.push(deepClone(snapshot));
  let stones = st.pits[pitIndex];
  st.pits[pitIndex] = 0;
  let idx = pitIndex;
  const sowOrder = [];
  while (stones > 0) {
    idx = (idx + 1) % 14;
    if (st.currentPlayer === 0 && idx === 13) continue;
    if (st.currentPlayer === 1 && idx === 6) continue;
    st.pits[idx]++;
    sowOrder.push(idx);
    stones--;
  }
  let capture = null;
  const store = st.currentPlayer === 0 ? 6 : 13;
  const isOwnPit = st.currentPlayer === 0 ? idx >= 0 && idx <=5 : idx >=7 && idx <=12;
  if (isOwnPit && st.pits[idx] === 1) {
    const opp = oppositePit(idx);
    if (st.pits[opp] > 0) {
      capture = {from: opp, to: store, count: st.pits[opp] + 1};
      st.pits[store] += st.pits[opp] + 1;
      st.pits[opp] = 0;
      st.pits[idx] = 0;
    }
  }
  const extraTurn = idx === store;
  if (!extraTurn) st.currentPlayer = 1 - st.currentPlayer;

  let ended = false; let winner = null;
  if (isGameOver(st)) {
    ended = true;
    const p1Remaining = st.pits.slice(0,6).reduce((a,b)=>a+b,0);
    const p2Remaining = st.pits.slice(7,13).reduce((a,b)=>a+b,0);
    st.pits[6] += p1Remaining; st.pits[13] += p2Remaining;
    for (let i=0;i<6;i++) { st.pits[i]=0; st.pits[i+7]=0; }
    if (st.pits[6] > st.pits[13]) winner = 0; else if (st.pits[13] > st.pits[6]) winner = 1; else winner = 'tie';
  }

  return {state: st, summary: {sowOrder, capture, extraTurn, ended, winner}};
}

export function isGameOver(state) {
  const p1Empty = state.pits.slice(0,6).every(p=>p===0);
  const p2Empty = state.pits.slice(7,13).every(p=>p===0);
  return p1Empty || p2Empty;
}

export function serialize(state) {
  return JSON.stringify(state);
}

export function deserialize(str) {
  return JSON.parse(str);
}
