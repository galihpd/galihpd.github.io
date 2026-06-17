// ============================================================================
// SCENE CONFIG — loaded from scene-config.json (managed via sandbox editor)
// ============================================================================
let collections = []; // Will be populated from scene-config.json
let SCENE_CONFIG = null;

async function loadSceneConfig() {
  try {
    const res = await fetch('scene-config.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    SCENE_CONFIG = await res.json();
    collections = (SCENE_CONFIG.markers || []).map(m => ({
      ...m,
      color: getCategoryColor(m.category)
    }));
    console.log(`[Config] Loaded ${collections.length} markers, ${(SCENE_CONFIG.objects3D||[]).length} objects3D`);
  } catch (err) {
    console.warn('[Config] Failed to load scene-config.json, using empty config.', err);
    SCENE_CONFIG = {
      version: '1.0',
      museum: { name: 'Museum Satria Mandala', center: { lat: -6.2315, lng: 106.8188 }, bounds: { minX: -40, maxX: 40, minZ: -40, maxZ: 40 } },
      objects3D: [],
      markers: []
    };
    collections = [];
  }
}

function getCategoryColor(cat) {
  const map = {
    aircraft: 'var(--color-aircraft)',
    tank: 'var(--color-tank)',
    navy: 'var(--color-navy)',
    artillery: 'var(--color-artillery)',
    diorama: 'var(--color-diorama)',
  };
  return map[cat] || 'var(--color-aircraft)';
}

// ============================================================================
// BATAS BOUNDS DAN KOORDINAT PROYEKSI TILES (CARTO BASMAP)
// ============================================================================
const zoom = 17;
const startX = 104425;
const startY = 67807;
const gridSize = 4; // Grid 4x4 tiles = 1024x1024 piksel ubin peta
const GROUND_SIZE = 350; // Lebar/panjang unit di Three.js

function latLngToXZ(lat, lng) {
  const n = Math.pow(2.0, zoom);
  const xTileRaw = (lng + 180.0) / 360.0 * n;
  const latRad = lat * Math.PI / 180.0;
  const yTileRaw = (1.0 - Math.log(Math.tan(latRad) + (1.0 / Math.cos(latRad))) / Math.PI) / 2.0 * n;
  
  // Posisi relatif di dalam grid ubin 4x4
  const relX = xTileRaw - startX;
  const relY = yTileRaw - startY;
  
  // Transformasikan ke koordinat dunia 3D Three.js
  const x = (relX / gridSize - 0.5) * GROUND_SIZE;
  const z = (relY / gridSize - 0.5) * GROUND_SIZE;
  return { x, z };
}
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

// ============================================================================
// HDRI & FALLBACK SYNTHETIC STUDIO ENVIRONMENT MAP
// ============================================================================
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
  // Gunakan synthetic environment map terlebih dahulu sebagai instant fallback
  const fallbackEnvMap = generateSyntheticEnvMap(renderer);
  scene.environment = fallbackEnvMap;

  // Coba muat HDRI real menggunakan RGBELoader
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
      fallbackEnvMap.dispose(); // Hapus fallback agar menghemat memori
      console.log('Real HDRI Environment Map loaded successfully.');
    },
    undefined,
    (err) => {
      console.warn('Gagal memuat real HDRI. Menggunakan Synthetic Studio lighting fallback.', err);
    }
  );
}

// ============================================================================
// THREE.JS INITIALIZATION & SCENE SETUP
// ============================================================================
const container = document.getElementById('map');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeaedf0);
scene.fog = new THREE.FogExp2(0xeaedf0, 0.0035); // Fog halus ubin cakrawala

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Bayangan halus realistis
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

// Setup HDRI Lighting (dengan fallback synthetic)
setupHDRLighting(renderer, scene);

const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
camera.position.set(130, 110, 130);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 15;
controls.maxDistance = 250;
controls.target.set(0, 0, 0);

// Status transisi kamera otomatis (lerp)
let isTransitioning = true;
controls.addEventListener('start', () => {
  isTransitioning = false;
});

