import {getLegalMoves} from './engine.js';
import {play} from './sounds.js';

const svgNS = 'http://www.w3.org/2000/svg';
const ENABLE_PERF_LOG = false;
let pitElements = [];
let pitTexts = [];
let currentFrame = null;
let currentAnimId = 0;

function stopAnimFrame() {
  if (currentFrame !== null) {
    cancelAnimationFrame(currentFrame);
    currentFrame = null;
  }
}

export function cancelAnim() {
  stopAnimFrame();
  currentAnimId++;
}

export function initBoard(container, state, onPitSelect) {
  container.innerHTML = '';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('board');
  svg.setAttribute('viewBox', '0 0 240 100');
  const pos = [
    {x:45,y:70},{x:75,y:70},{x:105,y:70},{x:135,y:70},{x:165,y:70},{x:195,y:70},
    {x:225,y:50,store:true},
    {x:195,y:30},{x:165,y:30},{x:135,y:30},{x:105,y:30},{x:75,y:30},{x:45,y:30},
    {x:15,y:50,store:true}
  ];
  pitElements = [];
  pitTexts = [];
  pos.forEach((p, i) => {
    const g = document.createElementNS(svgNS, 'g');
    g.dataset.index = i;
    g.dataset.pit = p.store ? '' : '1';
    if (p.store) {
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', p.x-15); rect.setAttribute('y', 15); rect.setAttribute('width',30); rect.setAttribute('height',70); rect.setAttribute('rx',15); rect.setAttribute('ry',15);
      rect.setAttribute('class','store');
      g.appendChild(rect);
    } else {
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r',14); c.setAttribute('class','pit');
      g.appendChild(c);
      g.tabIndex = 0;
      g.addEventListener('click', ()=> onPitSelect(i));
      g.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){e.preventDefault(); onPitSelect(i);} });
    }
    const t = document.createElementNS(svgNS,'text');
    t.setAttribute('x', p.x); t.setAttribute('y', p.store?50:p.y); t.setAttribute('class','pit-count');
    g.appendChild(t);
    svg.appendChild(g);
    pitElements[i] = g;
    pitTexts[i] = t;
  });
  container.appendChild(svg);
  updateBoard(state);
}

export function updateBoard(state) {
  const legal = getLegalMoves(state);
  pitElements.forEach((g,i)=>{
    const t = pitTexts[i];
    const val = state.pits[i];
    if (t.textContent !== String(val)) t.textContent = val;
    if (g.dataset.pit) {
      const isLegal = legal.includes(i);
      if (g.dataset.legal !== String(isLegal)) {
        g.dataset.legal = isLegal;
        g.setAttribute('aria-disabled', !isLegal);
      }
    }
  });
}

function computeTotalDuration(len, speed) {
  if (speed === 'instant') return 0;
  const per = speed === 'fast' ? 25 : 50;
  const min = speed === 'fast' ? 250 : 450;
  const max = speed === 'fast' ? 450 : 800;
  return Math.min(max, Math.max(min, per * len));
}

export function animateSow(prevState, pitIndex, summary, resultingState, speed='normal') {
  cancelAnim();
  const animId = currentAnimId;
  const len = summary.sowOrder.length;
  const totalDuration = computeTotalDuration(len, speed);

  if (totalDuration === 0) {
    updateBoard(resultingState);
    return Promise.resolve();
  }

  const perDrop = totalDuration / Math.max(len, 1);
  const counts = [...prevState.pits];
  counts[pitIndex] = 0;
  pitTexts[pitIndex].textContent = 0;

  let dropIndex = 0;
  let nextDrop = perDrop;
  const start = performance.now();

  return new Promise(resolve => {
    function step(now) {
      if (animId !== currentAnimId) return resolve();
      const elapsed = now - start;
      while (dropIndex < len && elapsed >= nextDrop) {
        const idx = summary.sowOrder[dropIndex];
        counts[idx]++;
        pitTexts[idx].textContent = counts[idx];
        if (dropIndex % 3 === 0) play('move');
        dropIndex++;
        nextDrop += perDrop;
      }
      if (dropIndex < len && elapsed < totalDuration) {
        currentFrame = requestAnimationFrame(step);
      } else {
        stopAnimFrame();
        updateBoard(resultingState);
        if (ENABLE_PERF_LOG) {
          const actual = performance.now() - start;
          console.log('animateSow', {len, totalDuration, actual});
        }
        resolve();
      }
    }
    currentFrame = requestAnimationFrame(step);
  });
}

export function debugAnimate(length = 50, speed='normal') {
  if (pitTexts.length === 0) {
    pitTexts = Array.from({length:14}, () => ({textContent:'0'}));
    pitElements = pitTexts.map(() => ({dataset:{pit:'1'}, setAttribute(){}}));
  }
  const prev = {pits:Array(14).fill(0), currentPlayer:0};
  const sowOrder = Array.from({length}, (_,i)=> i%14);
  const result = {pits:[...prev.pits], currentPlayer:0};
  sowOrder.forEach(idx => result.pits[idx]++);
  return animateSow(prev, 0, {sowOrder}, result, speed);
}
