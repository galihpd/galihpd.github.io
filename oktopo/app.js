/**
 * OkTopo Web - Main Application Logic
 * Integrates Three.js, model importing, automatic alignment, manual shrinkwrap,
 * Laplacian relaxation, Loop Subdivision Surface, visual landmark controller pins, 
 * proportional soft-selection editing, and OBJ export.
 */

import * as threeModule from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoopSubdivision } from 'https://unpkg.com/three-subdivide/build/index.module.js';

// Create a mutable copy of THREE to attach dependencies and expose for backward compatibility
const THREE = { ...threeModule };
THREE.OrbitControls = OrbitControls;
THREE.TransformControls = TransformControls;
THREE.OBJLoader = OBJLoader;
THREE.GLTFLoader = GLTFLoader;

window.THREE = THREE;
window.LoopSubdivision = LoopSubdivision;


// Spatial Hashing Grid for O(1) closest-point lookups
class SpatialGrid {
  constructor(vertices, cellSize = 0.05) {
    this.vertices = vertices; // Array of THREE.Vector3
    this.cellSize = cellSize;
    this.grid = new Map();
    
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      const cx = Math.floor(v.x / cellSize);
      const cy = Math.floor(v.y / cellSize);
      const cz = Math.floor(v.z / cellSize);
      const key = `${cx},${cy},${cz}`;
      
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key).push(i);
    }
  }
  
  findClosest(queryPoint, maxDistance, normalConstraintFn) {
    const cellSize = this.cellSize;
    const qx = queryPoint.x;
    const qy = queryPoint.y;
    const qz = queryPoint.z;
    
    const cx = Math.floor(qx / cellSize);
    const cy = Math.floor(qy / cellSize);
    const cz = Math.floor(qz / cellSize);
    
    const searchRadius = Math.ceil(maxDistance / cellSize);
    
    let minDistSq = maxDistance * maxDistance;
    let closestIdx = -1;
    
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dz = -searchRadius; dz <= searchRadius; dz++) {
          const key = `${cx + dx},${cy + dy},${cz + dz}`;
          const indices = this.grid.get(key);
          if (!indices) continue;
          
          for (let i = 0; i < indices.length; i++) {
            const idx = indices[i];
            const v = this.vertices[idx];
            
            const rx = v.x - qx;
            const ry = v.y - qy;
            const rz = v.z - qz;
            const distSq = rx*rx + ry*ry + rz*rz;
            
            if (distSq < minDistSq) {
              if (normalConstraintFn && !normalConstraintFn(idx)) {
                continue;
              }
              minDistSq = distSq;
              closestIdx = idx;
            }
          }
        }
      }
    }
    
    return closestIdx;
  }
}

// Global App State
const state = {
  // 3D Engine objects
  scene: null,
  camera: null,
  renderer: null,
  orbitControls: null,
  transformControls: null,
  
  // Meshes
  targetMesh: null,          // The high-poly mesh uploaded by the user
  targetSpatialGrid: null,   // Fast lookup spatial grid for targetMesh
  baseMesh: null,            // The rendered conformed mesh (possibly subdivided)
  lowPolyGeometry: null,     // The low-poly control geometry (source of truth for deformation & landmark tracking)
  canonicalGeometry: null,   // Cached MediaPipe canonical geometry (468 vertices)
  
  // Visual controller pins
  controllerMeshes: [],      // Array of pink sphere meshes for landmark control
  prevLocalPos: null,        // Stores previous local position of the dragged controller vertex
  
  // Settings
  gridResolution: 24,
  projectionMode: 'closest', // 'closest', 'z-axis'
  offset: 0.003,             // Offset to prevent z-fighting
  maxProjDistance: 0.25,     // Maximum snap distance to prevent neck/back spikes
  normalThreshold: 0.25,     // Normal alignment similarity filter (dot product)
  subdivisionLevel: 0,       // Loop subdivision modifier level (0, 1, 2)
  smoothingIterations: 10,
  smoothingDamping: 0.25,
  reprojectAfterSmooth: true,
  viewMode: 'overlay',       // 'overlay', 'solid-base', 'wire-target'
  
  // Proportional Editing (Soft Selection)
  vertexEditMode: false,
  isDragging: false,         // Active dragging state flag
  selectedVertexIndex: -1,
  deformRadius: 0.25,        // Gaussian weight influence radius
  
  // Base Mesh alignment cache
  basePosition: { x: 0, y: 0, z: 0.2 },
  baseRotation: { x: 0, y: 0, z: 0 },
  baseScale: { x: 1, y: 1, z: 1 }
};

// Canonical MediaPipe Landmark Indices for correct topology
const CANONICAL_LANDMARKS = [
  { index: 12288, name: 'Nose Tip' },
  { index: 12361, name: 'Chin bottom' },
  { index: 12352, name: 'Forehead center' },
  { index: 6815, name: 'Left Eye Outer' },
  { index: 8108, name: 'Left Eye Inner' },
  { index: 1980, name: 'Right Eye Inner' },
  { index: 687, name: 'Right Eye Outer' },
  { index: 9753, name: 'Left Mouth Corner' },
  { index: 3625, name: 'Right Mouth Corner' },
  { index: 12260, name: 'Upper Lip' },
  { index: 12258, name: 'Lower Lip' },
  { index: 6840, name: 'Left Cheek Outline' },
  { index: 712, name: 'Right Cheek Outline' },
  { index: 10063, name: 'Left Cheek Upper' },
  { index: 3935, name: 'Right Cheek Upper' },
  { index: 8893, name: 'Left Ear' },
  { index: 2765, name: 'Right Ear' }
];

// Initialize the Application
window.addEventListener('DOMContentLoaded', () => {
  initEngine();
  setupUI();
  loadCanonicalModel(); // Loads canonical topology first, then calls createBaseMesh
  animate();
});

// 1. Initialize Three.js Engine
function initEngine() {
  const container = document.getElementById('canvas-container');
  
  // Scene
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x0b0f19);
  
  // Camera
  state.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 100);
  state.camera.position.set(0, 0, 3);
  
  // Renderer
  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setSize(container.clientWidth, container.clientHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  state.renderer.shadowMap.enabled = true;
  container.appendChild(state.renderer.domElement);
  
  // Controls
  state.orbitControls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
  state.orbitControls.enableDamping = true;
  state.orbitControls.dampingFactor = 0.05;
  state.orbitControls.minDistance = 0.5;
  state.orbitControls.maxDistance = 20;
  
  // Transform Gizmo
  state.transformControls = new THREE.TransformControls(state.camera, state.renderer.domElement);
  state.transformControls.size = 0.75;
  state.transformControls.addEventListener('change', () => state.renderer.render(state.scene, state.camera));
  state.transformControls.addEventListener('dragging-changed', (event) => {
    state.orbitControls.enabled = !event.value;
    state.isDragging = event.value;
    
    if (!event.value) {
      // Drag released: trigger full high-poly rebuild and projection
      document.getElementById('loading-overlay').style.display = 'flex';
      document.getElementById('loading-text').textContent = 'Computing conformed subdivision...';
      
      setTimeout(() => {
        rebuildRenderMesh();
        if (state.targetMesh) {
          projectMesh();
        } else {
          syncControllers();
        }
        document.getElementById('loading-overlay').style.display = 'none';
      }, 50);
    }
  });
  
  // Listen to visual controller dragging changes (Proportional edit)
  state.transformControls.addEventListener('objectChange', () => {
    if (state.vertexEditMode && state.selectedVertexIndex !== -1 && state.transformControls.object) {
      applyProportionalDeform();
    }
  });
  
  state.scene.add(state.transformControls);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  state.scene.add(ambientLight);
  
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(5, 5, 5);
  state.scene.add(dirLight1);
  
  const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.45); // Blue fill light
  dirLight2.position.set(-5, -2, -2);
  state.scene.add(dirLight2);

  const headLight = new THREE.PointLight(0xffffff, 0.4, 10);
  state.camera.add(headLight);
  state.scene.add(state.camera);
  
  // Grid helper
  const gridHelper = new THREE.GridHelper(10, 50, 0x3b82f6, 0x1e293b);
  gridHelper.position.y = -1.2;
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  state.scene.add(gridHelper);
  
  // Event listeners for Pointer down and Pointer move
  state.renderer.domElement.addEventListener('pointerdown', onCanvasClick);
  state.renderer.domElement.addEventListener('pointermove', onCanvasMove);
  
  // Handle Escape key to deselect active pin
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      deselectVertex();
    }
  });
  
  // Handle Resize
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  state.camera.aspect = container.clientWidth / container.clientHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(container.clientWidth, container.clientHeight);
}

