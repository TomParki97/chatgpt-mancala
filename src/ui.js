import {getLegalMoves} from './engine.js';
import {play} from './sounds.js';

const svgNS = 'http://www.w3.org/2000/svg';
let pitElements = [];

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
  pos.forEach((p, i) => {
    const g = document.createElementNS(svgNS, 'g');
    g.dataset.index = i;
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
  });
  container.appendChild(svg);
  updateBoard(state);
}

export function updateBoard(state) {
  const legal = getLegalMoves(state);
  pitElements.forEach((g,i)=>{
    const t = g.querySelector('text');
    t.textContent = state.pits[i];
    if (g.querySelector('circle')) {
      const isLegal = legal.includes(i);
      g.dataset.legal = isLegal;
      g.setAttribute('aria-disabled', !isLegal);
    }
  });
}

export function animateSow(prevState, pitIndex, summary, speed=200) {
  return new Promise(resolve => {
    const counts = [...prevState.pits];
    counts[pitIndex]=0;
    const startText = pitElements[pitIndex].querySelector('text');
    startText.textContent = 0;
    summary.sowOrder.forEach((idx, i) => {
      setTimeout(() => {
        counts[idx]++;
        pitElements[idx].querySelector('text').textContent = counts[idx];
        play('move');
      }, speed * (i+1));
    });
    const totalTime = speed * summary.sowOrder.length + 50;
    setTimeout(()=> resolve(), totalTime);
  });
}
