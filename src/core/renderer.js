import * as THREE from 'three';
import { CONFIG } from '../config.js';

export let renderer, scene, camera, canvas;
export let sun, rim, vmLight;

export function initRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  document.body.appendChild(renderer.domElement);
  canvas = renderer.domElement;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xbfe3f5, 48, 125);

  camera = new THREE.PerspectiveCamera(
    72, window.innerWidth / window.innerHeight, 0.05, 400
  );
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  // نورها
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a4456, 0.75));

  sun = new THREE.DirectionalLight(0xfff2cc, 1.35);
  sun.position.set(35, 55, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40;
  sc.near = 1; sc.far = 140;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);

  rim = new THREE.DirectionalLight(0x80b8ff, 0.35);
  rim.position.set(-30, 20, -30);
  scene.add(rim);

  vmLight = new THREE.PointLight(0xffffff, 0.55, 3.5);
  vmLight.position.set(0.3, 0.2, 0);
  camera.add(vmLight);

  window.addEventListener('resize', onResize);

  return { renderer, scene, camera, canvas };
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // composer رو هم باید resize کنیم
  window.dispatchEvent(new Event('scene-resize'));
}

// ابزار: ساخت تکسچر شعاعی
export function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
}