// 2. Load Canonical Head OBJ from Server
function loadCanonicalModel() {
  document.getElementById('loading-overlay').style.display = 'flex';
  document.getElementById('loading-text').textContent = 'Loading Male Average Head base topology...';
  
  const loader = new THREE.OBJLoader();
  loader.load(
    'male_average_head.obj?v=' + Date.now(),
    (obj) => {
      let mesh = null;
      obj.traverse((child) => {
        if (child.isMesh && !mesh) {
          mesh = child;
        }
      });
      
      if (mesh) {
        state.canonicalGeometry = mesh.geometry.clone();
        
        // Normalize canonical geometry size and orientation
        state.canonicalGeometry.center();
        state.canonicalGeometry.computeBoundingSphere();
        const r = state.canonicalGeometry.boundingSphere.radius;
        const s = 0.75 / r;
        state.canonicalGeometry.scale(s, s, s);
        
        console.log("Male Average Head base model loaded successfully!");
      }
      
      createBaseMesh();
      document.getElementById('loading-overlay').style.display = 'none';
    },
    undefined,
    (err) => {
      console.warn("Failed to load male_average_head.obj. Falling back to procedural grid...", err);
      createBaseMesh();
      document.getElementById('loading-overlay').style.display = 'none';
    }
  );
}

// 3. Create and Manage Base Mesh & Landmark Controllers
function createBaseMesh() {
  // Save current transform if mesh already exists
  if (state.baseMesh) {
    state.basePosition = { ...state.baseMesh.position };
    state.baseRotation = { x: state.baseMesh.rotation.x, y: state.baseMesh.rotation.y, z: state.baseMesh.rotation.z };
    state.baseScale = { ...state.baseMesh.scale };
    
    state.transformControls.detach();
    state.scene.remove(state.baseMesh);
  }
  
  // Set up low-poly control geometry
  if (state.canonicalGeometry) {
    state.lowPolyGeometry = state.canonicalGeometry.clone();
  } else {
    state.lowPolyGeometry = window.createFaceBaseGeometry(state.gridResolution);
  }
  
  // Create beautiful material
  const material = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.45,
    metalness: 0.1,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  
  // BaseMesh geometry starts as low-poly, then gets subdivided
  state.baseMesh = new THREE.Mesh(state.lowPolyGeometry.clone(), material);
  
  // Custom wireframe line drawing for visual clarity
  const wireframeGeom = new THREE.WireframeGeometry(state.lowPolyGeometry);
  const wireframeMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.45 });
  const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
  state.baseMesh.add(wireframe);
  
  // Apply transforms
  state.baseMesh.position.set(state.basePosition.x, state.basePosition.y, state.basePosition.z);
  state.baseMesh.rotation.set(state.baseRotation.x, state.baseRotation.y, state.baseRotation.z);
  state.baseMesh.scale.set(state.baseScale.x, state.baseScale.y, state.baseScale.z);
  
  state.scene.add(state.baseMesh);
  
  // Keep original geometry for resets
  state.originalBaseGeom = state.lowPolyGeometry.clone();
  
  // Rebuild the conformed/subdivided geometry
  rebuildRenderMesh();
  
  // Create Visual pink controllers
  rebuildControllers();
  
  // Attach transform controls to baseMesh if not editing controllers
  if (!state.vertexEditMode) {
    state.transformControls.attach(state.baseMesh);
  } else {
    deselectVertex();
  }
  
  updateStats();
}

// 4. Rebuild Subdivided Geometry
function rebuildRenderMesh() {
  if (!state.baseMesh || !state.lowPolyGeometry) return;
  
  let geom = state.lowPolyGeometry.clone();
  
  // Loop subdivision surface modifier
  if (state.subdivisionLevel > 0 && window.LoopSubdivision) {
    try {
      geom = window.LoopSubdivision.modify(geom, state.subdivisionLevel);
    } catch (e) {
      console.error("Loop Subdivision failed: ", e);
    }
  }
  
  state.baseMesh.geometry.dispose();
  state.baseMesh.geometry = geom;
  
  // Update wireframe helper overlays
  const wireframe = state.baseMesh.children[0];
  if (wireframe && wireframe.isLineSegments) {
    wireframe.geometry.dispose();
    wireframe.geometry = new THREE.WireframeGeometry(geom);
  }
  
  updateStats();
}

// 5. Create and Sync Pink Controller Spheres
function getLandmarkIndices() {
  if (state.canonicalGeometry) {
    return CANONICAL_LANDMARKS;
  }
  
  // Fallback grid mapping (24x24 resolution fallback)
  const size = state.gridResolution;
  const nose = Math.round(size / 2) * (size + 1) + Math.round(size / 2);
  const chin = size * (size + 1) + Math.round(size / 2);
  const forehead = 0 * (size + 1) + Math.round(size / 2);
  const eyeL = Math.round(size / 3) * (size + 1) + Math.round(size / 4);
  const eyeR = Math.round(size / 3) * (size + 1) + Math.round(size * 3 / 4);
  const mouthL = Math.round(size * 2 / 3) * (size + 1) + Math.round(size / 3);
  const mouthR = Math.round(size * 2 / 3) * (size + 1) + Math.round(size * 2 / 3);
  
  return [
    { index: nose, name: 'Nose Tip' },
    { index: chin, name: 'Chin' },
    { index: forehead, name: 'Forehead' },
    { index: eyeL, name: 'Left Eye' },
    { index: eyeR, name: 'Right Eye' },
    { index: mouthL, name: 'Left Mouth' },
    { index: mouthR, name: 'Right Mouth' }
  ];
}

