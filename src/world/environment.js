import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { scene, radialTexture } from '../core/renderer.js';
import { collections } from '../state.js';

export let waterGeo, waterBase, water, foamRing, dustSprites;

export function buildEnvironment() {
  buildSky();
  buildLights();
  buildWater();
  buildIsland();
  buildGroundDetails();
  buildDust();
}

function buildSky() {
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      uTop:    { value: new THREE.Color(0x3a7fc4) },
      uMid:    { value: new THREE.Color(0x8fd0f0) },
      uBottom: { value: new THREE.Color(0xffe4b8) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        float t = clamp(h, -0.05, 0.9);
        vec3 col;
        if (t < 0.15) col = mix(uBottom, uMid, smoothstep(-0.05, 0.15, t));
        else col = mix(uMid, uTop, smoothstep(0.15, 0.9, t));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), skyMat));

  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(255,245,220,1)', 'rgba(255,200,120,0)'),
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
    fog: false, transparent: true,
  }));
  sunGlow.scale.set(90, 90, 1);
  sunGlow.position.set(70, 55, 35);
  scene.add(sunGlow);

  const sunCore = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(255,255,255,1)', 'rgba(255,240,200,0)'),
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
    fog: false, transparent: true,
  }));
  sunCore.scale.set(28, 28, 1);
  sunCore.position.set(70, 55, 35);
  scene.add(sunCore);
}

function buildLights() {
  // نورها توی renderer.js ساخته شدن
}

function buildWater() {
  waterGeo = new THREE.PlaneGeometry(500, 500, 48, 48);
  water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({
    color: 0x2fa8d9, roughness: 0.08, metalness: 0.45,
    transparent: true, opacity: 0.94,
  }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.6;
  water.receiveShadow = true;
  scene.add(water);
  waterBase = Float32Array.from(waterGeo.attributes.position.array);

  foamRing = new THREE.Mesh(
    new THREE.RingGeometry(26.5, 28.2, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.35,
      side: THREE.DoubleSide, depthWrite: false,
    })
  );
  foamRing.rotation.x = -Math.PI / 2;
  foamRing.position.y = 0.02;
  scene.add(foamRing);
}

function buildIsland() {
  const sandDarkMat = new THREE.MeshStandardMaterial({ color: 0xd9bf87, roughness: 1 });
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xf0dca8, roughness: 0.95 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x6fbe4d, roughness: 1 });
  const grassDark = new THREE.MeshStandardMaterial({ color: 0x5a9d3e, roughness: 1 });

  const b = new THREE.Mesh(new THREE.CylinderGeometry(30, 22, 7, 64), sandDarkMat);
  b.position.y = CONFIG.GROUND_Y - 4;
  b.receiveShadow = true;
  scene.add(b);

  const t = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 0.9, 64), sandMat);
  t.position.y = CONFIG.GROUND_Y - 0.45;
  t.receiveShadow = true; t.castShadow = true;
  scene.add(t);

  const gb = new THREE.Mesh(new THREE.CylinderGeometry(25, 26.5, 0.85, 64), grassDark);
  gb.position.y = CONFIG.GROUND_Y - 0.4;
  gb.receiveShadow = true;
  scene.add(gb);

  const gt = new THREE.Mesh(new THREE.CylinderGeometry(25, 25, 0.35, 64), grassMat);
  gt.position.y = CONFIG.GROUND_Y - 0.18;
  gt.receiveShadow = true;
  scene.add(gt);
}

function buildGroundDetails() {
  const _dummy = new THREE.Object3D();

  // علف
  {
    const geo = new THREE.ConeGeometry(0.07, 0.42, 3);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4f9c3a, roughness: 1, flatShading: true });
    const inst = new THREE.InstancedMesh(geo, mat, 600);
    inst.castShadow = true; inst.receiveShadow = true;
    for (let i = 0; i < 600; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 22;
      _dummy.position.set(Math.cos(a) * r, CONFIG.GROUND_Y + 0.15, Math.sin(a) * r);
      _dummy.rotation.set((Math.random()-0.5)*0.2, Math.random()*Math.PI*2, (Math.random()-0.5)*0.2);
      _dummy.scale.setScalar(0.6 + Math.random() * 0.9);
      _dummy.updateMatrix();
      inst.setMatrixAt(i, _dummy.matrix);
    }
    scene.add(inst);
  }

  // گل‌ها
  [0xff6b9d, 0xffe066, 0xff6b6b, 0xb388ff, 0x7fd7ff].forEach(color => {
    const geo = new THREE.SphereGeometry(0.065, 6, 6);
    const mat = new THREE.MeshStandardMaterial({
      color, roughness: 0.7, emissive: color, emissiveIntensity: 0.25,
    });
    const inst = new THREE.InstancedMesh(geo, mat, 30);
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 20;
      _dummy.position.set(Math.cos(a) * r, CONFIG.GROUND_Y + 0.28, Math.sin(a) * r);
      _dummy.scale.setScalar(0.8 + Math.random() * 0.7);
      _dummy.rotation.set(0, Math.random() * Math.PI, 0);
      _dummy.updateMatrix();
      inst.setMatrixAt(i, _dummy.matrix);
    }
    scene.add(inst);
  });

  // سنگ‌ریزه‌ها
  {
    const geo = new THREE.DodecahedronGeometry(0.12, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x9aa3ab, roughness: 0.9, flatShading: true });
    const inst = new THREE.InstancedMesh(geo, mat, 40);
    inst.castShadow = true;
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 22;
      _dummy.position.set(Math.cos(a) * r, CONFIG.GROUND_Y + 0.06, Math.sin(a) * r);
      _dummy.scale.setScalar(0.5 + Math.random() * 1.2);
      _dummy.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
      _dummy.updateMatrix();
      inst.setMatrixAt(i, _dummy.matrix);
    }
    scene.add(inst);
  }
}

function buildDust() {
  const dustTex = radialTexture('rgba(255,240,200,1)', 'rgba(255,240,200,0)');
  for (let i = 0; i < 70; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dustTex, blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true, opacity: 0.5,
    }));
    sprite.scale.setScalar(0.25 + Math.random() * 0.3);
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 22;
    sprite.position.set(Math.cos(a) * r, 0.5 + Math.random() * 4, Math.sin(a) * r);
    scene.add(sprite);
    collections.dustSprites.push({
      sprite,
      baseX: sprite.position.x,
      baseZ: sprite.position.z,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      amp: 0.3 + Math.random() * 0.6,
    });
  }
}

export function updateEnvironment(dt, t, survivalSeconds) {
  // موج دریا
  const pos = waterGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = waterBase[i * 3], y = waterBase[i * 3 + 1];
    pos.setZ(i,
      Math.sin(x * 0.09 + t * 1.3) * 0.35 +
      Math.cos(y * 0.07 + t * 0.9) * 0.30 +
      Math.sin((x + y) * 0.05 + t * 2.1) * 0.15
    );
  }
  pos.needsUpdate = true;
  waterGeo.computeVertexNormals();

  foamRing.material.opacity = 0.28 + Math.sin(t * 1.8) * 0.10;

  // غبار
  for (const d of collections.dustSprites) {
    d.phase += dt * d.speed;
    d.sprite.position.x = d.baseX + Math.sin(d.phase) * d.amp;
    d.sprite.position.z = d.baseZ + Math.cos(d.phase * 0.7) * d.amp;
    d.sprite.position.y += Math.sin(d.phase * 1.3) * 0.004;
    d.sprite.material.opacity = 0.3 + Math.sin(d.phase * 1.5) * 0.2;
  }
}