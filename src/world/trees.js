import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { scene } from '../core/renderer.js';
import { collections } from '../state.js';

export function makeTreeMesh() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.42, 3.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x6a3e1f, roughness: 0.95, flatShading: true })
  );
  trunk.position.y = 1.5;
  trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);

  const baseColor = new THREE.Color(0x3aa84c);
  [[0,4.0,0,1.95],[-1.4,3.5,0.5,1.4],[1.3,3.6,-0.4,1.4],[0.5,4.7,0.9,1.25],
   [-0.7,4.5,-0.8,1.25],[0.15,5.2,0.1,1.05],[-1.6,4.3,-0.4,1.0],[1.5,4.4,0.3,1.0]
  ].forEach(([x, y, z, r]) => {
    const col = baseColor.clone();
    col.offsetHSL((Math.random()-0.5)*0.05, (Math.random()-0.5)*0.12, (Math.random()-0.5)*0.14);
    const leaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 1),
      new THREE.MeshStandardMaterial({
        color: col, roughness: 0.9, flatShading: true,
        emissive: col, emissiveIntensity: 0.06,
      })
    );
    leaf.position.set(x, y, z);
    leaf.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
    leaf.castShadow = true; leaf.receiveShadow = true;
    g.add(leaf);
  });
  return g;
}

export function addTree(x, z) {
  const g = makeTreeMesh();
  g.position.set(x, CONFIG.GROUND_Y, z);
  g.rotation.y = Math.random() * Math.PI * 2;
  scene.add(g);
  collections.trees.push({
    type: 'tree', isFruit: false, group: g, baseX: x,
    hp: 3, dead: false, timer: 0, fallT: 0, shakeT: 0,
  });
}

export function addFruitTree(x, z) {
  const g = makeTreeMesh();
  g.position.set(x, CONFIG.GROUND_Y, z);
  g.rotation.y = Math.random() * Math.PI * 2;

  const fruitMat = new THREE.MeshStandardMaterial({
    color: 0xff5a3a, roughness: 0.5, emissive: 0xcc2200, emissiveIntensity: 0.55,
  });
  const fruitMeshes = [];
  for (let i = 0; i < 5; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.20, 10, 10), fruitMat);
    const ang = Math.random() * Math.PI * 2;
    const rr = 1.4 + Math.random() * 0.8;
    f.position.set(Math.cos(ang) * rr, 3.4 + Math.random() * 1.6, Math.sin(ang) * rr);
    f.castShadow = true;
    g.add(f);
    fruitMeshes.push(f);
  }
  scene.add(g);
  collections.trees.push({
    type: 'tree', isFruit: true, group: g, baseX: x, dead: false,
    fruitCount: 5, maxFruit: 5, fruitRespawnT: 0,
    fruitMeshes, shakeT: 0,
  });
}

export function updateTrees(dt, randomPosFn) {
  for (const tr of collections.trees) {
    if (tr.shakeT > 0) {
      tr.shakeT = Math.max(0, tr.shakeT - dt);
      tr.group.position.x = tr.baseX + Math.sin(tr.shakeT * 60) * tr.shakeT * 0.5;
    } else if (!tr.isFruit && !tr.dead) {
      tr.group.position.x = tr.baseX;
    }

    if (tr.isFruit && tr.fruitCount < tr.maxFruit) {
      tr.fruitRespawnT += dt;
      if (tr.fruitRespawnT >= 15) {
        tr.fruitRespawnT = 0;
        tr.fruitCount++;
        const idx = tr.fruitMeshes.findIndex(f => !f.visible);
        if (idx >= 0) tr.fruitMeshes[idx].visible = true;
      }
    }

    if (tr.dead) {
      tr.timer -= dt;
      if (tr.fallT < 1) {
        tr.fallT = Math.min(1, tr.fallT + dt * 2.4);
        tr.group.rotation.z = -tr.fallT * Math.PI / 2 * 0.95;
      }
      if (tr.timer <= 0) {
        const p = randomPosFn(6, 21);
        tr.dead = false; tr.hp = 3; tr.fallT = 0;
        tr.group.rotation.z = 0;
        tr.baseX = p.x;
        tr.group.position.set(p.x, CONFIG.GROUND_Y, p.z);
        tr.group.rotation.y = Math.random() * Math.PI * 2;
      }
    }
  }
}