function rebuildControllers() {
  // Clear existing spheres
  state.controllerMeshes.forEach(mesh => state.scene.remove(mesh));
  state.controllerMeshes = [];
  
  if (!state.baseMesh || !state.lowPolyGeometry) return;
  
  const positions = state.lowPolyGeometry.attributes.position;
  const indices = getLandmarkIndices();
  
  // Controller pins sphere geometry (made slightly larger for easier clicking)
  const markerGeom = new THREE.SphereGeometry(0.024, 16, 16);
  
  indices.forEach(landmark => {
    if (landmark.index >= positions.count) return;
    
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xec4899, // Pink
      depthTest: false,
      depthWrite: false
    });
    
    const sphere = new THREE.Mesh(markerGeom, markerMat);
    sphere.renderOrder = 1000;
    sphere.userData = {
      index: landmark.index,
      name: landmark.name,
      isController: true
    };
    
    state.scene.add(sphere);
    state.controllerMeshes.push(sphere);
  });
  
  syncControllers();
}

function syncControllers() {
  if (!state.baseMesh || !state.lowPolyGeometry || state.controllerMeshes.length === 0) return;
  
  const positions = state.lowPolyGeometry.attributes.position;
  state.baseMesh.updateMatrixWorld(true);
  
  state.controllerMeshes.forEach(sphere => {
    // CRITICAL: Skip the active dragged sphere to prevent feedback loop locking!
    if (state.vertexEditMode && sphere.userData.index === state.selectedVertexIndex) {
      return;
    }
    
    const idx = sphere.userData.index;
    if (idx < positions.count) {
      const localPos = new THREE.Vector3(
        positions.getX(idx),
        positions.getY(idx),
        positions.getZ(idx)
      );
      // Transform to world space
      const worldPos = localPos.applyMatrix4(state.baseMesh.matrixWorld);
      sphere.position.copy(worldPos);
    }
  });
}

// 6. UI Interactions & Event Handlers
function setupUI() {
  const showToast = (msg, isError = false) => {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast ${isError ? 'error' : ''} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // Drag & Drop Files
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  
  uploadZone.addEventListener('click', () => fileInput.click());
  
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Base Mesh Controls
  const setupSlider = (id, property, scale = 1, isRotation = false) => {
    const slider = document.getElementById(id);
    const valueDisp = document.getElementById(`${id}-val`);
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) * scale;
      valueDisp.textContent = val.toFixed(3);
      
      const parts = property.split('.');
      if (parts[0] === 'position') {
        state.baseMesh.position[parts[1]] = val;
        state.basePosition[parts[1]] = val;
      } else if (parts[0] === 'rotation') {
        const rad = isRotation ? (val * Math.PI) / 180 : val;
        state.baseMesh.rotation[parts[1]] = rad;
        state.baseRotation[parts[1]] = rad;
      } else if (parts[0] === 'scale') {
        state.baseMesh.scale[parts[1]] = val;
        state.baseScale[parts[1]] = val;
      }
      syncControllers();
    });
  };

  setupSlider('pos-x', 'position.x');
  setupSlider('pos-y', 'position.y');
  setupSlider('pos-z', 'position.z');
  setupSlider('rot-x', 'rotation.x', 1, true);
  setupSlider('rot-y', 'rotation.y', 1, true);
  setupSlider('rot-z', 'rotation.z', 1, true);
  setupSlider('scale-all', 'scale.x');
  
  document.getElementById('scale-all').addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.baseMesh.scale.set(val, val, val);
    state.baseScale = { x: val, y: val, z: val };
    document.getElementById('scale-all-val').textContent = val.toFixed(3);
    syncControllers();
  });

  // Resolution Selector (only active if fallback grid is used)
  const resSelect = document.getElementById('grid-res');
  resSelect.addEventListener('change', (e) => {
    state.gridResolution = parseInt(e.target.value);
    state.canonicalGeometry = null; // Clear canonical model to force grid fallback
    createBaseMesh();
    showToast(`Fallback grid resolution changed to ${state.gridResolution}x${state.gridResolution}`);
  });

  // Projection Parameters
  const projMode = document.getElementById('proj-mode');
  projMode.addEventListener('change', (e) => state.projectionMode = e.target.value);

  const offsetSlider = document.getElementById('proj-offset');
  offsetSlider.addEventListener('input', (e) => {
    state.offset = parseFloat(e.target.value);
    document.getElementById('proj-offset-val').textContent = state.offset.toFixed(3);
  });

  // Max Projection Distance Limit slider
  const maxDistSlider = document.getElementById('max-dist');
  maxDistSlider.addEventListener('input', (e) => {
    state.maxProjDistance = parseFloat(e.target.value);
    document.getElementById('max-dist-val').textContent = state.maxProjDistance.toFixed(2);
  });

  // Normal alignment similarity filter slider
  const normalThreshSlider = document.getElementById('normal-thresh');
  normalThreshSlider.addEventListener('input', (e) => {
    state.normalThreshold = parseFloat(e.target.value);
    document.getElementById('normal-thresh-val').textContent = state.normalThreshold.toFixed(2);
  });

  // Subdivision surface slider
  const subdivSlider = document.getElementById('subdiv-level');
  subdivSlider.addEventListener('input', (e) => {
    state.subdivisionLevel = parseInt(e.target.value);
    document.getElementById('subdiv-level-val').textContent = state.subdivisionLevel;
    
    // Subdivision-first workflow:
    // Rebuild geometry, then run projection to snap conformed vertices
    rebuildRenderMesh();
    if (state.targetMesh) {
      projectMesh();
    }
  });

  // Smoothing Parameters
  const smoothIterSlider = document.getElementById('smooth-iter');
  smoothIterSlider.addEventListener('input', (e) => {
    state.smoothingIterations = parseInt(e.target.value);
    document.getElementById('smooth-iter-val').textContent = state.smoothingIterations;
  });

  const smoothDampSlider = document.getElementById('smooth-damp');
  smoothDampSlider.addEventListener('input', (e) => {
    state.smoothingDamping = parseFloat(e.target.value);
    document.getElementById('smooth-damp-val').textContent = state.smoothingDamping.toFixed(2);
  });

  const toggleReproject = document.getElementById('toggle-reproject');
  toggleReproject.addEventListener('change', (e) => state.reprojectAfterSmooth = e.target.checked);

  // View Mode Pill Buttons
  const viewBtns = document.querySelectorAll('.view-mode-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      viewBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.viewMode = e.target.dataset.mode;
      updateVisualizerStyles();
    });
  });

  // Action Buttons
  document.getElementById('btn-reset-align').addEventListener('click', () => {
    state.baseMesh.position.set(0, 0, 0.2);
    state.baseMesh.rotation.set(0, 0, 0);
    state.baseMesh.scale.set(1, 1, 1);
    
    // Reset sliders
    document.getElementById('pos-x').value = 0; document.getElementById('pos-x-val').textContent = "0.00";
    document.getElementById('pos-y').value = 0; document.getElementById('pos-y-val').textContent = "0.00";
    document.getElementById('pos-z').value = 0.2; document.getElementById('pos-z-val').textContent = "0.20";
    document.getElementById('rot-x').value = 0; document.getElementById('rot-x-val').textContent = "0.00";
    document.getElementById('rot-y').value = 0; document.getElementById('rot-y-val').textContent = "0.00";
    document.getElementById('rot-z').value = 0; document.getElementById('rot-z-val').textContent = "0.00";
    document.getElementById('scale-all').value = 1.0; document.getElementById('scale-all-val').textContent = "1.00";
    
    state.basePosition = { x: 0, y: 0, z: 0.2 };
    state.baseRotation = { x: 0, y: 0, z: 0 };
    state.baseScale = { x: 1, y: 1, z: 1 };
    
    syncControllers();
    showToast("Base mesh alignment reset");
  });

  document.getElementById('btn-reset-mesh').addEventListener('click', () => {
    if (state.originalBaseGeom) {
      state.lowPolyGeometry.copy(state.originalBaseGeom);
      deselectVertex();
      rebuildRenderMesh();
      syncControllers();
      showToast("Projection reset to original base mesh");
    }
  });

  document.getElementById('btn-project').addEventListener('click', () => {
    if (!state.targetMesh) {
      showToast("Please upload a 3D target mesh first!", true);
      return;
    }
    projectMesh();
    showToast("Mesh projected successfully!");
  });

  document.getElementById('btn-smooth').addEventListener('click', () => {
    if (!state.targetMesh) {
      showToast("Please upload a 3D target mesh first!", true);
      return;
    }
    smoothMesh();
    showToast("Mesh smoothed successfully!");
  });

  // Controller Edit Mode Toggle
  const btnVertexEdit = document.getElementById('btn-toggle-vertex-edit');
  btnVertexEdit.addEventListener('click', () => {
    state.vertexEditMode = !state.vertexEditMode;
    if (state.vertexEditMode) {
      btnVertexEdit.classList.remove('btn-secondary');
      btnVertexEdit.classList.add('btn-danger');
      btnVertexEdit.innerHTML = '<i class="fa-solid fa-expand"></i> Disable Controller Edit';
      showToast("Edit Mode Enabled! Click a pink pin to select it.");
      
      // Detach controls from baseMesh
      state.transformControls.detach();
    } else {
      btnVertexEdit.classList.remove('btn-danger');
      btnVertexEdit.classList.add('btn-secondary');
      btnVertexEdit.innerHTML = '<i class="fa-solid fa-up-down-left-right"></i> Enable Controller Edit';
      showToast("Edit Mode Disabled.");
      
      deselectVertex();
      state.transformControls.attach(state.baseMesh);
    }
  });

  // Soft selection deformation radius slider
  const deformRadSlider = document.getElementById('deform-radius');
  deformRadSlider.addEventListener('input', (e) => {
    state.deformRadius = parseFloat(e.target.value);
    document.getElementById('deform-radius-val').textContent = state.deformRadius.toFixed(2);
  });

  // Load Demo Button
  const btnLoadDemo = document.getElementById('btn-load-demo');
  btnLoadDemo.addEventListener('click', () => {
    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('loading-text').textContent = 'Loading Male Average Head demo...';
    
    const loader = new THREE.OBJLoader();
    loader.load(
      'male_average_head.obj?v=' + Date.now(),
      (obj) => {
        processLoadedObject(obj, 'Male Average Head.obj');
        btnLoadDemo.style.display = 'none';
      },
      undefined,
      (err) => {
        console.error(err);
        showToast("Failed to load demo model", true);
        document.getElementById('loading-overlay').style.display = 'none';
      }
    );
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    exportToOBJ();
  });
}

