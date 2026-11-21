import * as THREE from 'three';

// وضعیت مشترک بازی
export const state = {
  player: {
    pos: new THREE.Vector3(0, 0.9 + 1.75, 12),
    yaw: 0,
    pitch: 0,
  },
  inventory: {
    stone: 0, wood: 0, arrows: 0, mana: 0, fruits: 0,
    swordDur: 0, axeDur: 0, bowDur: 0,
  },
  hp: 100,
  stamina: 100,
  kills: 0,
  wave: 1,
  dayNumber: 1,
  survivalSeconds: 0,
  waveClock: 0,
  nightFactor: 0,
  currentWeapon: 'fist',
  attackCd: 0,
  swingT: 0,
  swingDur: 0.3,
  swingActive: false,
  walkPhase: 0,
  shakeAmount: 0,
  footstepT: 0,
  spawnT: 0,
  zombieSpawnT: 6,
  gameActive: true,
  paused: false,
  time: 0,
};

// مجموعه‌های مشترک (آرایه‌ها)
export const collections = {
  trees: [], stones: [], sticks: [], zombies: [],
  particles: [], arrows: [], fireballs: [], manaOrbs: [],
  dustSprites: [],
};

// ویومدل‌های سلاح (بعداً پر می‌شن)
export const viewmodels = {};