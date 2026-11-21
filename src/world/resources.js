import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { scene, radialTexture } from '../core/renderer.js';
import { collections } from '../state.js';

export function addStone(x, z) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({
      color: 0x9aa3ab, roughness: 0.85, flatShading: true, metalness: 0.15,
    })
  );
  m.position.y = 0.32;
  m.scale.set(1, 0.85, 1);
  m.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
  m.castShadow = true; m.receiveShadow = true;
  g.add(m);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(180,220,255,0.4)', 'rgba(180,220,255,0)'),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  }));
  glow.scale.set(1.4, 1.4, 1);
  glow.position.y = 0.35;
  g.add(glow);

  g.position.set(x, CONFIG.GROUND_Y, z);
  scene.add(g);
  collections.stones.push({ type: 'stone', group: g });
}

export function addStick(x, z) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 1.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.9 })
    );
    s.rotation.z = Math.PI / 2;
    s.rotation.y = (Math.random() - 0.5) * 1.4;
    s.position.y = 0.1 + i * 0.08;
    s.position.x = (Math.random() - 0.5) * 0.2;
    s.position.z = (Math.random() - 0.5) * 0.2;
    s.castShadow = true;
    g.add(s);
  }
  g.position.set(x, CONFIG.GROUND_Y, z);
  scene.add(g);
  collections.sticks.push({ type: 'stick', group: g });
}

export function updateResourceSpawn(dt, randomPosFn) {
  // فراخوانی این تابع توی main با state.spawnT کار می‌کنه
}