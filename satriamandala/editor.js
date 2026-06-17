// =============================================================================
// EDITOR.JS — Sandbox Editor for Museum Satria Mandala
// =============================================================================

// ── TILE CONFIG (must match app.js) ──────────────────────────────────────────
const zoom = 17;
const startX = 104425;
const startY = 67807;
const gridSize = 4;
const GROUND_SIZE = 350;
const METERS_PER_UNIT = (4 * 304) / GROUND_SIZE;

function latLngToXZ(lat, lng) {
  const n = Math.pow(2.0, zoom);
  const xTileRaw = (lng + 180.0) / 360.0 * n;
  const latRad = lat * Math.PI / 180.0;
  const yTileRaw = (1.0 - Math.log(Math.tan(latRad) + 1.0 / Math.cos(latRad)) / Math.PI) / 2.0 * n;
  const x = (xTileRaw - startX) / gridSize * GROUND_SIZE - GROUND_SIZE / 2;
  const z = (yTileRaw - startY) / gridSize * GROUND_SIZE - GROUND_SIZE / 2;
  return { x, z };
}

function xzToLatLng(x, z) {
  const n = Math.pow(2.0, zoom);
  const xTileRaw = (x + GROUND_SIZE / 2) / GROUND_SIZE * gridSize + startX;
  const yTileRaw = (z + GROUND_SIZE / 2) / GROUND_SIZE * gridSize + startY;
  const lng = xTileRaw / n * 360.0 - 180.0;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * yTileRaw / n)));
  const lat = latRad * 180.0 / Math.PI;
  return { lat, lng };
}

// ── SCENE CONFIG STATE ────────────────────────────────────────────────────────
let sceneConfig = {
  version: '1.0',
  museum: {
    name: 'Museum Satria Mandala',
    center: { lat: -6.2315, lng: 106.8188 },
    bounds: { minX: -40, maxX: 40, minZ: -40, maxZ: 40 }
  },
  objects3D: [],
  markers: []
};

// ── THREE.JS SETUP ────────────────────────────────────────────────────────────
const container = document.getElementById('sb-canvas-wrap');
const W = container.clientWidth || window.innerWidth - 56 - 280;
const H = container.clientHeight || window.innerHeight - 52 - 32;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeaedf0);
scene.fog = new THREE.FogExp2(0xeaedf0, 0.0035);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000);
camera.position.set(100, 90, 100);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.minDistance = 10;
controls.maxDistance = 300;
controls.target.set(0, 0, 0);

// ── TRANSFORM CONTROLS SETUP ──────────────────────────────────────────────────
const transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.showY = false; // Restrict dragging to XZ flat plane
transformControls.size = 0.85;
scene.add(transformControls);

const clock = new THREE.Clock();

// Kordinat Lalu Lintas Jl. Gatot Subroto
const trafficWestCoords = [
  [106.8272988, -6.2365240],
  [106.8272629, -6.2364989],
  [106.8270472, -6.2363484],
  [106.8269755, -6.2362984],
  [106.8268332, -6.2361991],
  [106.8266635, -6.2360807],
  [106.8265744, -6.2360185],
  [106.8264899, -6.2359595],
  [106.8263335, -6.2358504],
  [106.8260185, -6.2356474],
  [106.8256881, -6.2354126],
  [106.8254650, -6.2352699],
  [106.8252520, -6.2351399],
  [106.8250262, -6.2350217],
  [106.8247534, -6.2348975],
  [106.8246764, -6.2348606],
  [106.8244268, -6.2346917],
  [106.8243047, -6.2346086],
  [106.8237866, -6.2342456],
  [106.8236742, -6.2341616],
  [106.8235606, -6.2340760],
  [106.8227890, -6.2335682],
  [106.8225914, -6.2334219],
  [106.8224286, -6.2332957],
  [106.8221960, -6.2331052],
  [106.8220689, -6.2329688],
  [106.8217922, -6.2326532],
  [106.8217696, -6.2326259],
  [106.8217296, -6.2325801],
  [106.8216630, -6.2325088],
  [106.8213305, -6.2321038],
  [106.8212115, -6.2319422],
  [106.8209971, -6.2316435],
  [106.8209023, -6.2314908],
  [106.8208130, -6.2313516],
  [106.8206600, -6.2311132],
  [106.8206337, -6.2310716],
  [106.8204733, -6.2308081],
  [106.8202099, -6.2303775],
  [106.8200520, -6.2301193],
  [106.8199868, -6.2300215],
  [106.8197350, -6.2296253],
  [106.8196963, -6.2295717],
  [106.8194857, -6.2292791],
  [106.8194330, -6.2292318],
  [106.8193216, -6.2291195],
  [106.8192359, -6.2290345],
  [106.8192053, -6.2289918],
  [106.8191832, -6.2289604],
  [106.8191456, -6.2288920],
  [106.8190573, -6.2287632],
  [106.8190211, -6.2287137],
  [106.8187987, -6.2283766],
  [106.8184982, -6.2279210],
  [106.8182584, -6.2275724],
  [106.8179404, -6.2271415],
  [106.8179013, -6.2270823],
  [106.8178863, -6.2270608],
  [106.8178395, -6.2269988],
  [106.8177342, -6.2268258],
  [106.8176537, -6.2266989],
  [106.8176047, -6.2266246],
  [106.8173386, -6.2262309],
  [106.8173017, -6.2261801],
  [106.8172322, -6.2260859],
  [106.8171871, -6.2260173],
  [106.8170814, -6.2258564],
  [106.8168849, -6.2255762],
  [106.8167152, -6.2253324],
  [106.8166378, -6.2252230],
  [106.8164592, -6.2249464],
  [106.8163431, -6.2247711],
  [106.8161339, -6.2244164],
  [106.8160250, -6.2242318],
  [106.8158695, -6.2239730],
  [106.8157962, -6.2238521],
  [106.8157514, -6.2237782],
  [106.8157404, -6.2237599],
  [106.8157004, -6.2237050],
  [106.8155000, -6.2234270],
  [106.8152506, -6.2230811],
];

