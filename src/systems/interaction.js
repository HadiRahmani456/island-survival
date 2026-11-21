import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { scene } from '../core/renderer.js';
import { collections, state } from '../state.js';
import { spawnParticles } from './particles.js';

export function findResourceInCone(range, minDot) {
  const fwdX = -Math.sin(state.player.yaw);
  const fwdZ = -Math.cos(state.player.yaw);
  let best = null, bestDist = range;

  const check = (res) => {
    const p = res.group.position;
    const dx = p.x - state.player.pos.x;
    const dz = p.z - state.player.pos.z;
    const d = Math.hypot(dx, dz);
    if (d > bestDist) return;
    if (d < 0.6) { bestDist = d; best = res; return; }
    const dot = (dx * fwdX + dz * fwdZ) / d;
    if (dot < minDot) return;
    bestDist = d;
    best = res;
  };

  for (const tr of collections.trees) if (!tr.dead) check(tr);
  for (const s of collections.stones) check(s);
  for (const s of collections.sticks) check(s);

  return best;
}

export function interact(toastFn) {
  if (!state.gameActive) return;
  const tgt = findResourceInCone(CONFIG.REACH, 0.5);
  if (!tgt) { toastFn('چیزی نزدیکت نیست'); return; }

  if (tgt.type === 'stone') {
    spawnParticles(tgt.group.position.clone().setY(0.5), 10, 0x9aa3ab, {
      gravity: 10, speed: 3, life: 0.6, size: 0.07,
    });
    scene.remove(tgt.group);
    collections.stones.splice(collections.stones.indexOf(tgt), 1);
    state.inventory.stone++;
    toastFn('+۱ سنگ 🪨');
  } else if (tgt.type === 'stick') {
    spawnParticles(tgt.group.position.clone().setY(0.3), 8, 0x8a5a2b, {
      gravity: 8, speed: 3, life: 0.5, size: 0.06,
    });
    scene.remove(tgt.group);
    collections.sticks.splice(collections.sticks.indexOf(tgt), 1);
    state.inventory.wood++;
    toastFn('+۱ چوب 🪵');
  } else if (tgt.type === 'tree') {
    if (tgt.isFruit) {
      if (tgt.fruitCount > 0) {
        tgt.fruitCount--;
        const idx = tgt.fruitMeshes.findIndex(f => f.visible);
        if (idx >= 0) tgt.fruitMeshes[idx].visible = false;
        state.inventory.fruits++;
        spawnParticles(tgt.group.position.clone().setY(4), 8, 0xff5a3a, {
          gravity: 5, speed: 3, life: 0.7, size: 0.09,
        });
        toastFn('+۱ میوه 🍎');
      } else {
        toastFn('میوه ندارد — صبر کن');
      }
    } else {
      if (state.inventory.axeDur <= 0) {
        toastFn('برای قطع درخت باید تبر داشته باشی (C)');
        return;
      }
      tgt.hp--;
      tgt.shakeT = 0.30;
      state.inventory.wood++;
      const pPos = tgt.group.position.clone();
      pPos.y = 2 + Math.random() * 1.5;
      spawnParticles(pPos, 12, 0x8a5a2b, { gravity: 10, speed: 4, life: 0.7, size: 0.08 });
      toastFn('+۱ چوب 🪵');
      if (tgt.hp <= 0) {
        tgt.dead = true;
        tgt.timer = 9;
        tgt.fallT = 0;
        toastFn('درخت افتاد! 🎉');
        state.shakeAmount = Math.max(state.shakeAmount, 0.3);
      }
    }
  }
}