/* Professor Bingo — Dynamic Anime Characters (Three.js)
 * Kai (The Lecture Hunter) & Yuki (The Lantern Spirit)
 * Human presence animation system:
 * - Damped mouse-driven parallax and gaze tracking (organic 3D depth)
 * - Grounded physical footing (temple roof ridge & contact shadow)
 * - Anatomical multi-phase breathing cycle (torso expansion & haori settle)
 * - Explosive kinetic katana slash with anticipation, surge, zanshin recovery
 * - Volumetric Hinokami Kagura flame dragon vortex & dynamic firelight
 * - Yuki with wooden veranda base, responsive gaze, breathing, swaying 3D lantern
 */
(function(){
"use strict";

const stubApi = {
  slash: () => {},
  cheer: () => {},
  victory: () => {},
  click: () => {},
  setQuiet: () => {}
};

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

if (typeof THREE === 'undefined' || !isWebGLAvailable()) {
  console.warn("Three.js or WebGL is unavailable. Running in fallback mode.");
  window.chars = stubApi;
  const sl = document.getElementById('stageLeft'); if (sl) sl.style.display = 'none';
  const sr = document.getElementById('stageRight'); if (sr) sr.style.display = 'none';
  return;
}

// Global state
let isQuiet = false;
let isPageHidden = false;
let kai = null;
let yuki = null;
let modalKai = null;
let modalYuki = null;

// Synchronously exported window.chars API
window.chars = {
  slash: (opts) => {
    if (kai) kai.slash(opts);
  },
  cheer: () => {
    if (yuki) yuki.cheer();
  },
  victory: () => {
    if (kai) kai.victory(isQuiet);
    if (yuki) yuki.victory(isQuiet);
  },
  click: () => {
    if (kai) kai.click();
    if (yuki) yuki.click();
  },
  setQuiet: (on) => {
    isQuiet = !!on;
  },
  setElement: (elem) => {
    if (kai) kai.setElement(elem);
  }
};

document.addEventListener("visibilitychange", () => {
  isPageHidden = document.hidden;
});

// Pointer tracking for mouse-driven orbit & human gaze (Skill: add-mouse-driven-orbit)
const pointer = { x: 0, y: 0 };
const smoothPointer = { x: 0, y: 0 };

window.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch") return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener("pointerleave", () => {
  pointer.x = 0;
  pointer.y = 0;
});

