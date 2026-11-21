import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { renderer, scene, camera } from './renderer.js';

let composer = null;

export function initPostFX() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55, 0.5, 0.88
  ));

  window.addEventListener('scene-resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight);
  });
}

export function renderFrame() {
  if (composer) composer.render();
  else renderer.render(scene, camera);
}