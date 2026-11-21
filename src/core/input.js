import { state } from '../state.js';

const keys = {};
let isDragging = false;
let canvas;

export function initInput(canvasEl, handlers) {
  canvas = canvasEl;

  document.addEventListener('keydown', e => onKeyDown(e, handlers), true);
  document.addEventListener('keyup', e => setKey(e, false), true);
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  document.addEventListener('mousedown', e => onMouseDown(e, handlers));
  document.addEventListener('mouseup', () => { isDragging = false; });
  document.addEventListener('mousemove', e => onMouseMove(e));
  document.addEventListener('contextmenu', e => e.preventDefault());

  canvas.addEventListener('click', () => {
    if (!isLocked() && state.gameActive && !state.paused) requestLock();
  });

  document.addEventListener('pointerlockchange', onLockChange);
  document.addEventListener('pointerlockerror', () => {
    handlers.onLockError?.();
  });
}

function setKey(e, s) {
  if (e.code) keys[e.code] = s;
  if (e.key && e.key.length === 1) keys[e.key.toLowerCase()] = s;
  if (e.key) keys[e.key] = s;
}

function onKeyDown(e, h) {
  const k = e.code;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(k)) e.preventDefault();

  const wasDown = keys[e.code] || (e.key && keys[e.key]);
  setKey(e, true);

  if (!wasDown && state.gameActive && !e.repeat && !state.paused) {
    h.onKeyPress?.(k, e);
  }
  if (!state.gameActive && (k === 'KeyR' || e.key === 'r' || e.key === 'R')) {
    h.onRestart?.();
  }
}

function onMouseDown(e, h) {
  if (!state.gameActive || state.paused) return;
  if (e.target.closest('#click-play') || e.target.closest('#gameover')) return;

  if (e.button === 0) {
    if (isLocked()) h.onAttack?.();
    else { requestLock(); isDragging = true; }
  } else if (e.button === 2) {
    h.onMagic?.();
  }
}

function onMouseMove(e) {
  const mvX = e.movementX, mvY = e.movementY;
  if (mvX === undefined) return;

  if (isLocked() && !state.paused) {
    state.player.yaw -= mvX * 0.0022;
    state.player.pitch -= mvY * 0.0022;
    clampPitch();
  } else if (isDragging) {
    state.player.yaw -= mvX * 0.005;
    state.player.pitch -= mvY * 0.005;
    clampPitch();
  }
}

function clampPitch() {
  const lim = Math.PI / 2 - 0.05;
  state.player.pitch = Math.max(-lim, Math.min(lim, state.player.pitch));
}

function onLockChange() {
  const locked = isLocked();
  document.body.classList.toggle('locked', locked);
  if (state.gameActive) {
    const el = document.getElementById('click-play');
    if (el) el.style.display = locked ? 'none' : 'flex';
  }
}

export function requestLock() {
  if (!state.gameActive) return;
  const el = canvas;
  try { el.requestPointerLock?.(); return; } catch (e) {}
  try { el.mozRequestPointerLock?.(); return; } catch (e) {}
  try { el.webkitRequestPointerLock?.(); return; } catch (e) {}
}

export function exitLock() {
  const d = document;
  try { d.exitPointerLock?.(); } catch (e) {}
  try { d.mozExitPointerLock?.(); } catch (e) {}
  try { d.webkitExitPointerLock?.(); } catch (e) {}
}

export function isLocked() {
  const d = document;
  return d.pointerLockElement === canvas
      || d.mozPointerLockElement === canvas
      || d.webkitPointerLockElement === canvas;
}

export function isKey(code, ch) {
  return keys[code] || keys[ch] || keys[ch?.toUpperCase()];
}

export function isShift() {
  return keys['Shift'] || keys['ShiftLeft'] || keys['ShiftRight'];
}