// Texture loader helper
function loadCharTexture(src) {
  const loader = new THREE.TextureLoader();
  const tex = loader.load(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/* ==========================================================
 * CHARACTER 1: KAI — THE LECTURE HUNTER (Left Stage, 300px)
 * Grounded on a temple roof, realistic human breathing,
 * pointer gaze tracking, explosive kinetic Hinokami slash
 * ========================================================== */
function initKaiStage(container) {
  if (!container) return null;

  const width = container.clientWidth || 300;
  const height = container.clientHeight || 540;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
  camera.position.set(0, 0.25, 4.7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0x24183d, 1.8);
  scene.add(ambient);

  const moonKey = new THREE.DirectionalLight(0xfff1c2, 1.9);
  moonKey.position.set(-2.5, 4.0, 3.5);
  scene.add(moonKey);

  // Dynamic glowing ocean water light from the Water Breathing dragon
  const waterLight = new THREE.PointLight(0x00c8ff, 3.2, 9);
  waterLight.position.set(0.1, 0.5, 1.2);
  scene.add(waterLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
  rimLight.position.set(2.5, 0.5, -2.5);
  scene.add(rimLight);

  // Stage Ground Group: Ancient Japanese Temple Roof
  const groundGroup = new THREE.Group();
  groundGroup.position.set(0, -1.55, 0);
  scene.add(groundGroup);

  // Tiled roof ridge
  const tileMat = new THREE.MeshStandardMaterial({
    color: 0x181024,
    roughness: 0.7,
    metalness: 0.1
  });
  const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.32, 1.6), tileMat);
  roofRidge.rotation.x = 0.12;
  roofRidge.rotation.z = -0.04;
  groundGroup.add(roofRidge);

  // Gold trim rim on roof edge
  const roofTrim = new THREE.Mesh(
    new THREE.BoxGeometry(2.44, 0.06, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x9a6818, roughness: 0.4, metalness: 0.6 })
  );
  roofTrim.position.set(0, 0.16, 0.8);
  roofRidge.add(roofTrim);

  // Ambient occlusion contact shadow under Kai's feet
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  sGrad.addColorStop(0, 'rgba(3, 1, 6, 0.85)');
  sGrad.addColorStop(0.5, 'rgba(8, 2, 12, 0.45)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.95),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.75 })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(0.05, 0.17, 0.1);
  groundGroup.add(shadowMesh);

  // Kai Character Root (human presence & pose hierarchy)
  const kaiRoot = new THREE.Group();
  kaiRoot.position.set(0, -0.05, 0);
  scene.add(kaiRoot);

  // Kai Sprite / Textured Human Mesh
  const kaiTex = loadCharTexture('img/kai_reference.png');
  const kaiMat = new THREE.MeshBasicMaterial({
    map: kaiTex,
    transparent: true,
    alphaTest: 0.02,
    depthWrite: false
  });
  const kaiMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), kaiMat);
  kaiMesh.position.set(0, 0.12, 0);
  kaiRoot.add(kaiMesh);

  // Volumetric 3D Water Breathing Dragon Vortex (Mizu no Kokyu: Constant Flux)
  const vortexGroup = new THREE.Group();
  kaiRoot.add(vortexGroup);

  // 1. Water Breathing Dragon Helical Wave Path
  const arcPoints = [];
  const numPts = 42;
  for (let i = 0; i <= numPts; i++) {
    const t = (i / numPts) * Math.PI * 1.75 - 0.35;
    const rad = 1.75 - (i / numPts) * 0.46;
    const x = Math.cos(t) * rad;
    const y = Math.sin(t) * (rad * 0.96) + 0.18;
    const z = Math.sin(t * 1.9) * 0.48 + 0.22;
    arcPoints.push(new THREE.Vector3(x, y, z));
  }
  const arcCurve = new THREE.CatmullRomCurve3(arcPoints);

  // Core luminous cyan water stream (sleek anime dragon stream)
  const coreGeom = new THREE.TubeGeometry(arcCurve, 48, 0.038, 8, false);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x99f4ff,
    emissive: 0x0099ff,
    emissiveIntensity: 3.5,
    roughness: 0.12,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85
  });
  const coreTube = new THREE.Mesh(coreGeom, coreMat);
  vortexGroup.add(coreTube);

  // Outer azure ocean water wave ribbon
  const outerGeom = new THREE.TubeGeometry(arcCurve, 48, 0.078, 8, false);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x0066ee,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.42
  });
  const outerRibbon = new THREE.Mesh(outerGeom, outerMat);
  vortexGroup.add(outerRibbon);

  // White cresting sea foam tips
  const foamGeom = new THREE.TubeGeometry(arcCurve, 48, 0.022, 6, false);
  const foamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85
  });
  const foamRibbon = new THREE.Mesh(foamGeom, foamMat);
  foamRibbon.position.y += 0.05;
  vortexGroup.add(foamRibbon);

  // 3. Floating 3D Water Spray & Splash Droplet Particles
  const sparkCount = 45;
  const sparkGeom = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkVels = [];
  for (let i = 0; i < sparkCount; i++) {
    sparkPos[i * 3] = (Math.random() - 0.5) * 3.4;
    sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 3.2;
    sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 1.9 + 0.3;
    sparkVels.push({
      vx: (Math.random() - 0.5) * 0.018,
      vy: Math.random() * 0.026 + 0.012,
      vz: (Math.random() - 0.5) * 0.014,
      swirl: Math.random() * 6.28
    });
  }
  sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0x88eeff,
    size: 0.08,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.92
  });
  const sparkPoints = new THREE.Points(sparkGeom, sparkMat);
  kaiRoot.add(sparkPoints);

  // Human Animation State Machine
  let action = "idle";
  let actionStart = 0;
  let actionDuration = 0;
  let currentElement = "water";

  function applyElement(elem) {
    currentElement = elem || "water";
    if (currentElement === "flame") {
      coreMat.color.setHex(0xfffae0);
      coreMat.emissive.setHex(0xff3300);
      outerMat.color.setHex(0xff2200);
      foamMat.color.setHex(0xffcc00);
      sparkMat.color.setHex(0xffaa22);
      waterLight.color.setHex(0xff6600);
    } else {
      coreMat.color.setHex(0x99f4ff);
      coreMat.emissive.setHex(0x0099ff);
      outerMat.color.setHex(0x0066ee);
      foamMat.color.setHex(0xffffff);
      sparkMat.color.setHex(0x88eeff);
      waterLight.color.setHex(0x00c8ff);
    }
  }

  function setAction(name, dur) {
    action = name;
    actionStart = performance.now();
    actionDuration = dur;
  }

  function update(time) {
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    const amp = isQuiet ? 0.45 : 1.0;
    const now = performance.now();

    // 1. Organic Human Breathing Cycle (~3.8s complete respiration)
    const breathT = time * 0.0022;
    const breath = Math.sin(breathT);
    // Torso expands on inhale, settles on exhale
    const breathScaleY = 1.0 + breath * 0.024 * amp;
    const breathScaleX = 1.0 - breath * 0.012 * amp; // Poisson ratio compression
    const breathY = -0.05 + breath * 0.038 * amp;

    // Haori fabric wind sway
    const windFlutter = Math.sin(time * 0.0035) * 0.02 * amp;

    // 2. Damped Pointer Gaze & Head Tracking (add-mouse-driven-orbit)
    const cameraYaw = -smoothPointer.x * 0.28;
    const cameraPitch = smoothPointer.y * 0.18;
    camera.position.x = cameraYaw;
    camera.position.y = 0.25 + cameraPitch;
    camera.lookAt(0, 0.2, 0);

    // Kai's body and gaze subtly turn toward user's cursor
    let targetRotY = smoothPointer.x * 0.26 * amp;
    let targetRotX = -smoothPointer.y * 0.12 * amp;
    let targetRotZ = (windFlutter - smoothPointer.x * 0.04) * amp;

    let targetX = 0;
    let targetY = breathY;
    let targetZ = 0;
    let targetScale = 1.0;

    // Water Breathing dragon gentle wave pulse & ocean light flicker
    vortexGroup.rotation.z = Math.sin(time * 0.002) * 0.08 * amp;
    vortexGroup.rotation.y = -smoothPointer.x * 0.35 * amp; // opposing parallax depth
    const flicker = Math.sin(time * 0.014) * 0.35 + Math.sin(time * 0.031) * 0.25;
    waterLight.intensity = (3.2 + flicker) * amp;

    // 3. Martial Arts Action Kinetic Chain (Water Breathing: Sword Slash & Spells)
    if (action !== "idle") {
      const elapsed = now - actionStart;
      const progress = Math.min(1, elapsed / actionDuration);

      if (action === "slash") {
        // Multi-phase authentic Water Breathing katana strike:
        // 0.0 to 0.18: Anticipation (coils back, draws sword behind shoulder, water gathers)
        // 0.18 to 0.48: Powerful forward diagonal sword swing! (Mizu no Kokyu: Water Wheel spins 360 deg)
        // 0.48 to 0.78: Zanshin follow-through (blade extends, water dragon wave surges across screen)
        // 0.78 to 1.0: Controlled return to battle breathing stance
        if (progress < 0.18) {
          const p = progress / 0.18;
          targetZ = -p * 0.28 * amp;
          targetY = -0.05 - p * 0.12 * amp; // drops into deep martial stance
          targetRotZ = p * 0.18 * amp; // draws sword back
          targetRotX = p * 0.08 * amp;
          targetScale = 1.0 - p * 0.04;
          waterLight.intensity = 3.2 + p * 2.0 * amp;
        } else if (progress < 0.48) {
          const p = (progress - 0.18) / 0.3;
          const strikeCurve = Math.sin(p * Math.PI);
          targetZ = (-0.28 + p * 1.05) * amp; // explosive forward strike surge!
          targetX = p * 0.26 * amp;
          targetY = -0.17 + strikeCurve * 0.26 * amp;
          targetScale = 1.0 + strikeCurve * 0.28 * amp;
          targetRotZ = -strikeCurve * 0.35 * amp; // wide sweeping diagonal sword cut!
          targetRotY = (smoothPointer.x * 0.26 + strikeCurve * 0.25) * amp;
          vortexGroup.rotation.z = p * Math.PI * 2.0 * amp; // full 360-degree Water Wheel spin!
          vortexGroup.scale.set(1.0 + strikeCurve * 0.4, 1.0 + strikeCurve * 0.4, 1.0);
          coreMat.emissiveIntensity = 3.5 + strikeCurve * 5.0 * amp;
          waterLight.intensity = 3.5 + strikeCurve * 6.0 * amp;
        } else if (progress < 0.78) {
          const p = (progress - 0.48) / 0.3;
          targetZ = (0.77 - p * 0.5) * amp;
          targetX = (0.26 - p * 0.15) * amp;
          targetY = -0.05;
          targetScale = 1.15 - p * 0.1;
          targetRotZ = -0.15 * (1 - p) * amp;
          vortexGroup.rotation.z = (Math.PI * 2.0 + p * 0.6) * amp;
          vortexGroup.scale.set(1.1 - p * 0.1, 1.1 - p * 0.1, 1.0);
          coreMat.emissiveIntensity = 5.0 - p * 1.5 * amp;
          waterLight.intensity = 5.5 - p * 2.0 * amp;
        } else {
          const p = (progress - 0.78) / 0.22;
          targetZ = 0.27 * (1 - p) * amp;
          targetX = 0.11 * (1 - p) * amp;
          targetScale = 1.05 - p * 0.05;
          coreMat.emissiveIntensity = 3.5;
          waterLight.intensity = 3.2;
        }

        if (progress >= 1) {
          action = "idle";
          kaiRoot.position.set(0, -0.05, 0);
          vortexGroup.scale.set(1, 1, 1);
          coreMat.emissiveIntensity = 3.5;
        }
      } else if (action === "victory") {
        // Triumphant battle victory: athletic leaps with Water Dragon wave
        const hop = Math.abs(Math.sin(progress * Math.PI * 4)) * 0.44 * amp;
        targetY = -0.05 + hop;
        targetScale = 1.0 + Math.sin(progress * Math.PI * 2) * 0.14 * amp;
        vortexGroup.rotation.z += 0.06 * amp;
        coreMat.emissiveIntensity = 4.2 + Math.sin(progress * Math.PI * 5) * 2.2 * amp;
        waterLight.intensity = 4.5 + Math.sin(progress * Math.PI * 5) * 2.0 * amp;
        if (progress >= 1) {
          action = "idle";
          coreMat.emissiveIntensity = 3.5;
        }
      } else if (action === "victoryQuiet") {
        // Respectful calm warrior bow
        const bow = Math.sin(progress * Math.PI);
        targetRotX = -bow * 0.2;
        targetY = -0.05 - bow * 0.08;
        if (progress >= 1) action = "idle";
      } else if (action === "click") {
        // Crisp responsive combat nod
        const nod = Math.sin(progress * Math.PI);
        targetRotX = -nod * 0.09 * amp;
        targetY = -0.05 - nod * 0.05 * amp;
        if (progress >= 1) action = "idle";
      }
    }

    // Apply combined transformations
    kaiRoot.position.set(targetX, targetY, targetZ);
    kaiRoot.scale.set(targetScale * breathScaleX, targetScale * breathScaleY, targetScale);
    kaiRoot.rotation.set(targetRotX, targetRotY, targetRotZ);

    // Animate swirling spark particles
    const pos = sparkGeom.attributes.position.array;
    for (let i = 0; i < sparkCount; i++) {
      sparkVels[i].swirl += 0.02 * amp;
      pos[i * 3 + 1] += sparkVels[i].vy * amp;
      pos[i * 3] += Math.sin(sparkVels[i].swirl) * 0.012 * amp;
      pos[i * 3 + 2] += Math.cos(sparkVels[i].swirl) * 0.012 * amp;
      if (pos[i * 3 + 1] > 2.2) {
        pos[i * 3 + 1] = -1.4;
        pos[i * 3] = (Math.random() - 0.5) * 2.2;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5 + 0.3;
      }
    }
    sparkGeom.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  return {
    slash: (opts) => {
      if (opts && opts.element) applyElement(opts.element);
      setAction("slash", 750);
    },
    setElement: (elem) => applyElement(elem),
    victory: (quiet) => setAction(quiet ? "victoryQuiet" : "victory", quiet ? 1400 : 2500),
    click: () => setAction("click", 300),
    update
  };
}

