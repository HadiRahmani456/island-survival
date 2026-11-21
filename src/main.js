import { initRenderer, renderer, scene, camera } from './core/renderer.js';
import { initPostFX, renderFrame } from './core/postfx.js';
import { initInput } from './core/input.js';
import { buildEnvironment } from './world/environment.js';
import { initWorld, randomPos } from './world/init.js';
import { updatePlayer } from './entities/player.js';
import { updateZombies } from './entities/zombies.js';
import { updateProjectiles } from './entities/projectiles.js';
import { updateParticles } from './systems/particles.js';
import { updateSurvival } from './systems/survival.js';
import { updateTrees } from './world/trees.js';
import { updateHUD, updateSurvivalHUD, showToast } from './ui/hud.js';
import { bindUI } from './ui/screens.js';
import { handleKeyPress } from './systems/inputHandlers.js';
import { drawMinimap } from './ui/minimap.js';
import { buildViewmodels } from './items/viewmodels.js';
import { tryAttack, castFireball } from './systems/combat.js';
import { state } from './state.js';

initRenderer();
initPostFX();
buildEnvironment();
initWorld();
buildViewmodels();

initInput(document.querySelector('canvas'), {
  onKeyPress: handleKeyPress,
  onAttack: () => tryAttack(showToast),
  onMagic: () => castFireball(showToast),
  onRestart: () => location.reload(),
});

bindUI();
updateHUD();
updateSurvivalHUD();
drawMinimap();

let last = performance.now();
let fpsFrames = 0, fpsTimer = 0;
const fpsEl = document.getElementById('fps-counter');

function loop(now) {
  let dt = (now - last) / 1000;
  if (!isFinite(dt) || dt <= 0) dt = 0.016;
  dt = Math.min(dt, 0.05);
  last = now;

  if (!state.paused) {
    state.time += dt;

    if (state.attackCd > 0) state.attackCd -= dt;
    if (state.swingActive) {
      state.swingT += dt;
      if (state.swingT >= state.swingDur) {
        state.swingActive = false;
        state.swingT = 0;
      }
    }

    updatePlayer(dt);
    updateSurvival(dt);
    updateTrees(dt, randomPos);
    updateZombies(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateHUD();
    updateSurvivalHUD();

    if (Math.floor(state.time * 4) !== Math.floor((state.time - dt) * 4)) {
      drawMinimap();
    }
  }

  renderFrame();

  fpsTimer += dt;
  fpsFrames++;
  if (fpsTimer >= 0.5) {
    fpsEl.textContent = 'FPS: ' + Math.round(fpsFrames / fpsTimer);
    fpsTimer = 0;
    fpsFrames = 0;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);