// ============================================================================
// LIGHTING SETUP (REALISTIC DOME & STUDIO SHADOWS)
// ============================================================================
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xb0c4de, 0.45);
scene.add(hemisphereLight);

// Berkas sinar matahari yang terarah (tidak kuning menyengat, putih studio)
const sunLight = new THREE.DirectionalLight(0xffffff, 0.85); // Sedikit ditingkatkan agar lebih terang dengan tone mapping
sunLight.position.set(80, 120, 80);
sunLight.castShadow = true;

// Resolusi shadow map yang tinggi untuk bayangan arsitektural berkualitas tinggi
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
sunLight.shadow.radius = 3.5; // Membuat tepi bayangan tampak halus realistis
scene.add(sunLight);

// ============================================================================
// STITCHED MAP TILES GROUND (Ubin Basemap CARTO Positron Riil)
// ============================================================================
function loadStitchedMapTexture(callback) {
  const TILE_PX = 512; // 2x resolution per tile for a sharper map
  const canvasSize = gridSize * TILE_PX; // 2048 x 2048
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#e8edf2';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  let loadedCount = 0;
  const totalTiles = gridSize * gridSize;

  for (let dx = 0; dx < gridSize; dx++) {
    for (let dy = 0; dy < gridSize; dy++) {
      const tileX = startX + dx;
      const tileY = startY + dy;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      // Use @2x retina tiles from CARTO for maximum sharpness
      img.src = `https://basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tileX}/${tileY}@2x.png`;

      img.onload = (function(xPos, yPos) {
        return function() {
          ctx.drawImage(img, xPos * TILE_PX, yPos * TILE_PX, TILE_PX, TILE_PX);
          loadedCount++;
          if (loadedCount === totalTiles) {
            const texture = new THREE.CanvasTexture(canvas);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            callback(texture);
          }
        };
      })(dx, dy);

      img.onerror = (function(xPos, yPos) {
        return function() {
          ctx.fillStyle = '#e8edf2';
          ctx.fillRect(xPos * TILE_PX, yPos * TILE_PX, TILE_PX, TILE_PX);
          loadedCount++;
          if (loadedCount === totalTiles) {
            const texture = new THREE.CanvasTexture(canvas);
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            callback(texture);
          }
        };
      })(dx, dy);
    }
  }
}

// Bikin Plane Tanah dan tempelkan tekstur peta riil
const groundGeo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
const groundMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.55, // Lebih rendah agar peta terlihat tajam dan bersih
  metalness: 0.0,
  clearcoat: 0.0,
  envMapIntensity: 0.4,
  transparent: false
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

loadStitchedMapTexture((texture) => {
  ground.material.map = texture;
  ground.material.needsUpdate = true;
});

// ============================================================================
// OSM REAL BUILDINGS (dari Overpass API)
// ============================================================================
// Skala: GROUND_SIZE unit Three.js = 4 tiles × ~304m/tile = ~1216m
const METERS_PER_UNIT = (4 * 304) / GROUND_SIZE; // ~3.47 meter per unit

// Bounds kompleks museum — dari scene-config.json (diupdate setelah config load)
let MUSEUM_BOUNDS = { minX: -40, maxX: 40, minZ: -40, maxZ: 40 };

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

