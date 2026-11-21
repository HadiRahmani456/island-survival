import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { spawnCraftFX } from '../systems/particles.js';
import { setWeapon } from './viewmodels.js';

export function craftSword(toastFn) {
  if (!state.gameActive) return;
  if (state.inventory.swordDur > 0) { toastFn('تو قبلاً شمشیر داری! ⚔️'); return; }
  if (state.inventory.stone >= 2 && state.inventory.wood >= 1) {
    state.inventory.stone -= 2;
    state.inventory.wood -= 1;
    state.inventory.swordDur = CONFIG.MAX_DURABILITY;
    setWeapon('sword');
    toastFn('شمشیر ساخته شد! ⚔️');
    spawnCraftFX(state.player.pos.clone().add(new THREE.Vector3(0, -0.5, -0.5)));
  } else toastFn('برای شمشیر: ۲ سنگ + ۱ چوب');
}

export function craftAxe(toastFn) {
  if (!state.gameActive) return;
  if (state.inventory.axeDur > 0) { toastFn('تو قبلاً تبر داری! 🪓'); return; }
  if (state.inventory.stone >= 2 && state.inventory.wood >= 2) {
    state.inventory.stone -= 2;
    state.inventory.wood -= 2;
    state.inventory.axeDur = CONFIG.MAX_DURABILITY;
    setWeapon('axe');
    toastFn('تبر ساخته شد! 🪓');
    spawnCraftFX(state.player.pos.clone().add(new THREE.Vector3(0, -0.5, -0.5)));
  } else toastFn('برای تبر: ۲ سنگ + ۲ چوب');
}

export function craftBow(toastFn) {
  if (!state.gameActive) return;
  if (state.inventory.bowDur > 0) { toastFn('تو قبلاً کمان داری! 🏹'); return; }
  if (state.inventory.stone >= 1 && state.inventory.wood >= 3) {
    state.inventory.stone -= 1;
    state.inventory.wood -= 3;
    state.inventory.bowDur = CONFIG.MAX_DURABILITY;
    setWeapon('bow');
    toastFn('کمان ساخته شد! 🏹');
    spawnCraftFX(state.player.pos.clone().add(new THREE.Vector3(0, -0.5, -0.5)));
  } else toastFn('برای کمان: ۳ چوب + ۱ سنگ');
}

export function craftArrows(toastFn) {
  if (!state.gameActive) return;
  if (state.inventory.wood < 1) { toastFn('برای تیر: ۱ چوب'); return; }
  state.inventory.wood -= 1;
  state.inventory.arrows += 5;
  toastFn('+۵ تیر ➶');
  spawnCraftFX(state.player.pos.clone().add(new THREE.Vector3(0, -0.5, -0.5)));
}

export function eatFruit(toastFn) {
  if (!state.gameActive) return;
  if (state.inventory.fruits <= 0) { toastFn('میوه نداری (از درخت میوه با E بردار)'); return; }
  if (state.hp >= 100) { toastFn('جانت پره!'); return; }
  state.inventory.fruits--;
  state.hp = Math.min(100, state.hp + 30);
  toastFn('+۳۰ جان 🍎');
}