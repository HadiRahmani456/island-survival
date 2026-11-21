import { CONFIG, WEAPONS } from '../config.js';
import { state } from '../state.js';

const $ = id => document.getElementById(id);
const fa = n => n.toLocaleString('fa-IR');

let toastTimer = null;

export function showToast(text, ms = 1400) {
  const el = $('toast');
  if (!el) return;
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, ms);
}

export function flashDamage() {
  const v = $('vignette');
  v.classList.add('hit');
  setTimeout(() => v.classList.remove('hit'), 220);
}

export function showHitMarker() {
  const ch = $('crosshair');
  ch.classList.add('hit');
  setTimeout(() => ch.classList.remove('hit'), 110);
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return fa(Math.floor(s / 60)).padStart(2, '۰') + ':' + fa(s % 60).padStart(2, '۰');
}

export function updateHUD() {
  $('h-stone').textContent = fa(state.inventory.stone);
  $('h-wood').textContent = fa(state.inventory.wood);
  $('h-arrows').textContent = fa(state.inventory.arrows);
  $('h-mana').textContent = fa(state.inventory.mana);
  $('h-fruit').textContent = fa(state.inventory.fruits);
  const kn = $('kills-num');
  kn.textContent = fa(state.kills);
  kn.classList.remove('pop');
  void kn.offsetWidth;
  kn.classList.add('pop');
  updateWeaponHUD();
  updateHPBar();
}

export function updateWeaponHUD() {
  const w = WEAPONS[state.currentWeapon];
  $('cur-weapon').textContent = w.icon + ' ' + w.label;
  const durRow = $('durability-row');
  if (state.currentWeapon === 'fist') {
    durRow.style.display = 'none';
  } else {
    durRow.style.display = 'block';
    const dur = state.inventory[state.currentWeapon + 'Dur'];
    $('durability').textContent = fa(dur) + '/' + fa(CONFIG.MAX_DURABILITY);
    if (dur <= 5) durRow.classList.add('low');
    else durRow.classList.remove('low');
  }
}

export function updateHPBar() {
  const fill = $('hp-fill');
  fill.style.width = state.hp + '%';
  $('hp-num').textContent = fa(state.hp);
  if (state.hp > 60) {
    fill.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a, #b9e86e)';
    fill.classList.remove('low');
  } else if (state.hp > 30) {
    fill.style.background = 'linear-gradient(90deg, #ff9800, #ffc107, #ffd54f)';
    fill.classList.remove('low');
  } else {
    fill.style.background = 'linear-gradient(90deg, #f44336, #e91e63, #ff5252)';
    fill.classList.add('low');
  }
}

export function updateSurvivalHUD() {
  $('day-num').textContent = fa(state.dayNumber);
  $('wave-num').textContent = fa(state.wave);
  $('survival-time').textContent = formatClock(state.survivalSeconds);
  $('stamina-fill').style.width = state.stamina + '%';
  $('stamina-fill').style.background = state.stamina < 25
    ? 'linear-gradient(90deg,#ff5252,#ff9b62)'
    : 'linear-gradient(90deg,#32d6a0,#b4f36b)';
}