async function loadOSMBuildings() {
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

    // Convert OSM nodes to Three.js coordinates
    const pts = el.geometry.map(node => latLngToXZ(node.lat, node.lon));

    // Centroid check — skip buildings inside museum complex
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cz = pts.reduce((s, p) => s + p.z, 0) / pts.length;
    if (cx > MUSEUM_BOUNDS.minX && cx < MUSEUM_BOUNDS.maxX &&
        cz > MUSEUM_BOUNDS.minZ && cz < MUSEUM_BOUNDS.maxZ) return;

    // Determine height from OSM tags
    const tags = el.tags || {};
    let heightM = 10; // default 10m
    if (tags.height) {
      heightM = parseFloat(tags.height) || 10;
    } else if (tags['building:levels']) {
      heightM = (parseFloat(tags['building:levels']) || 3) * 3.5;
    } else if (tags.building === 'yes' || !tags.building) {
      heightM = 8 + Math.random() * 6; // slight variation for untagged
    }
    const heightUnits = heightM / METERS_PER_UNIT;

    // Remove duplicate last node (OSM closes ways by repeating first node)
    const nodes = [...pts];
    if (nodes.length > 1) {
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (Math.abs(first.x - last.x) < 0.001 && Math.abs(first.z - last.z) < 0.001) {
        nodes.pop();
      }
    }
    if (nodes.length < 3) return;

    // Build THREE.Shape in XZ plane
    // Shape coords: shapeX = worldX, shapeY = -worldZ (compensates for rotateX(PI/2))
    const shape = new THREE.Shape();
    shape.moveTo(nodes[0].x, -nodes[0].z);
    for (let i = 1; i < nodes.length; i++) {
      shape.lineTo(nodes[i].x, -nodes[i].z);
    }
    shape.closePath();

    const extrudeSettings = { depth: heightUnits, bevelEnabled: false };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const mesh = new THREE.Mesh(geom, osmBuildingMat);
    // Rotate so extrusion goes up (+Y) and shape lies in XZ plane
    mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    buildingCount++;
  });

  console.log(`Loaded ${buildingCount} real OSM buildings.`);
}

// Render custom 3D objects from scene-config
function renderCustomObjects3D() {
  if (!SCENE_CONFIG || !SCENE_CONFIG.objects3D) return;
  const mat = new THREE.MeshPhysicalMaterial({
    roughness: 0.45, metalness: 0.05, clearcoat: 0.35,
    clearcoatRoughness: 0.2, envMapIntensity: 1.25
  });
  SCENE_CONFIG.objects3D.forEach(cfg => {
    const { x, z } = latLngToXZ(cfg.lat, cfg.lng);
    const w = cfg.width  || 10;
    const h = cfg.height || 12;
    const d = cfg.depth  || 10;
    const geo = cfg.type === 'cylinder'
      ? new THREE.CylinderGeometry(w/2, w/2, h, 24)
      : new THREE.BoxGeometry(w, h, d);
    const m = mat.clone();
    m.color.set(cfg.color || '#f5f5f0');
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
}

// Main async init: load config → update bounds → load OSM buildings → render objects → setup markers
async function initScene() {
  await loadSceneConfig();

  // Update museum bounds from config
  if (SCENE_CONFIG && SCENE_CONFIG.museum && SCENE_CONFIG.museum.bounds) {
    Object.assign(MUSEUM_BOUNDS, SCENE_CONFIG.museum.bounds);
  }

  // Load OSM buildings (uses MUSEUM_BOUNDS)
  await loadOSMBuildings();

  // Render custom editor objects
  renderCustomObjects3D();

  // Spawn markers (uses collections)
  setupMarkers();
}

initScene();


// ============================================================================
// TRAFFIC GLOW ANIMATION (NEON GREEN FILAMENTS)
// ============================================================================
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

// Procedural vehicle generators (facing +Z local axis)
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
  cabMesh.position.set(0, 0.85, 0.1); // slightly forward
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
const particleCount = 18; // Slightly increased for a busier road
const vehicleColors = [0xdc2626, 0x2563eb, 0x16a34a, 0xeab308, 0x4f46e5, 0x0891b2, 0x57534e];

for (let i = 0; i < particleCount; i++) {
  const isEast = i % 2 === 0;
  const isCar = i % 3 !== 0; // 2 cars for every 1 motorcycle
  
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

// ============================================================================
// DYNAMIC 3D COLLECTION MARKERS
// ============================================================================
const markersList = [];
const markersMap = new Map();
let activeId = null;

const defaultStandMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xe2e8f0,
  roughness: 0.25,
  metalness: 0.7, // Semi-metallic stand
  clearcoat: 0.8,
  clearcoatRoughness: 0.15,
  envMapIntensity: 1.3,
  transparent: false
});
const activeStandMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x2563eb,
  roughness: 0.15,
  metalness: 0.85, // Highly metallic blue!
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  emissive: 0x1d4ed8,
  emissiveIntensity: 0.3,
  envMapIntensity: 1.6,
  transparent: false
});
const lockedStandMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xe15b64,
  roughness: 0.3,
  metalness: 0.6,
  clearcoat: 0.7,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.3,
  transparent: false
});

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
  markersList.forEach(group => {
    const item = collections[group.userData.index];
    const isActive = activeId === item.id;
    const isLocked = item.locked;

    const standMesh = group.children[0];
    if (standMesh) {
      if (isActive) standMesh.material = activeStandMaterial;
      else if (isLocked) standMesh.material = lockedStandMaterial;
      else standMesh.material = defaultStandMaterial;
    }

    const sprite = group.userData.sprite;
    if (sprite) {
      const indexText = String(group.userData.index + 1).padStart(2, '0');
      const oldTexture = sprite.material.map;
      sprite.material.map = createBadgeTexture(indexText, isLocked, isActive);
      if (oldTexture) oldTexture.dispose();
    }
  });
}

