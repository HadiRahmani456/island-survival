import * as THREE from 'three';
import { CONFIG, WEAPONS } from '../config.js';
import { scene, camera } from '../core/renderer.js';
import { collections, state } from '../state.js';
import { spawnHitFX, spawnParticles } from './particles.js';
import { spawnArrow, spawnFireball as spawnFireballProj } from '../entities/projectiles.js';
import { spawnManaOrb } from '../entities/projectiles.js';
import { setWeapon } from '../items/viewmodels.js';

export function tryAttack(toastFn) {
  if (!state.gameActive || state.attackCd > 0) return;

  const w = WEAPONS[state.currentWeapon];

  if (state.currentWeapon !== 'fist') {
    const durKey = state.currentWeapon + 'Dur';
    if (state.inventory[durKey] <= 0) { setWeapon('fist'); return; }
  }
  if (state.currentWeapon === 'bow' && state.inventory.arrows <= 0) {
    toastFn?.('تیر نداری! (V برای ساخت)');
    return;
  }

  state.attackCd = w.cooldown;
  state.swingT = 0;
  state.swingActive = true;
  state.swingDur =
    state.currentWeapon === 'bow'   ? 0.55 :
    state.currentWeapon === 'axe'   ? 0.40 :
    state.currentWeapon === 'sword' ? 0.28 : 0.28;

  if (state.currentWeapon === 'bow') {
    state.inventory.arrows--;
    spawnArrow();
  } else {
    doMeleeAttack(w);
  }

  if (state.currentWeapon !== 'fist') {
    state.inventory[state.currentWeapon + 'Dur']--;
    if (state.inventory[state.currentWeapon + 'Dur'] <= 0) {
      toastFn?.('سلاح شکست! 💔');
      setTimeout(() => setWeapon('fist'), 40);
    }
  }
}

function doMeleeAttack(w) {
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const eye = state.player.pos;
  let hit = null, hitDist = w.range;

  for (const z of collections.zombies) {
    if (z.dying) continue;
    const zp = z.group.position.clone(); zp.y += 1.1;
    const to = zp.sub(eye);
    const d = to.length();
    if (d > hitDist) continue;
    const dot = to.normalize().dot(fwd);
    if (dot < 0.45) continue;
    hitDist = d; hit = z;
  }

  if (hit) damageZombie(hit, w.damage);
}

export function damageZombie(z, dmg) {
  if (z.dying) return;
  z.hp -= dmg;
  state.shakeAmount = Math.max(state.shakeAmount, 0.15);

  const hitPos = z.group.position.clone();
  hitPos.y += 1.2;

  z.group.traverse(o => {
    if (o.isMesh && o.material && o.material.emissive) {
      if (!o.userData.baseEmissive) o.userData.baseEmissive = o.material.emissive.clone();
      o.material.emissive.set(0xff2222);
      o.material.emissiveIntensity = 0.9;
    }
  });
  z.flashT = 0.15;

  const kb = new THREE.Vector3(
    z.group.position.x - state.player.pos.x, 0,
    z.group.position.z - state.player.pos.z
  );
  if (kb.lengthSq() > 0.001) {
    kb.normalize().multiplyScalar(0.35);
    z.group.position.x += kb.x;
    z.group.position.z += kb.z;
  }

  const killed = z.hp <= 0;
  spawnHitFX(hitPos, killed);

  if (killed) {
    z.dying = true;
    z.dieT = 0;
    state.kills++;
    spawnManaOrb(z.group.position.clone().add(new THREE.Vector3(0, 1, 0)));
  }
}

export function damagePlayer(amount) {
  if (!state.gameActive) return;
  state.hp = Math.max(0, state.hp - amount);
  if (state.hp <= 0) gameOver();
}

export function castFireball(toastFn) {
  if (!state.gameActive || state.attackCd > 0) return;
  if (state.inventory.mana < CONFIG.FIREBALL_COST) {
    toastFn?.('مانا کافی نیست! (' + CONFIG.FIREBALL_COST + ' نیاز)');
    return;
  }
  state.inventory.mana -= CONFIG.FIREBALL_COST;
  state.attackCd = 0.6;
  spawnFireballProj();
}

function gameOver() {
  state.gameActive = false;
  // ایمپورت دینامیک برای جلوگیری از حلقه
  import('../ui/screens.js').then(m => m.showGameOver());
}