// 7. Load Uploaded Files & Trigger Auto-Align (BUT NO AUTO-SHRINKWRAP TO PREVENT EXPLOSIONS!)
function handleFile(file) {
  const reader = new FileReader();
  const extension = file.name.split('.').pop().toLowerCase();
  
  document.getElementById('loading-overlay').style.display = 'flex';
  document.getElementById('loading-text').textContent = `Loading ${file.name}...`;

  reader.onload = function (event) {
    try {
      if (state.targetMesh) {
        state.scene.remove(state.targetMesh);
        state.targetMesh = null;
      }
      
      if (extension === 'obj') {
        const textReader = new FileReader();
        textReader.onload = function(e) {
          try {
            const loader = new THREE.OBJLoader();
            const obj = loader.parse(e.target.result);
            processLoadedObject(obj, file.name);
          } catch(err) {
            console.error(err);
            showToast("Error parsing OBJ", true);
            document.getElementById('loading-overlay').style.display = 'none';
          }
        };
        textReader.readAsText(file);
      } else if (extension === 'gltf' || extension === 'glb') {
        const loader = new THREE.GLTFLoader();
        loader.parse(event.target.result, '', (gltf) => {
          processLoadedObject(gltf.scene, file.name);
        }, (err) => {
          console.error(err);
          showToast("Failed to parse GLTF/GLB file", true);
          document.getElementById('loading-overlay').style.display = 'none';
        });
      } else {
        showToast("Unsupported file format", true);
        document.getElementById('loading-overlay').style.display = 'none';
      }
    } catch (err) {
      console.error(err);
      showToast("Error reading file", true);
      document.getElementById('loading-overlay').style.display = 'none';
    }
  };

  reader.readAsArrayBuffer(file);
}