/* ==========================================================
 * CHARACTER 2: YUKI — THE LANTERN SPIRIT (Right Stage, 350px)
 * Grounded on a cedar temple veranda, human breathing,
 * swaying 3D lantern with PointLight, pointer gaze tracking
 * ========================================================== */
function initYukiStage(container) {
  if (!container) return null;

  const width = container.clientWidth || 350;
  const height = container.clientHeight || 280;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
  camera.position.set(0, 0.05, 4.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0x2d143f, 1.7);
  scene.add(ambient);

  const moonKey = new THREE.DirectionalLight(0xfff1c2, 1.8);
  moonKey.position.set(2.0, 3.5, 3.0);
  scene.add(moonKey);

  const lanternLight = new THREE.PointLight(0xffaa33, 2.6, 6);
  lanternLight.position.set(0.75, -0.1, 0.7);
  scene.add(lanternLight);

  // Stage Ground: Cedar Veranda & Contact Shadow
  const groundGroup = new THREE.Group();
  groundGroup.position.set(0, -1.35, 0);
  scene.add(groundGroup);

  const verandaMat = new THREE.MeshStandardMaterial({ color: 0x22130e, roughness: 0.7 });
  const veranda = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.28, 1.5), verandaMat);
  groundGroup.add(veranda);

  const verandaTrim = new THREE.Mesh(
    new THREE.BoxGeometry(2.64, 0.05, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x8a5820, roughness: 0.4 })
  );
  verandaTrim.position.set(0, 0.14, 0.75);
  groundGroup.add(verandaTrim);

  // Contact shadow
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  sGrad.addColorStop(0, 'rgba(3, 1, 6, 0.85)');
  sGrad.addColorStop(0.5, 'rgba(8, 2, 12, 0.45)');
  sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.8),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.7 })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(-0.25, 0.15, 0.1);
  groundGroup.add(shadowMesh);

  // Yuki Character Root
  const yukiRoot = new THREE.Group();
  scene.add(yukiRoot);

  const yukiTex = loadCharTexture('img/yuki_reference.png');
  const yukiMat = new THREE.MeshBasicMaterial({
    map: yukiTex,
    transparent: true,
    alphaTest: 0.02,
    depthWrite: false
  });
  const yukiMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 2.74), yukiMat);
  yukiMesh.position.set(-0.25, 0.02, 0);
  yukiRoot.add(yukiMesh);

  // 3D Glowing Japanese Paper Lantern beside her
  const lanternGroup = new THREE.Group();
  lanternGroup.position.set(0.68, -0.05, 0.4);
  yukiRoot.add(lanternGroup);

  const lanternCapGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.05, 12);
  const lanternCapMat = new THREE.MeshStandardMaterial({ color: 0x4a180a, roughness: 0.6 });
  const lanternTop = new THREE.Mesh(lanternCapGeom, lanternCapMat);
  lanternTop.position.y = 0.22;
  lanternGroup.add(lanternTop);

  const lanternBodyGeom = new THREE.CylinderGeometry(0.18, 0.20, 0.38, 16);
  const lanternBodyMat = new THREE.MeshStandardMaterial({
    color: 0xffe099,
    emissive: 0xff8811,
    emissiveIntensity: 2.2,
    roughness: 0.3
  });
  const lanternBody = new THREE.Mesh(lanternBodyGeom, lanternBodyMat);
  lanternGroup.add(lanternBody);

  const lanternBot = new THREE.Mesh(lanternCapGeom, lanternCapMat);
  lanternBot.position.y = -0.22;
  lanternGroup.add(lanternBot);

  // Sakura Petal & Firefly Particles
  const flyCount = 20;
  const flyGeom = new THREE.BufferGeometry();
  const flyPos = new Float32Array(flyCount * 3);
  for (let i = 0; i < flyCount; i++) {
    flyPos[i * 3] = (Math.random() - 0.5) * 3.0;
    flyPos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
    flyPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5 + 0.3;
  }
  flyGeom.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
  const flyMat = new THREE.PointsMaterial({
    color: 0xffd27a,
    size: 0.07,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8
  });
  const flyPoints = new THREE.Points(flyGeom, flyMat);
  yukiRoot.add(flyPoints);

  // Animation Tween State
  let action = "idle";
  let actionStart = 0;
  let actionDuration = 0;

  function setAction(name, dur) {
    action = name;
    actionStart = performance.now();
    actionDuration = dur;
  }

  function update(time) {
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    const amp = isQuiet ? 0.45 : 1.0;
    const now = performance.now();

    // Human Breathing & Kimono Settle
    const breathT = time * 0.0024 + 1.2;
    const breath = Math.sin(breathT);
    const breathScaleY = 1.0 + breath * 0.02 * amp;
    const breathScaleX = 1.0 - breath * 0.01 * amp;
    let targetY = -0.1 + breath * 0.03 * amp;
    let targetScale = 1.0;

    // Damped Gaze Tracking (Yuki looks toward user cursor)
    let targetRotY = smoothPointer.x * 0.22 * amp;
    let targetRotZ = Math.sin(time * 0.0025) * 0.02 * amp;

    // Lantern physics swing & warm breathing glow
    lanternGroup.rotation.z = Math.sin(time * 0.003) * 0.16 * amp;
    lanternGroup.position.y = -0.1 + Math.sin(time * 0.004) * 0.04 * amp;
    lanternLight.intensity = (2.4 + Math.sin(time * 0.005) * 0.7) * amp;

    if (action !== "idle") {
      const elapsed = now - actionStart;
      const progress = Math.min(1, elapsed / actionDuration);

      if (action === "cheer") {
        const hop = Math.sin(progress * Math.PI) * 0.35 * amp;
        targetY = -0.1 + hop;
        lanternGroup.rotation.z = Math.sin(progress * Math.PI * 4) * 0.38 * amp;
        lanternLight.intensity = 2.4 + Math.sin(progress * Math.PI) * 2.0 * amp;
        lanternBodyMat.emissiveIntensity = 2.2 + Math.sin(progress * Math.PI) * 1.5 * amp;

        if (progress >= 1) {
          action = "idle";
          lanternLight.intensity = 2.4;
          lanternBodyMat.emissiveIntensity = 2.2;
        }
      } else if (action === "victory") {
        const hop = Math.abs(Math.sin(progress * Math.PI * 5)) * 0.35 * amp;
        targetY = -0.1 + hop;
        lanternGroup.rotation.z = Math.sin(progress * Math.PI * 6) * 0.35 * amp;
        lanternLight.intensity = 3.2 + Math.sin(progress * Math.PI * 3) * 1.2 * amp;

        if (progress >= 1) {
          action = "idle";
          lanternLight.intensity = 2.4;
        }
      } else if (action === "victoryQuiet") {
        targetY = -0.1 + Math.sin(progress * Math.PI * 2) * 0.08;
        if (progress >= 1) action = "idle";
      } else if (action === "click") {
        targetY = -0.1 + Math.sin(progress * Math.PI) * 0.05 * amp;
        lanternGroup.rotation.z = Math.sin(progress * Math.PI * 2) * 0.15 * amp;
        if (progress >= 1) action = "idle";
      }
    }

    yukiRoot.position.y = targetY;
    yukiRoot.scale.set(targetScale * breathScaleX, targetScale * breathScaleY, targetScale);
    yukiRoot.rotation.set(0, targetRotY, targetRotZ);

    renderer.render(scene, camera);
  }

  return {
    cheer: () => setAction("cheer", 700),
    victory: (quiet) => setAction(quiet ? "victoryQuiet" : "victory", quiet ? 1400 : 2500),
    click: () => setAction("click", 300),
    update
  };
}

