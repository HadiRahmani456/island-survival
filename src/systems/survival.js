import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { spawnZombie } from '../entities/zombies.js';
import { collections } from '../state.js';
import { sun, rim, scene } from '../core/renderer.js';
import { updateEnvironment } from '../world/environment.js';

export function updateSurvival(dt) {
  if (!state.gameActive) return;

  state.survivalSeconds += dt;
  state.waveClock += dt;

  if (state.waveClock >= CONFIG.WAVE_DURATION) {
    state.waveClock = 0;
    state.wave++;
    state.dayNumber = Math.floor((state.wave - 1) / 2) + 1;
    state.zombieSpawnT = Math.min(state.zombieSpawnT, 1.5);
  }

  state.nightFactor = (Math.sin((state.survivalSeconds % CONFIG.DAY_DURATION) / CONFIG.DAY_DURATION * Math.PI * 2 - Math.PI/2) + 1) / 2;

  // نور روز/شب
  const dusk = Math.max(0, Math.sin((state.survivalSeconds % CONFIG.DAY_DURATION) / CONFIG.DAY_DURATION * Math.PI * 2));
  sun.intensity = 1.35 - dusk * 0.72;
  rim.intensity = 0.35 + dusk * 0.28;
  scene.fog.color.setRGB(
    0.75 - dusk * 0.48,
    0.89 - dusk * 0.55,
    0.96 - dusk * 0.48
  );

  // اسپاون زامبی
  state.zombieSpawnT -= dt;
  const maxZombies = Math.min(10, 4 + Math.floor(state.wave / 2));
  if (state.zombieSpawnT <= 0 && collections.zombies.filter(z => !z.dying).length < maxZombies) {
    state.zombieSpawnT = Math.max(2.8, (9.5 - Math.min(4, state.wave * 0.35)) * (1 - state.nightFactor * 0.22)) + Math.random() * 2.5;
    spawnZombie();
  }

  updateEnvironment(dt, state.time, state.survivalSeconds);
}