const trafficEastCoords = [
  [106.8143699, -6.2226916],
  [106.8148224, -6.2234306],
  [106.8149195, -6.2235675],
  [106.8151331, -6.2238534],
  [106.8155689, -6.2244421],
  [106.8157140, -6.2246645],
  [106.8157755, -6.2247588],
  [106.8159301, -6.2249915],
  [106.8163004, -6.2255346],
  [106.8166313, -6.2260215],
  [106.8167818, -6.2262436],
  [106.8168135, -6.2262907],
  [106.8169629, -6.2265145],
  [106.8171969, -6.2268706],
  [106.8172206, -6.2269067],
  [106.8173936, -6.2271592],
  [106.8176874, -6.2275894],
  [106.8177554, -6.2276870],
  [106.8185571, -6.2288504],
  [106.8185911, -6.2288998],
  [106.8188754, -6.2293077],
  [106.8189306, -6.2293865],
  [106.8189732, -6.2294496],
  [106.8193566, -6.2300192],
  [106.8194066, -6.2300940],
  [106.8196878, -6.2305094],
  [106.8198967, -6.2308179],
  [106.8204091, -6.2315694],
  [106.8205244, -6.2317301],
  [106.8205722, -6.2318000],
  [106.8208283, -6.2321634],
  [106.8208645, -6.2322131],
  [106.8210043, -6.2324045],
  [106.8210739, -6.2324998],
  [106.8212494, -6.2327406],
  [106.8213639, -6.2328790],
  [106.8214008, -6.2329229],
  [106.8214718, -6.2329960],
  [106.8217884, -6.2333325],
  [106.8218202, -6.2333698],
  [106.8221955, -6.2337052],
  [106.8222215, -6.2337313],
  [106.8222698, -6.2337759],
  [106.8223094, -6.2338103],
  [106.8223595, -6.2338539],
  [106.8224500, -6.2339325],
  [106.8227488, -6.2341566],
  [106.8228809, -6.2342462],
  [106.8230751, -6.2343719],
  [106.8233360, -6.2345361],
  [106.8234179, -6.2345765],
  [106.8235280, -6.2346237],
  [106.8236430, -6.2346475],
  [106.8238343, -6.2347696],
  [106.8240286, -6.2348900],
  [106.8242215, -6.2350173],
  [106.8244453, -6.2351775],
  [106.8245413, -6.2352659],
  [106.8246496, -6.2353544],
  [106.8251474, -6.2357045],
  [106.8254125, -6.2358910],
  [106.8256213, -6.2360259],
  [106.8258509, -6.2361825],
  [106.8259422, -6.2362384],
  [106.8260181, -6.2362849],
  [106.8262943, -6.2364638],
  [106.8268054, -6.2368060],
  [106.8268598, -6.2368424],
];

// OSM Buildings material & group setup
const osmBuildingMat = new THREE.MeshPhysicalMaterial({
  color: 0xf2f0eb,
  roughness: 0.45,
  metalness: 0.05,
  clearcoat: 0.35,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.25,
  transparent: false,
  side: THREE.DoubleSide
});

const osmBuildingsGroup = new THREE.Group();
scene.add(osmBuildingsGroup);

// Disable OrbitControls while dragging objects
transformControls.addEventListener('dragging-changed', (event) => {
  controls.enabled = !event.value;
});

// Real-time synchronization when objects/markers are dragged visually
transformControls.addEventListener('objectChange', () => {
  if (!selectedId || !selectedType) return;
  
  if (selectedType === 'object3D') {
    const entry = obj3DRegistry.get(selectedId);
    if (entry) {
      // Force Y position to remain on the ground
      const h = entry.config.height || 12;
      entry.mesh.position.y = h / 2;
      
      const { lat, lng } = xzToLatLng(entry.mesh.position.x, entry.mesh.position.z);
      entry.config.lat = lat;
      entry.config.lng = lng;
      
      const latEl = document.getElementById('p-lat');
      const lngEl = document.getElementById('p-lng');
      if (latEl) latEl.value = lat.toFixed(6);
      if (lngEl) lngEl.value = lng.toFixed(6);
    }
  } else if (selectedType === 'marker') {
    const entry = markerRegistry.get(selectedId);
    if (entry) {
      // Force Y position to ground level
      entry.group.position.y = 0;
      
      const { lat, lng } = xzToLatLng(entry.group.position.x, entry.group.position.z);
      entry.config.lat = lat;
      entry.config.lng = lng;
      
      const latEl = document.getElementById('p-lat');
      const lngEl = document.getElementById('p-lng');
      if (latEl) latEl.value = lat.toFixed(6);
      if (lngEl) lngEl.value = lng.toFixed(6);
    }
  }
  scheduleAutoSave();
});


// ── HDRI & FALLBACK SYNTHETIC STUDIO ENVIRONMENT MAP ──────────────────────────
function generateSyntheticEnvMap(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Gradien dasar abu-abu/biru gelap studio
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1a222d');
  grad.addColorStop(0.5, '#0b0f14');
  grad.addColorStop(1, '#05070a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Softbox utama: cahaya putih-biru sejuk di kiri atas
  let radGrad1 = ctx.createRadialGradient(128, 96, 10, 128, 96, 120);
  radGrad1.addColorStop(0, 'rgba(235, 245, 255, 0.9)');
  radGrad1.addColorStop(0.2, 'rgba(200, 225, 255, 0.6)');
  radGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad1;
  ctx.beginPath();
  ctx.arc(128, 96, 120, 0, Math.PI * 2);
  ctx.fill();

  // Softbox hangat: cahaya jingga/kuning hangat di kanan atas
  let radGrad2 = ctx.createRadialGradient(384, 80, 5, 384, 80, 90);
  radGrad2.addColorStop(0, 'rgba(255, 240, 210, 0.85)');
  radGrad2.addColorStop(0.3, 'rgba(255, 220, 180, 0.45)');
  radGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad2;
  ctx.beginPath();
  ctx.arc(384, 80, 90, 0, Math.PI * 2);
  ctx.fill();

  // Lampu sorot atas: cahaya putih lembut di tengah
  let radGrad3 = ctx.createRadialGradient(256, 32, 2, 256, 32, 60);
  radGrad3.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  radGrad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad3;
  ctx.beginPath();
  ctx.arc(256, 32, 60, 0, Math.PI * 2);
  ctx.fill();

  const canvasTex = new THREE.CanvasTexture(canvas);
  canvasTex.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromEquirectangular(canvasTex).texture;
  
  canvasTex.dispose();
  pmremGenerator.dispose();
  
  return envMap;
}

function setupHDRLighting(renderer, scene) {
  const fallbackEnvMap = generateSyntheticEnvMap(renderer);
  scene.environment = fallbackEnvMap;

  const rgbeLoader = new THREE.RGBELoader();
  const hdrUrl = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/equirectangular/royal_esplanade_1k.hdr';
  
  rgbeLoader.load(hdrUrl, 
    (texture) => {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      
      scene.environment = envMap;
      
      texture.dispose();
      pmremGenerator.dispose();
      fallbackEnvMap.dispose();
      console.log('[HDRI] Real Environment loaded successfully in Sandbox.');
    },
    undefined,
    (err) => {
      console.warn('[HDRI] Failed loading real HDR in Sandbox. Using synthetic fallback.', err);
    }
  );
}

// Setup HDRI Lighting
setupHDRLighting(renderer, scene);

// ── LIGHTING (Sync with app.js) ───────────────────────────────────────────────
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xb0c4de, 0.45);
scene.add(hemisphereLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.85);
sunLight.position.set(80, 120, 80);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 400;
const d = 165;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0002;
sunLight.shadow.radius = 3.5;
scene.add(sunLight);

// ── GROUND ────────────────────────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
const groundMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.55,
  metalness: 0.0,
  clearcoat: 0.0,
  envMapIntensity: 0.4,
  transparent: false
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.name = '__ground__';
scene.add(ground);