function setupMarkers() {
  const rodMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd1d5db, // Polished silver metal
    roughness: 0.05,
    metalness: 1.0, // Fully metallic!
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.7,
    transparent: false
  });

  collections.forEach((item, index) => {
    const markerGroup = new THREE.Group();
    const { x, z } = latLngToXZ(item.lat, item.lng);
    markerGroup.position.set(x, 0, z);

    const isLocked = item.locked;
    const isActive = activeId === item.id;
    let standMat = defaultStandMaterial;
    if (isActive) standMat = activeStandMaterial;
    else if (isLocked) standMat = lockedStandMaterial;

    // 1. Pedestal silinder
    const standGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 16);
    const standMesh = new THREE.Mesh(standGeo, standMat);
    standMesh.position.y = 0.2;
    standMesh.castShadow = true;
    standMesh.receiveShadow = true;
    markerGroup.add(standMesh);

    // 2. Tiang penyangga tipis
    const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8);
    const rodMesh = new THREE.Mesh(rodGeo, rodMaterial);
    rodMesh.position.y = 1.5;
    rodMesh.castShadow = true;
    markerGroup.add(rodMesh);

    // 3. Sprite billboard lingkaran hitam melayang
    const indexText = String(index + 1).padStart(2, '0');
    const spriteMat = new THREE.SpriteMaterial({
      map: createBadgeTexture(indexText, isLocked, isActive),
      depthWrite: false,
      depthTest: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, 3.2, 0);
    sprite.scale.set(2.2, 2.2, 1);
    markerGroup.add(sprite);

    markerGroup.userData = { 
      collectionId: item.id, 
      sprite: sprite,
      index: index 
    };

    scene.add(markerGroup);
    markersList.push(markerGroup);
    markersMap.set(item.id, markerGroup);
  });
}

// ============================================================================
// CAMERA FLIGHT TRANSITIONS (CINEMATIC LERP)
// ============================================================================
const targetCameraPos = new THREE.Vector3(85, 75, 85);
const targetControlsTarget = new THREE.Vector3(0, 0, 0);

const startTimeout = setTimeout(() => {
  targetCameraPos.set(85, 75, 85);
  isTransitioning = true;
}, 200);

function flyToTarget(x, z, zoomIn = true) {
  if (zoomIn) {
    targetControlsTarget.set(x, 0, z);
    targetCameraPos.set(x + 15, 12, z + 15);
  } else {
    targetControlsTarget.set(0, 0, 0);
    targetCameraPos.set(85, 75, 85);
  }
  isTransitioning = true;
}

// ============================================================================
// INTERACTION: RAYCASTING (CLICK DETECTION ON 3D PIN)
// ============================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onDocumentClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) {
    return;
  }

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markersList, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.userData.collectionId) {
      obj = obj.parent;
    }
    if (obj && obj.userData.collectionId) {
      showDetail(obj.userData.collectionId, true);
    }
  }
}

renderer.domElement.addEventListener('click', onDocumentClick);

