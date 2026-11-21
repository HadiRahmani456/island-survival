import * as THREE from 'three';
import { scene } from '../core/renderer.js';
import { collections } from '../state.js';

export function spawnParticles(pos, count, color, opts = {}) {
  const { gravity = 9, additive = false, speed = 4, life = 0.6, size = 0.08 } = opts;
  for (let i = 0; i < count; i++) {
    const s = size * (0.5 + Math.random());
    const geom = new THREE.SphereGeometry(s, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      transparent: true, opacity: 1, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pos);
    scene.add(mesh);

    const ang = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.3) * Math.PI * 0.7;
    const spd = speed * (0.5 + Math.random());
    const vx = Math.cos(ang) * Math.cos(pitch) * spd;
    const vy = Math.sin(pitch) * spd + 2;
    const vz = Math.sin(ang) * Math.cos(pitch) * spd;
    const l = life * (0.6 + Math.random() * 0.8);

    collections.particles.push({
      mesh, mat, geom,
      life: l, maxLife: l,
      vel: new THREE.Vector3(vx, vy, vz),
      gravity,
    });
  }
}

export function updateParticles(dt) {
  for (let i = collections.particles.length - 1; i >= 0; i--) {
    const p = collections.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      scene.remove(p.mesh);
      p.geom.dispose();
      p.mat.dispose();
      collections.particles.splice(i, 1);
      continue;
    }
    p.vel.y -= p.gravity * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    const k = p.life / p.maxLife;
    p.mat.opacity = k;
    p.mesh.scale.setScalar(0.4 + k * 0.8);
  }
}

export function spawnHitFX(pos, isKill) {
  spawnParticles(pos, isKill ? 22 : 10, 0xffdd44, {
    additive: true, gravity: 6, speed: 5, life: 0.5, size: 0.07,
  });
  if (isKill) {
    spawnParticles(pos, 16, 0xcc1111, { gravity: 14, speed: 5, life: 0.7, size: 0.09 });
    spawnParticles(pos, 8, 0x660000, { gravity: 12, speed: 3, life: 0.9, size: 0.11 });
  }
  spawnParticles(pos, 4, 0xffffff, { additive: true, gravity: 1, speed: 2, life: 0.3, size: 0.15 });
}

export function spawnCraftFX(pos) {
  spawnParticles(pos, 18, 0xffdd44, { additive: true, gravity: -3, speed: 3, life: 0.8, size: 0.08 });
  spawnParticles(pos, 10, 0xffffff, { additive: true, gravity: -4, speed: 2, life: 0.6, size: 0.1 });
}