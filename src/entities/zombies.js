import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { scene } from '../core/renderer.js';
import { collections, state } from '../state.js';
import { damagePlayer } from '../systems/combat.js';
import { spawnManaOrb } from './projectiles.js';

export function makeZombieMesh() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x7ab85a, roughness: 1 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x7ab85a, roughness: 1, flatShading: true });
  const legMat  = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 1 });
  const eyeMat  = new THREE.MeshBasicMaterial({ color: 0xff2020 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.0, 0.36), bodyMat);
  body.position.y = 1.0; body.castShadow = true; g.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), headMat);
  head.position.y = 1.76; head.castShadow = true; g.add(head);

  [-0.11, 0.11].forEach(x => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.02), eyeMat);
    eye.position.set(x, 1.82, 0.225);
    g.add(eye);
  });

  [-0.42, 0.42].forEach(x => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.75), bodyMat);
    arm.position.set(x, 1.18, 0.42);
    arm.castShadow = true; g.add(arm);
  });

  [-0.17, 0.17].forEach(x => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.68, 0.23), legMat);
    leg.position.set(x, 0.34, 0);
    leg.castShadow = true; g.add(leg);
  });

  return g;
}

export function spawnZombie() {
  const g = makeZombieMesh();
  const angle = Math.random() * Math.PI * 2;
  const dist = 18 + Math.random() * 6;
  let x = state.player.pos.x + Math.cos(angle) * dist;
  let z = state.player.pos.z + Math.sin(angle) * dist;
  const r = Math.hypot(x, z);
  if (r > CONFIG.ISLAND_R - 1.5) { const k = (CONFIG.ISLAND_R - 1.5) / r; x *= k; z *= k; }

  g.position.set(x, CONFIG.GROUND_Y, z);
  scene.add(g);

  const hp = CONFIG.ZOMBIE_HP + Math.floor((state.wave - 1) / 3) * 2;
  collections.zombies.push({
    group: g, hp, maxHp: hp, attackCd: 0,
    walkPhase: Math.random() * 10, flashT: 0, dying: false, dieT: 0,
  });
}

export function updateZombies(dt) {
  for (let i = collections.zombies.length - 1; i >= 0; i--) {
    const z = collections.zombies[i];
    const zp = z.group.position;

    if (z.dying) {
      z.dieT += dt;
      z.group.rotation.z = -Math.min(1, z.dieT * 3) * Math.PI / 2;
      zp.y = CONFIG.GROUND_Y - Math.min(1, z.dieT * 2) * 1.4;
      if (z.dieT > 1.2) {
        scene.remove(z.group);
        collections.zombies.splice(i, 1);
      }
      continue;
    }

    if (z.flashT > 0) {
      z.flashT -= dt;
      if (z.flashT <= 0) restoreZombieColor(z);
    }

    const dx = state.player.pos.x - zp.x;
    const dz = state.player.pos.z - zp.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 1.15) {
      const speed = 2.0 + Math.min(0.9, (state.wave - 1) * 0.055);
      zp.x += (dx / dist) * speed * dt;
      zp.z += (dz / dist) * speed * dt;
      z.walkPhase += dt * 6;
      zp.y = CONFIG.GROUND_Y + Math.abs(Math.sin(z.walkPhase)) * 0.06;
      z.group.rotation.y = Math.atan2(dx, dz);
    } else {
      z.group.rotation.y = Math.atan2(dx, dz);
    }

    z.attackCd -= dt;
    if (dist < 1.5 && z.attackCd <= 0 && state.gameActive) {
      z.attackCd = 1.4;
      damagePlayer(13 + Math.min(9, Math.floor((state.wave - 1) / 2)));
    }
  }
}

export function restoreZombieColor(z) {
  z.group.traverse(o => {
    if (o.isMesh && o.userData.baseEmissive) {
      o.material.emissive.copy(o.userData.baseEmissive);
      o.material.emissiveIntensity = 1;
    }
  });
}