function processLoadedObject(object, filename) {
  let meshes = [];
  object.traverse((child) => {
    if (child.isMesh) {
      meshes.push(child);
    }
  });

  if (meshes.length === 0) {
    showToast("No mesh geometry found in the file", true);
    document.getElementById('loading-overlay').style.display = 'none';
    return;
  }

  meshes.sort((a, b) => b.geometry.attributes.position.count - a.geometry.attributes.position.count);
  const selectedMesh = meshes[0];
  
  const geometry = selectedMesh.geometry.clone();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  
  const material = new THREE.MeshStandardMaterial({
    color: 0x8e9bb0,
    roughness: 0.85,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65
  });
  
  state.targetMesh = new THREE.Mesh(geometry, material);
  
  // Ensure target geometry has normals
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  
  const wireframeGeom = new THREE.WireframeGeometry(geometry);
  const wireframeMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.1 });
  const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
  state.targetMesh.add(wireframe);
  
  state.scene.add(state.targetMesh);
  
  document.getElementById('upload-zone').style.display = 'none';
  const fileInfo = document.getElementById('file-info');
  fileInfo.style.display = 'flex';
  document.getElementById('lbl-file-name').textContent = filename;
  
  document.getElementById('loading-text').textContent = 'Auto-aligning base mesh...';
  
  setTimeout(() => {
    // 1. Get target bounding box and center
    const targetBbox = new THREE.Box3().setFromObject(state.targetMesh);
    const targetCenter = new THREE.Vector3();
    targetBbox.getCenter(targetCenter);
    const targetSize = new THREE.Vector3();
    targetBbox.getSize(targetSize);
    
    // We need base size *before* modifying base position/scale
    const tempBaseMesh = new THREE.Mesh(state.lowPolyGeometry.clone());
    const baseBbox = new THREE.Box3().setFromObject(tempBaseMesh);
    const baseSize = new THREE.Vector3();
    baseBbox.getSize(baseSize);
    
    // 2. Align base mesh scale to match target mesh height
    const scaleRatio = targetSize.y / baseSize.y;
    state.baseMesh.scale.set(scaleRatio, scaleRatio, scaleRatio);
    state.baseScale = { x: scaleRatio, y: scaleRatio, z: scaleRatio };
    
    // Update scale UI slider dynamically
    const scaleSlider = document.getElementById('scale-all');
    scaleSlider.min = (scaleRatio * 0.1).toFixed(4);
    scaleSlider.max = (scaleRatio * 3.0).toFixed(4);
    scaleSlider.step = (scaleRatio * 0.01).toFixed(4);
    scaleSlider.value = scaleRatio;
    document.getElementById('scale-all-val').textContent = scaleRatio.toFixed(3);
    
    // 3. Align base mesh position to match target mesh center (with a Z offset forward relative to target scale)
    const zOffset = targetSize.z * 0.15; // shift slightly forward
    const alignedPos = new THREE.Vector3(targetCenter.x, targetCenter.y, targetCenter.z + zOffset);
    state.baseMesh.position.copy(alignedPos);
    state.basePosition = { x: alignedPos.x, y: alignedPos.y, z: alignedPos.z };
    
    // Adjust position slider bounds dynamically based on target mesh size
    const posZSlider = document.getElementById('pos-z');
    posZSlider.min = (alignedPos.z - targetSize.z * 0.5).toFixed(4);
    posZSlider.max = (alignedPos.z + targetSize.z * 0.5).toFixed(4);
    posZSlider.step = (targetSize.z * 0.01).toFixed(4);
    posZSlider.value = alignedPos.z;
    document.getElementById('pos-z-val').textContent = alignedPos.z.toFixed(3);
    
    // Adjust advanced position slider bounds
    const posXSlider = document.getElementById('pos-x');
    posXSlider.min = (alignedPos.x - targetSize.x * 0.5).toFixed(4);
    posXSlider.max = (alignedPos.x + targetSize.x * 0.5).toFixed(4);
    posXSlider.step = (targetSize.x * 0.01).toFixed(4);
    posXSlider.value = alignedPos.x;
    document.getElementById('pos-x-val').textContent = alignedPos.x.toFixed(3);

    const posYSlider = document.getElementById('pos-y');
    posYSlider.min = (alignedPos.y - targetSize.y * 0.5).toFixed(4);
    posYSlider.max = (alignedPos.y + targetSize.y * 0.5).toFixed(4);
    posYSlider.step = (targetSize.y * 0.01).toFixed(4);
    posYSlider.value = alignedPos.y;
    document.getElementById('pos-y-val').textContent = alignedPos.y.toFixed(3);
    
    // Adjust max projection distance to scale dynamically (e.g. 25% of target mesh height)
    state.maxProjDistance = targetSize.y * 0.25;
    const maxDistSlider = document.getElementById('max-dist');
    maxDistSlider.min = (targetSize.y * 0.05).toFixed(4);
    maxDistSlider.max = (targetSize.y * 0.8).toFixed(4);
    maxDistSlider.step = (targetSize.y * 0.01).toFixed(4);
    maxDistSlider.value = state.maxProjDistance;
    document.getElementById('max-dist-val').textContent = state.maxProjDistance.toFixed(3);
    
    // Re-build target spatial grid based on the actual target coordinates and custom cell size
    const cellSize = targetSize.y * 0.05;
    const targetPositions = state.targetMesh.geometry.attributes.position;
    const targetCount = targetPositions.count;
    const targetVertices = [];
    for (let k = 0; k < targetCount; k++) {
      targetVertices.push(new THREE.Vector3(
        targetPositions.getX(k),
        targetPositions.getY(k),
        targetPositions.getZ(k)
      ));
    }
    state.targetSpatialGrid = new SpatialGrid(targetVertices, cellSize);
    
    // 4. Focus camera on target bounding box (Frame Selected)
    const maxDim = Math.max(targetSize.x, targetSize.y, targetSize.z);
    const fov = state.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.3; // add padding
    
    state.camera.position.set(targetCenter.x, targetCenter.y, targetCenter.z + cameraZ);
    state.orbitControls.target.copy(targetCenter);
    state.orbitControls.update();
    
    rebuildRenderMesh();
    syncControllers();
    updateVisualizerStyles();
    updateStats();
    
    document.getElementById('loading-overlay').style.display = 'none';
    showToast("Model aligned & camera framed!");
  }, 100);
  
  document.getElementById('btn-remove-file').onclick = () => {
    state.scene.remove(state.targetMesh);
    state.targetMesh = null;
    state.targetSpatialGrid = null;
    deselectVertex();
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('btn-load-demo').style.display = 'block';
    fileInfo.style.display = 'none';
    createBaseMesh();
    updateStats();
  };
}

// 8. Interactive Landmark Controller Picking & Hover Effects
function onCanvasClick(event) {
  if (!state.vertexEditMode || state.controllerMeshes.length === 0) return;
  if (state.transformControls.dragging) return;
  
  const container = document.getElementById('canvas-container');
  const rect = state.renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, state.camera);
  
  // Raycast specifically against pink controller spheres!
  const intersects = raycaster.intersectObjects(state.controllerMeshes);
  
  if (intersects.length > 0) {
    const clickedController = intersects[0].object;
    selectController(clickedController);
  } else if (state.selectedVertexIndex !== -1 && state.targetMesh) {
    // Raycast against the target sculpt mesh to place the active controller pin
    const targetIntersects = raycaster.intersectObject(state.targetMesh);
    if (targetIntersects.length > 0) {
      const hitPointWorld = targetIntersects[0].point;
      moveSelectedVertexTo(hitPointWorld);
    }
  }
}

// Hover cursor visual indicator
function onCanvasMove(event) {
  if (!state.vertexEditMode || state.controllerMeshes.length === 0) return;
  
  const rect = state.renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, state.camera);
  
  const intersects = raycaster.intersectObjects(state.controllerMeshes);
  if (intersects.length > 0) {
    state.renderer.domElement.style.cursor = 'pointer';
  } else {
    state.renderer.domElement.style.cursor = 'default';
  }
}

function selectController(sphere) {
  deselectVertex(); // deselect current
  
  state.selectedVertexIndex = sphere.userData.index;
  
  sphere.material.color.setHex(0xfacc15); // Yellow
  
  state.transformControls.attach(sphere);
  
  const positions = state.lowPolyGeometry.attributes.position;
  state.prevLocalPos = new THREE.Vector3(
    positions.getX(state.selectedVertexIndex),
    positions.getY(state.selectedVertexIndex),
    positions.getZ(state.selectedVertexIndex)
  );
}

function deselectVertex() {
  state.selectedVertexIndex = -1;
  state.prevLocalPos = null;
  state.transformControls.detach();
  
  // Reset all controller colors back to pink
  state.controllerMeshes.forEach(sphere => {
    sphere.material.color.setHex(0xec4899); // Pink
  });
  
  if (state.renderer) {
    state.renderer.domElement.style.cursor = 'default';
  }
}

