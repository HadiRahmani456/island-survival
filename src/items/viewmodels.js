import * as THREE from 'three';
import { camera } from '../core/renderer.js';
import { viewmodels, state } from '../state.js';

export function buildViewmodels() {
  // مشت
  {
    const g = new THREE.Group();
    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.20),
      new THREE.MeshStandardMaterial({ color: 0xf3c9a0, roughness: 0.8 })
    );
    hand.castShadow = true;
    g.add(hand);
    g.position.set(0.32, -0.30, -0.55);
    g.rotation.set(0.10, -0.12, 0.10);
    g.userData.basePos = g.position.clone();
    g.userData.baseRot = g.rotation.clone();
    g.visible = false;
    camera.add(g);
    viewmodels.fist = g;
  }

  // شمشیر
  {
    const g = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.028, 0.20, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 0.85 })
    );
    handle.position.set(0, 0, 0.10);
    handle.rotation.x = Math.PI / 2;
    handle.castShadow = true;
    g.add(handle);

    const guard = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.03, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xddb84a, metalness: 0.75, roughness: 0.3 })
    );
    guard.position.set(0, 0, 0.02);
    guard.castShadow = true;
    g.add(guard);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.014, 0.55),
      new THREE.MeshStandardMaterial({
        color: 0xeff5ff, metalness: 0.95, roughness: 0.12,
        emissive: 0x6688bb, emissiveIntensity: 0.15,
      })
    );
    blade.position.set(0, 0, -0.28);
    blade.castShadow = true;
    g.add(blade);

    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.09, 4),
      new THREE.MeshStandardMaterial({
        color: 0xeff5ff, metalness: 0.95, roughness: 0.12,
        emissive: 0x6688bb, emissiveIntensity: 0.15,
      })
    );
    tip.rotation.x = -Math.PI / 2;
    tip.position.set(0, 0, -0.585);
    g.add(tip);

    g.position.set(0.26, -0.24, -0.52);
    g.rotation.set(0.00, 0.15, 0);
    g.userData.basePos = g.position.clone();
    g.userData.baseRot = g.rotation.clone();
    g.visible = false;
    camera.add(g);
    viewmodels.sword = g;
  }

  // تبر
  {
    const g = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.62, 8),
      new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85 })
    );
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0, 0, 0.02);
    handle.castShadow = true;
    g.add(handle);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.038, 0.16),
      new THREE.MeshStandardMaterial({
        color: 0xcfd8e0, metalness: 0.85, roughness: 0.25,
        emissive: 0x6688aa, emissiveIntensity: 0.12,
      })
    );
    head.position.set(0.10, 0, -0.28);
    head.castShadow = true;
    g.add(head);

    g.position.set(0.30, -0.30, -0.58);
    g.rotation.set(0.00, 0.20, 0);
    g.userData.basePos = g.position.clone();
    g.userData.baseRot = g.rotation.clone();
    g.visible = false;
    camera.add(g);
    viewmodels.axe = g;
  }

  // کمان
  {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xaa8844, metalness: 0.6, roughness: 0.4 });
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 });

    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8), accentMat);
    g.add(grip);

    for (let i = 0; i < 3; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 6), woodMat);
      seg.position.set(0.005 * i, 0.10 + i * 0.14, 0.005 * i);
      seg.rotation.z = -0.1 * (i + 1);
      g.add(seg);
    }
    for (let i = 0; i < 3; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 6), woodMat);
      seg.position.set(0.005 * i, -0.10 - i * 0.14, 0.005 * i);
      seg.rotation.z = 0.1 * (i + 1);
      g.add(seg);
    }

    const stringMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.95, 4), stringMat);
    stringMesh.position.set(0.055, 0, 0);
    g.add(stringMesh);
    g.userData.stringMesh = stringMesh;

    g.position.set(-0.32, -0.28, -0.62);
    g.rotation.set(0.05, 0.42, -0.12);
    g.userData.basePos = g.position.clone();
    g.userData.baseRot = g.rotation.clone();
    g.visible = false;
    camera.add(g);
    viewmodels.bow = g;
  }
}

export function animateViewmodel(dt, moving) {
  const vm = viewmodels[state.currentWeapon];
  if (!vm) return;

  vm.position.copy(vm.userData.basePos);
  vm.rotation.copy(vm.userData.baseRot);

  if (moving) {
    vm.position.x += Math.sin(state.walkPhase * 0.5) * 0.018;
    vm.position.y += Math.cos(state.walkPhase) * 0.013;
  } else {
    vm.position.y += Math.sin(state.time * 2.0) * 0.008;
    vm.position.x += Math.cos(state.time * 1.4) * 0.005;
  }

  if (state.swingActive) {
    const p = Math.min(1, state.swingT / state.swingDur);
    const amt = Math.pow(Math.sin(p * Math.PI), 0.65);

    if (state.currentWeapon === 'fist') {
      vm.position.z = vm.userData.basePos.z - amt * 0.42;
      vm.position.y = vm.userData.basePos.y + amt * 0.06;
      vm.rotation.x = vm.userData.baseRot.x - amt * 0.35;
    } else if (state.currentWeapon === 'sword') {
      vm.rotation.y = vm.userData.baseRot.y + amt * 1.25;
      vm.rotation.x = vm.userData.baseRot.x - amt * 0.75;
      vm.position.x = vm.userData.basePos.x - amt * 0.16;
      vm.position.z = vm.userData.basePos.z - amt * 0.20;
      vm.position.y = vm.userData.basePos.y + amt * 0.08;
    } else if (state.currentWeapon === 'axe') {
      vm.rotation.x = vm.userData.baseRot.x - amt * 1.85;
      vm.position.z = vm.userData.basePos.z - amt * 0.32;
      vm.position.y = vm.userData.basePos.y + amt * 0.12;
    } else if (state.currentWeapon === 'bow') {
      let pull = 0;
      if (p < 0.5) pull = p / 0.5;
      else pull = Math.max(0, 1 - (p - 0.5) * 5);

      vm.position.z = vm.userData.basePos.z + pull * 0.18;
      vm.position.x = vm.userData.basePos.x + pull * 0.02;
      vm.rotation.x = vm.userData.baseRot.x - pull * 0.18;
      vm.rotation.z = vm.userData.baseRot.z + pull * 0.10;

      if (vm.userData.stringMesh) {
        vm.userData.stringMesh.position.x = 0.055 + pull * 0.04;
      }
    }
  } else if (state.currentWeapon === 'bow' && vm.userData.stringMesh) {
    vm.userData.stringMesh.position.x = 0.055;
  }
}

export function setWeapon(name, toastFn) {
  if (name === 'sword' && state.inventory.swordDur <= 0) { toastFn?.('شمشیر نداری! (K)'); return; }
  if (name === 'axe'   && state.inventory.axeDur   <= 0) { toastFn?.('تبر نداری! (C)'); return; }
  if (name === 'bow'   && state.inventory.bowDur   <= 0) { toastFn?.('کمان نداری! (B)'); return; }

  state.currentWeapon = name;
  for (const k in viewmodels) viewmodels[k].visible = (k === name);
}