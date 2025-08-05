import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.1/examples/jsm/controls/OrbitControls.js?module';

const w = window.innerWidth, h = window.innerHeight;

// --- Scene / Camera / Renderer ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Group (planet tilt) ---
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);

// --- Geometry & Textures ---
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, 12);

// Earth
const earthMat = new THREE.MeshStandardMaterial({
  map: loader.load('./textures/8081_earthmap10k.jpg'),
});
const earthMesh = new THREE.Mesh(geometry, earthMat);
earthGroup.add(earthMesh);

// City lights (always visible, rendered after Earth)
const lightsTex = loader.load('./textures/earthlights1k.jpg');
const lightsMat = new THREE.MeshBasicMaterial({
  map: lightsTex,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  depthTest: false,
});
const lightsMesh = new THREE.Mesh(geometry.clone(), lightsMat);
lightsMesh.scale.setScalar(1.001);
lightsMesh.renderOrder = 2;
earthGroup.add(lightsMesh);

// Clouds (proper alpha mask, no additive blowout)
const cloudsColor = loader.load('./textures/earthcloudmap.jpg');
const cloudsAlpha = loader.load('./textures/earthcloudmaptrans.jpg', t => {
  t.generateMipmaps = false;           // helps kill the “breathing dots”
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
});
const cloudsMat = new THREE.MeshStandardMaterial({
  map: cloudsColor,
  alphaMap: cloudsAlpha,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
  blending: THREE.NormalBlending,
  roughness: 1.0,
  metalness: 0.0,
  alphaTest: 0.2,                      // drop tiny noisy fragments
});
const cloudsMesh = new THREE.Mesh(geometry.clone(), cloudsMat);
cloudsMesh.scale.setScalar(1.01);
cloudsMesh.renderOrder = 3;
earthGroup.add(cloudsMesh);

// Light
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Simple: rotate the whole group
  earthGroup.rotation.y += 0.001;

  // (Optional) uncomment if you want clouds to drift faster than Earth:
  // cloudsMesh.rotation.y += 0.0015;

  renderer.render(scene, camera);
}
animate();

// --- Resize ---
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
