import { CONFIG } from '../config.js';
import { addTree, addFruitTree } from './trees.js';
import { addStone, addStick } from './resources.js';

export function randomPos(minR, maxR) {
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    return { x, z };
  }
  return { x: 10, z: 10 };
}

export function initWorld() {
  for (let i = 0; i < 7; i++)  { const p = randomPos(6, 21); addTree(p.x, p.z); }
  for (let i = 0; i < 3; i++)  { const p = randomPos(8, 18); addFruitTree(p.x, p.z); }
  for (let i = 0; i < 12; i++) { const p = randomPos(4, 22); addStone(p.x, p.z); }
  for (let i = 0; i < 12; i++) { const p = randomPos(4, 22); addStick(p.x, p.z); }
}