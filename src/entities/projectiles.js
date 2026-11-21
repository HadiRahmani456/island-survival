import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { scene, camera, radialTexture } from '../core/renderer.js';
import { collections, state } from '../state.js';
import { damageZombie } from '../systems/combat.js';
import { spawnParticles } from '../systems/particles.js';

export function spawnArrow() {
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const group = new THREE.Group();

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.65, 6),
    new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.8 })
  );
  group.add(shaft);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.045, 0.12, 6),
    new THREE.MeshStandardMaterial({
      color: 0xddeeff, metalness: 0.85, roughness: 0.2,
      emissive: 0x6688bb, emissiveIntensity: 0.2,
    })
  );
  tip.position.y = 0.38;
  group.add(tip);

  const fletch = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.12, 0.008),
    new THREE.MeshStandardMaterial({ color: 0xff5555, roughness: 0.9 })
  );
  fletch.position.y = -0.28;
  group.add(fletch);

  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), fwd);
  group.position.copy(state.player.pos).addScaledVector(fwd, 0.6);
  scene.add(group);

  collections.arrows.push({
    mesh: group,
    vel: fwd.clone().multiplyScalar(38),
    damage: 5,
    life: 2.5,
  });
}

export function spawnManaOrb(pos) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x66ccff })
  );
  mesh.position.copy(pos);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(100,180,255,0.9)', 'rgba(100,180,255,0)'),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  }));
  glow.scale.set(1.4, 1.4, 1);
  mesh.add(glow);

  scene.add(mesh);
  collections.manaOrbs.push({
    mesh, amount: CONFIG.MANA_DROP, life: 12,
    vel: new THREE.Vector3((Math.random()-0.5) * 2, 3.5, (Math.random()-0.5) * 2),
    phase: Math.random() * Math.PI * 2,
    homingDelay: 0.4,
  });
}

export function spawnFireball() {
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffaa22 })
  );
  group.add(core);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(255,180,50,1)', 'rgba(255,80,0,0)'),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  }));
  glow.scale.set(2.5, 2.5, 1);
  group.add(glow);

  const light = new THREE.PointLight(0xff6600, 3, 8);
  group.add(light);

  group.position.copy(state.player.pos).addScaledVector(fwd, 0.8);
  scene.add(group);

  collections.fireballs.push({
    group, light,
    vel: fwd.clone().multiplyScalar(20),
    life: 2.5, radius: 2.5, damage: 6, trailT: 0,
  });
}

export function updateProjectiles(dt) {
  updateArrows(dt);
  updateFireballs(dt);
  updateManaOrbs(dt);
}

function updateArrows(dt) {
  for (let i = collections.arrows.length - 1; i >= 0; i--) {
    const a = collections.arrows[i];
    a.life -= dt;
    a.vel.y -= 0.5 * dt;
    a.mesh.position.addScaledVector(a.vel, dt);

    a.mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      a.vel.clone().normalize()
    );

    let hit = false;
    for (const z of collections.zombies) {
      if (z.dying) continue;
      const zp = z.group.position.clone(); zp.y += 1.1;
      if (a.mesh.position.distanceTo(zp) < 1.0) {
        damageZombie(z, a.damage);
        spawnParticles(a.mesh.position.clone(), 5, 0xffdd44, {
          additive: true, gravity: 3, speed: 3, life: 0.4, size: 0.05,
        });
        hit = true; break;
      }
    }
    if (!hit && a.mesh.position.y < CONFIG.GROUND_Y + 0.1) {
      spawnParticles(a.mesh.position.clone(), 4, 0xd8c898, {
        gravity: 5, speed: 2, life: 0.4, size: 0.05,
      });
      hit = true;
    }
    if (hit || a.life <= 0) {
      scene.remove(a.mesh);
      collections.arrows.splice(i, 1);
    }
  }
}

function updateFireballs(dt) {
  for (let i = collections.fireballs.length - 1; i >= 0; i--) {
    const fb = collections.fireballs[i];
    fb.life -= dt;
    fb.group.position.addScaledVector(fb.vel, dt);

    fb.trailT -= dt;
    if (fb.trailT <= 0) {
      fb.trailT = 0.03;
      spawnParticles(fb.group.position.clone(), 1, 0xff8800, {
        additive: true, gravity: -1, speed: 0.5, life: 0.35, size: 0.16,
      });
    }

    let exploded = false;
    for (const z of collections.zombies) {
      if (z.dying) continue;
      const zp = z.group.position.clone(); zp.y += 1;
      if (fb.group.position.distanceTo(zp) < 1.0) { exploded = true; break; }
    }
    if (!exploded && fb.group.position.y < CONFIG.GROUND_Y + 0.2) exploded = true;
    if (!exploded && fb.life <= 0) exploded = true;

    if (exploded) {
      explodeFireball(fb);
      collections.fireballs.splice(i, 1);
    }
  }
}

function explodeFireball(fb) {
  const ep = fb.group.position.clone();

  for (const z of collections.zombies) {
    if (z.dying) continue;
    const zp = z.group.position.clone(); zp.y += 1;
    if (ep.distanceTo(zp) < fb.radius) damageZombie(z, fb.damage);
  }

  spawnParticles(ep, 30, 0xff6600, { additive: true, gravity: 4, speed: 8, life: 0.7, size: 0.15 });
  spawnParticles(ep, 15, 0xffdd44, { additive: true, gravity: 2, speed: 6, life: 0.5, size: 0.12 });
  spawnParticles(ep, 10, 0x222222, { gravity: 1, speed: 4, life: 1.0, size: 0.2 });

  state.shakeAmount = Math.max(state.shakeAmount, 0.4);

  scene.remove(fb.group);
}

function updateManaOrbs(dt) {
  for (let i = collections.manaOrbs.length - 1; i >= 0; i--) {
    const orb = collections.manaOrbs[i];
    orb.life -= dt;
    orb.phase += dt * 4;

    if (orb.homingDelay > 0) {
      orb.homingDelay -= dt;
      orb.vel.y -= 8 * dt;
      orb.mesh.position.addScaledVector(orb.vel, dt);
      if (orb.mesh.position.y < CONFIG.GROUND_Y + 0.3) {
        orb.mesh.position.y = CONFIG.GROUND_Y + 0.3;
        orb.vel.y = 0;
      }
    } else {
      const to = state.player.pos.clone().sub(orb.mesh.position);
      const d = to.length();
      if (d < 0.9) {
        state.inventory.mana = Math.min(100, state.inventory.mana + orb.amount);
        spawnParticles(orb.mesh.position.clone(), 8, 0x66ccff, {
          additive: true, gravity: 0, speed: 2, life: 0.5, size: 0.08,
        });
        scene.remove(orb.mesh);
        collections.manaOrbs.splice(i, 1);
        continue;
      }
      to.normalize().multiplyScalar(9);
      orb.mesh.position.addScaledVector(to, dt);
    }
    orb.mesh.position.y += Math.sin(orb.phase) * 0.012;

    if (orb.life <= 0) {
      scene.remove(orb.mesh);
      collections.manaOrbs.splice(i, 1);
    }
  }
}