/* ==========================================================
 * MODAL CELEBRATION CHARACTERS (BINGO Modal Slots)
 * ========================================================== */

// Celebratory Kai for #modalLeft (170×280px)
function initModalKai(container) {
  if (!container) return null;

  const width = container.clientWidth || 170;
  const height = container.clientHeight || 280;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
  camera.position.set(0, 0, 4.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x351848, 1.8);
  scene.add(ambient);
  const flameLight = new THREE.PointLight(0xff5511, 2.5, 6);
  flameLight.position.set(0, 0.2, 1.2);
  scene.add(flameLight);

  const root = new THREE.Group();
  scene.add(root);

  const tex = loadCharTexture('img/kai_modal.png');
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.02,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), mat);
  mesh.position.set(0, 0.05, 0);
  root.add(mesh);

  function update(time) {
    const modalOverlay = document.getElementById("overlay");
    if (!modalOverlay || !modalOverlay.classList.contains("show")) return;
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    // Gentle celebratory bounce loop
    const bounce = Math.abs(Math.sin(time * 0.005)) * 0.14;
    root.position.y = -0.05 + bounce;
    root.rotation.z = Math.sin(time * 0.003) * 0.04;
    flameLight.intensity = 2.2 + Math.sin(time * 0.007) * 0.8;

    renderer.render(scene, camera);
  }

  return { update };
}