// ============================================================================
// SIDEBAR CONTROLS & INTERACTIVITY
// ============================================================================
const collectionListEl = document.getElementById('collection-list');
const defaultPanel = document.getElementById('default-panel');
const detailPanel = document.getElementById('detail-panel');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const collectionCountEl = document.getElementById('collection-count');
const filterTabs = document.querySelectorAll('.filter-tab');

const detailImage = document.getElementById('detail-image');
const detailBadge = document.getElementById('detail-badge');
const detailTitle = document.getElementById('detail-title');
const detailYear = document.getElementById('detail-year');
const detailOrigin = document.getElementById('detail-origin');
const detailDescription = document.getElementById('detail-description');
const detailFact = document.getElementById('detail-fact');
const closeDetailBtn = document.getElementById('close-detail-btn');
const locateOnMapBtn = document.getElementById('locate-on-map-btn');

let currentCategory = 'all';
let searchQuery = '';

function renderCollectionList() {
  const filteredCollections = collections.filter(item => {
    const matchCategory = currentCategory === 'all' || item.category === currentCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery) ||
                        item.subtitle.toLowerCase().includes(searchQuery) ||
                        item.description.toLowerCase().includes(searchQuery) ||
                        item.categoryLabel.toLowerCase().includes(searchQuery);
    return matchCategory && matchSearch;
  });

  collectionListEl.innerHTML = '';
  collectionCountEl.textContent = `Menampilkan ${filteredCollections.length} Koleksi`;

  if (filteredCollections.length === 0) {
    collectionListEl.innerHTML = `
      <div class="empty-list">
        <p class="text-2xl mb-2">🔍</p>
        <p class="text-xs">Koleksi tidak ditemukan.<br>Coba gunakan kata kunci pencarian lain.</p>
      </div>
    `;
    return;
  }

  filteredCollections.forEach(item => {
    const isActive = activeId === item.id;
    const isLocked = item.locked;
    const itemCard = document.createElement('div');
    itemCard.className = `collection-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
    itemCard.style.setProperty('--cat-color', isLocked ? '#e15b64' : item.color);
    
    const itemIndex = String(collections.indexOf(item) + 1).padStart(2, '0');

    const badgeHTML = isLocked
      ? `<div class="item-index-badge" style="background-color: #e15b64; color: #ffffff; box-shadow: 0 2px 4px rgba(225, 91, 100, 0.25);">
           <span>🔒</span>
         </div>`
      : `<div class="item-index-badge">
           <span>${itemIndex}</span>
         </div>`;

    itemCard.innerHTML = `
      <div class="item-thumb">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='https://placehold.co/120x120/1a1a17/a1a19a?text=Museum'">
      </div>
      <div class="item-text">
        <h3 class="item-title">${item.title}</h3>
        <p class="item-subtitle" style="${isLocked ? 'color: #ef4444; font-weight: 600;' : ''}">
          ${isLocked ? '🔒 Akses Terbatas' : `${item.year} &middot; ${item.origin}`}
        </p>
      </div>
      ${badgeHTML}
    `;
    
    itemCard.addEventListener('click', () => {
      showDetail(item.id, true);
    });
    
    collectionListEl.appendChild(itemCard);
  });
}

function showDetail(id, zoomTo = true) {
  const item = collections.find(x => x.id === id);
  if (!item) return;
  
  activeId = id;
  
  detailImage.src = item.image;
  detailImage.alt = item.title;
  detailImage.onerror = function() {
    this.src = `https://placehold.co/600x375/1a1a17/a1a19a?text=${encodeURIComponent(item.title)}`;
  };
  
  if (item.locked) {
    detailBadge.textContent = '🔒 TERKUNCI';
    detailBadge.style.backgroundColor = '#e15b64';
    detailBadge.style.color = '#fff';
  } else {
    detailBadge.textContent = item.categoryLabel;
    detailBadge.style.backgroundColor = item.color;
    detailBadge.style.color = '#fff';
  }
  
  detailTitle.textContent = item.title;
  detailYear.textContent = item.year;
  detailOrigin.textContent = item.origin;
  detailDescription.textContent = item.description;
  detailFact.textContent = item.fact;
  
  if (zoomTo) {
    const { x, z } = latLngToXZ(item.lat, item.lng);
    flyToTarget(x, z, true);
  }

  defaultPanel.classList.add('hidden');
  detailPanel.classList.remove('hidden');

  renderCollectionList();
  updateMarkersVisuals();

  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768 && !sidebar.classList.contains('active')) {
    toggleMobileSidebar(true);
  }
}

