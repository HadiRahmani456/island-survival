import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { camera } from '../core/renderer.js';
import { state } from '../state.js';
import { isKey, isShift } from '../core/input.js';
import { spawnParticles } from '../systems/particles.js';
import { animateViewmodel } from '../items/viewmodels.js';

export function updatePlayer(dt) {
  const p = state.player;

  let dx = 0, dz = 0;
  if (state.gameActive) {
    if (isKey('KeyW', 'w') || isKey('ArrowUp'))    dz -= 1;
    if (isKey('KeyS', 's') || isKey('ArrowDown'))  dz += 1;
    if (isKey('KeyA', 'a') || isKey('ArrowLeft'))  dx -= 1;
    if (isKey('KeyD', 'd') || isKey('ArrowRight')) dx += 1;
  }

  const moving = (dx !== 0 || dz !== 0);

  if (moving) {
    const fwdX = -Math.sin(p.yaw), fwdZ = -Math.cos(p.yaw);
    const rgtX =  Math.cos(p.yaw), rgtZ = -Math.sin(p.yaw);
    let mx = fwdX * (-dz) + rgtX * dx;
    let mz = fwdZ * (-dz) + rgtZ * dx;
    const len = Math.hypot(mx, mz);

    if (len > 0.0001) {
      mx /= len; mz /= len;
      const sprinting = isShift() && state.stamina > 2;
      const speed = sprinting ? 9.2 : 6.0;

      if (sprinting) state.stamina = Math.max(0, state.stamina - 26 * dt);
      else           state.stamina = Math.min(100, state.stamina + 14 * dt);

      p.pos.x += mx * speed * dt;
      p.pos.z += mz * speed * dt;

      const r = Math.hypot(p.pos.x, p.pos.z);
      if (r > CONFIG.ISLAND_R) {
        p.pos.x *= CONFIG.ISLAND_R / r;
        p.pos.z *= CONFIG.ISLAND_R / r;
      }
    }

    state.walkPhase += dt * 10;

    state.footstepT += dt;
    if (state.footstepT > 0.32) {
      state.footstepT = 0;
      const fp = p.pos.clone();
      fp.y = CONFIG.GROUND_Y + 0.05;
      fp.x += (Math.random() - 0.5) * 0.4;
      fp.z += (Math.random() - 0.5) * 0.4;
      spawnParticles(fp, 2, 0xd8c898, { gravity: 2, speed: 1, life: 0.5, size: 0.08 });
    }
  } else {
    state.stamina = Math.min(100, state.stamina + 22 * dt);
    state.walkPhase *= Math.pow(0.001, dt);
  }

  // دوربین
  const bob = moving ? Math.sin(state.walkPhase) * 0.045 : 0;
  const breathe = moving ? 0 : Math.sin(state.time * 1.6) * 0.015;

  state.shakeAmount = Math.max(0, state.shakeAmount - 6 * dt);
  const sx = (Math.random() - 0.5) * state.shakeAmount * 0.15;
  const sy = (Math.random() - 0.5) * state.shakeAmount * 0.15;

  camera.position.set(p.pos.x + sx, p.pos.y + bob + breathe + sy, p.pos.z);
  camera.rotation.y = p.yaw + sx * 0.05;
  camera.rotation.x = p.pitch + sy * 0.05;

  animateViewmodel(dt, moving);
}

export function triggerShake(amount) {
  state.shakeAmount = Math.max(state.shakeAmount, amount);
}