// 9. Proportional Soft Selection Deformation (Deforms lowPolyGeometry, then rebuilds and projects subdivided mesh)
function applyProportionalDeform() {
  const activeController = state.transformControls.object;
  if (!activeController || !state.baseMesh || state.selectedVertexIndex === -1 || !state.prevLocalPos) return;
  
  const positions = state.lowPolyGeometry.attributes.position;
  const count = positions.count;
  
  // 1. Get controller's current world position, convert to base mesh local coordinate
  const worldToBaseLocal = state.baseMesh.matrixWorld.clone().invert();
  const currentLocalPos = activeController.position.clone().applyMatrix4(worldToBaseLocal);
  
  // 2. Calculate local translation delta vector
  const delta = currentLocalPos.clone().sub(state.prevLocalPos);
  if (delta.lengthSq() < 0.000001) return;
  
  // 3. Proportional edit surrounding vertices of lowPolyGeometry using a Gaussian falloff weight
  const cX = state.prevLocalPos.x;
  const cY = state.prevLocalPos.y;
  const cZ = state.prevLocalPos.z;
  
  const sigma = state.deformRadius;
  const sigmaSq2 = 2 * sigma * sigma;
  
  for (let i = 0; i < count; i++) {
    const px = positions.getX(i);
    const py = positions.getY(i);
    const pz = positions.getZ(i);
    
    const dx = px - cX;
    const dy = py - cY;
    const dz = pz - cZ;
    const distSq = dx*dx + dy*dy + dz*dz;
    
    const w = Math.exp(-distSq / sigmaSq2);
    
    if (w > 0.001) {
      positions.setXYZ(
        i,
        px + delta.x * w,
        py + delta.y * w,
        pz + delta.z * w
      );
    }
  }
  
  positions.needsUpdate = true;
  state.lowPolyGeometry.computeVertexNormals();
  
  state.prevLocalPos.copy(currentLocalPos);
  
  // Re-generate subdivided geometry & project subdivided surface
  if (state.isDragging) {
    // During active dragging, bypass subdivision and projection to ensure 60 FPS performance
    // Just copy the low-poly control geometry to the base mesh geometry directly!
    state.baseMesh.geometry.dispose();
    state.baseMesh.geometry = state.lowPolyGeometry.clone();
    
    // Update wireframe helper overlay
    const wireframe = state.baseMesh.children[0];
    if (wireframe && wireframe.isLineSegments) {
      wireframe.geometry.dispose();
      wireframe.geometry = new THREE.WireframeGeometry(state.baseMesh.geometry);
    }
    
    syncControllers();
  } else {
    rebuildRenderMesh();
    if (state.targetMesh) {
      projectMesh();
    } else {
      syncControllers();
    }
  }
}

// Move selected landmark vertex to a specific world coordinate and deform base mesh
function moveSelectedVertexTo(worldPos) {
  if (state.selectedVertexIndex === -1 || !state.baseMesh || !state.lowPolyGeometry) return;
  
  const positions = state.lowPolyGeometry.attributes.position;
  const idx = state.selectedVertexIndex;
  
  // Convert world position to base mesh local coordinate
  const worldToBaseLocal = state.baseMesh.matrixWorld.clone().invert();
  const targetLocalPos = worldPos.clone().applyMatrix4(worldToBaseLocal);
  
  // Calculate local translation delta vector from previous local position
  const prevLocal = new THREE.Vector3(
    positions.getX(idx),
    positions.getY(idx),
    positions.getZ(idx)
  );
  const delta = targetLocalPos.clone().sub(prevLocal);
  
  // Apply proportional edit to surrounding vertices
  const count = positions.count;
  const sigma = state.deformRadius;
  const sigmaSq2 = 2 * sigma * sigma;
  
  for (let i = 0; i < count; i++) {
    const px = positions.getX(i);
    const py = positions.getY(i);
    const pz = positions.getZ(i);
    
    const dx = px - prevLocal.x;
    const dy = py - prevLocal.y;
    const dz = pz - prevLocal.z;
    const distSq = dx*dx + dy*dy + dz*dz;
    
    const w = Math.exp(-distSq / sigmaSq2);
    
    if (w > 0.001) {
      positions.setXYZ(
        i,
        px + delta.x * w,
        py + delta.y * w,
        pz + delta.z * w
      );
    }
  }
  
  positions.needsUpdate = true;
  state.lowPolyGeometry.computeVertexNormals();
  
  // Update state.prevLocalPos so further snapping/dragging coordinates stay synced
  if (state.prevLocalPos) {
    state.prevLocalPos.copy(targetLocalPos);
  }
  
  // Re-generate subdivided geometry & project subdivided surface
  rebuildRenderMesh();
  if (state.targetMesh) {
    projectMesh();
  } else {
    syncControllers();
  }
  
  // Force update the selected controller mesh position in world space
  const sphere = state.controllerMeshes.find(m => m.userData.index === idx);
  if (sphere) {
    sphere.position.copy(worldPos);
    // Sync TransformControls position to match the sphere
    if (state.transformControls.object === sphere) {
      state.transformControls.position.copy(worldPos);
    }
  }
}

// 10. Helper function to project any geometry onto target surface with distance limit
function projectGeometry(geom) {
  if (!state.targetMesh || !geom) return;

  const positions = geom.attributes.position;
  const count = positions.count;

  state.baseMesh.updateMatrixWorld(true);
  state.targetMesh.updateMatrixWorld(true);

  const baseToWorld = state.baseMesh.matrixWorld;
  const worldToTargetLocal = state.targetMesh.matrixWorld.clone().invert();
  const targetLocalToWorld = state.targetMesh.matrixWorld;
  const worldToBaseLocal = state.baseMesh.matrixWorld.clone().invert();

  const targetGeom = state.targetMesh.geometry;
  const targetPositions = targetGeom.attributes.position;
  const targetCount = targetPositions.count;
  const targetNormals = targetGeom.attributes.normal;

  const baseNormals = geom.attributes.normal;

  const raycaster = new THREE.Raycaster();
  const rayDir = new THREE.Vector3();
  const vertexPosWorld = new THREE.Vector3();

  // Matrices and vectors for normal transformations (allocated once outside the loop)
  const baseNormalMatrix = new THREE.Matrix3().getNormalMatrix(baseToWorld);
  const targetNormalMatrix = new THREE.Matrix3().getNormalMatrix(targetLocalToWorld);
  
  const baseNormalWorld = new THREE.Vector3();
  const targetNormalWorld = new THREE.Vector3();

  // Cache target vertices in target local coordinates
  const targetVertices = [];
  for (let k = 0; k < targetCount; k++) {
    targetVertices.push(
      new THREE.Vector3(
        targetPositions.getX(k),
        targetPositions.getY(k),
        targetPositions.getZ(k)
      )
    );
  }

  for (let i = 0; i < count; i++) {
    let vx = positions.getX(i);
    let vy = positions.getY(i);
    let vz = positions.getZ(i);
    let localPos = new THREE.Vector3(vx, vy, vz);

    // Vertex world space position
    vertexPosWorld.copy(localPos).applyMatrix4(baseToWorld);
    let projectedPointWorld = null;

    if (state.projectionMode === 'closest') {
      const localPosTarget = vertexPosWorld.clone().applyMatrix4(worldToTargetLocal);
      
      // Get base vertex normal in world space
      if (baseNormals) {
        baseNormalWorld.set(baseNormals.getX(i), baseNormals.getY(i), baseNormals.getZ(i))
          .applyMatrix3(baseNormalMatrix)
          .normalize();
      } else {
        baseNormalWorld.set(0, 0, 1);
      }
      
      // Define normal constraint check function
      let normalConstraintFn = null;
      if (targetNormals) {
        normalConstraintFn = (idx) => {
          targetNormalWorld.set(
            targetNormals.getX(idx),
            targetNormals.getY(idx),
            targetNormals.getZ(idx)
          ).applyMatrix3(targetNormalMatrix).normalize();
          
          return baseNormalWorld.dot(targetNormalWorld) > state.normalThreshold;
        };
      }
      
      let closestIdx = -1;
      if (state.targetSpatialGrid) {
        closestIdx = state.targetSpatialGrid.findClosest(localPosTarget, state.maxProjDistance, normalConstraintFn);
      } else {
        // Fallback to brute force closest point search
        let minDistSq = state.maxProjDistance * state.maxProjDistance;
        for (let k = 0; k < targetCount; k++) {
          const tv = targetVertices[k];
          const dx = tv.x - localPosTarget.x;
          const dy = tv.y - localPosTarget.y;
          const dz = tv.z - localPosTarget.z;
          const distSq = dx*dx + dy*dy + dz*dz;
          
          if (distSq < minDistSq) {
            if (normalConstraintFn && !normalConstraintFn(k)) {
              continue;
            }
            minDistSq = distSq;
            closestIdx = k;
          }
        }
      }
      
      if (closestIdx !== -1) {
        projectedPointWorld = targetVertices[closestIdx].clone().applyMatrix4(targetLocalToWorld);
        
        if (state.offset !== 0 && targetNormals) {
          const normalWorld = new THREE.Vector3(
            targetNormals.getX(closestIdx),
            targetNormals.getY(closestIdx),
            targetNormals.getZ(closestIdx)
          ).applyMatrix3(new THREE.Matrix3().getNormalMatrix(targetLocalToWorld)).normalize();
          
          projectedPointWorld.addScaledVector(normalWorld, state.offset);
        }
      }

    } else if (state.projectionMode === 'z-axis') {
      // Cast ray along -Z axis
      rayDir.set(0, 0, -1).applyMatrix4(baseToWorld).sub(new THREE.Vector3(0,0,0).applyMatrix4(baseToWorld)).normalize();
      
      const rayOrigin = vertexPosWorld.clone().addScaledVector(rayDir, -0.5);
      raycaster.set(rayOrigin, rayDir);
      
      const intersections = raycaster.intersectObject(state.targetMesh);
      if (intersections.length > 0) {
        projectedPointWorld = intersections[0].point;
        if (state.offset !== 0) {
          projectedPointWorld.addScaledVector(intersections[0].face.normal, state.offset);
        }
      } else {
        rayDir.negate();
        const rayOrigin2 = vertexPosWorld.clone().addScaledVector(rayDir, -0.5);
        raycaster.set(rayOrigin2, rayDir);
        const intersections2 = raycaster.intersectObject(state.targetMesh);
        if (intersections2.length > 0) {
          projectedPointWorld = intersections2[0].point;
          if (state.offset !== 0) {
            projectedPointWorld.addScaledVector(intersections2[0].face.normal, state.offset);
          }
        }
      }
    }

    if (projectedPointWorld) {
      const localProjected = projectedPointWorld.clone().applyMatrix4(worldToBaseLocal);
      positions.setXYZ(i, localProjected.x, localProjected.y, localProjected.z);
    }
  }

  positions.needsUpdate = true;
  geom.computeVertexNormals();
}