// Celebratory Yuki for #modalRight (170×280px)
function initModalYuki(container) {
  if (!container) return null;

  const width = container.clientWidth || 170;
  const height = container.clientHeight || 280;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
  camera.position.set(0, 0, 4.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x351848, 1.8);
  scene.add(ambient);
  const lanternLight = new THREE.PointLight(0xffaa33, 2.5, 6);
  lanternLight.position.set(0.4, 0.2, 1.2);
  scene.add(lanternLight);

  const root = new THREE.Group();
  scene.add(root);

  const tex = loadCharTexture('img/yuki_modal.png');
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.02,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 2.85), mat);
  mesh.position.set(0, -0.05, 0);
  root.add(mesh);

  function update(time) {
    const modalOverlay = document.getElementById("overlay");
    if (!modalOverlay || !modalOverlay.classList.contains("show")) return;
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    const bounce = Math.abs(Math.sin(time * 0.005 + 1.2)) * 0.14;
    root.position.y = -0.05 + bounce;
    root.rotation.z = Math.sin(time * 0.003 + 1.0) * 0.04;
    lanternLight.intensity = 2.2 + Math.sin(time * 0.006) * 0.8;

    renderer.render(scene, camera);
  }

  return { update };
}

/* ==========================================================
 * INITIALIZATION & SMOOTH 60FPS LOOP
 * ========================================================== */
let lastFrameTime = performance.now();

function init() {
  const stageLeftEl = document.getElementById("stageLeft");
  const stageRightEl = document.getElementById("stageRight");
  const modalLeftEl = document.getElementById("modalLeft");
  const modalRightEl = document.getElementById("modalRight");

  kai = initKaiStage(stageLeftEl);
  yuki = initYukiStage(stageRightEl);
  modalKai = initModalKai(modalLeftEl);
  modalYuki = initModalYuki(modalRightEl);

  function loop(time) {
    if (!isPageHidden) {
      const dt = Math.min(1 / 30, (time - lastFrameTime) / 1000);
      lastFrameTime = time;

      // Exponential damping across refresh rates (Skill: add-mouse-driven-orbit)
      const alpha = 1 - Math.pow(1 - 0.065, dt * 60);
      smoothPointer.x += (pointer.x - smoothPointer.x) * alpha;
      smoothPointer.y += (pointer.y - smoothPointer.y) * alpha;

      if (kai) kai.update(time);
      if (yuki) yuki.update(time);
      if (modalKai) modalKai.update(time);
      if (modalYuki) modalYuki.update(time);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

})();