function closeDetail() {
  activeId = null;
  defaultPanel.classList.remove('hidden');
  detailPanel.classList.add('hidden');
  
  flyToTarget(0, 0, false);
  
  renderCollectionList();
  updateMarkersVisuals();
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderCollectionList();
});

const categorySelect = document.getElementById('category-select');
if (categorySelect) {
  categorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    filterTabs.forEach(tab => {
      if (tab.getAttribute('data-category') === currentCategory) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    renderCollectionList();
  });
}

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.getAttribute('data-category');
    if (categorySelect) {
      categorySelect.value = currentCategory;
    }
    renderCollectionList();
  });
});

const showAllBtn = document.getElementById('show-all-btn');
if (showAllBtn) {
  showAllBtn.addEventListener('click', () => {
    currentCategory = 'all';
    searchQuery = '';
    searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    filterTabs.forEach(t => {
      if (t.getAttribute('data-category') === 'all') {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
    renderCollectionList();
  });
}

locateOnMapBtn.addEventListener('click', () => {
  const item = collections.find(x => x.id === activeId);
  if (item) {
    const { x, z } = latLngToXZ(item.lat, item.lng);
    flyToTarget(x, z, true);
    if (window.innerWidth <= 768) {
      toggleMobileSidebar(false);
    }
  }
});

closeDetailBtn.addEventListener('click', closeDetail);

// Zoom In / Zoom Out Controls
const zoomInBtn = document.getElementById('zoom-in-btn');
if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    const factor = 0.82;
    camera.position.lerp(controls.target, 1 - factor);
    isTransitioning = false;
  });
}

const zoomOutBtn = document.getElementById('zoom-out-btn');
if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    const factor = 1.22;
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    camera.position.copy(controls.target).addScaledVector(dir, factor);
    isTransitioning = false;
  });
}

// Mobile Drawer Toggle
const sidebarEl = document.getElementById('sidebar');
function toggleMobileSidebar(forceState = null) {
  const isOpen = forceState !== null ? forceState : !sidebarEl.classList.contains('active');
  if (isOpen) {
    sidebarEl.classList.add('active');
  } else {
    sidebarEl.classList.remove('active');
  }
}

document.querySelector('.sidebar header').addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    toggleMobileSidebar();
  }
});
const dragHandle = document.querySelector('.sidebar .w-12');
if (dragHandle) {
  dragHandle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      toggleMobileSidebar();
    }
  });
}

// Initial Render
renderCollectionList();

// ============================================================================
// ANIMATION LOOP & WINDOW RESIZING
// ============================================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const time = clock.getElapsedTime();
  
  // 1. Animasi Pin Markers (Hanya badge yang melayang & membesar secara dinamis)
  markersList.forEach(m => {
    const sprite = m.userData.sprite;
    if (sprite) {
      const hoverOffset = Math.sin(time * 3.2 + m.userData.index * 1.6) * 0.25;
      sprite.position.y = 3.2 + hoverOffset;
      
      const targetScale = (activeId === m.userData.collectionId) ? 2.8 : 2.2;
      sprite.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1.0), 0.12);
    }
  });

  // 2. Animasi Partikel Lalu Lintas (Mobil & Motor dengan Orientasi Arah Jalan)
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

  // 3. Animasi Lerp Posisi & Target Kamera
  if (isTransitioning) {
    camera.position.lerp(targetCameraPos, 0.05);
    controls.target.lerp(targetControlsTarget, 0.05);
    
    if (camera.position.distanceTo(targetCameraPos) < 0.1 && 
        controls.target.distanceTo(targetControlsTarget) < 0.1) {
      isTransitioning = false;
    }
  }
  
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  
  renderer.setSize(w, h);
});

animate();