// 11. Shrinkwrap Deformation Algorithm (Subdivision-First Projection)
function projectMesh() {
  if (!state.targetMesh || !state.baseMesh || !state.lowPolyGeometry) return;

  // 1. Project low-poly control geometry first so control pins are conformed
  projectGeometry(state.lowPolyGeometry);
  
  // 2. Re-subdivide the conformed low-poly mesh to generate high-poly geometry
  rebuildRenderMesh();
  
  // 3. Project the conformed high-poly subdivided mesh again so it wraps to target sculpt details perfectly!
  if (state.subdivisionLevel > 0) {
    projectGeometry(state.baseMesh.geometry);
    // 4. Smooth conformed high-poly mesh to relax it organically
    smoothHighPolyGeometry(state.baseMesh.geometry);
  }

  // Keep controllers aligned
  syncControllers();
}

// 12. Smooth High-poly subdivided geometry (Loop Subdivision post-relaxation)
function smoothHighPolyGeometry(geom) {
  const positions = geom.attributes.position;
  const count = positions.count;
  const indices = geom.index;
  if (!indices) return;

  // Build high-poly adjacency list
  const adjacency = Array.from({ length: count }, () => []);
  for (let k = 0; k < indices.count; k += 3) {
    const a = indices.getX(k);
    const b = indices.getY(k);
    const c = indices.getZ(k);
    
    if (!adjacency[a].includes(b)) adjacency[a].push(b);
    if (!adjacency[a].includes(c)) adjacency[a].push(c);
    if (!adjacency[b].includes(a)) adjacency[b].push(a);
    if (!adjacency[b].includes(c)) adjacency[b].push(c);
    if (!adjacency[c].includes(a)) adjacency[c].push(a);
    if (!adjacency[c].includes(b)) adjacency[c].push(b);
  }

  const tempPositions = new Float32Array(count * 3);
  const damping = 0.25;

  // Run 3 fast iterations of Laplacian smoothing on high-poly subdivided surface
  for (let iter = 0; iter < 3; iter++) {
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const neighbors = adjacency[i];
      let nSumX = 0, nSumY = 0, nSumZ = 0;
      for (let n = 0; n < neighbors.length; n++) {
        const nIdx = neighbors[n];
        nSumX += positions.getX(nIdx);
        nSumY += positions.getY(nIdx);
        nSumZ += positions.getZ(nIdx);
      }

      if (neighbors.length > 0) {
        const avgX = nSumX / neighbors.length;
        const avgY = nSumY / neighbors.length;
        const avgZ = nSumZ / neighbors.length;

        tempPositions[i * 3]     = x + damping * (avgX - x);
        tempPositions[i * 3 + 1] = y + damping * (avgY - y);
        tempPositions[i * 3 + 2] = z + damping * (avgZ - z);
      } else {
        tempPositions[i * 3]     = x;
        tempPositions[i * 3 + 1] = y;
        tempPositions[i * 3 + 2] = z;
      }
    }

    for (let k = 0; k < count; k++) {
      positions.setXYZ(k, tempPositions[k * 3], tempPositions[k * 3 + 1], tempPositions[k * 3 + 2]);
    }
  }

  positions.needsUpdate = true;
  geom.computeVertexNormals();

  // Snaps the relaxed subdivided vertices back onto target surface
  projectGeometry(geom);
}

