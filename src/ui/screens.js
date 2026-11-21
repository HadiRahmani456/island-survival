import { state } from '../state.js';
import { exitLock, requestLock } from '../core/input.js';

export function bindUI() {
  document.getElementById('resume-btn').addEventListener('click', () => togglePause(false));
  document.getElementById('restart-btn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    location.reload();
  });
  document.getElementById('click-play').addEventListener('mousedown', (e) => {
    e.preventDefault();
    requestLock();
  });
  document.getElementById('click-play').addEventListener('click', () => requestLock());
}

export function togglePause(force) {
  if (!state.gameActive) return;
  state.paused = typeof force === 'boolean' ? force : !state.paused;
  document.getElementById('pause-screen').style.display = state.paused ? 'flex' : 'none';
  if (state.paused) exitLock();
  else requestLock();
}

export function showGameOver() {
  state.gameActive = false;
  exitLock();
  document.getElementById('click-play').style.display = 'none';
  document.getElementById('gameover').style.display = 'flex';
  document.getElementById('final-kills').textContent = state.kills.toLocaleString('fa-IR');
  document.getElementById('final-wave').textContent = state.wave.toLocaleString('fa-IR');
  const s = Math.max(0, Math.floor(state.survivalSeconds));
  document.getElementById('final-time').textContent =
    Math.floor(s / 60).toLocaleString('fa-IR').padStart(2, '۰') + ':' +
    (s % 60).toLocaleString('fa-IR').padStart(2, '۰');
  document.getElementById('pause-screen').style.display = 'none';
  document.body.classList.remove('locked');
}