// Load map texture
(function loadMapTex() {
  const TILE_PX = 512;
  const canvasSize = gridSize * TILE_PX;
  const cvs = document.createElement('canvas');
  cvs.width = canvasSize; cvs.height = canvasSize;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#e8edf2';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  let loaded = 0;
  const total = gridSize * gridSize;
  for (let dx = 0; dx < gridSize; dx++) {
    for (let dy = 0; dy < gridSize; dy++) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${startX+dx}/${startY+dy}@2x.png`;
      img.onload = img.onerror = (function(xi, yi) { return function() {
        if (img.complete && img.naturalWidth) ctx.drawImage(img, xi*TILE_PX, yi*TILE_PX, TILE_PX, TILE_PX);
        if (++loaded === total) {
          const tex = new THREE.CanvasTexture(cvs);
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          groundMat.map = tex;
          groundMat.needsUpdate = true;
        }
      }; })(dx, dy);
    }
  }
})();

// ── MUSEUM BOUNDS GIZMO ───────────────────────────────────────────────────────
let boundsBox, boundsEdges;

function updateBoundsGizmo() {
  const b = sceneConfig.museum.bounds;
  const cx = (b.minX + b.maxX) / 2;
  const cz = (b.minZ + b.maxZ) / 2;
  const sx = b.maxX - b.minX;
  const sz = b.maxZ - b.minZ;

  if (boundsBox) { scene.remove(boundsBox); boundsBox.geometry.dispose(); }
  if (boundsEdges) { scene.remove(boundsEdges); boundsEdges.geometry.dispose(); }

  const geo = new THREE.BoxGeometry(sx, 0.05, sz);
  const mat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, opacity: 0.08, transparent: true });
  boundsBox = new THREE.Mesh(geo, mat);
  boundsBox.position.set(cx, 0.025, cz);
  boundsBox.name = '__bounds__';
  scene.add(boundsBox);

  const edges = new THREE.EdgesGeometry(geo);
  const linesMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 });
  boundsEdges = new THREE.LineSegments(edges, linesMat);
  boundsEdges.position.set(cx, 0.025, cz);
  boundsEdges.name = '__bounds_edges__';
  scene.add(boundsEdges);
}
updateBoundsGizmo();

// ── MATERIALS ─────────────────────────────────────────────────────────────────
const OBJ_MAT = new THREE.MeshPhysicalMaterial({
  color: 0xf5f5f0, roughness: 0.45, metalness: 0.05,
  clearcoat: 0.35, clearcoatRoughness: 0.2, envMapIntensity: 1.2
});
const OBJ_MAT_SEL = new THREE.MeshPhysicalMaterial({
  color: 0x93c5fd, roughness: 0.35, metalness: 0.1,
  clearcoat: 0.5, envMapIntensity: 1.4,
  emissive: 0x1d4ed8, emissiveIntensity: 0.12
});

const MARKER_DEFAULT_MAT = new THREE.MeshPhysicalMaterial({
  color: 0x1e293b, roughness: 0.25, metalness: 0.7,
  clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 1.3
});
const MARKER_SEL_MAT = new THREE.MeshPhysicalMaterial({
  color: 0x2563eb, roughness: 0.15, metalness: 0.85,
  clearcoat: 1.0, emissive: 0x1d4ed8, emissiveIntensity: 0.3, envMapIntensity: 1.6
});
const MARKER_LOCKED_MAT = new THREE.MeshPhysicalMaterial({
  color: 0xe15b64, roughness: 0.3, metalness: 0.6,
  clearcoat: 0.7, envMapIntensity: 1.3
});

// ── SCENE OBJECT REGISTRY ─────────────────────────────────────────────────────
// Maps id → { configRef, mesh/group }
const obj3DRegistry = new Map();   // id → { config, mesh }
const markerRegistry = new Map();  // id → { config, group }

function add3DObject(cfg) {
  const { x, z } = latLngToXZ(cfg.lat, cfg.lng);
  const w = cfg.width  || 10;
  const h = cfg.height || 12;
  const d = cfg.depth  || 10;

  let geo;
  if (cfg.type === 'cylinder') {
    geo = new THREE.CylinderGeometry(w / 2, w / 2, h, 24);
  } else {
    geo = new THREE.BoxGeometry(w, h, d);
  }

  const mat = OBJ_MAT.clone();
  mat.color.set(cfg.color || '#f5f5f0');

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { type: 'object3D', id: cfg.id };
  scene.add(mesh);
  obj3DRegistry.set(cfg.id, { config: cfg, mesh });
  updateStatusBar();
}

function remove3DObject(id) {
  const entry = obj3DRegistry.get(id);
  if (!entry) return;
  scene.remove(entry.mesh);
  entry.mesh.geometry.dispose();
  obj3DRegistry.delete(id);
  sceneConfig.objects3D = sceneConfig.objects3D.filter(o => o.id !== id);
  updateStatusBar();
}

function addMarker(cfg) {
  const { x, z } = latLngToXZ(cfg.lat, cfg.lng);
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData = { type: 'marker', id: cfg.id };

  const isLocked = cfg.locked;
  const isActive = selectedId === cfg.id;
  let standMat = cfg.locked ? MARKER_LOCKED_MAT : MARKER_DEFAULT_MAT;
  if (isActive) standMat = MARKER_SEL_MAT;

  // 1. Pedestal silinder
  const standGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 16);
  const standMesh = new THREE.Mesh(standGeo, standMat);
  standMesh.position.y = 0.2;
  standMesh.castShadow = true;
  standMesh.receiveShadow = true;
  group.add(standMesh);

  // 2. Tiang penyangga tipis (logam krom perak reflektif)
  const rodMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd1d5db,
    roughness: 0.05,
    metalness: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.7,
    transparent: false
  });
  const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8);
  const rodMesh = new THREE.Mesh(rodGeo, rodMaterial);
  rodMesh.position.y = 1.5;
  rodMesh.castShadow = true;
  group.add(rodMesh);

  // 3. Sprite billboard lingkaran berindeks angka / lock melayang
  const index = sceneConfig.markers.indexOf(cfg);
  const indexText = index !== -1 ? String(index + 1).padStart(2, '0') : '01';
  
  const spriteMat = new THREE.SpriteMaterial({
    map: createBadgeTexture(indexText, isLocked, isActive),
    depthWrite: false,
    depthTest: true
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(0, 3.2, 0);
  sprite.scale.set(2.2, 2.2, 1);
  group.add(sprite);

  // Simpan data referensi di dalam group.userData
  group.userData.sprite = sprite;
  group.userData.index = index !== -1 ? index : 0;

  scene.add(group);
  markerRegistry.set(cfg.id, { config: cfg, group });
  updateStatusBar();
}

function removeMarker(id) {
  const entry = markerRegistry.get(id);
  if (!entry) return;
  scene.remove(entry.group);
  markerRegistry.delete(id);
  sceneConfig.markers = sceneConfig.markers.filter(m => m.id !== id);
  updateStatusBar();
}

// ── SELECTION STATE ───────────────────────────────────────────────────────────
let selectedId = null;
let selectedType = null; // 'object3D' | 'marker'

function createBadgeTexture(text, isLocked = false, isActive = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, 64, 64);
  
  // Bayangan bulat
  ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;
  
  ctx.beginPath();
  ctx.arc(32, 32, 23, 0, 2 * Math.PI);
  if (isActive) {
    ctx.fillStyle = '#2563eb';
  } else if (isLocked) {
    ctx.fillStyle = '#e15b64';
  } else {
    ctx.fillStyle = '#0f172a';
  }
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Plus Jakarta Sans", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (isLocked) {
    ctx.fillText('🔒', 32, 32);
  } else {
    ctx.fillText(text, 32, 32);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function updateMarkersVisuals() {
  markerRegistry.forEach((entry, id) => {
    const group = entry.group;
    const cfg = entry.config;
    const isActive = selectedId === id;
    const isLocked = cfg.locked;

    const standMesh = group.children[0];
    if (standMesh) {
      if (isActive) standMesh.material = MARKER_SEL_MAT;
      else if (isLocked) standMesh.material = MARKER_LOCKED_MAT;
      else standMesh.material = MARKER_DEFAULT_MAT;
    }

    const sprite = group.userData.sprite;
    if (sprite) {
      const index = sceneConfig.markers.indexOf(cfg);
      const indexText = index !== -1 ? String(index + 1).padStart(2, '0') : '01';
      const oldTexture = sprite.material.map;
      sprite.material.map = createBadgeTexture(indexText, isLocked, isActive);
      if (oldTexture) oldTexture.dispose();
    }
  });
}

function selectObject(id, type) {
  deselectAll();
  selectedId = id;
  selectedType = type;

  if (type === 'object3D') {
    const entry = obj3DRegistry.get(id);
    if (entry) {
      entry.mesh.material = OBJ_MAT_SEL;
      transformControls.attach(entry.mesh);
    }
  } else if (type === 'marker') {
    const entry = markerRegistry.get(id);
    if (entry) {
      transformControls.attach(entry.group);
      updateMarkersVisuals();
    }
  }

  showProperties(id, type);
  document.getElementById('btn-delete-sel').style.display = '';
}

function deselectAll() {
  if (typeof transformControls !== 'undefined') {
    transformControls.detach();
  }
  if (selectedId) {
    if (selectedType === 'object3D') {
      const entry = obj3DRegistry.get(selectedId);
      if (entry) {
        entry.mesh.material = OBJ_MAT.clone();
        entry.mesh.material.color.set(entry.config.color || '#f5f5f0');
      }
    }
  }
  selectedId = null;
  selectedType = null;
  updateMarkersVisuals();
  showPropsEmpty();
  document.getElementById('btn-delete-sel').style.display = 'none';
}

// ── PROPERTIES PANEL ──────────────────────────────────────────────────────────
function showPropsEmpty() {
  document.getElementById('props-body').innerHTML = `
    <div class="props-empty">
      <span class="empty-icon">🎯</span>
      <span>Select an object or marker<br>to edit its properties</span>
    </div>`;
}

function showProperties(id, type) {
  const body = document.getElementById('props-body');

  if (type === 'object3D') {
    const cfg = sceneConfig.objects3D.find(o => o.id === id);
    if (!cfg) return;
    body.innerHTML = `
      <div class="prop-group">
        <div class="prop-group-label">Identity</div>
        <div class="prop-row"><label>Label</label><input type="text" id="p-label" value="${cfg.label || ''}" /></div>
        <div class="prop-row"><label>Type</label>
          <select id="p-type">
            <option value="box" ${cfg.type==='box'?'selected':''}>Box</option>
            <option value="cylinder" ${cfg.type==='cylinder'?'selected':''}>Cylinder</option>
          </select>
        </div>
      </div>
      <div class="prop-group">
        <div class="prop-group-label">Dimensions (meters)</div>
        <div class="prop-row-2col">
          <div class="prop-row"><label>Width</label><input type="number" id="p-width" value="${cfg.width||10}" min="1" max="100" /></div>
          <div class="prop-row"><label>Depth</label><input type="number" id="p-depth" value="${cfg.depth||10}" min="1" max="100" /></div>
        </div>
        <div class="prop-row"><label>Height</label><input type="number" id="p-height" value="${cfg.height||12}" min="1" max="200" /></div>
      </div>
      <div class="prop-group">
        <div class="prop-group-label">Material</div>
        <div class="prop-row"><label>Color</label><input type="color" id="p-color" value="${cfg.color||'#f5f5f0'}" /></div>
        <div class="prop-row-2col">
          <div class="prop-row"><label>Roughness</label><input type="number" id="p-rough" value="${cfg.roughness||0.45}" min="0" max="1" step="0.05" /></div>
          <div class="prop-row"><label>Metalness</label><input type="number" id="p-metal" value="${cfg.metalness||0.05}" min="0" max="1" step="0.05" /></div>
        </div>
      </div>
      <div class="prop-group">
        <div class="prop-group-label">Position</div>
        <div class="prop-row-2col">
          <div class="prop-row"><label>Lat</label><input type="number" id="p-lat" value="${cfg.lat.toFixed(6)}" step="0.0001" /></div>
          <div class="prop-row"><label>Lng</label><input type="number" id="p-lng" value="${cfg.lng.toFixed(6)}" step="0.0001" /></div>
        </div>
      </div>`;

    // Real-time updates
    ['p-label','p-type','p-width','p-depth','p-height','p-color','p-rough','p-metal','p-lat','p-lng'].forEach(elId => {
      const el = document.getElementById(elId);
      if (el) el.addEventListener('input', () => applyObj3DProps(id));
    });

  } else if (type === 'marker') {
    const cfg = sceneConfig.markers.find(m => m.id === id);
    if (!cfg) return;
    const imgHtml = cfg.image
      ? `<img id="p-img-preview" class="prop-img-preview" src="${cfg.image}" />`
      : `<div class="prop-img-placeholder" id="p-img-drop" onclick="document.getElementById('sb-img-input-prop').click()">📷 Klik untuk upload gambar</div>`;

    body.innerHTML = `
      <div class="prop-group">
        <div class="prop-group-label">Identity</div>
        <div class="prop-row"><label>ID</label><input type="text" id="p-id" value="${cfg.id}" /></div>
        <div class="prop-row"><label>Judul</label><input type="text" id="p-title" value="${escHtml(cfg.title||'')}" /></div>
        <div class="prop-row"><label>Subtitle</label><input type="text" id="p-subtitle" value="${escHtml(cfg.subtitle||'')}" /></div>
        <div class="prop-row-2col">
          <div class="prop-row"><label>Kategori</label>
            <select id="p-cat">
              <option value="aircraft" ${cfg.category==='aircraft'?'selected':''}>Pesawat</option>
              <option value="tank" ${cfg.category==='tank'?'selected':''}>Tank</option>
              <option value="navy" ${cfg.category==='navy'?'selected':''}>Navy</option>
              <option value="artillery" ${cfg.category==='artillery'?'selected':''}>Artileri</option>
              <option value="diorama" ${cfg.category==='diorama'?'selected':''}>Diorama</option>
              <option value="other" ${cfg.category==='other'?'selected':''}>Lainnya</option>
            </select>
          </div>
          <div class="prop-row"><label>Tahun</label><input type="text" id="p-year" value="${escHtml(cfg.year||'')}" /></div>
        </div>
        <div class="prop-row"><label>Asal Negara</label><input type="text" id="p-origin" value="${escHtml(cfg.origin||'')}" /></div>
      </div>
      <div class="prop-group">
        <div class="prop-group-label">Gambar</div>
        ${imgHtml}
        <div style="margin-top:8px;">
          <button class="sb-btn" style="width:100%;justify-content:center;" onclick="document.getElementById('sb-img-input-prop').click()">📷 Ganti Gambar</button>
        </div>
      </div>
      <div class="prop-group">
        <div class="prop-group-label">Konten</div>
        <div class="prop-row"><label>Deskripsi</label><textarea id="p-desc" rows="4">${escHtml(cfg.description||'')}</textarea></div>
        <div class="prop-row"><label>Fakta Menarik</label><textarea id="p-fact" rows="3">${escHtml(cfg.fact||'')}</textarea></div>
      </div>
      <div class="prop-group">
        <div class="prop-group-label">Status</div>
        <div class="prop-toggle">
          <label>🔒 Terkunci</label>
          <div class="toggle-switch${cfg.locked?' on':''}" id="p-locked"></div>
        </div>
      </div>
      <div class="prop-group">
        <div class="prop-group-label">Posisi</div>
        <div class="prop-row-2col">
          <div class="prop-row"><label>Lat</label><input type="number" id="p-lat" value="${cfg.lat.toFixed(6)}" step="0.0001" /></div>
          <div class="prop-row"><label>Lng</label><input type="number" id="p-lng" value="${cfg.lng.toFixed(6)}" step="0.0001" /></div>
        </div>
      </div>`;

    // Toggle locked
    document.getElementById('p-locked').addEventListener('click', function() {
      this.classList.toggle('on');
      cfg.locked = this.classList.contains('on');
      // Refresh marker visuals
      const entry = markerRegistry.get(id);
      if (entry) {
        const mat = cfg.locked ? MARKER_LOCKED_MAT : MARKER_SEL_MAT;
        entry.group.children.forEach(c => c.material = mat);
      }
      scheduleAutoSave();
    });

    // Image upload for selected marker
    document.getElementById('sb-img-input-prop').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        cfg.image = evt.target.result;
        const preview = document.getElementById('p-img-preview');
        const drop = document.getElementById('p-img-drop');
        if (preview) preview.src = cfg.image;
        if (drop) {
          drop.outerHTML = `<img id="p-img-preview" class="prop-img-preview" src="${cfg.image}" />`;
        }
        scheduleAutoSave();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    };

    // Real-time updates for text fields
    ['p-id','p-title','p-subtitle','p-cat','p-year','p-origin','p-desc','p-fact','p-lat','p-lng'].forEach(elId => {
      const el = document.getElementById(elId);
      if (el) el.addEventListener('input', () => applyMarkerProps(id));
    });
  }
}

function applyObj3DProps(id) {
  const cfg = sceneConfig.objects3D.find(o => o.id === id);
  if (!cfg) return;

  const oldType = cfg.type;
  const oldWidth = cfg.width;
  const oldHeight = cfg.height;
  const oldDepth = cfg.depth;

  cfg.label    = v('p-label') || cfg.label;
  cfg.type     = v('p-type')  || cfg.type;
  cfg.width    = parseFloat(v('p-width'))  || cfg.width;
  cfg.height   = parseFloat(v('p-height')) || cfg.height;
  cfg.depth    = parseFloat(v('p-depth'))  || cfg.depth;
  cfg.color    = v('p-color') || cfg.color;
  cfg.roughness= parseFloat(v('p-rough'))  ?? cfg.roughness;
  cfg.metalness= parseFloat(v('p-metal'))  ?? cfg.metalness;
  const newLat = parseFloat(v('p-lat'));
  const newLng = parseFloat(v('p-lng'));
  if (!isNaN(newLat)) cfg.lat = newLat;
  if (!isNaN(newLng)) cfg.lng = newLng;

  const entry = obj3DRegistry.get(id);
  if (entry) {
    // Recreate geometry only if type or dimensions changed
    if (cfg.type !== oldType || cfg.width !== oldWidth || cfg.height !== oldHeight || cfg.depth !== oldDepth) {
      entry.mesh.geometry.dispose();
      let geo;
      if (cfg.type === 'cylinder') {
        geo = new THREE.CylinderGeometry(cfg.width / 2, cfg.width / 2, cfg.height, 24);
      } else {
        geo = new THREE.BoxGeometry(cfg.width, cfg.height, cfg.depth);
      }
      entry.mesh.geometry = geo;
    }

    // Update material properties in-place
    if (entry.mesh.material) {
      entry.mesh.material.color.set(cfg.color || '#f5f5f0');
      entry.mesh.material.roughness = cfg.roughness;
      entry.mesh.material.metalness = cfg.metalness;
      entry.mesh.material.needsUpdate = true;
    }

    // Update position in-place
    const { x, z } = latLngToXZ(cfg.lat, cfg.lng);
    entry.mesh.position.set(x, cfg.height / 2, z);

    // Sync transformControls gizmo position
    if (typeof transformControls !== 'undefined' && transformControls.object === entry.mesh) {
      transformControls.update();
    }
  }

  scheduleAutoSave();
}

function applyMarkerProps(id) {
  const cfg = sceneConfig.markers.find(m => m.id === id);
  if (!cfg) return;

  const newId = v('p-id');
  const catMap = { aircraft:'Pesawat', tank:'Tank & Panser', navy:'Navy (KRI)', artillery:'Artileri Berat', diorama:'Diorama & Relik', other:'Lainnya' };

  cfg.title       = v('p-title')    || cfg.title;
  cfg.subtitle    = v('p-subtitle') || cfg.subtitle;
  cfg.category    = v('p-cat')      || cfg.category;
  cfg.categoryLabel = catMap[cfg.category] || 'Lainnya';
  cfg.year        = v('p-year')     || cfg.year;
  cfg.origin      = v('p-origin')   || cfg.origin;
  cfg.description = v('p-desc')     || cfg.description;
  cfg.fact        = v('p-fact')     || cfg.fact;
  const newLat = parseFloat(v('p-lat'));
  const newLng = parseFloat(v('p-lng'));
  if (!isNaN(newLat)) cfg.lat = newLat;
  if (!isNaN(newLng)) cfg.lng = newLng;

  // Move marker visually in-place
  const entry = markerRegistry.get(id);
  if (entry && !isNaN(newLat) && !isNaN(newLng)) {
    const { x, z } = latLngToXZ(cfg.lat, cfg.lng);
    entry.group.position.set(x, 0, z);

    // Sync transformControls gizmo position
    if (typeof transformControls !== 'undefined' && transformControls.object === entry.group) {
      transformControls.update();
    }
  }

  // Handle ID rename
  if (newId && newId !== id && newId.length > 0) {
    cfg.id = newId;
    if (entry) {
      entry.group.userData.id = newId;
      markerRegistry.delete(id);
      markerRegistry.set(newId, entry);
    }
    selectedId = newId;
  }

  updateMarkersVisuals();
  scheduleAutoSave();
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── TOOL STATE ────────────────────────────────────────────────────────────────
let currentTool = 'select';
let pendingPlacement = null; // { lat, lng } for new object
let markerModalMode = 'add'; // 'add' | 'pending'

const toolButtons = document.querySelectorAll('.tool-btn[data-tool]');
toolButtons.forEach(btn => {
  btn.addEventListener('click', () => switchTool(btn.dataset.tool));
});

function switchTool(tool) {
  currentTool = tool;
  toolButtons.forEach(b => b.classList.toggle('active', b.dataset.tool === tool));

  const viewport = document.getElementById('sb-viewport');
  viewport.className = `mode-${tool}`;

  const hint = document.getElementById('sb-place-hint');
  const modeInd = document.getElementById('sb-mode-indicator');
  const modeText = document.getElementById('mode-text');

  if (tool === 'select') {
    hint.classList.remove('visible');
    modeInd.classList.remove('visible');
    controls.enabled = true;
  } else {
    const labels = {
      box: 'ADD BOX', cylinder: 'ADD CYLINDER', marker: 'ADD MARKER', bounds: 'EDIT BOUNDS'
    };
    const hints = {
      box: 'Click on the map to place a Box • Esc to cancel',
      cylinder: 'Click on the map to place a Cylinder • Esc to cancel',
      marker: 'Click on the map to add a Marker • Esc to cancel',
      bounds: 'Edit bounds values in the Properties panel'
    };
    modeText.textContent = labels[tool] || tool.toUpperCase();
    hint.textContent = hints[tool] || '';
    hint.classList.add('visible');
    modeInd.classList.add('visible');

    if (tool === 'bounds') {
      showBoundsProps();
      controls.enabled = true;
    } else {
      controls.enabled = false;
      deselectAll();
    }
  }

  document.getElementById('status-mode').textContent = currentTool.toUpperCase();
}

function showBoundsProps() {
  const b = sceneConfig.museum.bounds;
  const body = document.getElementById('props-body');
  body.innerHTML = `
    <div class="prop-group">
      <div class="prop-group-label">Museum Bounds (Three.js units)</div>
      <div class="prop-group-label" style="margin-top:4px;font-size:10px;color:var(--text-muted)">~${(METERS_PER_UNIT).toFixed(1)}m per unit</div>
    </div>
    <div id="sb-bounds-panel" class="sb-bounds-panel">
      <div class="bounds-grid">
        <div class="prop-row"><label>Min X</label><input type="number" id="b-minx" value="${b.minX}" step="1" /></div>
        <div class="prop-row"><label>Max X</label><input type="number" id="b-maxx" value="${b.maxX}" step="1" /></div>
        <div class="prop-row"><label>Min Z</label><input type="number" id="b-minz" value="${b.minZ}" step="1" /></div>
        <div class="prop-row"><label>Max Z</label><input type="number" id="b-maxz" value="${b.maxZ}" step="1" /></div>
      </div>
    </div>
    <div class="prop-group" style="margin-top:8px;">
      <div class="prop-group-label">Museum Name</div>
      <div class="prop-row"><label>Nama</label><input type="text" id="b-name" value="${sceneConfig.museum.name}" /></div>
    </div>`;

  ['b-minx','b-maxx','b-minz','b-maxz','b-name'].forEach(elId => {
    const el = document.getElementById(elId);
    if (el) el.addEventListener('input', applyBoundsProps);
  });
}

function applyBoundsProps() {
  const b = sceneConfig.museum.bounds;
  b.minX = parseFloat(v('b-minx')) || b.minX;
  b.maxX = parseFloat(v('b-maxx')) || b.maxX;
  b.minZ = parseFloat(v('b-minz')) || b.minZ;
  b.maxZ = parseFloat(v('b-maxz')) || b.maxZ;
  sceneConfig.museum.name = v('b-name') || sceneConfig.museum.name;
  updateBoundsGizmo();
  scheduleAutoSave();
}

// ── RAYCASTING & CLICK HANDLING ───────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', onViewportClick);
renderer.domElement.addEventListener('mousemove', onViewportMouseMove);

let isDragging = false;
let dragStartMouse = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (e) => {
  dragStartMouse = { x: e.clientX, y: e.clientY };
  isDragging = false;
});
renderer.domElement.addEventListener('mousemove', (e) => {
  const dx = e.clientX - dragStartMouse.x;
  const dy = e.clientY - dragStartMouse.y;
  if (Math.sqrt(dx*dx + dy*dy) > 4) isDragging = true;
});

function getMouseNDC(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
}

function onViewportClick(e) {
  if (isDragging) return;
  getMouseNDC(e);
  raycaster.setFromCamera(mouse, camera);

  if (currentTool === 'select') {
    // Collect all interactive objects
    const pickTargets = [];
    obj3DRegistry.forEach(entry => pickTargets.push(entry.mesh));
    markerRegistry.forEach(entry => entry.group.children.forEach(c => pickTargets.push(c)));

    const hits = raycaster.intersectObjects(pickTargets, false);
    if (hits.length > 0) {
      const hit = hits[0].object;
      const id = hit.userData.id || hit.parent?.userData?.id;
      const type = hit.userData.type || hit.parent?.userData?.type;
      if (id && type) { selectObject(id, type); return; }
    }
    deselectAll();
    return;
  }

  // Placement tools: raycast against ground
  if (['box','cylinder','marker'].includes(currentTool)) {
    const groundHits = raycaster.intersectObject(ground);
    if (groundHits.length === 0) return;
    const pt = groundHits[0].point;
    const { lat, lng } = xzToLatLng(pt.x, pt.z);

    if (currentTool === 'marker') {
      // Open marker modal
      pendingPlacement = { lat, lng };
      openMarkerModal(lat, lng);
    } else {
      // Immediately add box/cylinder
      const id = `obj_${Date.now()}`;
      const cfg = {
        id, type: currentTool,
        label: currentTool === 'box' ? 'New Box' : 'New Cylinder',
        lat, lng,
        height: 12, width: 10, depth: 10,
        color: '#f5f5f0', roughness: 0.45, metalness: 0.05
      };
      sceneConfig.objects3D.push(cfg);
      add3DObject(cfg);
      switchTool('select');
      selectObject(id, 'object3D');
      scheduleAutoSave();
    }
  }
}

function onViewportMouseMove(e) {
  getMouseNDC(e);
  raycaster.setFromCamera(mouse, camera);
  const groundHits = raycaster.intersectObject(ground);
  if (groundHits.length > 0) {
    const pt = groundHits[0].point;
    const { lat, lng } = xzToLatLng(pt.x, pt.z);
    document.getElementById('status-coords').textContent =
      `Lat: ${lat.toFixed(5)}  Lng: ${lng.toFixed(5)}`;
  }
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch(e.key.toLowerCase()) {
    case 'v': switchTool('select'); break;
    case 'b': switchTool('box'); break;
    case 'c': switchTool('cylinder'); break;
    case 'm': switchTool('marker'); break;
    case 'x': switchTool('bounds'); break;
    case 'escape': switchTool('select'); break;
    case 'delete':
    case 'backspace':
      if (selectedId) deleteSelected(); break;
  }
});

// ── DELETE SELECTED ───────────────────────────────────────────────────────────
document.getElementById('btn-delete-sel').addEventListener('click', deleteSelected);

function deleteSelected() {
  if (!selectedId) return;
  if (!confirm(`Hapus ${selectedType === 'marker' ? 'marker' : 'objek'} "${selectedId}"?`)) return;
  if (selectedType === 'object3D') remove3DObject(selectedId);
  else if (selectedType === 'marker') removeMarker(selectedId);
  deselectAll();
  scheduleAutoSave();
}

// ── MARKER MODAL ──────────────────────────────────────────────────────────────
let markerModalLocked = false;
let markerModalImageData = null;

function openMarkerModal(lat, lng) {
  markerModalLocked = false;
  markerModalImageData = null;

  document.getElementById('modal-title').textContent = 'Add New Marker';
  document.getElementById('m-id').value = `marker_${Date.now()}`;
  document.getElementById('m-title').value = '';
  document.getElementById('m-subtitle').value = '';
  document.getElementById('m-category').value = 'aircraft';
  document.getElementById('m-year').value = '';
  document.getElementById('m-origin').value = '';
  document.getElementById('m-description').value = '';
  document.getElementById('m-fact').value = '';
  document.getElementById('m-image-data').value = '';
  document.getElementById('m-img-preview').style.display = 'none';
  document.getElementById('m-img-drop').style.display = '';
  document.getElementById('m-locked-toggle').className = 'toggle-switch';

  document.getElementById('sb-modal-overlay').classList.add('open');
}

document.getElementById('modal-close').addEventListener('click', closeMarkerModal);
document.getElementById('modal-cancel').addEventListener('click', closeMarkerModal);
function closeMarkerModal() {
  document.getElementById('sb-modal-overlay').classList.remove('open');
  pendingPlacement = null;
  markerModalImageData = null;
}

document.getElementById('m-locked-toggle').addEventListener('click', function() {
  this.classList.toggle('on');
  markerModalLocked = this.classList.contains('on');
});

document.getElementById('modal-confirm').addEventListener('click', () => {
  const id = document.getElementById('m-id').value.trim().replace(/\s+/g,'_');
  const title = document.getElementById('m-title').value.trim();
  if (!id || !title) { alert('ID dan Judul wajib diisi!'); return; }
  if (markerRegistry.has(id) || sceneConfig.markers.find(m => m.id === id)) {
    alert('ID sudah digunakan! Ganti dengan ID yang unik.'); return;
  }

  const catMap = { aircraft:'Pesawat', tank:'Tank & Panser', navy:'Navy (KRI)', artillery:'Artileri Berat', diorama:'Diorama & Relik', other:'Lainnya' };
  const cat = document.getElementById('m-category').value;

  const cfg = {
    id,
    title,
    subtitle: document.getElementById('m-subtitle').value,
    category: cat,
    categoryLabel: catMap[cat] || 'Lainnya',
    lat: pendingPlacement?.lat || sceneConfig.museum.center.lat,
    lng: pendingPlacement?.lng || sceneConfig.museum.center.lng,
    locked: markerModalLocked,
    image: markerModalImageData || document.getElementById('m-image-data').value || '',
    year: document.getElementById('m-year').value,
    origin: document.getElementById('m-origin').value,
    description: document.getElementById('m-description').value,
    fact: document.getElementById('m-fact').value
  };

  sceneConfig.markers.push(cfg);
  addMarker(cfg);
  closeMarkerModal();
  selectObject(id, 'marker');
  scheduleAutoSave();
});

// Image upload in modal
document.getElementById('sb-img-input-modal').addEventListener('change', function(e) {
  if (document.getElementById('sb-modal-overlay').classList.contains('open')) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      markerModalImageData = evt.target.result;
      document.getElementById('m-image-data').value = markerModalImageData;
      document.getElementById('m-img-preview').src = markerModalImageData;
      document.getElementById('m-img-preview').style.display = 'block';
      document.getElementById('m-img-drop').style.display = 'none';
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }
});

document.getElementById('m-img-drop').addEventListener('click', () => {
  document.getElementById('sb-img-input-modal').click();
});

// ── SAVE / LOAD JSON ──────────────────────────────────────────────────────────
document.getElementById('btn-save-json').addEventListener('click', saveJSON);
document.getElementById('btn-load-json').addEventListener('click', () => {
  document.getElementById('sb-file-input').click();
});
document.getElementById('btn-preview').addEventListener('click', () => {
  window.open('index.html', '_blank');
});

// Reset to Server functionality
document.getElementById('btn-reset-server').addEventListener('click', async () => {
  if (!confirm('Apakah Anda yakin ingin menghapus semua perubahan lokal dan mengembalikan data sesuai file scene-config.json di server?')) return;
  try {
    const res = await fetch('scene-config.json?t=' + Date.now());
    if (res.ok) {
      const cfg = await res.json();
      loadConfig(cfg);
      localStorage.setItem('satria_sandbox_config', JSON.stringify(cfg));
      document.getElementById('autosave-status').textContent = 'Reverted to server config';
    } else {
      alert('Gagal mengambil file scene-config.json dari server (HTTP ' + res.status + ')');
    }
  } catch(err) {
    alert('Terjadi kesalahan saat memuat server config: ' + err.message);
  }
});

function saveJSON() {
  const json = JSON.stringify(sceneConfig, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scene-config.json';
  a.click();
  URL.revokeObjectURL(url);
  document.getElementById('autosave-status').textContent = `Saved at ${new Date().toLocaleTimeString()}`;
}

document.getElementById('sb-file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const cfg = JSON.parse(evt.target.result);
      loadConfig(cfg);
      // Save to localStorage immediately on manual load
      localStorage.setItem('satria_sandbox_config', JSON.stringify(cfg));
      document.getElementById('autosave-status').textContent = 'Manual JSON config loaded';
    } catch(err) {
      alert('File JSON tidak valid: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

function loadConfig(cfg) {
  // Clear existing
  obj3DRegistry.forEach((_, id) => {
    const entry = obj3DRegistry.get(id);
    if (entry) { scene.remove(entry.mesh); entry.mesh.geometry.dispose(); }
  });
  obj3DRegistry.clear();
  markerRegistry.forEach((_, id) => {
    const entry = markerRegistry.get(id);
    if (entry) scene.remove(entry.group);
  });
  markerRegistry.clear();
  deselectAll();

  sceneConfig = cfg;
  updateBoundsGizmo();

  (cfg.objects3D || []).forEach(add3DObject);
  (cfg.markers || []).forEach(addMarker);
  updateStatusBar();

  // Load OSM real buildings for the loaded complex bounds
  loadOSMBuildings();

  document.getElementById('autosave-status').textContent = 'Config loaded';
}

// ── AUTO-SAVE TO LOCALSTORAGE ─────────────────────────────────────────────────
let autoSaveTimer = null;
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    localStorage.setItem('satria_sandbox_config', JSON.stringify(sceneConfig));
    document.getElementById('autosave-status').textContent = `Auto-saved at ${new Date().toLocaleTimeString()}`;
  }, 2000);
}

// ── STATUS BAR ────────────────────────────────────────────────────────────────
function updateStatusBar() {
  document.getElementById('status-objects').textContent = obj3DRegistry.size;
  document.getElementById('status-markers').textContent = markerRegistry.size;
}

// ── OSM REAL BUILDINGS LOAD ───────────────────────────────────────────────────
async function loadOSMBuildings() {
  // Clear existing in the group first
  while(osmBuildingsGroup.children.length > 0) {
    const child = osmBuildingsGroup.children[0];
    osmBuildingsGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
  }

  const b = sceneConfig.museum.bounds;
  const query = `[out:json][timeout:30];
(
  way["building"](around:700,-6.2315,106.8188);
);
out geom;`;

  let data;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    data = await res.json();
  } catch (err) {
    console.warn('Overpass API failed, trying fallback endpoint...', err);
    try {
      const res2 = await fetch('https://overpass.kumi.systems/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query)
      });
      data = await res2.json();
    } catch (err2) {
      console.error('Both Overpass endpoints failed.', err2);
      return;
    }
  }

  let buildingCount = 0;

  data.elements.forEach(el => {
    if (el.type !== 'way' || !el.geometry || el.geometry.length < 3) return;

    const pts = el.geometry.map(node => latLngToXZ(node.lat, node.lon));

    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cz = pts.reduce((s, p) => s + p.z, 0) / pts.length;
    if (cx > b.minX && cx < b.maxX &&
        cz > b.minZ && cz < b.maxZ) return;

    const tags = el.tags || {};
    let heightM = 10;
    if (tags.height) {
      heightM = parseFloat(tags.height) || 10;
    } else if (tags['building:levels']) {
      heightM = (parseFloat(tags['building:levels']) || 3) * 3.5;
    } else if (tags.building === 'yes' || !tags.building) {
      heightM = 8 + Math.random() * 6;
    }
    const heightUnits = heightM / METERS_PER_UNIT;

    const nodes = [...pts];
    if (nodes.length > 1) {
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (Math.abs(first.x - last.x) < 0.001 && Math.abs(first.z - last.z) < 0.001) {
        nodes.pop();
      }
    }
    if (nodes.length < 3) return;

    const shape = new THREE.Shape();
    shape.moveTo(nodes[0].x, -nodes[0].z);
    for (let i = 1; i < nodes.length; i++) {
      shape.lineTo(nodes[i].x, -nodes[i].z);
    }
    shape.closePath();

    const extrudeSettings = { depth: heightUnits, bevelEnabled: false };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const mesh = new THREE.Mesh(geom, osmBuildingMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    osmBuildingsGroup.add(mesh);
    buildingCount++;
  });

  console.log(`[OSM] Loaded ${buildingCount} real buildings in Sandbox.`);
}

// ── TRAFFIC SIMULATION (Sync with app.js) ──────────────────────────────────────
const trafficEastCurve = new THREE.CatmullRomCurve3(
  trafficEastCoords.map(c => {
    const { x, z } = latLngToXZ(c[1], c[0]);
    return new THREE.Vector3(x, 0.25, z);
  })
);

const trafficWestCurve = new THREE.CatmullRomCurve3(
  trafficWestCoords.map(c => {
    const { x, z } = latLngToXZ(c[1], c[0]);
    return new THREE.Vector3(x, 0.25, z);
  })
);

function createCarMesh(colorHex) {
  const carGroup = new THREE.Group();
  
  // Body (X is width 0.9, Y is height 0.6, Z is length 1.8)
  const bodyGeo = new THREE.BoxGeometry(0.9, 0.6, 1.8);
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: colorHex, roughness: 0.2, metalness: 0.5 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.4;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  carGroup.add(bodyMesh);

  // Cabin (X is width 0.8, Y is height 0.5, Z is length 1.0)
  const cabGeo = new THREE.BoxGeometry(0.8, 0.5, 1.0);
  const cabMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
  const cabMesh = new THREE.Mesh(cabGeo, cabMat);
  cabMesh.position.set(0, 0.85, 0.1);
  cabMesh.castShadow = true;
  carGroup.add(cabMesh);

  // Wheels (Cylinder along X axis, so we rotate Z by PI/2)
  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 8);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  
  // 4 wheels
  const w1 = new THREE.Mesh(wheelGeo, wheelMat); w1.position.set(0.48, 0.22, 0.5); carGroup.add(w1);
  const w2 = new THREE.Mesh(wheelGeo, wheelMat); w2.position.set(-0.48, 0.22, 0.5); carGroup.add(w2);
  const w3 = new THREE.Mesh(wheelGeo, wheelMat); w3.position.set(0.48, 0.22, -0.5); carGroup.add(w3);
  const w4 = new THREE.Mesh(wheelGeo, wheelMat); w4.position.set(-0.48, 0.22, -0.5); carGroup.add(w4);
  
  return carGroup;
}

function createMotorcycleMesh() {
  const bikeGroup = new THREE.Group();
  
  // Body (X is width 0.2, Y is height 0.4, Z is length 1.2)
  const bodyGeo = new THREE.BoxGeometry(0.2, 0.4, 1.2);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.3;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  bikeGroup.add(bodyMesh);

  // Rider representation (X is width 0.3, Y is height 0.6, Z is length 0.3)
  const riderGeo = new THREE.BoxGeometry(0.3, 0.6, 0.3);
  const riderMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const riderMesh = new THREE.Mesh(riderGeo, riderMat);
  riderMesh.position.set(0, 0.7, -0.1);
  bikeGroup.add(riderMesh);
  
  // Helmet
  const helmetGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const helmetMat = new THREE.MeshStandardMaterial({ color: 0xe11d48 });
  const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
  helmetMesh.position.set(0, 1.1, -0.1);
  bikeGroup.add(helmetMesh);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 8);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  
  const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.position.set(0, 0.22, 0.45);
  bikeGroup.add(frontWheel);

  const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
  rearWheel.position.set(0, 0.22, -0.45);
  bikeGroup.add(rearWheel);

  return bikeGroup;
}

const trafficParticles = [];
const particleCount = 18;
const vehicleColors = [0xdc2626, 0x2563eb, 0x16a34a, 0xeab308, 0x4f46e5, 0x0891b2, 0x57534e];

for (let i = 0; i < particleCount; i++) {
  const isEast = i % 2 === 0;
  const isCar = i % 3 !== 0;
  
  let mesh;
  if (isCar) {
    const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];
    mesh = createCarMesh(color);
  } else {
    mesh = createMotorcycleMesh();
  }
  
  scene.add(mesh);
  
  trafficParticles.push({
    mesh,
    curve: isEast ? trafficEastCurve : trafficWestCurve,
    progress: (i / particleCount) + Math.random() * 0.05,
    speed: 0.0012 + Math.random() * 0.0004
  });
}

// ── LOAD INITIAL CONFIG ───────────────────────────────────────────────────────
async function init() {
  // 1. Try loading from localStorage first to preserve active changes
  const saved = localStorage.getItem('satria_sandbox_config');
  if (saved) {
    try {
      const cfg = JSON.parse(saved);
      loadConfig(cfg);
      document.getElementById('autosave-status').textContent = 'Restored from auto-saved session';
      return;
    } catch(_) {}
  }

  // 2. Fallback to loading from server file
  try {
    const res = await fetch('scene-config.json?t=' + Date.now());
    if (res.ok) {
      const cfg = await res.json();
      loadConfig(cfg);
      localStorage.setItem('satria_sandbox_config', JSON.stringify(cfg));
      document.getElementById('autosave-status').textContent = 'Loaded from server';
      return;
    }
  } catch(_) {}

  // 3. Fallback to default state
  loadConfig(sceneConfig);
  document.getElementById('autosave-status').textContent = 'Loaded defaults';
}

init();

// ── RESIZE HANDLER ────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const W2 = container.clientWidth;
  const H2 = container.clientHeight;
  camera.aspect = W2 / H2;
  camera.updateProjectionMatrix();
  renderer.setSize(W2, H2);
});

// ── RENDER LOOP ───────────────────────────────────────────────────────────────
(function animate() {
  requestAnimationFrame(animate);
  
  const time = clock.getElapsedTime();
  
  // 1. Animasi Pin Markers (Melayang & membesar secara dinamis saat dipilih)
  markerRegistry.forEach((entry, id) => {
    const group = entry.group;
    const sprite = group.userData.sprite;
    if (sprite) {
      const index = group.userData.index || 0;
      const hoverOffset = Math.sin(time * 3.2 + index * 1.6) * 0.25;
      sprite.position.y = 3.2 + hoverOffset;
      
      const targetScale = (selectedId === id) ? 2.8 : 2.2;
      sprite.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1.0), 0.12);
    }
  });

  // 2. Animasi Kendaraan Lalu Lintas (Mobil & Motor dengan Orientasi Arah Jalan)
  trafficParticles.forEach(p => {
    p.progress += p.speed;
    if (p.progress > 1) p.progress = 0;
    const pos = p.curve.getPointAt(p.progress);
    p.mesh.position.copy(pos);
    
    // Hitung tangen untuk mengarahkan moncong kendaraan ke depan
    const tangent = p.curve.getTangentAt(p.progress);
    const target = pos.clone().add(tangent);
    p.mesh.lookAt(target);
  });

  controls.update();
  renderer.render(scene, camera);
})();