// 13. Laplacian Smoothing (Relaxation) - Runs on lowPolyGeometry, then projects & subdivides
function smoothMesh() {
  if (!state.targetMesh || !state.baseMesh || !state.lowPolyGeometry) return;

  const baseGeom = state.lowPolyGeometry;
  const positions = baseGeom.attributes.position;
  const count = positions.count;
  
  // Build adjacency list for low-poly geometry
  const indices = baseGeom.index;
  const adjacency = Array.from({ length: count }, () => []);

  if (indices) {
    for (let k = 0; k < indices.count; k += 3) {
      const a = indices.getX(k);
      const b = indices.getY(k);
      const c = indices.getZ(k);
      
      if (!adjacency[a].includes(b)) adjacency[a].push(b);
      if (!adjacency[a].includes(c)) adjacency[a].push(c);
      
      if (!adjacency[b].includes(a)) adjacency[b].push(a);
      if (!adjacency[b].includes(c)) adjacency[b].push(c);
      
      if (!adjacency[c].includes(a)) adjacency[c].push(a);
      if (!adjacency[c].includes(b)) adjacency[c].push(b);
    }
  } else {
    console.warn("Base mesh geometry has no index buffer. Smoothing skipped.");
    return;
  }

  // Run iterations
  for (let iter = 0; iter < state.smoothingIterations; iter++) {
    const tempPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Keep the active selected vertex locked during smooth/relaxation
      if (state.vertexEditMode && i === state.selectedVertexIndex) {
        tempPositions[i * 3]     = positions.getX(i);
        tempPositions[i * 3 + 1] = positions.getY(i);
        tempPositions[i * 3 + 2] = positions.getZ(i);
        continue;
      }

      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const neighbors = adjacency[i];
      let neighborSumX = 0, neighborSumY = 0, neighborSumZ = 0;
      
      for (let n = 0; n < neighbors.length; n++) {
        const nIdx = neighbors[n];
        neighborSumX += positions.getX(nIdx);
        neighborSumY += positions.getY(nIdx);
        neighborSumZ += positions.getZ(nIdx);
      }

      if (neighbors.length > 0) {
        const avgX = neighborSumX / neighbors.length;
        const avgY = neighborSumY / neighbors.length;
        const avgZ = neighborSumZ / neighbors.length;

        tempPositions[i * 3]     = x + state.smoothingDamping * (avgX - x);
        tempPositions[i * 3 + 1] = y + state.smoothingDamping * (avgY - y);
        tempPositions[i * 3 + 2] = z + state.smoothingDamping * (avgZ - z);
      } else {
        tempPositions[i * 3]     = x;
        tempPositions[i * 3 + 1] = y;
        tempPositions[i * 3 + 2] = z;
      }
    }

    // Apply back
    for (let k = 0; k < count; k++) {
      positions.setXYZ(k, tempPositions[k * 3], tempPositions[k * 3 + 1], tempPositions[k * 3 + 2]);
    }
    positions.needsUpdate = true;

    // Reproject back onto surface
    if (state.reprojectAfterSmooth) {
      projectMesh();
    }
  }

  baseGeom.computeVertexNormals();

  // Re-generate subdivided geometry & project subdivided surface
  rebuildRenderMesh();
  if (state.targetMesh) {
    projectMesh();
  } else {
    syncControllers();
  }
}

// 14. Update Viewport Modes
function updateVisualizerStyles() {
  if (!state.baseMesh) return;

  const baseMat = state.baseMesh.material;
  const baseWire = state.baseMesh.children[0];
  
  let targetMat = null;
  let targetWire = null;
  if (state.targetMesh) {
    targetMat = state.targetMesh.material;
    targetWire = state.targetMesh.children[0];
  }

  switch (state.viewMode) {
    case 'overlay':
      baseMat.opacity = 0.85;
      baseMat.transparent = true;
      baseMat.color.setHex(0x3b82f6);
      baseMat.wireframe = false;
      if (baseWire) baseWire.visible = true;

      if (targetMat) {
        targetMat.opacity = 0.5;
        targetMat.transparent = true;
        targetMat.wireframe = false;
      }
      if (targetWire) targetWire.visible = true;
      break;

    case 'solid-base':
      baseMat.opacity = 1.0;
      baseMat.transparent = false;
      baseMat.color.setHex(0x3b82f6);
      baseMat.wireframe = false;
      if (baseWire) baseWire.visible = true;

      if (targetMat) {
        targetMat.opacity = 0.0;
        targetMat.transparent = true;
      }
      if (targetWire) targetWire.visible = false;
      break;

    case 'wire-target':
      baseMat.opacity = 1.0;
      baseMat.transparent = false;
      baseMat.color.setHex(0x3b82f6);
      baseMat.wireframe = true;
      if (baseWire) baseWire.visible = false;

      if (targetMat) {
        targetMat.opacity = 1.0;
        targetMat.transparent = false;
        targetMat.wireframe = false;
      }
      if (targetWire) targetWire.visible = false;
      break;
  }
}

// 15. Update Mesh Stats
function updateStats() {
  const lblTargetVerts = document.getElementById('target-verts');
  const lblTargetFaces = document.getElementById('target-faces');
  const lblBaseVerts = document.getElementById('base-verts');
  const lblBaseFaces = document.getElementById('base-faces');

  if (state.targetMesh) {
    const targetCount = state.targetMesh.geometry.attributes.position.count;
    const targetFaces = state.targetMesh.geometry.index ? state.targetMesh.geometry.index.count / 3 : targetCount / 3;
    lblTargetVerts.textContent = targetCount.toLocaleString();
    lblTargetFaces.textContent = targetFaces.toLocaleString();
  } else {
    lblTargetVerts.textContent = '-';
    lblTargetFaces.textContent = '-';
  }

  if (state.baseMesh) {
    const baseCount = state.baseMesh.geometry.attributes.position.count;
    const baseFaces = state.baseMesh.geometry.index ? state.baseMesh.geometry.index.count / 3 : baseCount / 3;
    lblBaseVerts.textContent = baseCount.toLocaleString();
    lblBaseFaces.textContent = Math.round(baseFaces).toLocaleString();
  }
}

// 16. Export Wavefront OBJ
function exportToOBJ() {
  if (!state.baseMesh) return;

  const baseGeom = state.baseMesh.geometry;
  const positions = baseGeom.attributes.position;
  const uvs = baseGeom.attributes.uv;
  const indices = baseGeom.index;

  state.baseMesh.updateMatrixWorld(true);
  const transformMatrix = state.baseMesh.matrixWorld;

  let objStr = `# OkTopo Web Exported Mesh\n`;
  objStr += `# Vertices: ${positions.count}\n`;
  objStr += `# Faces: ${indices ? indices.count / 3 : positions.count / 3}\n\n`;

  const vertex = new THREE.Vector3();
  
  // Vertices
  for (let i = 0; i < positions.count; i++) {
    vertex.set(positions.getX(i), positions.getY(i), positions.getZ(i));
    vertex.applyMatrix4(transformMatrix); // World space coords export
    objStr += `v ${vertex.x.toFixed(6)} ${vertex.y.toFixed(6)} ${vertex.z.toFixed(6)}\n`;
  }

  // UV Texture Coordinates (fallback if missing)
  if (uvs && uvs.count > 0) {
    for (let i = 0; i < uvs.count; i++) {
      objStr += `vt ${uvs.getX(i).toFixed(6)} ${uvs.getY(i).toFixed(6)}\n`;
    }
  } else {
    // Generate default uv for OBJ format requirements
    for (let i = 0; i < positions.count; i++) {
      objStr += `vt 0.000000 0.000000\n`;
    }
  }

  // Indices / Faces (1-indexed)
  if (indices) {
    for (let i = 0; i < indices.count; i += 3) {
      const v1 = indices.getX(i) + 1;
      const v2 = indices.getY(i) + 1;
      const v3 = indices.getZ(i) + 1;
      objStr += `f ${v1}/${v1} ${v2}/${v2} ${v3}/${v3}\n`;
    }
  } else {
    // Non-indexed triangulation export
    for (let i = 0; i < positions.count; i += 3) {
      const v1 = i + 1;
      const v2 = i + 2;
      const v3 = i + 3;
      objStr += `f ${v1}/${v1} ${v2}/${v2} ${v3}/${v3}\n`;
    }
  }

  // Download trigger
  const blob = new Blob([objStr], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `oktopo_retopo_head.obj`;
  link.click();
}

// 17. Main Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (state.orbitControls) {
    state.orbitControls.update();
  }
  
  if (state.renderer && state.scene && state.camera) {
    state.renderer.render(state.scene, state.camera);
  }
}
