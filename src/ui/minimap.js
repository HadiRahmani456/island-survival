import { CONFIG } from '../config.js';
import { collections, state } from '../state.js';

export function drawMinimap() {
  const c = document.getElementById('minimap');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#102b36';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w/2, h/2);
  const scale = 2.75;

  ctx.beginPath();
  ctx.arc(0, 0, CONFIG.ISLAND_R * scale, 0, Math.PI*2);
  ctx.fillStyle = '#6d9d58';
  ctx.fill();
  ctx.strokeStyle = '#e6d19b';
  ctx.lineWidth = 4;
  ctx.stroke();

  const dot = (x, z, color, r=2.5) => {
    ctx.beginPath();
    ctx.arc(x * scale, z * scale, r, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  collections.trees.forEach(o => { if (!o.dead) dot(o.group.position.x, o.group.position.z, o.isFruit ? '#ff8a65' : '#245d35', 2.3); });
  collections.stones.forEach(o => dot(o.group.position.x, o.group.position.z, '#b8c5cf', 1.8));
  collections.zombies.forEach(o => { if (!o.dying) dot(o.group.position.x, o.group.position.z, '#ff4242', 3); });

  ctx.rotate(-state.player.yaw);
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(-5, 5);
  ctx.lineTo(5, 5);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.restore();
}