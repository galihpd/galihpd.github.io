// --- Multiproject State Management ---
let projects = [];
let activeProjectId = null;
let appClipboard = [];

let currentMode = 'move';
let zIndexCounter = 30;
let isSnapEnabled = false;
const GRID_SIZE = 20;

let connections = [];
let isConnecting = false;
let startContainerId = null;
let selectedElements = new Set();
let draggedLayerId = null;

const MAX_HISTORY = 30;
let undoStack = [];
let redoStack = [];
let isRestoring = false;

let zoomLevel = 1;
let panX = 0;
let panY = 0;
const BOARD_SIZE = 4000;
let isPanning = false;
let panStartX, panStartY, initialPanX, initialPanY;
let initialPinchDist = null;
let initialPinchZoom = null;

let isBoxSelecting = false;
let boxStartX = 0;
let boxStartY = 0;
let initialSelection = new Set();
let currentShapeType = 'rect';
let pasteCount = 0;

// Ruler Guides
let horizontalGuides = [];
let verticalGuides = [];
let isDraggingGuide = false;
let draggedGuideType = null;
let draggedGuideIndex = -1;

// Vector Pen Tool variables
let isDrawingPath = false;
let currentPathPoints = [];
let currentPathElement = null;
let currentPathId = null;
let isPathClosed = false;
let activePathNodeIndex = -1;
let selectedPathNodeIndex = -1;
let isDraggingPathNode = false;
let pathNodeDragOffset = { x: 0, y: 0 };

// Drag to spawn variables
let isDrawingSpawn = false;
let spawnStartX = 0;
let spawnStartY = 0;

let brushSizes = {
    pen: 4,
    pencil: 1.5,
    highlighter: 30,
    eraser: 30
};

// Text format active state memory
let savedTextRange = null;

const workspace = document.getElementById('workspace');
const boardContainer = document.getElementById('board-container');
const imageLayer = document.getElementById('image-layer');
const connectionLayer = document.getElementById('connection-layer');
const canvas = document.getElementById('drawing-canvas');
const selectionBox = document.getElementById('selection-box');
const ghostBox = document.getElementById('ghost-box');
const brushCursor = document.getElementById('brush-cursor');
const textToolbar = document.getElementById('text-format-toolbar');
const ctx = canvas ? canvas.getContext('2d') : null;

// Premium Color Pickers instances
let pickerFill, pickerStroke, pickerText;

function showLoading(msg) {
    const textEl = document.getElementById('global-loading-text');
    if (textEl) textEl.innerText = msg;
    document.getElementById('global-loading')?.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('global-loading')?.classList.add('hidden');
}

// --- HELPER FUNCTION UNTUK MEMBULATKAN SUDUT VECTOR PATH NATIVE ---
function getRoundedPath(points, radius, isClosed, pointRadii = null, scaleX = 1, scaleY = 1) {
    const radii = points.map((_, index) => {
        const pointRadius = Array.isArray(pointRadii) ? parseFloat(pointRadii[index]) : NaN;
        return Number.isFinite(pointRadius) ? Math.max(0, pointRadius) : Math.max(0, parseFloat(radius) || 0);
    });
    const hasRoundedPoint = radii.some(r => r > 0);

    if (points.length < 3 || !hasRoundedPoint) {
        let d = '';
        if (points.length > 0) d += `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
        return isClosed && points.length > 2 ? d + ' Z' : d;
    }

    let d = "";
    const len = points.length;

    for (let i = 0; i < len; i++) {
        let p = points[i];
        let prev = isClosed ? points[(i - 1 + len) % len] : points[i - 1];
        let next = isClosed ? points[(i + 1) % len] : points[i + 1];
        let pointRadius = radii[i];

        if (!prev || !next) {
            if (i === 0) d += `M ${p.x} ${p.y} `;
            else d += `L ${p.x} ${p.y} `;
            continue;
        }

        let pPx = { x: p.x * scaleX, y: p.y * scaleY };
        let prevPx = { x: prev.x * scaleX, y: prev.y * scaleY };
        let nextPx = { x: next.x * scaleX, y: next.y * scaleY };

        let dx1 = prevPx.x - pPx.x, dy1 = prevPx.y - pPx.y;
        let d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
        let dx2 = nextPx.x - pPx.x, dy2 = nextPx.y - pPx.y;
        let d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

        let r = Math.min(pointRadius, d1 / 2, d2 / 2);

        if (r <= 0.1) {
            if (i === 0) {
                if (isClosed) d += `M ${p.x} ${p.y} `;
                else d += `M ${p.x} ${p.y} `;
            } else {
                d += `L ${p.x} ${p.y} `;
            }
            continue;
        }

        let p1x = (pPx.x + (dx1 / d1) * r) / scaleX;
        let p1y = (pPx.y + (dy1 / d1) * r) / scaleY;
        let p2x = (pPx.x + (dx2 / d2) * r) / scaleX;
        let p2y = (pPx.y + (dy2 / d2) * r) / scaleY;

        if (i === 0) {
            if (isClosed) d += `M ${p1x} ${p1y} Q ${p.x} ${p.y} ${p2x} ${p2y} `;
            else d += `M ${p.x} ${p.y} `;
        } else {
            d += `L ${p1x} ${p1y} Q ${p.x} ${p.y} ${p2x} ${p2y} `;
        }
    }

    if (isClosed) d += ' Z';
    return d;
}

function initApp() {
    if (canvas) {
        canvas.width = BOARD_SIZE;
        canvas.height = BOARD_SIZE;
    }
    createNewProject("Moodboard Projek Baru", true);
    initScrubbers();
    initColorPickers();
    window.addEventListener('resize', drawRulers);
    setupRulerInteraction();
}

// --- CUSTOM COLOR PICKER ENGINE ---
let cpType = null;
let cpH = 0, cpS = 1, cpV = 1, cpA = 1;
let cpOriginalHex = '#000000';
let cpDragging = null; // 'sv' | 'hue' | 'alpha'
let cpDragSetup = false;
let isColorPickerDragging = false;
let colorPickerStartX = 0, colorPickerStartY = 0;

const CP_SWATCHES = ['#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#64748b', '#94a3b8'];

function cpHsvToRgb(h, s, v) { h = h % 360; const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c; let r, g, b; if (h < 60) { r = c; g = x; b = 0; } else if (h < 120) { r = x; g = c; b = 0; } else if (h < 180) { r = 0; g = c; b = x; } else if (h < 240) { r = 0; g = x; b = c; } else if (h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }; }
function cpRgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min; let h = 0, s = 0, v = max; if (max) s = d / max; if (d) { if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60; else if (max === g) h = ((b - r) / d + 2) * 60; else h = ((r - g) / d + 4) * 60; } return { h, s, v }; }
function cpHexToRgb(hex) { hex = (hex || '').replace('#', ''); if (hex.length === 3) hex = hex.split('').map(c => c + c).join(''); if (hex.length !== 6) return { r: 0, g: 0, b: 0 }; return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }; }
function cpRgbToHex(r, g, b) { return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join(''); }
function cpCurrentHex() { const rgb = cpHsvToRgb(cpH, cpS, cpV); return cpRgbToHex(rgb.r, rgb.g, rgb.b); }
function cpCurrentRgba() { const rgb = cpHsvToRgb(cpH, cpS, cpV); return `rgba(${rgb.r},${rgb.g},${rgb.b},${cpA})`; }

function cpUpdateUI() {
    const hex = cpCurrentHex();
    const rgb = cpHsvToRgb(cpH, cpS, cpV);
    const hueColor = `hsl(${cpH},100%,50%)`;

    const svField = document.getElementById('cp-sv-field');
    const svHueBg = document.getElementById('cp-sv-hue-bg');
    if (svHueBg) svHueBg.style.backgroundColor = hueColor;

    const cursor = document.getElementById('cp-sv-cursor');
    if (cursor && svField) {
        cursor.style.left = (cpS * svField.offsetWidth) + 'px';
        cursor.style.top = ((1 - cpV) * svField.offsetHeight) + 'px';
        cursor.style.backgroundColor = hex;
    }

    const hueSlider = document.getElementById('cp-hue-slider');
    const hueThumb = document.getElementById('cp-hue-thumb');
    if (hueThumb && hueSlider) {
        hueThumb.style.left = (cpH / 360 * hueSlider.offsetWidth) + 'px';
        hueThumb.style.backgroundColor = hueColor;
    }

    const alphaOverlay = document.getElementById('cp-alpha-overlay');
    const alphaThumb = document.getElementById('cp-alpha-thumb');
    const alphaTrack = document.getElementById('cp-alpha-track');
    if (alphaOverlay) alphaOverlay.style.background = `linear-gradient(to right,transparent,${hex})`;
    if (alphaThumb && alphaTrack) {
        alphaThumb.style.left = (cpA * alphaTrack.offsetWidth) + 'px';
        alphaThumb.style.backgroundColor = cpCurrentRgba();
    }

    const newSwatch = document.getElementById('cp-preview-new');
    if (newSwatch) newSwatch.style.backgroundColor = cpCurrentRgba();

    const hexInput = document.getElementById('cp-hex-input');
    if (hexInput && document.activeElement !== hexInput) hexInput.value = hex.toUpperCase();
    const rIn = document.getElementById('cp-r-input');
    const gIn = document.getElementById('cp-g-input');
    const bIn = document.getElementById('cp-b-input');
    if (rIn && document.activeElement !== rIn) rIn.value = rgb.r;
    if (gIn && document.activeElement !== gIn) gIn.value = rgb.g;
    if (bIn && document.activeElement !== bIn) bIn.value = rgb.b;
    const alphaIn = document.getElementById('cp-alpha-input');
    if (alphaIn && document.activeElement !== alphaIn) alphaIn.value = Math.round(cpA * 100);
}

function cpApply(save = false) {
    const hex = cpCurrentHex();
    if (cpType === 'fill') {
        const t = document.getElementById('alwan-fill-trigger');
        const h = document.getElementById('prop-fill-hex');
        if (t) t.style.backgroundColor = hex;
        if (h) h.value = hex.toUpperCase();
        applyFormatToSelection('fill', hex, save);
        applyFormatToSelection('fillOpacity', Math.round(cpA * 100), save);
    } else if (cpType === 'stroke') {
        const t = document.getElementById('alwan-stroke-trigger');
        const h = document.getElementById('prop-stroke-hex');
        if (t) t.style.backgroundColor = hex;
        if (h) h.value = hex.toUpperCase();
        applyFormatToSelection('stroke', hex, save);
    } else if (cpType === 'text') {
        const t = document.getElementById('alwan-text-trigger');
        const h = document.getElementById('prop-text-hex');
        if (t) t.style.backgroundColor = hex;
        if (h) h.value = hex.toUpperCase();
        applyTextFormat('fill', hex, save);
    }
}

function cpSetFromHex(hex) {
    const rgb = cpHexToRgb(hex);
    const hsv = cpRgbToHsv(rgb.r, rgb.g, rgb.b);
    cpH = hsv.h; cpS = hsv.s; cpV = hsv.v;
    cpUpdateUI();
}

function cpMakeSliderHandler(onMove, onDone) {
    return function (e) {
        e.preventDefault();
        onMove(e);
        const move = (ev) => { ev.preventDefault(); onMove(ev); };
        const up = () => { onDone(); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up); };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('touchend', up);
    };
}

function cpSetupInteractions() {
    const svField = document.getElementById('cp-sv-field');
    if (svField && !svField._cpReady) {
        svField._cpReady = true;
        const onMove = (e) => {
            const rect = svField.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            cpS = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
            cpV = 1 - Math.max(0, Math.min(1, (cy - rect.top) / rect.height));
            cpUpdateUI(); cpApply(false);
        };
        svField.addEventListener('mousedown', cpMakeSliderHandler(onMove, () => cpApply(true)));
        svField.addEventListener('touchstart', cpMakeSliderHandler(onMove, () => cpApply(true)), { passive: false });
    }

    const hueSlider = document.getElementById('cp-hue-slider');
    if (hueSlider && !hueSlider._cpReady) {
        hueSlider._cpReady = true;
        const onMove = (e) => {
            const rect = hueSlider.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            cpH = Math.max(0, Math.min(360, (cx - rect.left) / rect.width * 360));
            cpUpdateUI(); cpApply(false);
        };
        hueSlider.addEventListener('mousedown', cpMakeSliderHandler(onMove, () => cpApply(true)));
        hueSlider.addEventListener('touchstart', cpMakeSliderHandler(onMove, () => cpApply(true)), { passive: false });
    }

    const alphaTrack = document.getElementById('cp-alpha-track');
    if (alphaTrack && !alphaTrack._cpReady) {
        alphaTrack._cpReady = true;
        const onMove = (e) => {
            const rect = alphaTrack.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            cpA = Math.max(0, Math.min(1, (cx - rect.left) / rect.width));
            cpUpdateUI(); cpApply(false);
        };
        alphaTrack.addEventListener('mousedown', cpMakeSliderHandler(onMove, () => cpApply(true)));
        alphaTrack.addEventListener('touchstart', cpMakeSliderHandler(onMove, () => cpApply(true)), { passive: false });
    }

    const previewOld = document.getElementById('cp-preview-old');
    if (previewOld && !previewOld._cpReady) {
        previewOld._cpReady = true;
        previewOld.addEventListener('click', () => { cpSetFromHex(cpOriginalHex); cpApply(true); });
    }

    const hexInput = document.getElementById('cp-hex-input');
    if (hexInput && !hexInput._cpReady) {
        hexInput._cpReady = true;
        hexInput.addEventListener('change', () => { cpSetFromHex(hexInput.value); cpApply(true); });
    }
    const alphaInput = document.getElementById('cp-alpha-input');
    if (alphaInput && !alphaInput._cpReady) {
        alphaInput._cpReady = true;
        alphaInput.addEventListener('change', () => { cpA = Math.max(0, Math.min(100, +alphaInput.value)) / 100; cpUpdateUI(); cpApply(true); });
    }
    ['r', 'g', 'b'].forEach(ch => {
        const el = document.getElementById(`cp-${ch}-input`);
        if (el && !el._cpReady) {
            el._cpReady = true;
            el.addEventListener('change', () => {
                const r = +document.getElementById('cp-r-input').value;
                const g = +document.getElementById('cp-g-input').value;
                const b = +document.getElementById('cp-b-input').value;
                const hsv = cpRgbToHsv(r, g, b);
                cpH = hsv.h; cpS = hsv.s; cpV = hsv.v;
                cpUpdateUI(); cpApply(true);
            });
        }
    });

    const swatchContainer = document.getElementById('cp-swatches');
    if (swatchContainer && !swatchContainer._cpReady) {
        swatchContainer._cpReady = true;
        swatchContainer.innerHTML = '';
        CP_SWATCHES.forEach(color => {
            const sw = document.createElement('button');
            sw.className = 'cp-swatch';
            sw.style.backgroundColor = color;
            sw.title = color;
            sw.addEventListener('click', () => { cpSetFromHex(color); cpApply(true); });
            swatchContainer.appendChild(sw);
        });
    }
}

function openColorPickerModal(triggerType) {
    cpType = triggerType;
    let currentColor = '#000000';
    if (triggerType === 'fill') currentColor = document.getElementById('prop-fill-hex')?.value || '#e2e8f0';
    else if (triggerType === 'stroke') currentColor = document.getElementById('prop-stroke-hex')?.value || '#94a3b8';
    else if (triggerType === 'text') currentColor = document.getElementById('prop-text-hex')?.value || '#000000';

    cpOriginalHex = currentColor;
    cpA = 1;
    cpSetFromHex(currentColor);

    const titleEl = document.getElementById('cp-title');
    if (titleEl) titleEl.textContent = triggerType === 'fill' ? 'Fill Color' : triggerType === 'stroke' ? 'Stroke Color' : 'Text Color';

    const oldSwatch = document.getElementById('cp-preview-old');
    if (oldSwatch) oldSwatch.style.backgroundColor = currentColor;

    const modal = document.getElementById('color-picker-modal');
    modal.classList.remove('hidden');

    // Setup interactions (once per element lifetime)
    requestAnimationFrame(() => {
        cpSetupInteractions();
        cpUpdateUI();
    });

    setupColorPickerDrag();
}

function closeColorPickerModal() {
    document.getElementById('color-picker-modal').classList.add('hidden');
    cpApply(true);
    cpType = null;
}

function setupColorPickerDrag() {
    if (cpDragSetup) return;
    cpDragSetup = true;
    const modal = document.getElementById('color-picker-modal');
    const header = document.getElementById('color-picker-header');
    const getP = (e) => e.touches ? e.touches[0] : e;
    const startDrag = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        const p = getP(e), rect = modal.getBoundingClientRect();
        isColorPickerDragging = true;
        colorPickerStartX = p.clientX - rect.left;
        colorPickerStartY = p.clientY - rect.top;
        modal.style.left = rect.left + 'px';
        modal.style.top = rect.top + 'px';
        modal.style.transform = 'none';
        header.style.cursor = 'grabbing';
        e.preventDefault();
    };
    const moveDrag = (e) => {
        if (!isColorPickerDragging) return;
        const p = getP(e);
        modal.style.left = (p.clientX - colorPickerStartX) + 'px';
        modal.style.top = (p.clientY - colorPickerStartY) + 'px';
        e.preventDefault();
    };
    const stopDrag = () => { isColorPickerDragging = false; header.style.cursor = 'move'; };
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function initColorPickers() { /* custom picker, no init needed */ }

// --- EXPORT SELECTED (opens modal) ---
let _exportFormat = 'png';
let _exportScale = 2;

function exportSelected() {
    if (selectedElements.size === 0) return alert("Pilih objek terlebih dahulu!");
    // Show element name in subtitle
    const elId = Array.from(selectedElements)[0];
    const el = document.getElementById(elId);
    const name = el?.dataset?.layerName || 'Selection';
    const sub = document.getElementById('export-subtitle');
    if (sub) sub.textContent = name;
    // Update size hint
    updateExportSizeHint();
    // Open modal
    document.getElementById('export-modal')?.classList.remove('hidden');
}

function setExportFormat(fmt) {
    _exportFormat = fmt;
    // Toggle active class
    document.querySelectorAll('.export-fmt-btn').forEach(b => {
        b.classList.toggle('active-fmt', b.dataset.fmt === fmt);
    });
    // Show/hide sections
    document.getElementById('export-scale-section').style.display = (fmt === 'svg') ? 'none' : '';
    document.getElementById('export-quality-section').classList.toggle('hidden', fmt !== 'jpg');
    document.getElementById('export-pdf-section').classList.toggle('hidden', fmt !== 'pdf');
    // Update button label
    document.getElementById('btn-execute-label').textContent = `Export ${fmt.toUpperCase()}`;
    updateExportSizeHint();
}

function setExportScale(s) {
    _exportScale = s;
    document.querySelectorAll('.export-scale-btn').forEach(b => {
        b.classList.toggle('active-scale', Number(b.dataset.scale) === s);
    });
    updateExportSizeHint();
}

function updateExportSizeHint() {
    const hint = document.getElementById('export-size-hint');
    if (!hint) return;
    if (_exportFormat === 'svg' || _exportFormat === 'pdf') { hint.textContent = ''; return; }
    if (selectedElements.size === 0) { hint.textContent = ''; return; }
    const elId = Array.from(selectedElements)[0];
    const el = document.getElementById(elId);
    if (!el) { hint.textContent = ''; return; }
    const w = Math.round(el.offsetWidth * _exportScale);
    const h = Math.round(el.offsetHeight * _exportScale);
    hint.textContent = `Output: ${w} × ${h} px`;
}

function closeExportModal() {
    document.getElementById('export-modal')?.classList.add('hidden');
    document.getElementById('export-loading')?.classList.add('hidden');
    const btn = document.getElementById('btn-execute-export');
    if (btn) btn.disabled = false;
}

async function executeExport() {
    const btn = document.getElementById('btn-execute-export');
    const loading = document.getElementById('export-loading');
    if (btn) btn.disabled = true;
    loading?.classList.remove('hidden');

    setTimeout(async () => {
        try {
            if (_exportFormat === 'pdf') {
                await _doPDFExport();
            } else if (_exportFormat === 'svg') {
                await _doSVGExport();
            } else {
                await _doRasterExport(_exportFormat, _exportScale);
            }
            closeExportModal();
        } catch (err) {
            console.error(err);
            alert("Export failed: " + err.message);
            closeExportModal();
        }
    }, 80);
}

// --- RASTER EXPORT (PNG / JPG) with scale ---
async function _doRasterExport(format, scale) {
    const elId = Array.from(selectedElements)[0];
    const el = document.getElementById(elId);
    if (!el) throw new Error("No element selected");

    el.classList.remove('ring-1', 'ring-brand-500');
    const handles = el.querySelectorAll('.handle, .frame-label-ui');
    handles.forEach(h => h.style.opacity = '0');

    await new Promise(r => setTimeout(r, 60));

    let bgColor = null;
    if (format === 'jpg') {
        bgColor = '#ffffff'; // JPG doesn't support transparency
        if (document.documentElement.classList.contains('dark')) bgColor = '#0e0e0e';
    }
    if (el.dataset.type === 'frame') {
        const content = el.querySelector('.frame-content');
        if (content) bgColor = bgColor || window.getComputedStyle(content).backgroundColor;
    } else if (el.dataset.type === 'shape' && el.dataset.shapeType === 'rect') {
        const content = el.querySelector('.shape-inner-wrapper');
        if (content) bgColor = bgColor || window.getComputedStyle(content).backgroundColor;
    }

    const canvasRender = await html2canvas(el, {
        backgroundColor: bgColor,
        scale: scale,
        useCORS: true
    });

    const link = document.createElement('a');
    const name = el.dataset.layerName || 'export';
    const suffix = scale > 1 ? `@${scale}x` : '';

    if (format === 'jpg') {
        const quality = (parseInt(document.getElementById('export-quality-slider')?.value) || 92) / 100;
        link.download = `${name}${suffix}.jpg`;
        link.href = canvasRender.toDataURL('image/jpeg', quality);
    } else {
        link.download = `${name}${suffix}.png`;
        link.href = canvasRender.toDataURL('image/png');
    }
    link.click();

    el.classList.add('ring-1', 'ring-brand-500');
    handles.forEach(h => h.style.opacity = '1');
}

// --- SVG EXPORT ---
async function _doSVGExport() {
    const elId = Array.from(selectedElements)[0];
    const el = document.getElementById(elId);
    if (!el) throw new Error("No element selected");

    const w = el.offsetWidth;
    const h = el.offsetHeight;

    // Clone element for clean export
    const clone = el.cloneNode(true);
    // Remove UI handles
    clone.querySelectorAll('.handle, .frame-label-ui, .delete-btn').forEach(n => n.remove());
    // Remove selection ring
    clone.classList.remove('ring-1', 'ring-brand-500');
    clone.style.position = 'relative';
    clone.style.left = '0'; clone.style.top = '0';

    // Create foreignObject SVG wrapper
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const fo = document.createElementNS(svgNS, 'foreignObject');
    fo.setAttribute('width', '100%');
    fo.setAttribute('height', '100%');

    const body = document.createElement('body');
    body.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    body.style.margin = '0';
    body.style.padding = '0';
    body.appendChild(clone);

    fo.appendChild(body);
    svg.appendChild(fo);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `${el.dataset.layerName || 'export'}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}


// --- GLOBAL SNAPPING HELPER ---
function snapValue(val, type) {
    let snapped = val;
    let didSnap = false;
    const threshold = 10 / zoomLevel;
    const guides = type === 'x' ? verticalGuides : horizontalGuides;

    // Snap to guides first
    for (let g of guides) {
        if (Math.abs(val - g) < threshold) {
            snapped = g;
            didSnap = true;
            break;
        }
    }

    // Snap to grid if enabled and no guide snapped
    if (!didSnap && isSnapEnabled) {
        snapped = Math.round(val / GRID_SIZE) * GRID_SIZE;
    }

    return snapped;
}

// Fungsi baru untuk guide menempel (snap) ke elemen di canvas
function snapGuideToElements(val, type) {
    let snapped = val;
    let minDiff = 10 / zoomLevel;
    const elements = document.querySelectorAll('.element-container');
    const boardRect = imageLayer.getBoundingClientRect();

    elements.forEach(el => {
        if (el.dataset.hidden === 'true') return;
        const rect = el.getBoundingClientRect();

        if (type === 'vertical') {
            const left = (rect.left - boardRect.left) / zoomLevel;
            const right = (rect.right - boardRect.left) / zoomLevel;
            const center = left + (rect.width / zoomLevel) / 2;

            [left, center, right].forEach(target => {
                if (Math.abs(val - target) < minDiff) {
                    snapped = target;
                    minDiff = Math.abs(val - target);
                }
            });
        } else {
            const top = (rect.top - boardRect.top) / zoomLevel;
            const bottom = (rect.bottom - boardRect.top) / zoomLevel;
            const center = top + (rect.height / zoomLevel) / 2;

            [top, center, bottom].forEach(target => {
                if (Math.abs(val - target) < minDiff) {
                    snapped = target;
                    minDiff = Math.abs(val - target);
                }
            });
        }
    });

    if (isSnapEnabled && snapped === val) {
        const gridSnapped = Math.round(val / GRID_SIZE) * GRID_SIZE;
        if (Math.abs(val - gridSnapped) < minDiff) {
            snapped = gridSnapped;
        }
    }

    return snapped;
}

// --- RULERS LOGIC ---
function drawRulers() {
    const rulerH = document.getElementById('ruler-h');
    const rulerV = document.getElementById('ruler-v');
    if (!rulerH || !rulerV) return;

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#666666' : '#94a3b8';
    const tickColor = isDark ? '#333333' : '#e2e8f0';

    rulerH.width = rulerH.clientWidth;
    rulerH.height = rulerH.clientHeight;
    rulerV.width = rulerV.clientWidth;
    rulerV.height = rulerV.clientHeight;

    const ctxH = rulerH.getContext('2d');
    const ctxV = rulerV.getContext('2d');

    ctxH.clearRect(0, 0, rulerH.width, rulerH.height);
    ctxV.clearRect(0, 0, rulerV.width, rulerV.height);

    // Adjust step size and font size based on zoom level
    let stepBoard = 100;
    let fontSize = 10;

    if (zoomLevel < 0.1) {
        stepBoard = 1000; // Much larger steps when zoomed out far
        fontSize = 14; // Larger font
    } else if (zoomLevel < 0.3) {
        stepBoard = 500; // Larger steps
        fontSize = 12; // Slightly larger font
    } else if (zoomLevel < 0.5) {
        stepBoard = 200; // Medium steps
        fontSize = 11; // Medium font
    }

    ctxH.fillStyle = textColor;
    ctxH.strokeStyle = tickColor;
    ctxH.font = `${fontSize}px Inter, sans-serif`;
    ctxH.textAlign = 'center';
    ctxH.textBaseline = 'top';

    ctxV.fillStyle = textColor;
    ctxV.strokeStyle = tickColor;
    ctxV.font = `${fontSize}px Inter, sans-serif`;
    ctxV.textAlign = 'right';
    ctxV.textBaseline = 'middle';

    // Draw Horizontal
    let startBoardX = Math.floor(-panX / (stepBoard * zoomLevel)) * stepBoard;
    ctxH.beginPath();
    for (let bx = startBoardX; ; bx += stepBoard) {
        let sx = panX + bx * zoomLevel;
        if (sx > rulerH.width) break;

        ctxH.fillText(bx, sx + 2, 2);
        ctxH.moveTo(sx, 12);
        ctxH.lineTo(sx, 20);

        for (let j = 1; j < 10; j++) {
            let subBx = bx + j * 10;
            let subSx = panX + subBx * zoomLevel;
            if (subSx > rulerH.width) break;
            if (subSx >= 0) {
                ctxH.moveTo(subSx, j === 5 ? 15 : 18);
                ctxH.lineTo(subSx, 20);
            }
        }
    }
    ctxH.stroke();

    // Draw Vertical
    let startBoardY = Math.floor(-panY / (stepBoard * zoomLevel)) * stepBoard;
    ctxV.beginPath();
    for (let by = startBoardY; ; by += stepBoard) {
        let sy = panY + by * zoomLevel;
        if (sy > rulerV.height) break;

        ctxV.save();
        ctxV.translate(8, sy);
        ctxV.rotate(-Math.PI / 2);
        ctxV.fillText(by, 0, 0);
        ctxV.restore();

        ctxV.moveTo(12, sy);
        ctxV.lineTo(20, sy);

        for (let j = 1; j < 10; j++) {
            let subBy = by + j * 10;
            let subSy = panY + subBy * zoomLevel;
            if (subSy > rulerV.height) break;
            if (subSy >= 0) {
                ctxV.moveTo(j === 5 ? 15 : 18, subSy);
                ctxV.lineTo(20, subSy);
            }
        }
    }
    ctxV.stroke();
}

// --- RULER GUIDES LOGIC ---
function setupRulerInteraction() {
    const rulerH = document.getElementById('ruler-h');
    const rulerV = document.getElementById('ruler-v');

    if (rulerH) {
        const startDragH = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return; // Hanya klik kiri
            e.preventDefault();
            e.stopPropagation(); // Mencegah trigger Block Selection (Marquee)
            const pos = getPointerPos(e);
            horizontalGuides.push(pos.y);
            isDraggingGuide = true;
            draggedGuideType = 'horizontal';
            draggedGuideIndex = horizontalGuides.length - 1;
            renderGuides();
        };
        rulerH.addEventListener('mousedown', startDragH);
        rulerH.addEventListener('touchstart', startDragH, { passive: false });
    }

    if (rulerV) {
        const startDragV = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation(); // Mencegah trigger Block Selection (Marquee)
            const pos = getPointerPos(e);
            verticalGuides.push(pos.x);
            isDraggingGuide = true;
            draggedGuideType = 'vertical';
            draggedGuideIndex = verticalGuides.length - 1;
            renderGuides();
        };
        rulerV.addEventListener('mousedown', startDragV);
        rulerV.addEventListener('touchstart', startDragV, { passive: false });
    }
}

function renderGuides() {
    const container = document.getElementById('ruler-guides');
    if (!container) return;
    container.innerHTML = '';

    // Horizontal guides
    horizontalGuides.forEach((y, index) => {
        const guide = document.createElement('div');
        guide.className = 'absolute left-0 right-0 h-[2px] bg-cyan-500 cursor-ns-resize pointer-events-auto z-[26] hover:bg-cyan-400';
        guide.style.top = (panY + y * zoomLevel) + 'px';
        guide.title = 'Tarik untuk memindah, Klik ganda atau tarik ke luar/penggaris untuk menghapus';

        const startDrag = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            isDraggingGuide = true;
            draggedGuideType = 'horizontal';
            draggedGuideIndex = index;
        };

        guide.addEventListener('mousedown', startDrag);
        guide.addEventListener('touchstart', startDrag, { passive: false });

        guide.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            horizontalGuides.splice(index, 1);
            renderGuides();
        });

        container.appendChild(guide);
    });

    // Vertical guides
    verticalGuides.forEach((x, index) => {
        const guide = document.createElement('div');
        guide.className = 'absolute top-0 bottom-0 w-[2px] bg-cyan-500 cursor-ew-resize pointer-events-auto z-[26] hover:bg-cyan-400';
        guide.style.left = (panX + x * zoomLevel) + 'px';
        guide.title = 'Tarik untuk memindah, Klik ganda atau tarik ke luar/penggaris untuk menghapus';

        const startDrag = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            isDraggingGuide = true;
            draggedGuideType = 'vertical';
            draggedGuideIndex = index;
        };

        guide.addEventListener('mousedown', startDrag);
        guide.addEventListener('touchstart', startDrag, { passive: false });

        guide.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            verticalGuides.splice(index, 1);
            renderGuides();
        });

        container.appendChild(guide);
    });
}

// Keep track of internal active selection for rich text editor
document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        let node = sel.anchorNode;
        if (node && node.nodeType === 3) node = node.parentNode;
        if (node && node.closest('.text-content')) {
            savedTextRange = sel.getRangeAt(0);
        }
    }
});

function restoreTextSelection() {
    if (savedTextRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedTextRange);
    }
}

// --- SCRUBBER LOGIC (Drag to slide numbers) ---
function initScrubbers() {
    makeScrubbable('prop-x', 'x', false, true);
    makeScrubbable('prop-y', 'y', false, true);
    makeScrubbable('prop-w', 'w', false, true);
    makeScrubbable('prop-h', 'h', false, true);
    makeScrubbable('prop-rot', 'rot', false, true);
    makeScrubbable('prop-radius', 'radius', false, true);

    makeScrubbable('prop-text-size', 'size', false, false);
    makeScrubbable('prop-text-line-height', 'lineHeight', true, false);
    makeScrubbable('prop-text-spacing', 'spacing', true, false);
    makeScrubbable('prop-text-word-spacing', 'wordSpacing', true, false);
    makeScrubbable('prop-stroke-width', 'strokeWidth', false, false);
    makeScrubbable('prop-opacity', 'opacity', false, false);
    makeScrubbable('prop-fill-opacity', 'fillOpacity', false, false);
}

function makeScrubbable(inputId, propType, isFloat = false, isTransform = false) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const wrapper = input.parentElement;

    wrapper.style.cursor = 'ew-resize';
    input.style.cursor = 'ew-resize';

    let isDragging = false;
    let startX = 0;
    let startVal = 0;
    let hasDragged = false;

    wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        startVal = parseFloat(input.value) || 0;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        if (!hasDragged && Math.abs(e.clientX - startX) > 2) {
            hasDragged = true;
            input.blur();
        }

        if (hasDragged) {
            window.getSelection().removeAllRanges();
            const dx = e.clientX - startX;
            const sensitivity = isFloat ? 0.05 : 0.5;
            let newVal = startVal + (dx * sensitivity);

            if (!isFloat) newVal = Math.round(newVal);

            if (inputId === 'prop-text-size' || inputId === 'text-size') newVal = Math.max(1, newVal);
            if (inputId === 'prop-stroke-width') newVal = Math.max(0, Math.min(100, newVal));
            if (inputId === 'prop-radius') newVal = Math.max(0, newVal);
            if (inputId === 'prop-opacity' || inputId === 'prop-fill-opacity') newVal = Math.max(0, Math.min(100, newVal));

            input.value = isFloat ? newVal.toFixed(1) : newVal;

            if (isTransform) {
                applyTransformToSelection(propType, input.value, false);
            } else if (propType === 'strokeWidth' || propType === 'opacity' || propType === 'fillOpacity') {
                applyFormatToSelection(propType, input.value, false);
            } else {
                applyTextFormat(propType, input.value, false);
            }
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            if (hasDragged) {
                if (isTransform) applyTransformToSelection(propType, input.value, true);
                else if (propType === 'strokeWidth' || propType === 'opacity' || propType === 'fillOpacity') applyFormatToSelection(propType, input.value, true);
                else applyTextFormat(propType, input.value, true);
            } else {
                if (e.target === input) input.focus();
            }
        }
    });

    input.addEventListener('change', () => {
        if (isTransform) applyTransformToSelection(propType, input.value, true);
        else if (propType === 'strokeWidth' || propType === 'opacity' || propType === 'fillOpacity') applyFormatToSelection(propType, input.value, true);
        else applyTextFormat(propType, input.value, true);
    });

    input.addEventListener('click', (e) => {
        if (hasDragged) e.preventDefault();
    });
}

// --- Auto Reparenting Logic ---
function checkAndReparent(el) {
    if (el.dataset.type === 'frame') return;

    const elRect = el.getBoundingClientRect();
    const elCenter = { x: elRect.left + elRect.width / 2, y: elRect.top + elRect.height / 2 };

    const frames = Array.from(document.querySelectorAll('.element-container[data-type="frame"]'))
        .filter(f => f.id !== el.id && !f.contains(el) && f.dataset.hidden !== 'true');

    let targetFrame = null;
    for (let i = frames.length - 1; i >= 0; i--) {
        const fRect = frames[i].getBoundingClientRect();
        if (elCenter.x >= fRect.left && elCenter.x <= fRect.right &&
            elCenter.y >= fRect.top && elCenter.y <= fRect.bottom) {
            targetFrame = frames[i];
            break;
        }
    }

    if (targetFrame) {
        const frameContent = targetFrame.querySelector('.frame-content');
        if (el.parentElement !== frameContent) {
            const fcRect = frameContent.getBoundingClientRect();
            const relLeft = (elRect.left - fcRect.left) / zoomLevel;
            const relTop = (elRect.top - fcRect.top) / zoomLevel;

            frameContent.appendChild(el);
            el.style.left = relLeft + 'px';
            el.style.top = relTop + 'px';
        }
    } else {
        if (el.parentElement !== imageLayer) {
            const boardRect = imageLayer.getBoundingClientRect();
            const relLeft = (elRect.left - boardRect.left) / zoomLevel;
            const relTop = (elRect.top - boardRect.top) / zoomLevel;

            imageLayer.appendChild(el);
            el.style.left = relLeft + 'px';
            el.style.top = relTop + 'px';
        }
    }
}

// --- Project / Tab Management ---
function createNewProject(title = "Projek Baru", isInitial = false) {
    const newId = 'proj-' + Date.now();
    const proj = {
        id: newId,
        title: title,
        state: { images: [], connections: [], canvas: null },
        undoStack: [],
        redoStack: [],
        panX: (workspace.clientWidth - BOARD_SIZE) / 2,
        panY: (workspace.clientHeight - BOARD_SIZE) / 2,
        zoomLevel: 1,
        fileHandle: null
    };
    projects.push(proj);
    switchProject(newId);
}

function switchProject(id) {
    if (activeProjectId) {
        const activeProj = projects.find(p => p.id === activeProjectId);
        if (activeProj) {
            activeProj.state = getState();
            activeProj.undoStack = undoStack;
            activeProj.redoStack = redoStack;
            activeProj.panX = panX;
            activeProj.panY = panY;
            activeProj.zoomLevel = zoomLevel;
        }
    }

    activeProjectId = id;
    const newProj = projects.find(p => p.id === id);

    undoStack = newProj.undoStack || [];
    redoStack = newProj.redoStack || [];
    panX = newProj.panX;
    panY = newProj.panY;
    zoomLevel = newProj.zoomLevel;

    clearSelection();

    if (!newProj.state.canvas && newProj.state.images.length === 0 && newProj.undoStack.length === 0) {
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        imageLayer.innerHTML = '';
        connections = [];
        renderConnections();
        renderLayers();
        saveState();
    } else {
        loadState(newProj.state);
    }

    updateBoardTransform();
    renderTabs();
    updateUndoRedoUI();
    updateCanvasContext();
}

function closeProject(e, id) {
    e.stopPropagation();
    if (projects.length === 1) {
        projects = [];
        createNewProject("Projek Baru", true);
        return;
    }

    const idx = projects.findIndex(p => p.id === id);
    projects.splice(idx, 1);

    if (activeProjectId === id) {
        const nextId = projects[Math.max(0, idx - 1)].id;
        switchProject(nextId);
    } else {
        renderTabs();
    }
}

function updateProjectTitle(newTitle, id) {
    const targetId = id || activeProjectId;
    const proj = projects.find(p => p.id === targetId);
    if (proj) {
        proj.title = newTitle;
        renderTabs();
    }
}

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toggleProjectMenu(e) {
    e?.stopPropagation();
    const menu = document.getElementById('project-menu');
    if (!menu) return;
    renderProjectMenu();
    menu.classList.toggle('hidden');
}

function renderProjectMenu() {
    const menu = document.getElementById('project-menu');
    if (!menu) return;

    menu.innerHTML = projects.map(p => {
        const isActive = p.id === activeProjectId;
        return `
                    <div class="group flex items-center gap-2 px-2 py-1.5 ${isActive ? 'bg-brand-50 dark:bg-app-surfaceHover' : 'hover:bg-slate-100 dark:hover:bg-app-surfaceHover'}">
                        <button onclick="switchProject('${p.id}'); document.getElementById('project-menu')?.classList.add('hidden');" class="flex-1 min-w-0 text-left">
                            <div class="text-xs font-semibold truncate ${isActive ? 'text-brand-600 dark:text-white' : 'text-slate-700 dark:text-slate-200'}">${escapeHTML(p.title)}</div>
                            <div class="text-[10px] text-slate-400 dark:text-slate-500">${isActive ? 'Current project' : 'Open project'}</div>
                        </button>
                        <button onclick="closeProject(event, '${p.id}')" class="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-60 group-hover:opacity-100 transition-all" title="Close Project">
                            <i class="ph ph-x text-xs"></i>
                        </button>
                    </div>
                `;
    }).join('');
}

function renderTabs() {
    const tabBar = document.getElementById('tab-bar');
    if (tabBar) tabBar.innerHTML = '';

    const activeProj = projects.find(p => p.id === activeProjectId);
    const titleInput = document.getElementById('project-title-input');
    if (titleInput && activeProj) titleInput.value = activeProj.title;
    renderProjectMenu();
}

// --- File Menu & Save/Load ---
function toggleFileMenu() {
    const menu = document.getElementById('file-menu');
    menu?.classList.toggle('hidden');
}

function toggleShapeMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('shape-menu');
    menu?.classList.toggle('hidden');
}

function selectShapeType(type) {
    currentShapeType = type;
    setMode('shape');
    const icon = document.getElementById('current-shape-icon');
    if (icon) icon.className = `ph ph-${type === 'rect' ? 'square' : type} text-xl`;
    document.getElementById('shape-menu')?.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('file-menu');
    if (menu && !menu.classList.contains('hidden') && !e.target.closest('#file-menu') && !e.target.closest('button[onclick="toggleFileMenu()"]')) {
        menu.classList.add('hidden');
    }

    const shapeMenu = document.getElementById('shape-menu');
    if (shapeMenu && !shapeMenu.classList.contains('hidden') && !e.target.closest('#shape-menu') && !e.target.closest('button[onclick="toggleShapeMenu(event)"]')) {
        shapeMenu.classList.add('hidden');
    }

    const projectMenu = document.getElementById('project-menu');
    if (projectMenu && !projectMenu.classList.contains('hidden') && !e.target.closest('#project-menu') && !e.target.closest('#project-switcher')) {
        projectMenu.classList.add('hidden');
    }
});

async function saveProjectToLocal() {
    showLoading("Menyimpan Proyek...");
    const activeProj = projects.find(p => p.id === activeProjectId);
    activeProj.state = getState();

    const exportData = {
        id: activeProj.id,
        title: activeProj.title,
        state: activeProj.state,
        panX: activeProj.panX,
        panY: activeProj.panY,
        zoomLevel: activeProj.zoomLevel
    };
    const dataStr = JSON.stringify(exportData);

    try {
        if (window.showSaveFilePicker) {
            if (!activeProj.fileHandle) {
                activeProj.fileHandle = await window.showSaveFilePicker({
                    suggestedName: `${activeProj.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mb`,
                    types: [{ description: 'Moodboard File', accept: { 'application/json': ['.mb'] } }]
                });
            }
            const writable = await activeProj.fileHandle.createWritable();
            await writable.write(dataStr);
            await writable.close();
            hideLoading();
            return;
        }
    } catch (err) {
        if (err.name === 'AbortError') { hideLoading(); return; }
        console.warn('File System Access API failed or denied, using fallback.', err);
    }

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProj.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mb`;
    a.click();
    URL.revokeObjectURL(url);
    hideLoading();
}

async function saveProjectAsNew() {
    const activeProj = projects.find(p => p.id === activeProjectId);
    activeProj.fileHandle = null;
    saveProjectToLocal();
}

async function openLocalFile() {
    try {
        if (window.showOpenFilePicker) {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{ description: 'Moodboard File', accept: { 'application/json': ['.mb'] } }]
            });
            showLoading("Membuka Proyek...");
            const file = await fileHandle.getFile();
            const text = await file.text();

            const parsed = JSON.parse(text);
            if (parsed.id && parsed.state) {
                parsed.id = 'proj-' + Date.now();
                parsed.fileHandle = fileHandle;
                parsed.undoStack = [];
                parsed.redoStack = [];
                projects.push(parsed);
                switchProject(parsed.id);
            } else {
                alert("Format file tidak valid.");
            }
            hideLoading();
        } else {
            document.getElementById('mb-upload').click();
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.warn(err);
            document.getElementById('mb-upload').click();
        }
    }
}

function fallbackLoadLocal(event) {
    const file = event.target.files[0];
    if (!file) return;

    showLoading("Membuka Proyek...");
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.id && parsed.state) {
                parsed.id = 'proj-' + Date.now();
                parsed.fileHandle = null;
                parsed.undoStack = [];
                parsed.redoStack = [];
                projects.push(parsed);
                switchProject(parsed.id);
            } else {
                alert("Format file tidak valid.");
            }
        } catch (err) {
            alert("Gagal memuat file: " + err.message);
        } finally {
            hideLoading();
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// --- Layers Panel & Drag Drop Logic ---
function toggleLayerPanel() {
    const panel = document.getElementById('layer-panel');
    panel?.classList.toggle('hidden');
}

function handleLayerDragStart(e, id) {
    draggedLayerId = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setTimeout(() => e.target?.classList.add('opacity-40'), 0);
}
function handleLayerDragEnter(e) { e.preventDefault(); }
function handleLayerDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const isInsertBelowInUI = y > rect.height / 2;
    target?.classList.remove('drag-over-top', 'drag-over-bottom');
    if (isInsertBelowInUI) target?.classList.add('drag-over-bottom');
    else target?.classList.add('drag-over-top');
}
function handleLayerDragLeave(e) {
    const target = e.currentTarget;
    target?.classList.remove('drag-over-top', 'drag-over-bottom');
}

function handleLayerDrop(e, targetId) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    target?.classList.remove('drag-over-top', 'drag-over-bottom');

    if (draggedLayerId === targetId || !draggedLayerId) return;

    let elementsList = Array.from(document.querySelectorAll('.element-container')).sort((a, b) => parseInt(a.style.zIndex || 0) - parseInt(b.style.zIndex || 0));

    const draggedIdx = elementsList.findIndex(img => img.id === draggedLayerId);
    if (draggedIdx === -1) return;
    const [draggedImg] = elementsList.splice(draggedIdx, 1);

    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const isInsertBelowInUI = y > rect.height / 2;

    const insertIdx = elementsList.findIndex(img => img.id === targetId);
    elementsList.splice(isInsertBelowInUI ? insertIdx : insertIdx + 1, 0, draggedImg);

    elementsList.forEach((img, idx) => { img.style.zIndex = 30 + idx; });
    zIndexCounter = 30 + elementsList.length;

    renderLayers();
    saveState();
    draggedLayerId = null;
}

function handleLayerDragEnd(e) {
    e.target?.classList.remove('opacity-40');
    draggedLayerId = null;
    renderLayers();
}

function updateLayerName(id, newName) {
    const el = document.getElementById(id);
    if (el) {
        el.dataset.layerName = newName;
        if (el.dataset.type === 'frame') {
            const lbl = el.querySelector('.frame-label-ui');
            if (lbl) lbl.value = newName;
        }
        saveState();
    }
}

function renderLayers() {
    const container = document.getElementById('layers-list');
    if (!container) return;
    container.innerHTML = '';
    const query = (document.getElementById('layer-search')?.value || '').trim().toLowerCase();

    function renderElement(el, depth) {
        const id = el.id;
        const isHidden = el.dataset.hidden === 'true';
        const isLocked = el.dataset.locked === 'true';
        const isSelected = selectedElements.has(id);
        const layerName = el.dataset.layerName || `Item ${el.style.zIndex}`;
        const type = el.dataset.type || 'image';
        const frameContent = type === 'frame' ? el.querySelector('.frame-content') : null;
        const children = frameContent ? Array.from(frameContent.children).filter(c => c.classList.contains('element-container')) : [];
        const childMatches = children.some(child => (child.dataset.layerName || '').toLowerCase().includes(query));
        if (query && !layerName.toLowerCase().includes(query) && !childMatches) return;

        let thumbHTML = '';
        if (type === 'image') {
            const src = el.querySelector('img')?.src || '';
            thumbHTML = `<img src="${src}" class="w-4 h-4 object-cover rounded-sm bg-white dark:bg-[#0b1118] pointer-events-none" alt="L">`;
        } else if (type === 'text') {
            thumbHTML = `<div class="w-4 h-4 flex items-center justify-center rounded-sm text-slate-500 dark:text-slate-400 pointer-events-none"><i class="ph ph-text-t text-base"></i></div>`;
        } else if (type === 'shape') {
            const innerShape = el.querySelector('.shape-svg-node');
            const fill = (el.dataset.shapeType === 'rect') ? el.querySelector('.shape-inner-wrapper')?.style.backgroundColor : (innerShape ? innerShape.getAttribute('fill') : 'transparent');
            const stroke = (el.dataset.shapeType === 'rect') ? el.querySelector('.shape-inner-wrapper')?.style.borderColor : (innerShape ? innerShape.getAttribute('stroke') : 'transparent');
            thumbHTML = `<div class="w-4 h-4 rounded-sm border pointer-events-none" style="background-color:${fill}; border-color:${stroke || '#334155'}"></div>`;
        } else if (type === 'frame') {
            thumbHTML = `<div class="w-4 h-4 flex items-center justify-center rounded-sm text-brand-500 dark:text-white pointer-events-none"><i class="ph ph-frame-corners text-base"></i></div>`;
        }

        const div = document.createElement('div');
        div.className = `group flex items-center justify-between h-9 px-2 rounded-md transition-colors cursor-grab active:cursor-grabbing ${isSelected ? 'bg-brand-50 text-brand-600 dark:bg-app-surfaceHover dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-app-surface'}`;

        if (depth > 0) {
            div.style.marginLeft = (depth * 18) + 'px';
        }

        div.draggable = true;
        div.ondragstart = (e) => handleLayerDragStart(e, id);
        div.ondragenter = handleLayerDragEnter;
        div.ondragover = handleLayerDragOver;
        div.ondragleave = handleLayerDragLeave;
        div.ondrop = (e) => handleLayerDrop(e, id);
        div.ondragend = handleLayerDragEnd;

        div.innerHTML = `
                    <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden" onclick="selectElement('${id}', event.shiftKey)">
                        ${type === 'frame' ? `<i class="ph ph-caret-down text-[11px] text-slate-400 dark:text-slate-500 pointer-events-none"></i>` : `<span class="w-[11px] shrink-0"></span>`}
                        ${thumbHTML}
                        <input type="text" 
                               value="${escapeHTML(layerName)}" 
                               onchange="updateLayerName('${id}', this.value)"
                               onclick="event.stopPropagation(); selectElement('${id}', event.shiftKey);"
                               onmousedown="event.stopPropagation();"
                               class="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-white/30 rounded px-1 py-0.5 text-xs font-medium truncate w-full ${isSelected ? 'text-brand-600 dark:text-white' : 'text-slate-700 dark:text-slate-300'} ${isHidden ? 'opacity-40' : ''}">
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button onclick="toggleVisibility('${id}', event)" class="w-6 h-6 flex items-center justify-center rounded text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5 transition-colors" title="Hide/Show">
                            <i class="ph ${isHidden ? 'ph-eye-slash' : 'ph-eye'} text-sm"></i>
                        </button>
                        <button onclick="toggleLock('${id}', event)" class="w-6 h-6 flex items-center justify-center rounded ${isLocked ? 'text-brand-500 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'} hover:bg-slate-200/70 dark:hover:bg-white/5 transition-colors" title="Lock/Unlock">
                            <i class="ph ${isLocked ? 'ph-lock-key' : 'ph-lock-key-open'} text-sm"></i>
                        </button>
                    </div>
                `;
        container.appendChild(div);

        if (type === 'frame') {
            if (frameContent) {
                children.sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0));
                children.forEach(child => renderElement(child, depth + 1));
            }
        }
    }

    const topLevelElements = Array.from(imageLayer.children).filter(c => c.classList.contains('element-container'));
    topLevelElements.sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0));
    topLevelElements.forEach(el => renderElement(el, 0));

    if (container.children.length === 0) {
        container.innerHTML = `<div class="px-3 py-8 text-center text-xs text-slate-400 dark:text-slate-500">No layers found</div>`;
    }
}

function toggleVisibility(id, e) {
    e.stopPropagation();
    const el = document.getElementById(id);
    if (!el) return;
    const isHidden = el.dataset.hidden === 'true';

    if (isHidden) {
        el.dataset.hidden = 'false';
        el.style.opacity = (el.dataset.opacity || 100) / 100;
        el.style.pointerEvents = el.dataset.locked === 'true' ? 'none' : 'auto';
    } else {
        el.dataset.hidden = 'true';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        if (selectedElements.has(id)) clearSelection();
    }
    renderLayers();
    saveState();
}

function toggleLock(id, e) {
    e.stopPropagation();
    const el = document.getElementById(id);
    if (!el) return;
    const isLocked = el.dataset.locked === 'true';

    if (isLocked) {
        el.dataset.locked = 'false';
        if (el.dataset.hidden !== 'true') el.style.pointerEvents = 'auto';
    } else {
        el.dataset.locked = 'true';
        el.style.pointerEvents = 'none';
        if (selectedElements.has(id)) {
            selectedElements.delete(id);
            el.classList.remove('ring-1', 'ring-brand-500');
        }
    }
    renderLayers();
    saveState();
}

// --- Board & Zoom/Pan Logic ---
function centerBoard() {
    panX = (workspace.clientWidth - BOARD_SIZE) / 2;
    panY = (workspace.clientHeight - BOARD_SIZE) / 2;
    zoomLevel = 1;
    const zoomLabel = document.getElementById('zoom-label');
    if (zoomLabel) zoomLabel.innerText = '100%';
    updateBoardTransform();
}

function updateBoardTransform() {
    if (boardContainer) boardContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    if (workspace) {
        workspace.style.backgroundPosition = `${panX}px ${panY}px`;

        // Switch background based on zoom level
        if (zoomLevel < 0.15) {
            // Very zoomed out - use solid background
            workspace.classList.remove('bg-dots');
            workspace.classList.add('bg-solid');
            workspace.style.backgroundSize = 'auto'; // Reset background size for solid
        } else {
            // Normal zoom - use dots background
            workspace.classList.remove('bg-solid');
            workspace.classList.add('bg-dots');
            workspace.style.backgroundSize = `${20 * zoomLevel}px ${20 * zoomLevel}px`;
        }
    }
    updateBrushCursor();
    drawRulers();
    renderGuides(); // Memastikan posisi guide menempel pada kanvas (board coordinate)
}

function changeZoom(delta, mouseX = null, mouseY = null) {
    const oldZoom = zoomLevel;
    zoomLevel = Math.max(0.1, Math.min(5.0, zoomLevel + delta));
    if (oldZoom !== zoomLevel) {
        const cx = mouseX !== null ? mouseX : workspace.clientWidth / 2;
        const cy = mouseY !== null ? mouseY : workspace.clientHeight / 2;
        const boardX = (cx - panX) / oldZoom;
        const boardY = (cy - panY) / oldZoom;
        panX = cx - boardX * zoomLevel;
        panY = cy - boardY * zoomLevel;
        const zoomLabel = document.getElementById('zoom-label');
        if (zoomLabel) zoomLabel.innerText = Math.round(zoomLevel * 100) + '%';
        updateBoardTransform();
    }
}

function getBoardPos(clientX, clientY) {
    const wsRect = workspace.getBoundingClientRect();
    return { x: ((clientX - wsRect.left) - panX) / zoomLevel, y: ((clientY - wsRect.top) - panY) / zoomLevel };
}
function getPointerPos(e) {
    let clientX = e.clientX, clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    return getBoardPos(clientX, clientY);
}

// Global Panning (Middle Mouse)
window.addEventListener('mousedown', (e) => {
    const isSpawningMode = ['text', 'shape', 'frame'].includes(currentMode);
    const isBackgroundClick = e.target.closest('.element-container') === null && e.target.closest('.image-container') === null;

    if (e.button === 1) {
        e.preventDefault();
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        initialPanX = panX;
        initialPanY = panY;
        document.body.style.cursor = 'grabbing';
    }
});

// Mouse Events
workspace.addEventListener('mousedown', (e) => {
    if (isEditingShape && !e.target.closest('.shape-edit-nodes')) {
        exitShapeEditMode();
    }
    const isSpawningMode = ['text', 'shape', 'frame'].includes(currentMode);
    const isBackgroundClick = e.target.closest('.element-container') === null && e.target.closest('.image-container') === null;

    if (e.button === 0) {
        if (isSpawningMode) {
            if (e.target.closest('.handle') || e.target.closest('.text-content[contenteditable="true"]')) return;
            clearSelection();
            let pos = getPointerPos(e);
            pos.x = snapValue(pos.x, 'x');
            pos.y = snapValue(pos.y, 'y');

            isDrawingSpawn = true;
            spawnStartX = pos.x;
            spawnStartY = pos.y;

            if (ghostBox) {
                ghostBox.style.left = spawnStartX + 'px';
                ghostBox.style.top = spawnStartY + 'px';
                ghostBox.style.width = '0px';
                ghostBox.style.height = '0px';
                ghostBox.classList.remove('hidden');
            }
            e.preventDefault();
            return;
        }

        if (isBackgroundClick && !e.shiftKey) {
            clearSelection();
        }

        if (isBackgroundClick && currentMode === 'move') {
            if (!e.shiftKey) clearSelection();
            initialSelection = new Set(selectedElements);
            isBoxSelecting = true;
            boxStartX = e.clientX;
            boxStartY = e.clientY;
            const wsRect = workspace.getBoundingClientRect();
            if (selectionBox) {
                selectionBox.style.left = (boxStartX - wsRect.left) + 'px';
                selectionBox.style.top = (boxStartY - wsRect.top) + 'px';
                selectionBox.style.width = '0px';
                selectionBox.style.height = '0px';
                selectionBox.classList.remove('hidden');
            }
        }
    }
});

window.addEventListener('mousemove', (e) => {
    // Update Brush Cursor Position
    if (['pen', 'pencil', 'highlighter', 'eraser'].includes(currentMode)) {
        if (brushCursor) {
            brushCursor.style.left = e.clientX + 'px';
            brushCursor.style.top = e.clientY + 'px';
        }
    }

    // Handle guide dragging globally across window
    if (isDraggingGuide) {
        const pos = getPointerPos(e);
        if (draggedGuideType === 'horizontal') {
            horizontalGuides[draggedGuideIndex] = snapGuideToElements(pos.y, 'horizontal');
        } else if (draggedGuideType === 'vertical') {
            verticalGuides[draggedGuideIndex] = snapGuideToElements(pos.x, 'vertical');
        }
        renderGuides();
        return;
    }

    if (isDrawingSpawn && ghostBox) {
        let pos = getPointerPos(e);
        pos.x = snapValue(pos.x, 'x');
        pos.y = snapValue(pos.y, 'y');

        const x1 = Math.min(spawnStartX, pos.x);
        const y1 = Math.min(spawnStartY, pos.y);
        const w = Math.abs(pos.x - spawnStartX);
        const h = Math.abs(pos.y - spawnStartY);
        ghostBox.style.left = x1 + 'px';
        ghostBox.style.top = y1 + 'px';
        ghostBox.style.width = w + 'px';
        ghostBox.style.height = h + 'px';
        return;
    }

    if (isPanning) {
        panX = initialPanX + (e.clientX - panStartX);
        panY = initialPanY + (e.clientY - panStartY);
        updateBoardTransform();
    } else if (isBoxSelecting && selectionBox) {
        const wsRect = workspace.getBoundingClientRect();
        let currentX = e.clientX;
        let currentY = e.clientY;
        const x1 = Math.min(boxStartX, currentX) - wsRect.left;
        const y1 = Math.min(boxStartY, currentY) - wsRect.top;
        const x2 = Math.max(boxStartX, currentX) - wsRect.left;
        const y2 = Math.max(boxStartY, currentY) - wsRect.top;
        selectionBox.style.left = x1 + 'px';
        selectionBox.style.top = y1 + 'px';
        selectionBox.style.width = (x2 - x1) + 'px';
        selectionBox.style.height = (y2 - y1) + 'px';
        const boxRect = selectionBox.getBoundingClientRect();

        Array.from(document.querySelectorAll('.element-container')).forEach(el => {
            if (el.dataset.hidden === 'true' || el.dataset.locked === 'true') return;
            const elRect = el.getBoundingClientRect();
            const intersects = !(boxRect.right < elRect.left || boxRect.left > elRect.right || boxRect.bottom < elRect.top || boxRect.top > elRect.bottom);
            if (intersects) {
                if (!selectedElements.has(el.id)) {
                    selectedElements.add(el.id);
                    el.classList.add('ring-1', 'ring-brand-500');
                    renderLayers();
                }
            } else {
                if (!initialSelection.has(el.id) && selectedElements.has(el.id)) {
                    selectedElements.delete(el.id);
                    el.classList.remove('ring-1', 'ring-brand-500');
                    renderLayers();
                }
            }
        });
    }
});

window.addEventListener('mouseup', (e) => {
    if (isDraggingGuide) {
        // Mengecek apakah cursor dibuang ke arah luar layar atau kembali ke penggaris (hapus guide)
        const wsRect = workspace.getBoundingClientRect();
        if (draggedGuideType === 'horizontal' && (e.clientY - wsRect.top < 25 || e.clientY > wsRect.bottom)) {
            horizontalGuides.splice(draggedGuideIndex, 1);
        } else if (draggedGuideType === 'vertical' && (e.clientX - wsRect.left < 25 || e.clientX > wsRect.right)) {
            verticalGuides.splice(draggedGuideIndex, 1);
        }
        isDraggingGuide = false;
        draggedGuideType = null;
        draggedGuideIndex = -1;
        renderGuides();
        return;
    }

    if (isDrawingSpawn) {
        isDrawingSpawn = false;
        ghostBox?.classList.add('hidden');
        let pos = getPointerPos(e);
        pos.x = snapValue(pos.x, 'x');
        pos.y = snapValue(pos.y, 'y');

        let x1 = Math.min(spawnStartX, pos.x);
        let y1 = Math.min(spawnStartY, pos.y);
        let w = Math.abs(pos.x - spawnStartX);
        let h = Math.abs(pos.y - spawnStartY);

        if (w < 10 || h < 10) {
            w = currentMode === 'frame' ? 800 : 150;
            h = currentMode === 'frame' ? 600 : 150;
            x1 = spawnStartX;
            y1 = spawnStartY;
        }

        if (currentMode === 'shape') createShapeElement(x1, y1, w, h);
        else if (currentMode === 'frame') createFrameElement(x1, y1, w, h);
        else if (currentMode === 'text') createTextElement(x1, y1, w, h);

        return;
    }
    if (isPanning) { isPanning = false; document.body.style.cursor = ''; setMode(currentMode); }
    if (isBoxSelecting) { isBoxSelecting = false; selectionBox?.classList.add('hidden'); }
});

workspace.addEventListener('wheel', (e) => {
    if (e.target.closest('#layer-panel') || e.target.closest('#properties-panel')) return;
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    const wsRect = workspace.getBoundingClientRect();
    changeZoom(zoomDelta, e.clientX - wsRect.left, e.clientY - wsRect.top);
}, { passive: false });

workspace.addEventListener('touchstart', (e) => {
    if (e.target.closest('#layer-panel') || e.target.closest('#properties-panel')) return;
    const isBackgroundClick = e.target.closest('.element-container') === null && e.target.closest('.image-container') === null;
    const isSpawningMode = ['text', 'shape', 'frame'].includes(currentMode);

    if (e.touches.length === 2) {
        isPanning = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.sqrt(dx * dx + dy * dy);
        initialPinchZoom = zoomLevel;
    } else if (e.touches.length === 1) {
        if (isSpawningMode) {
            if (e.target.closest('.handle') || e.target.closest('.text-content[contenteditable="true"]')) return;
            clearSelection();
            let pos = getPointerPos({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
            pos.x = snapValue(pos.x, 'x');
            pos.y = snapValue(pos.y, 'y');

            isDrawingSpawn = true;
            spawnStartX = pos.x;
            spawnStartY = pos.y;
            if (ghostBox) {
                ghostBox.style.left = spawnStartX + 'px';
                ghostBox.style.top = spawnStartY + 'px';
                ghostBox.style.width = '0px';
                ghostBox.style.height = '0px';
                ghostBox.classList.remove('hidden');
            }
            e.preventDefault();
        } else if (isBackgroundClick) {
            if (!e.shiftKey) clearSelection();
            if (currentMode === 'move') {
                isPanning = true;
                panStartX = e.touches[0].clientX;
                panStartY = e.touches[0].clientY;
                initialPanX = panX;
                initialPanY = panY;
            }
        }
    }
}, { passive: false });

workspace.addEventListener('touchmove', (e) => {
    if (isDraggingGuide && e.touches.length === 1) {
        e.preventDefault();
        const pos = getPointerPos(e.touches[0]);
        if (draggedGuideType === 'horizontal') {
            horizontalGuides[draggedGuideIndex] = snapGuideToElements(pos.y, 'horizontal');
        } else if (draggedGuideType === 'vertical') {
            verticalGuides[draggedGuideIndex] = snapGuideToElements(pos.x, 'vertical');
        }
        renderGuides();
        return;
    }

    if (e.touches.length === 2 && initialPinchDist) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = dist / initialPinchDist;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const wsRect = workspace.getBoundingClientRect();
        let targetZoom = Math.max(0.1, Math.min(5.0, initialPinchZoom * scale));
        let delta = targetZoom - zoomLevel;
        if (Math.abs(delta) > 0.01) changeZoom(delta, cx - wsRect.left, cy - wsRect.top);
    } else if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        panX = initialPanX + (e.touches[0].clientX - panStartX);
        panY = initialPanY + (e.touches[0].clientY - panStartY);
        updateBoardTransform();
    } else if (isDrawingSpawn && e.touches.length === 1 && ghostBox) {
        let pos = getPointerPos({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
        pos.x = snapValue(pos.x, 'x');
        pos.y = snapValue(pos.y, 'y');

        const x1 = Math.min(spawnStartX, pos.x);
        const y1 = Math.min(spawnStartY, pos.y);
        const w = Math.abs(pos.x - spawnStartX);
        const h = Math.abs(pos.y - spawnStartY);
        ghostBox.style.left = x1 + 'px';
        ghostBox.style.top = y1 + 'px';
        ghostBox.style.width = w + 'px';
        ghostBox.style.height = h + 'px';
        e.preventDefault();
    }
}, { passive: false });

workspace.addEventListener('touchend', (e) => {
    if (isDraggingGuide) {
        const touch = e.changedTouches[0];
        const wsRect = workspace.getBoundingClientRect();
        if (draggedGuideType === 'horizontal' && (touch.clientY - wsRect.top < 25 || touch.clientY > wsRect.bottom)) {
            horizontalGuides.splice(draggedGuideIndex, 1);
        } else if (draggedGuideType === 'vertical' && (touch.clientX - wsRect.left < 25 || touch.clientX > wsRect.right)) {
            verticalGuides.splice(draggedGuideIndex, 1);
        }
        isDraggingGuide = false;
        draggedGuideType = null;
        draggedGuideIndex = -1;
        renderGuides();
        return;
    }

    if (e.touches.length < 2) initialPinchDist = null;
    if (e.touches.length === 0) isPanning = false;

    if (isDrawingSpawn) {
        isDrawingSpawn = false;
        ghostBox?.classList.add('hidden');
        let pos = getPointerPos(e.changedTouches[0] || { clientX: spawnStartX, clientY: spawnStartY });
        pos.x = snapValue(pos.x, 'x');
        pos.y = snapValue(pos.y, 'y');

        let x1 = Math.min(spawnStartX, pos.x);
        let y1 = Math.min(spawnStartY, pos.y);
        let w = Math.abs(pos.x - spawnStartX);
        let h = Math.abs(pos.y - spawnStartY);

        if (w < 10 || h < 10) {
            w = currentMode === 'frame' ? 800 : 150;
            h = currentMode === 'frame' ? 600 : 150;
            x1 = spawnStartX;
            y1 = spawnStartY;
        }

        if (currentMode === 'shape') createShapeElement(x1, y1, w, h);
        else if (currentMode === 'frame') createFrameElement(x1, y1, w, h);
        else if (currentMode === 'text') createTextElement(x1, y1, w, h);
    }
});

// --- Tool Logic & Brush Preview ---
function updateBrushCursor() {
    if (['pen', 'pencil', 'highlighter', 'eraser'].includes(currentMode)) {
        const scaledSize = brushSizes[currentMode] * zoomLevel;
        if (brushCursor) {
            brushCursor.style.width = scaledSize + 'px';
            brushCursor.style.height = scaledSize + 'px';
            brushCursor.classList.remove('hidden');
        }
    } else {
        brushCursor?.classList.add('hidden');
    }
}

const tools = ['move', 'connect', 'pen', 'pencil', 'highlighter', 'eraser', 'text', 'shape', 'frame', 'pentool'];

function setMode(mode) {
    currentMode = mode;

    // Cancel active path if switching tools
    if (mode !== 'pentool' && isDrawingPath) {
        finishPath();
    }

    tools.forEach(t => {
        const btn = document.getElementById(`btn-${t}`);
        if (!btn) return;
        if (t === mode) {
            btn.classList.add('tool-active');
            btn.classList.remove('text-slate-600', 'dark:text-app-textMuted', 'hover:bg-white', 'dark:hover:bg-app-surfaceHover', 'hover:text-slate-900', 'dark:hover:text-white');
        } else {
            btn.classList.remove('tool-active');
            btn.classList.add('text-slate-600', 'dark:text-app-textMuted', 'hover:bg-white', 'dark:hover:bg-app-surfaceHover', 'hover:text-slate-900', 'dark:hover:text-white');
        }
    });

    if (mode === 'move') {
        workspace.style.cursor = 'default';
        if (canvas) canvas.style.pointerEvents = 'none';
    } else if (mode === 'connect') {
        workspace.style.cursor = 'crosshair';
        if (canvas) canvas.style.pointerEvents = 'none';
    } else if (mode === 'pentool') {
        workspace.style.cursor = 'crosshair';
        if (canvas) canvas.style.pointerEvents = 'none';
    } else if (mode === 'eraser') {
        workspace.style.cursor = 'none'; // custom cursor visible
        if (canvas) canvas.style.pointerEvents = 'auto';
    } else if (mode === 'text' || mode === 'shape' || mode === 'frame') {
        workspace.style.cursor = 'crosshair';
        if (canvas) canvas.style.pointerEvents = 'none';
    } else {
        workspace.style.cursor = 'none'; // custom cursor visible
        if (canvas) canvas.style.pointerEvents = 'auto';
    }
    updateCanvasContext();
    updateBrushCursor();
}

function toggleSnap() {
    isSnapEnabled = !isSnapEnabled;
    const btn = document.getElementById('btn-snap');
    if (btn) {
        if (isSnapEnabled) {
            btn.classList.add('bg-brand-100', 'dark:bg-white/10', 'text-brand-600', 'dark:text-white');
            btn.classList.remove('text-slate-500', 'dark:text-app-textMuted', 'hover:bg-slate-200', 'dark:hover:bg-app-surface');
        } else {
            btn.classList.remove('bg-brand-100', 'dark:bg-white/10', 'text-brand-600', 'dark:text-white');
            btn.classList.add('text-slate-500', 'dark:text-app-textMuted', 'hover:bg-slate-200', 'dark:hover:bg-app-surface');
        }
    }
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    const icon = document.getElementById('icon-dark');
    if (icon) {
        if (isDark) icon.className = 'ph ph-sun text-xl';
        else icon.className = 'ph ph-moon text-xl';
    }
    updateCanvasContext();
    drawRulers();
}

function updateCanvasContext() {
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const isDark = document.documentElement.classList.contains('dark');

    if (currentMode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSizes.eraser;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        if (currentMode === 'pen') {
            ctx.lineWidth = brushSizes.pen;
            ctx.strokeStyle = isDark ? '#ffffff' : '#18181b';
        } else if (currentMode === 'pencil') {
            ctx.lineWidth = brushSizes.pencil;
            ctx.strokeStyle = isDark ? '#a1a1aa' : '#52525b';
        } else if (currentMode === 'highlighter') {
            ctx.lineWidth = brushSizes.highlighter;
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.2)';
        }
    }
}

// --- NEW IMPROVED COLOR PARSERS ---
function rgb2hex(rgb) {
    if (!rgb || rgb === 'none' || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent';
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb; // Fallback to original if not matched
    return "#" +
        ("0" + parseInt(match[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(match[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(match[3], 10).toString(16)).slice(-2);
}

function hex2rgb(hex) {
    if (!hex || hex === 'none' || hex === 'transparent') return { r: 0, g: 0, b: 0 };
    if (hex.startsWith('rgb')) {
        const match = hex.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
        return { r: 0, g: 0, b: 0 };
    }
    if (!hex.startsWith('#')) return { r: 226, g: 232, b: 240 }; // Safe slate gray fallback
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return {
        r: (c >> 16) & 255,
        g: (c >> 8) & 255,
        b: c & 255
    };
}

// --- Format Toolbars ---
function updateFormatUI() {
    const propsEmpty = document.getElementById('properties-empty');
    const propsContent = document.getElementById('properties-content');
    const secTransform = document.getElementById('prop-section-transform');
    const secAlign = document.getElementById('prop-section-align');
    const secText = document.getElementById('prop-section-text');
    const secFill = document.getElementById('prop-section-fill');
    const secStroke = document.getElementById('prop-section-stroke');
    const secBlend = document.getElementById('prop-section-blend');
    const tbText = document.getElementById('text-format-toolbar');

    tbText?.classList.add('hidden');

    if (selectedElements.size >= 1) {
        propsEmpty?.classList.add('hidden');
        propsContent?.classList.remove('hidden');
        secAlign?.classList.remove('hidden');

        if (selectedElements.size > 1) {
            secTransform?.classList.add('hidden');
            secText?.classList.add('hidden');
            secFill?.classList.add('hidden');
            secStroke?.classList.add('hidden');
            secBlend?.classList.add('hidden');
            return;
        }

        secTransform?.classList.remove('hidden');

        const elId = Array.from(selectedElements)[0];
        const el = document.getElementById(elId);
        if (!el) return;

        const type = el.dataset.type;

        // Sync Transform
        const propX = document.getElementById('prop-x');
        if (propX) propX.value = Math.round(parseFloat(el.style.left) || 0);
        const propY = document.getElementById('prop-y');
        if (propY) propY.value = Math.round(parseFloat(el.style.top) || 0);
        const propRot = document.getElementById('prop-rot');
        if (propRot) propRot.value = Math.round(parseFloat(el.dataset.rotation) || 0);

        let radius = parseFloat(el.dataset.radius) || 0;
        const propRadius = document.getElementById('prop-radius');
        if (propRadius) propRadius.value = radius;
        if (
            propRadius &&
            type === 'shape' &&
            isEditingShape &&
            editingShapeId === el.id &&
            selectedShapeNodeIndex >= 0
        ) {
            const shapeNode = el.querySelector('.shape-svg-node');
            const points = parsePathData(shapeNode?.getAttribute('data-original-d') || shapeNode?.getAttribute('d') || '');
            const radii = getShapePointRadii(el, points);
            propRadius.value = Math.round(radii[selectedShapeNodeIndex] || 0);
        }

        let w, h;
        if (type === 'shape' || type === 'frame') {
            w = el.clientWidth; h = el.clientHeight;
        } else {
            const inner = el.querySelector(type === 'text' ? '.text-content' : 'img');
            w = inner ? inner.clientWidth : 0; h = inner ? inner.clientHeight : 0;
        }
        const propW = document.getElementById('prop-w');
        if (propW) propW.value = Math.round(w);
        const propH = document.getElementById('prop-h');
        if (propH) propH.value = Math.round(h);

        // Section Display Logic
        secText?.classList.add('hidden');
        secFill?.classList.add('hidden');
        secStroke?.classList.add('hidden');
        secBlend?.classList.remove('hidden');

        if (type === 'text') {
            tbText?.classList.remove('hidden');
            secText?.classList.remove('hidden');

            const inner = el.querySelector('.text-content');
            if (inner) {
                const ff = inner.style.fontFamily || '"Inter", sans-serif';
                const propTextFont = document.getElementById('prop-text-font');
                if (propTextFont) propTextFont.value = ff;

                const fz = parseInt(inner.style.fontSize) || 24;
                const propTextSize = document.getElementById('prop-text-size');
                if (propTextSize) propTextSize.value = fz;

                const lh = parseFloat(inner.style.lineHeight) || 1.5;
                const propTextLineHeight = document.getElementById('prop-text-line-height');
                if (propTextLineHeight) propTextLineHeight.value = lh;

                const ls = parseFloat(inner.style.letterSpacing) || 0;
                const propTextSpacing = document.getElementById('prop-text-spacing');
                if (propTextSpacing) propTextSpacing.value = ls;

                const ws = parseFloat(inner.style.wordSpacing) || 0;
                const propTextWordSpacing = document.getElementById('prop-text-word-spacing');
                if (propTextWordSpacing) propTextWordSpacing.value = ws;

                const hexColor = rgb2hex(inner.style.color);
                if (pickerText) { pickerText.setColor(hexColor); }
                const propTextHex = document.getElementById('prop-text-hex');
                if (propTextHex) propTextHex.value = hexColor;
            }

        } else if (type === 'shape') {
            secFill?.classList.remove('hidden');
            secStroke?.classList.remove('hidden');

            if (el.dataset.shapeType === 'rect') {
                const inner = el.querySelector('.shape-inner-wrapper');
                if (inner) {
                    const fillHex = rgb2hex(inner.style.backgroundColor);
                    if (pickerFill) pickerFill.setColor(fillHex);
                    const propFillHex = document.getElementById('prop-fill-hex');
                    if (propFillHex) propFillHex.value = fillHex;

                    const fillOpacity = el.dataset.fillOpacity || 100;
                    const propFillOpacity = document.getElementById('prop-fill-opacity');
                    if (propFillOpacity) propFillOpacity.value = fillOpacity;

                    const strokeHex = rgb2hex(inner.style.borderColor);
                    if (pickerStroke) pickerStroke.setColor(strokeHex);
                    const propStrokeHex = document.getElementById('prop-stroke-hex');
                    if (propStrokeHex) propStrokeHex.value = strokeHex;

                    const propStrokeWidth = document.getElementById('prop-stroke-width');
                    if (propStrokeWidth) propStrokeWidth.value = parseFloat(inner.style.borderWidth) || 0;
                }
            } else {
                const shapeNode = el.querySelector('.shape-svg-node');
                if (shapeNode) {
                    const fillHex = rgb2hex(shapeNode.getAttribute('fill'));
                    if (pickerFill) pickerFill.setColor(fillHex);
                    const propFillHex = document.getElementById('prop-fill-hex');
                    if (propFillHex) propFillHex.value = fillHex;

                    const fillOpacity = el.dataset.fillOpacity || 100;
                    const propFillOpacity = document.getElementById('prop-fill-opacity');
                    if (propFillOpacity) propFillOpacity.value = fillOpacity;

                    const strokeHex = rgb2hex(shapeNode.getAttribute('stroke'));
                    if (pickerStroke) pickerStroke.setColor(strokeHex);
                    const propStrokeHex = document.getElementById('prop-stroke-hex');
                    if (propStrokeHex) propStrokeHex.value = strokeHex;

                    const propStrokeWidth = document.getElementById('prop-stroke-width');
                    if (propStrokeWidth) propStrokeWidth.value = shapeNode.getAttribute('stroke-width') || 4;
                }
            }

            const propStrokeAlign = document.getElementById('prop-stroke-align');
            if (propStrokeAlign) propStrokeAlign.value = el.dataset.strokeAlign || 'center';
        } else if (type === 'frame') {
            secFill?.classList.remove('hidden');
            secStroke?.classList.remove('hidden');

            const inner = el.querySelector('.frame-content');
            if (inner) {
                const fillHex = rgb2hex(inner.style.backgroundColor);
                if (pickerFill) pickerFill.setColor(fillHex);
                const propFillHex = document.getElementById('prop-fill-hex');
                if (propFillHex) propFillHex.value = fillHex;

                const fillOpacity = el.dataset.fillOpacity || 100;
                const propFillOpacity = document.getElementById('prop-fill-opacity');
                if (propFillOpacity) propFillOpacity.value = fillOpacity;

                const strokeHex = rgb2hex(inner.style.borderColor);
                if (pickerStroke) pickerStroke.setColor(strokeHex);
                const propStrokeHex = document.getElementById('prop-stroke-hex');
                if (propStrokeHex) propStrokeHex.value = strokeHex;

                const propStrokeWidth = document.getElementById('prop-stroke-width');
                if (propStrokeWidth) propStrokeWidth.value = parseFloat(inner.style.borderWidth) || 0;
            }
        }

        const propOpacity = document.getElementById('prop-opacity');
        if (propOpacity) propOpacity.value = el.dataset.opacity || 100;
        const propBlendMode = document.getElementById('prop-blend-mode');
        if (propBlendMode) propBlendMode.value = el.dataset.blendMode || 'normal';

    } else {
        propsEmpty?.classList.remove('hidden');
        propsContent?.classList.add('hidden');
        secAlign?.classList.add('hidden');
    }
}

// Live syncing inputs during drag/resize
function updateTransformInputsFromElement(el) {
    const propsContent = document.getElementById('properties-content');
    if (selectedElements.size === 1 && propsContent && !propsContent.classList.contains('hidden')) {
        document.getElementById('prop-x').value = Math.round(parseFloat(el.style.left) || 0);
        document.getElementById('prop-y').value = Math.round(parseFloat(el.style.top) || 0);
        document.getElementById('prop-rot').value = Math.round(parseFloat(el.dataset.rotation) || 0);

        let w, h;
        if (el.dataset.type === 'shape' || el.dataset.type === 'frame') {
            w = el.clientWidth; h = el.clientHeight;
        } else {
            const inner = el.querySelector(el.dataset.type === 'text' ? '.text-content' : 'img');
            w = inner.clientWidth; h = inner.clientHeight;
        }
        document.getElementById('prop-w').value = Math.round(w);
        document.getElementById('prop-h').value = Math.round(h);
    }
}

function getElementBoardRect(el) {
    const rect = el.getBoundingClientRect();
    const boardRect = imageLayer.getBoundingClientRect();
    const left = (rect.left - boardRect.left) / zoomLevel;
    const top = (rect.top - boardRect.top) / zoomLevel;
    const width = rect.width / zoomLevel;
    const height = rect.height / zoomLevel;
    return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        centerX: left + width / 2,
        centerY: top + height / 2
    };
}

function getUnionRect(rects) {
    const left = Math.min(...rects.map(r => r.left));
    const top = Math.min(...rects.map(r => r.top));
    const right = Math.max(...rects.map(r => r.right));
    const bottom = Math.max(...rects.map(r => r.bottom));
    return {
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: bottom - top,
        centerX: left + (right - left) / 2,
        centerY: top + (bottom - top) / 2
    };
}

function getSingleAlignReference(el) {
    const parentFrame = el.parentElement?.closest('.element-container[data-type="frame"]');
    const frameContent = parentFrame?.querySelector('.frame-content');
    if (frameContent) {
        const rect = frameContent.getBoundingClientRect();
        const boardRect = imageLayer.getBoundingClientRect();
        const left = (rect.left - boardRect.left) / zoomLevel;
        const top = (rect.top - boardRect.top) / zoomLevel;
        const width = rect.width / zoomLevel;
        const height = rect.height / zoomLevel;
        return {
            left,
            top,
            width,
            height,
            right: left + width,
            bottom: top + height,
            centerX: left + width / 2,
            centerY: top + height / 2
        };
    }
    return {
        left: 0,
        top: 0,
        right: BOARD_SIZE,
        bottom: BOARD_SIZE,
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        centerX: BOARD_SIZE / 2,
        centerY: BOARD_SIZE / 2
    };
}

function alignSelection(mode) {
    const elements = Array.from(selectedElements)
        .map(id => document.getElementById(id))
        .filter(el => el && el.dataset.hidden !== 'true' && el.dataset.locked !== 'true');

    if (elements.length === 0) return;

    const rects = elements.map(el => ({ el, rect: getElementBoardRect(el) }));
    const reference = elements.length > 1 ? getUnionRect(rects.map(item => item.rect)) : getSingleAlignReference(elements[0]);

    rects.forEach(({ el, rect }) => {
        let dx = 0;
        let dy = 0;

        if (mode === 'left') dx = reference.left - rect.left;
        if (mode === 'hcenter') dx = reference.centerX - rect.centerX;
        if (mode === 'right') dx = reference.right - rect.right;
        if (mode === 'top') dy = reference.top - rect.top;
        if (mode === 'vcenter') dy = reference.centerY - rect.centerY;
        if (mode === 'bottom') dy = reference.bottom - rect.bottom;

        el.style.left = (parseFloat(el.style.left) || 0) + dx + 'px';
        el.style.top = (parseFloat(el.style.top) || 0) + dy + 'px';
        updateTransformInputsFromElement(el);
    });

    renderConnections();
    renderLayers();
    updateFormatUI();
    saveState();
}

function applyTransformToSelection(prop, val, save = true) {
    let changed = false;
    selectedElements.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const type = el.dataset.type;

        if (prop === 'x') el.style.left = val + 'px';
        if (prop === 'y') el.style.top = val + 'px';
        if (prop === 'rot') {
            el.style.transform = `rotate(${val}deg)`;
            el.dataset.rotation = val;
        }
        if (prop === 'w' || prop === 'h') {
            if (type === 'shape' || type === 'frame') {
                if (prop === 'w') el.style.width = Math.max(20, val) + 'px';
                if (prop === 'h') el.style.height = Math.max(20, val) + 'px';
            } else {
                const inner = el.querySelector(type === 'text' ? '.text-content' : 'img');
                if (prop === 'w') {
                    inner.style.width = Math.max(40, val) + 'px';
                    if (type !== 'image') el.style.width = inner.style.width;
                }
                if (prop === 'h') {
                    inner.style.height = Math.max(20, val) + 'px';
                    if (type === 'image') inner.classList.remove('max-h-[300px]');
                    if (type !== 'image') el.style.height = inner.style.height;
                }
            }
        }
        if (prop === 'radius') {
            const shapeNode = el.querySelector('.shape-svg-node');
            const hasSelectedPoint = type === 'shape' &&
                el.dataset.shapeType !== 'rect' &&
                isEditingShape &&
                editingShapeId === el.id &&
                selectedShapeNodeIndex >= 0 &&
                shapeNode &&
                shapeNode.tagName.toLowerCase() === 'path';

            if (hasSelectedPoint) {
                const originalD = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d') || '';
                const points = parsePathData(originalD);
                const radii = getShapePointRadii(el, points);
                radii[selectedShapeNodeIndex] = Math.max(0, parseFloat(val) || 0);
                setShapePointRadii(el, radii);
                applyRoundedShapePath(el);
                changed = true;
                return;
            }

            el.dataset.radius = val;

            if (type === 'shape' && el.dataset.shapeType === 'rect') {
                const inner = el.querySelector('.shape-inner-wrapper');
                if (inner) inner.style.borderRadius = val + 'px';
            } else if (type === 'shape' && el.dataset.shapeType !== 'rect') {
                // Jangan gunakan metode bounding box overflow:hidden untuk vector (Triangle/Star/Path)
                el.style.borderRadius = '0px';
                el.style.overflow = 'visible';
                if (shapeNode && shapeNode.tagName.toLowerCase() === 'path') {
                    const points = parsePathData(shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d') || '');
                    setShapePointRadii(el, parsePointRadii(null, points.length, val));
                    applyRoundedShapePath(el);
                }
            } else if (type === 'frame') {
                const inner = el.querySelector('.frame-content');
                if (inner) inner.style.borderRadius = val + 'px';
            } else if (type === 'image') {
                const inner = el.querySelector('img');
                if (inner) inner.style.borderRadius = val + 'px';
            }
        }

        // Kalkulasi Dinamis pembulatan sudut saat Radius, Width, atau Height diubah
        if ((prop === 'w' || prop === 'h' || prop === 'radius') && type === 'shape' && el.dataset.shapeType !== 'rect') {
            const shapeNode = el.querySelector('.shape-svg-node');
            if (shapeNode && shapeNode.tagName.toLowerCase() === 'path' && shapeNode.hasAttribute('data-original-d')) {
                applyRoundedShapePath(el);
            }
        }

        changed = true;
    });
    if (changed) {
        renderConnections();
        if (save) saveState();
    }
}

function syncColorInput(sourceId, targetId, applyProp) {
    const sourceEl = document.getElementById(sourceId);
    if (!sourceEl) return;
    let val = sourceEl.value;
    if (!val.startsWith('#')) val = '#' + val;

    // Sync with alwan pickers if changed via manual HEX input
    if (applyProp === 'fill' && pickerFill) pickerFill.setColor(val);
    if (applyProp === 'stroke' && pickerStroke) pickerStroke.setColor(val);
    if (applyProp === 'fill' && pickerText && sourceId === 'prop-text-hex') pickerText.setColor(val);

    applyFormatToSelection(applyProp, val, true);
}

function applyTextFormat(format, value, save = true) {
    if (selectedElements.size !== 1) return;
    const elId = Array.from(selectedElements)[0];
    const el = document.getElementById(elId);
    if (!el || el.dataset.type !== 'text') return;

    const inner = el.querySelector('.text-content');

    if (document.activeElement !== inner) {
        restoreTextSelection();
    }

    const sel = window.getSelection();
    const isTextSelected = sel.rangeCount > 0 && sel.toString().length > 0 && inner.contains(sel.anchorNode);

    if (inner.contentEditable === 'true') {
        document.execCommand('styleWithCSS', false, true);
        if (format === 'font') document.execCommand('fontName', false, value);
        if (format === 'bold') document.execCommand('bold');
        if (format === 'italic') document.execCommand('italic');
        if (format === 'align') {
            document.execCommand('justify' + value.charAt(0).toUpperCase() + value.slice(1));
        }
        if (format === 'fill') {
            document.execCommand('foreColor', false, value);
        }
        if (format === 'size') {
            document.execCommand('fontSize', false, '7');
            const elements = inner.querySelectorAll('font[size="7"], span[style*="xxx-large"]');
            elements.forEach(f => {
                if (f.tagName.toLowerCase() === 'font') f.removeAttribute('size');
                f.style.fontSize = value + 'px';
            });
        }
        if (format === 'spacing') {
            if (isTextSelected) {
                const span = document.createElement('span');
                span.style.letterSpacing = value + 'px';
                const range = sel.getRangeAt(0);
                const extracted = range.extractContents();
                span.appendChild(extracted);
                range.insertNode(span);
            } else {
                inner.style.letterSpacing = value + 'px';
            }
        }
        if (format === 'wordSpacing') {
            if (isTextSelected) {
                const span = document.createElement('span');
                span.style.wordSpacing = value + 'px';
                const range = sel.getRangeAt(0);
                const extracted = range.extractContents();
                span.appendChild(extracted);
                range.insertNode(span);
            } else {
                inner.style.wordSpacing = value + 'px';
            }
        }
        if (format === 'lineHeight') {
            inner.style.lineHeight = value;
        }
    } else {
        if (format === 'font') inner.style.fontFamily = value;
        if (format === 'size') inner.style.fontSize = value + 'px';
        if (format === 'bold') inner.style.fontWeight = (inner.style.fontWeight === 'bold' || inner.style.fontWeight === '700') ? 'normal' : 'bold';
        if (format === 'italic') inner.style.fontStyle = inner.style.fontStyle === 'italic' ? 'normal' : 'italic';
        if (format === 'align') inner.style.textAlign = value;
        if (format === 'spacing') inner.style.letterSpacing = value + 'px';
        if (format === 'wordSpacing') inner.style.wordSpacing = value + 'px';
        if (format === 'lineHeight') inner.style.lineHeight = value;
        if (format === 'fill') inner.style.color = value;
    }

    if (save) saveState();
}

function syncStrokeVisuals(el) {
    const type = el.dataset.type;
    const align = el.dataset.strokeAlign || 'center';

    if (type === 'shape' && el.dataset.shapeType === 'rect') {
        const inner = el.querySelector('.shape-inner-wrapper');
        if (!inner) return;
        const width = parseFloat(inner.dataset.strokeWidth !== undefined ? inner.dataset.strokeWidth : inner.style.borderWidth) || 0;
        const color = inner.dataset.strokeColor || inner.style.borderColor || 'transparent';

        inner.dataset.strokeWidth = width;
        inner.dataset.strokeColor = color;

        if (width === 0) {
            inner.style.borderWidth = '0px';
            inner.style.outline = 'none';
            return;
        }

        if (align === 'inner') {
            inner.style.outline = 'none';
            inner.style.borderWidth = width + 'px';
            inner.style.borderStyle = 'solid';
            inner.style.borderColor = color;
        } else if (align === 'outer') {
            inner.style.borderWidth = '0px';
            inner.style.outline = `${width}px solid ${color}`;
            inner.style.outlineOffset = '0px';
        } else if (align === 'center') {
            inner.style.borderWidth = '0px';
            inner.style.outline = `${width}px solid ${color}`;
            inner.style.outlineOffset = `-${width / 2}px`;
        }
    } else if (type === 'frame') {
        const inner = el.querySelector('.frame-content');
        if (!inner) return;
        const width = parseFloat(inner.dataset.strokeWidth !== undefined ? inner.dataset.strokeWidth : inner.style.borderWidth) || 0;
        const color = inner.dataset.strokeColor || inner.style.borderColor || 'transparent';

        inner.dataset.strokeWidth = width;
        inner.dataset.strokeColor = color;

        if (width === 0) {
            inner.style.borderWidth = '0px';
            inner.style.outline = 'none';
            return;
        }

        if (align === 'inner') {
            inner.style.outline = 'none';
            inner.style.borderWidth = width + 'px';
            inner.style.borderStyle = 'solid';
            inner.style.borderColor = color;
        } else if (align === 'outer') {
            inner.style.borderWidth = '0px';
            inner.style.outline = `${width}px solid ${color}`;
            inner.style.outlineOffset = '0px';
        } else if (align === 'center') {
            inner.style.borderWidth = '0px';
            inner.style.outline = `${width}px solid ${color}`;
            inner.style.outlineOffset = `-${width / 2}px`;
        }
    } else if (type === 'shape') {
        const shapeNode = el.querySelector('.shape-svg-node');
        if (!shapeNode) return;

        const width = parseFloat(shapeNode.dataset.strokeWidth !== undefined ? shapeNode.dataset.strokeWidth : shapeNode.getAttribute('stroke-width')) || 0;
        shapeNode.dataset.strokeWidth = width;

        if (align === 'outer') {
            shapeNode.setAttribute('stroke-width', width * 2);
            shapeNode.setAttribute('paint-order', 'stroke fill');
        } else {
            shapeNode.setAttribute('stroke-width', width);
            shapeNode.removeAttribute('paint-order');
        }
    }
}

function applyFormatToSelection(property, val, save = true) {
    let changed = false;
    selectedElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const type = el.dataset.type;

            if (property === 'opacity') {
                el.style.opacity = val / 100;
                el.dataset.opacity = val;
                changed = true;
            } else if (property === 'blendMode') {
                el.style.mixBlendMode = val;
                el.dataset.blendMode = val;
                changed = true;
            } else if (property === 'fillOpacity') {
                el.dataset.fillOpacity = val;
                if (type === 'shape') {
                    if (el.dataset.shapeType === 'rect') {
                        const inner = el.querySelector('.shape-inner-wrapper');
                        if (inner) {
                            const hexInput = document.getElementById('prop-fill-hex');
                            const rgb = hex2rgb(hexInput ? hexInput.value : '#e2e8f0');
                            inner.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${val / 100})`;
                        }
                    } else {
                        const shapeNode = el.querySelector('.shape-svg-node');
                        if (shapeNode) shapeNode.setAttribute('fill-opacity', val / 100);
                    }
                } else if (type === 'frame') {
                    const inner = el.querySelector('.frame-content');
                    if (inner) {
                        const hexInput = document.getElementById('prop-fill-hex');
                        const rgb = hex2rgb(hexInput ? hexInput.value : '#ffffff');
                        inner.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${val / 100})`;
                    }
                }
                changed = true;
            } else if (property === 'strokeAlign') {
                el.dataset.strokeAlign = val;
                syncStrokeVisuals(el);
                changed = true;
            } else if (type === 'shape') {
                if (el.dataset.shapeType === 'rect') {
                    const inner = el.querySelector('.shape-inner-wrapper');
                    if (inner) {
                        if (property === 'fill') {
                            if (el.dataset.hasImageFill === 'true') return;
                            const opacity = el.dataset.fillOpacity || 100;
                            const rgb = hex2rgb(val);
                            inner.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`;
                            inner.style.backgroundImage = 'none';
                        }
                        if (property === 'stroke') inner.dataset.strokeColor = val;
                        if (property === 'strokeWidth') inner.dataset.strokeWidth = val;
                        if (property === 'stroke' || property === 'strokeWidth') syncStrokeVisuals(el);
                        changed = true;
                    }
                } else {
                    const shapeNode = el.querySelector('.shape-svg-node');
                    if (shapeNode) {
                        if (property === 'fill') {
                            if (el.dataset.hasImageFill === 'true') return;
                            shapeNode.setAttribute('fill', val);
                        }
                        if (property === 'stroke') shapeNode.setAttribute('stroke', val);
                        if (property === 'strokeWidth') shapeNode.dataset.strokeWidth = val;
                        if (property === 'stroke' || property === 'strokeWidth') syncStrokeVisuals(el);
                        changed = true;
                    }
                }
            } else if (type === 'frame') {
                const inner = el.querySelector('.frame-content');
                if (inner) {
                    if (property === 'fill') {
                        const opacity = el.dataset.fillOpacity || 100;
                        const rgb = hex2rgb(val);
                        inner.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`;
                    }
                    if (property === 'stroke') inner.dataset.strokeColor = val;
                    if (property === 'strokeWidth') inner.dataset.strokeWidth = val;
                    if (property === 'stroke' || property === 'strokeWidth') syncStrokeVisuals(el);
                    changed = true;
                }
            } else if (type === 'text') {
                if (property === 'fill') {
                    applyTextFormat('fill', val, false);
                    changed = true;
                }
            }
        }
    });
    if (changed && save) saveState();
}

// --- Undo / Redo & State System ---
function getState() {
    const images = Array.from(document.querySelectorAll('.element-container')).map(el => {
        const type = el.dataset.type || 'image';
        const parentFrame = el.parentElement.closest('.element-container');
        const parentId = parentFrame ? parentFrame.id : null;

        let data = {
            id: el.id,
            type: type,
            parentId: parentId,
            left: el.style.left,
            top: el.style.top,
            width: el.style.width || el.querySelector(type === 'text' ? '.text-content' : type === 'shape' ? 'svg' : type === 'frame' ? '.frame-content' : 'img')?.style.width || '',
            height: el.style.height || el.querySelector(type === 'text' ? '.text-content' : type === 'shape' ? 'svg' : type === 'frame' ? '.frame-content' : 'img')?.style.height || '',
            zIndex: el.style.zIndex,
            hidden: el.dataset.hidden || 'false',
            locked: el.dataset.locked || 'false',
            layerName: el.dataset.layerName || 'Item',
            rotation: el.dataset.rotation || '0',
            radius: el.dataset.radius || '0',
            opacity: el.dataset.opacity || '100',
            blendMode: el.dataset.blendMode || 'normal'
        };

        if (type === 'image') {
            const inner = el.querySelector('img');
            data.src = inner?.src;
            data.width = inner?.style.width;
            data.height = inner?.style.height;
        } else if (type === 'text') {
            const inner = el.querySelector('.text-content');
            if (inner) {
                data.content = inner.innerHTML;
                data.fill = rgb2hex(inner.style.color); // FIX applied here
                data.fontFamily = inner.style.fontFamily;
                data.fontWeight = inner.style.fontWeight;
                data.fontStyle = inner.style.fontStyle;
                data.textAlign = inner.style.textAlign;
                data.letterSpacing = inner.style.letterSpacing;
                data.fontSize = inner.style.fontSize;
                data.width = inner.style.width;
                data.height = inner.style.height;
            }
        } else if (type === 'shape') {
            data.shapeType = el.dataset.shapeType || 'rect';
            data.strokeAlign = el.dataset.strokeAlign || 'center';
            data.fillOpacity = el.dataset.fillOpacity || '100';
            data.fillImage = el.dataset.fillImage || null;
            data.hasImageFill = el.dataset.hasImageFill || 'false';
            data.pointRadii = el.dataset.pointRadii || null;
            if (data.shapeType === 'rect') {
                const inner = el.querySelector('.shape-inner-wrapper');
                if (inner) {
                    data.fill = rgb2hex(inner.style.backgroundColor);
                    data.stroke = rgb2hex(inner.dataset.strokeColor || inner.style.borderColor);
                    data.strokeWidth = parseFloat(inner.dataset.strokeWidth !== undefined ? inner.dataset.strokeWidth : inner.style.borderWidth) || 0;
                }
            } else if (data.shapeType === 'path' || data.shapeType === 'triangle' || data.shapeType === 'star') {
                const shapeNode = el.querySelector('.shape-svg-node');
                if (shapeNode) {
                    data.shapeType = 'path'; // Always save as generic path natively!
                    data.fill = rgb2hex(shapeNode.getAttribute('fill'));
                    data.stroke = rgb2hex(shapeNode.dataset.strokeColor || shapeNode.getAttribute('stroke'));
                    data.strokeWidth = parseFloat(shapeNode.dataset.strokeWidth !== undefined ? shapeNode.dataset.strokeWidth : shapeNode.getAttribute('stroke-width')) || 0;
                    if (shapeNode.tagName.toLowerCase() === 'path') {
                        data.pathData = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d');
                    }
                }
            } else {
                const shapeNode = el.querySelector('.shape-svg-node');
                if (shapeNode) {
                    data.fill = rgb2hex(shapeNode.getAttribute('fill'));
                    data.stroke = rgb2hex(shapeNode.dataset.strokeColor || shapeNode.getAttribute('stroke'));
                    data.strokeWidth = parseFloat(shapeNode.dataset.strokeWidth !== undefined ? shapeNode.dataset.strokeWidth : shapeNode.getAttribute('stroke-width')) || 0;
                    if (shapeNode.tagName.toLowerCase() === 'path') {
                        data.pathData = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d');
                    }
                }
            }
            data.width = el.style.width;
            data.height = el.style.height;
        } else if (type === 'frame') {
            const inner = el.querySelector('.frame-content');
            if (inner) {
                data.fill = rgb2hex(inner.style.backgroundColor);
                data.fillOpacity = el.dataset.fillOpacity || '100';
                data.stroke = rgb2hex(inner.dataset.strokeColor || inner.style.borderColor);
                data.strokeWidth = parseFloat(inner.dataset.strokeWidth !== undefined ? inner.dataset.strokeWidth : inner.style.borderWidth) || 0;
            }
            data.width = el.style.width;
            data.height = el.style.height;
        }
        return data;
    });
    return { images, connections: JSON.parse(JSON.stringify(connections)), canvas: canvas ? canvas.toDataURL() : null };
}

function saveState() {
    if (isRestoring) return;
    undoStack.push(getState());
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    updateUndoRedoUI();
}

function loadState(state) {
    imageLayer.innerHTML = '';

    // Build all elements flat first
    state.images.forEach(data => { buildElement(data); });

    // Re-parent nested elements
    state.images.forEach(data => {
        if (data.parentId) {
            const child = document.getElementById(data.id);
            const parent = document.getElementById(data.parentId);
            if (child && parent) {
                const frameContent = parent.querySelector('.frame-content');
                if (frameContent) frameContent.appendChild(child);
            }
        }
    });

    connections = JSON.parse(JSON.stringify(state.connections));
    renderConnections();
    renderLayers();

    if (state.canvas && ctx) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0);
            updateCanvasContext();
        };
        img.src = state.canvas;
    } else if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    selectedElements.clear();
    updateFormatUI();
}

function undo() {
    if (undoStack.length <= 1) return;
    isRestoring = true;
    redoStack.push(undoStack.pop());
    loadState(undoStack[undoStack.length - 1]);
    isRestoring = false;
    updateUndoRedoUI();
}

function redo() {
    if (redoStack.length === 0) return;
    isRestoring = true;
    const nextState = redoStack.pop();
    undoStack.push(nextState);
    loadState(nextState);
    isRestoring = false;
    updateUndoRedoUI();
}

function updateUndoRedoUI() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');

    if (btnUndo) {
        if (undoStack.length > 1) {
            btnUndo.disabled = false;
            btnUndo.className = 'text-slate-600 dark:text-app-text hover:bg-slate-200 dark:hover:bg-app-surfaceHover p-2 w-10 h-10 flex items-center justify-center rounded-md transition-colors';
        } else {
            btnUndo.disabled = true;
            btnUndo.className = 'text-slate-400 dark:text-app-border p-2 w-10 h-10 flex items-center justify-center rounded-md transition-colors';
        }
    }

    if (btnRedo) {
        if (redoStack.length > 0) {
            btnRedo.disabled = false;
            btnRedo.className = 'text-slate-600 dark:text-app-text hover:bg-slate-200 dark:hover:bg-app-surfaceHover p-2 w-10 h-10 flex items-center justify-center rounded-md transition-colors';
        } else {
            btnRedo.disabled = true;
            btnRedo.className = 'text-slate-400 dark:text-app-border p-2 w-10 h-10 flex items-center justify-center rounded-md transition-colors';
        }
    }
}

function clearCanvas() { if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); saveState(); }

// --- Selection Logic ---
function selectElement(id, multi) {
    const el = document.getElementById(id);
    if (!el) return;

    if (multi) {
        if (selectedElements.has(id)) {
            selectedElements.delete(id);
            el.classList.remove('ring-1', 'ring-brand-500');
        } else {
            selectedElements.add(id);
            el.classList.add('ring-1', 'ring-brand-500');
        }
    } else {
        clearSelection();
        selectedElements.add(id);
        el.classList.add('ring-1', 'ring-brand-500');
    }
    renderLayers();
    updateFormatUI();
}

function clearSelection() {
    selectedElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('ring-1', 'ring-brand-500');
        }
    });
    selectedElements.clear();
    renderLayers();
    updateFormatUI();
}

// --- Drawing Logic ---
let isDrawingCanvas = false;
function startDrawing(e) {
    if (!ctx || currentMode === 'move' || currentMode === 'connect' || currentMode === 'text' || currentMode === 'shape' || currentMode === 'frame' || currentMode === 'pentool') return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    isDrawingCanvas = true;
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (e.type === 'touchstart') e.preventDefault();
}
function draw(e) {
    if (!isDrawingCanvas || !ctx) return;
    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (e.type === 'touchmove') e.preventDefault();
}
function stopDrawing() {
    if (!isDrawingCanvas || !ctx) return;
    isDrawingCanvas = false;
    ctx.closePath();
    saveState();
}
if (canvas) {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
}
window.addEventListener('mouseup', stopDrawing);
window.addEventListener('touchend', stopDrawing);


// --- Vector Pen Tool Logic ---
workspace.addEventListener('mousedown', (e) => {
    if (currentMode === 'pentool' && e.button === 0) {
        const rawPos = getPointerPos(e);
        let pos = {
            x: snapValue(rawPos.x, 'x'),
            y: snapValue(rawPos.y, 'y')
        };

        // Check if clicking on an existing node to drag it
        if (isDrawingPath) {
            const hitThreshold = 10 / zoomLevel;
            const nodeIndex = currentPathPoints.findIndex(p => Math.hypot(p.x - rawPos.x, p.y - rawPos.y) < hitThreshold);
            if (nodeIndex !== -1) {
                // If clicking the first node and we have > 2 points, close the path
                if (nodeIndex === 0 && currentPathPoints.length > 2) {
                    isPathClosed = true;
                    finishPath();
                    return;
                }
                activePathNodeIndex = nodeIndex;
                selectedPathNodeIndex = nodeIndex;
                isDraggingPathNode = true;
                pathNodeDragOffset = {
                    x: currentPathPoints[nodeIndex].x - rawPos.x,
                    y: currentPathPoints[nodeIndex].y - rawPos.y
                };
                renderPathNodes();
                e.preventDefault();
                return;
            }
        }

        if (!isDrawingPath) {
            isDrawingPath = true;
            isPathClosed = false;
            currentPathPoints = [pos];
            selectedPathNodeIndex = 0;
            currentPathId = 'path-' + Date.now();

            // Create temporary SVG for drawing
            currentPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            currentPathElement.setAttribute('id', currentPathId);
            currentPathElement.setAttribute('fill', 'none');
            currentPathElement.setAttribute('stroke', document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000');
            currentPathElement.setAttribute('stroke-width', '4');
            currentPathElement.setAttribute('stroke-linejoin', 'round');
            currentPathElement.setAttribute('stroke-linecap', 'round');
            if (connectionLayer) connectionLayer.appendChild(currentPathElement);
        } else {
            currentPathPoints.push(pos);
            selectedPathNodeIndex = currentPathPoints.length - 1;
        }
        updatePathPreview(pos);
        renderPathNodes();
        e.preventDefault();
    }
});

workspace.addEventListener('mousemove', (e) => {
    if (currentMode === 'pentool' && isDrawingPath) {
        const rawPos = getPointerPos(e);
        let pos = {
            x: snapValue(rawPos.x, 'x'),
            y: snapValue(rawPos.y, 'y')
        };

        if (isDraggingPathNode && activePathNodeIndex !== -1) {
            const offsetPos = {
                x: rawPos.x + pathNodeDragOffset.x,
                y: rawPos.y + pathNodeDragOffset.y
            };
            currentPathPoints[activePathNodeIndex] = {
                x: snapValue(offsetPos.x, 'x'),
                y: snapValue(offsetPos.y, 'y')
            };
            updatePathPreview(null); // Don't add preview line while dragging node
            renderPathNodes();
        } else {
            updatePathPreview(pos);
        }
    }
});

workspace.addEventListener('mouseup', (e) => {
    if (currentMode === 'pentool' && isDraggingPathNode) {
        isDraggingPathNode = false;
        activePathNodeIndex = -1;
        pathNodeDragOffset = { x: 0, y: 0 };
        renderPathNodes();
    }
});

workspace.addEventListener('dblclick', (e) => {
    if (currentMode === 'pentool' && isDrawingPath) {
        finishPath();
    }
});

function renderPathNodes() {
    const container = document.getElementById('path-nodes-container');
    if (!container) return;
    container.innerHTML = '';

    if (!isDrawingPath) return;

    currentPathPoints.forEach((p, i) => {
        const node = document.createElement('div');
        node.className = 'point-edit-node absolute w-3 h-3 bg-white border-2 border-brand-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-move z-[260]';
        node.style.left = p.x + 'px';
        node.style.top = p.y + 'px';

        // Highlight first node to show it can be closed
        if (i === 0 && currentPathPoints.length > 2) {
            node.classList.add('w-4', 'h-4', 'border-red-500');
        }
        if (i === selectedPathNodeIndex) {
            node.classList.add('point-edit-node-selected');
        }

        container.appendChild(node);
    });
}

function updatePathPreview(currentPos) {
    if (!currentPathElement || currentPathPoints.length === 0) return;

    let d = `M ${currentPathPoints[0].x} ${currentPathPoints[0].y}`;
    for (let i = 1; i < currentPathPoints.length; i++) {
        d += ` L ${currentPathPoints[i].x} ${currentPathPoints[i].y}`;
    }
    if (currentPos && !isDraggingPathNode) {
        // Snap to first point if close enough
        if (currentPathPoints.length > 2 && Math.abs(currentPos.x - currentPathPoints[0].x) < 10 && Math.abs(currentPos.y - currentPathPoints[0].y) < 10) {
            d += ` L ${currentPathPoints[0].x} ${currentPathPoints[0].y}`;
        } else {
            d += ` L ${currentPos.x} ${currentPos.y}`;
        }
    }
    if (isPathClosed) {
        d += ' Z';
    }
    currentPathElement.setAttribute('d', d);
}

function finishPath() {
    if (!isDrawingPath || currentPathPoints.length < 2) {
        if (currentPathElement) currentPathElement.remove();
        isDrawingPath = false;
        currentPathPoints = [];
        selectedPathNodeIndex = -1;
        pathNodeDragOffset = { x: 0, y: 0 };
        renderPathNodes();
        return;
    }

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    currentPathPoints.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    });

    const w = Math.max(20, maxX - minX);
    const h = Math.max(20, maxY - minY);

    // Normalize points to 0-100 viewBox
    let normalizedD = `M ${((currentPathPoints[0].x - minX) / w) * 100} ${((currentPathPoints[0].y - minY) / h) * 100}`;
    for (let i = 1; i < currentPathPoints.length; i++) {
        normalizedD += ` L ${((currentPathPoints[i].x - minX) / w) * 100} ${((currentPathPoints[i].y - minY) / h) * 100}`;
    }

    if (isPathClosed) {
        normalizedD += ' Z';
    }

    // Remove temp path
    if (currentPathElement) currentPathElement.remove();

    // Create shape element
    const id = 'el-' + Date.now() + Math.floor(Math.random() * 1000);
    buildElement({
        id: id,
        type: 'shape',
        shapeType: 'path',
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: zIndexCounter++,
        layerName: 'Vector Path',
        fill: isPathClosed ? '#e2e8f0' : 'none',
        stroke: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
        strokeWidth: '4',
        pathData: normalizedD
    });

    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) checkAndReparent(el);
        renderLayers();
        saveState();
    }, 0);

    isDrawingPath = false;
    isPathClosed = false;
    currentPathPoints = [];
    selectedPathNodeIndex = -1;
    pathNodeDragOffset = { x: 0, y: 0 };
    renderPathNodes();
    setMode('move');
}

// --- Shape Edit Mode Logic ---
let isEditingShape = false;
let editingShapeId = null;
let editingShapePoints = [];
let selectedShapeNodeIndex = -1;

function parsePointRadii(value, length, fallback = 0) {
    let parsed = [];
    try {
        parsed = typeof value === 'string' ? JSON.parse(value) : (Array.isArray(value) ? value : []);
    } catch (e) {
        parsed = [];
    }
    return Array.from({ length }, (_, index) => {
        const radius = parseFloat(parsed[index]);
        return Number.isFinite(radius) ? Math.max(0, radius) : Math.max(0, parseFloat(fallback) || 0);
    });
}

function getShapePointRadii(el, points = null) {
    const shapeNode = el?.querySelector?.('.shape-svg-node');
    const targetPoints = points || parsePathData(shapeNode?.getAttribute('data-original-d') || shapeNode?.getAttribute('d') || '');
    return parsePointRadii(el?.dataset?.pointRadii, targetPoints.length, el?.dataset?.radius || 0);
}

function setShapePointRadii(el, radii) {
    if (!el) return;
    el.dataset.pointRadii = JSON.stringify(radii.map(radius => Math.max(0, parseFloat(radius) || 0)));
}

function applyRoundedShapePath(el) {
    const shapeNode = el?.querySelector?.('.shape-svg-node');
    if (!shapeNode || shapeNode.tagName.toLowerCase() !== 'path') return;

    const originalD = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d') || '';
    const points = parsePathData(originalD);
    if (points.length === 0) return;

    const isClosed = originalD.includes('Z');
    const pointRadii = getShapePointRadii(el, points);
    const w = parseFloat(el.style.width) || el.clientWidth || 1;
    const h = parseFloat(el.style.height) || el.clientHeight || 1;
    const newD = getRoundedPath(points, parseFloat(el.dataset.radius) || 0, isClosed, pointRadii, w / 100, h / 100);
    shapeNode.setAttribute('d', newD);
}

function normalizeEditingShapeBounds(el) {
    const shapeNode = el?.querySelector?.('.shape-svg-node');
    if (!shapeNode || shapeNode.tagName.toLowerCase() !== 'path') return;

    const originalD = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d') || '';
    const points = parsePathData(originalD);
    if (points.length === 0) return;

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    if (rangeX <= 0.001 || rangeY <= 0.001) return;

    const oldLeft = parseFloat(el.style.left) || 0;
    const oldTop = parseFloat(el.style.top) || 0;
    const oldW = parseFloat(el.style.width) || el.clientWidth || 1;
    const oldH = parseFloat(el.style.height) || el.clientHeight || 1;

    const newLeft = oldLeft + oldW * (minX / 100);
    const newTop = oldTop + oldH * (minY / 100);
    const newW = Math.max(20, oldW * (rangeX / 100));
    const newH = Math.max(20, oldH * (rangeY / 100));

    const normalizedPoints = points.map(p => ({
        x: ((p.x - minX) / rangeX) * 100,
        y: ((p.y - minY) / rangeY) * 100
    }));

    const isClosed = originalD.includes('Z');
    let normalizedD = `M ${normalizedPoints[0].x} ${normalizedPoints[0].y}`;
    for (let i = 1; i < normalizedPoints.length; i++) {
        normalizedD += ` L ${normalizedPoints[i].x} ${normalizedPoints[i].y}`;
    }
    if (isClosed) normalizedD += ' Z';

    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;
    el.style.width = `${newW}px`;
    el.style.height = `${newH}px`;
    shapeNode.setAttribute('data-original-d', normalizedD);
    editingShapePoints = normalizedPoints;
    applyRoundedShapePath(el);
    renderShapeEditNodes(el);
    updateTransformInputsFromElement(el);
    renderConnections();
}

function createEllipsePathData(segments = 16) {
    const points = [];
    for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 * i) / segments;
        const x = 50 + Math.cos(angle) * 50;
        const y = 50 + Math.sin(angle) * 50;
        points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`);
    }
    return points.join(' ') + ' Z';
}

function replaceShapeNodeWithPath(el, svg, oldNode, d) {
    const newShapeNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newShapeNode.setAttribute('d', d);
    newShapeNode.setAttribute('data-original-d', d);
    newShapeNode.setAttribute('fill', oldNode.getAttribute('fill') || '#e2e8f0');
    const fillOpacity = oldNode.getAttribute('fill-opacity');
    if (fillOpacity) newShapeNode.setAttribute('fill-opacity', fillOpacity);
    newShapeNode.setAttribute('stroke', oldNode.getAttribute('stroke') || 'transparent');
    newShapeNode.setAttribute('stroke-width', oldNode.getAttribute('stroke-width') || '0');
    newShapeNode.setAttribute('vector-effect', 'non-scaling-stroke');
    newShapeNode.className.baseVal = 'shape-svg-node';

    oldNode.remove();
    svg.appendChild(newShapeNode);
    el.dataset.shapeType = 'path';
    return newShapeNode;
}

function getEventClientPoint(e) {
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

function getShapePointerPercent(el, e) {
    const point = getEventClientPoint(e);
    const rect = el.getBoundingClientRect();
    const elW = el.clientWidth || 1;
    const elH = el.clientHeight || 1;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rot = parseFloat(el.dataset.rotation) || 0;
    const rad = -rot * Math.PI / 180;
    const dx = point.x - cx;
    const dy = point.y - cy;
    const localX = Math.cos(rad) * dx - Math.sin(rad) * dy;
    const localY = Math.sin(rad) * dx + Math.cos(rad) * dy;
    return {
        x: ((localX / (elW * zoomLevel)) + 0.5) * 100,
        y: ((localY / (elH * zoomLevel)) + 0.5) * 100
    };
}

function markShapeNodeSelection(container, selectedIndex) {
    container.querySelectorAll('.shape-edit-node').forEach((node, index) => {
        node.classList.toggle('point-edit-node-selected', index === selectedIndex);
    });
}

function enterShapeEditMode(id) {
    if (isEditingShape) exitShapeEditMode();
    const el = document.getElementById(id);
    if (!el || el.dataset.type !== 'shape') return;

    let shapeType = el.dataset.shapeType;
    let svg = el.querySelector('svg');
    let shapeNode = el.querySelector('.shape-svg-node');
    selectedShapeNodeIndex = -1;

    if (shapeType === 'rect') {
        const inner = el.querySelector('.shape-inner-wrapper');
        if (!inner) return;
        const fill = inner.style.backgroundColor;
        const stroke = inner.style.borderColor;
        const strokeWidth = inner.style.borderWidth;

        inner.remove();

        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.overflow = 'visible';

        shapeNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shapeNode.setAttribute('d', 'M 0 0 L 100 0 L 100 100 L 0 100 Z');
        shapeNode.setAttribute('data-original-d', 'M 0 0 L 100 0 L 100 100 L 0 100 Z'); // Save structure
        shapeNode.setAttribute('fill', fill);
        shapeNode.setAttribute('stroke', stroke);
        shapeNode.setAttribute('stroke-width', parseFloat(strokeWidth) || 0);
        shapeNode.setAttribute('vector-effect', 'non-scaling-stroke');
        shapeNode.className.baseVal = 'shape-svg-node';

        svg.appendChild(shapeNode);
        el.appendChild(svg);
        el.dataset.shapeType = 'path';
    } else if (shapeType === 'circle' && shapeNode && svg) {
        shapeNode = replaceShapeNodeWithPath(el, svg, shapeNode, createEllipsePathData(16));
    } else if (shapeType !== 'path' && shapeNode) {
        // Konversi aman bagi file save lawas (sebelum kita natively pakai path untuk polygon)
        let d = '';
        if (shapeType === 'triangle') d = 'M 50 0 L 100 100 L 0 100 Z';
        else if (shapeType === 'star') d = 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z';

        if (d) {
            shapeNode = replaceShapeNodeWithPath(el, svg, shapeNode, d);
        }
    }

    isEditingShape = true;
    editingShapeId = id;

    if (shapeNode) {
        const originalD = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d');
        editingShapePoints = parsePathData(originalD);
    }

    renderShapeEditNodes(el);
}

function parsePathData(d) {
    const points = [];
    if (!d) return points;
    const commands = d.match(/[ML]\s*(-?\d+\.?\d*)\s*(-?\d+\.?\d*)/g);
    if (commands) {
        commands.forEach(cmd => {
            const parts = cmd.trim().split(/\s+/);
            points.push({ x: parseFloat(parts[1]), y: parseFloat(parts[2]) });
        });
    }
    return points;
}

function renderShapeEditNodes(el) {
    let container = el.querySelector('.shape-edit-nodes');
    if (!container) {
        container = document.createElement('div');
        container.className = 'shape-edit-nodes absolute inset-0 z-50 pointer-events-none';
        el.appendChild(container);
    }
    container.innerHTML = '';

    editingShapePoints.forEach((p, i) => {
        const node = document.createElement('div');
        node.className = 'shape-edit-node point-edit-node absolute w-3 h-3 bg-white border-2 border-brand-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-move';
        node.style.left = p.x + '%';
        node.style.top = p.y + '%';
        if (i === selectedShapeNodeIndex) {
            node.classList.add('point-edit-node-selected');
        }

        const startNodeDrag = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            e.stopPropagation();
            e.preventDefault();

            selectedShapeNodeIndex = i;
            markShapeNodeSelection(container, i);
            updateFormatUI();

            let isDraggingNode = true;
            let hasNodeMoved = false;
            const startPoint = getShapePointerPercent(el, e);
            const nodeDragOffset = {
                x: editingShapePoints[i].x - startPoint.x,
                y: editingShapePoints[i].y - startPoint.y
            };

            const onMove = (me) => {
                if (!isDraggingNode) return;
                me.preventDefault();
                me.stopPropagation();
                hasNodeMoved = true;

                const pointerPercent = getShapePointerPercent(el, me);
                let px = pointerPercent.x + nodeDragOffset.x;
                let py = pointerPercent.y + nodeDragOffset.y;

                editingShapePoints[i] = { x: px, y: py };
                node.style.left = px + '%';
                node.style.top = py + '%';

                updateEditingShapePath();
            };

            const onUp = (ue) => {
                isDraggingNode = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);
                if (hasNodeMoved) {
                    normalizeEditingShapeBounds(el);
                    saveState();
                }
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onUp);
        };

        node.addEventListener('mousedown', startNodeDrag);
        node.addEventListener('touchstart', startNodeDrag, { passive: false });

        container.appendChild(node);
    });
}

function updateEditingShapePath() {
    if (!isEditingShape || !editingShapeId) return;
    const el = document.getElementById(editingShapeId);
    if (!el) return;
    const shapeNode = el.querySelector('.shape-svg-node');
    if (!shapeNode) return;

    if (editingShapePoints.length > 0) {
        let d = `M ${editingShapePoints[0].x} ${editingShapePoints[0].y}`;
        for (let i = 1; i < editingShapePoints.length; i++) {
            d += ` L ${editingShapePoints[i].x} ${editingShapePoints[i].y}`;
        }

        const originalD = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d') || '';
        const isClosed = originalD.includes('Z');
        if (isClosed) d += ' Z';

        shapeNode.setAttribute('data-original-d', d);
        applyRoundedShapePath(el);
    }
}

function exitShapeEditMode() {
    if (!isEditingShape || !editingShapeId) return;
    const el = document.getElementById(editingShapeId);
    if (el) {
        const container = el.querySelector('.shape-edit-nodes');
        if (container) container.remove();
    }
    isEditingShape = false;
    editingShapeId = null;
    editingShapePoints = [];
    selectedShapeNodeIndex = -1;
}

// --- Creation Logic (Image, Text, Shape) ---
function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const centerX = ((workspace.clientWidth / 2) - panX) / zoomLevel;
            const centerY = ((workspace.clientHeight / 2) - panY) / zoomLevel;
            let randomX = Math.floor(centerX - 100 + Math.random() * 200);
            let randomY = Math.floor(centerY - 100 + Math.random() * 200);

            randomX = snapValue(randomX, 'x');
            randomY = snapValue(randomY, 'y');

            const id = 'el-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            buildElement({
                id: id,
                type: 'image',
                src: e.target.result,
                layerName: file.name,
                left: `${randomX}px`,
                top: `${randomY}px`,
                zIndex: zIndexCounter++
            });

            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) checkAndReparent(el);
                renderLayers();
                saveState();
            }, 0);
        };
        reader.readAsDataURL(file);
    });
    event.target.value = '';
    if (currentMode !== 'move') setMode('move');
}

function createTextElement(x, y, w, h) {
    x = snapValue(x, 'x');
    y = snapValue(y, 'y');
    const id = 'el-' + Date.now() + Math.floor(Math.random() * 1000);
    buildElement({
        id: id,
        type: 'text',
        left: `${x}px`,
        top: `${y}px`,
        width: w ? `${w}px` : '150px',
        height: h ? `${h}px` : '50px',
        zIndex: zIndexCounter++,
        layerName: 'Text',
        content: 'Double click to edit',
        fill: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'
    });

    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) checkAndReparent(el);
        renderLayers();
        saveState();
    }, 0);

    setMode('move');
}

function handleFillImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        // Apply the image fill to selected elements
        selectedElements.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.dataset.type === 'shape') {
                el.dataset.fillImage = e.target.result;
                el.dataset.hasImageFill = 'true';

                // Update the visual fill
                applyImageFillToShape(el, e.target.result);
            }
        });

        // Update properties panel if needed
        updatePropertiesPanel();
        saveState();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function applyImageFillToShape(el, imageSrc) {
    if (el.dataset.shapeType === 'rect') {
        const inner = el.querySelector('.shape-inner-wrapper');
        if (inner) {
            // Use CSS background-image for simplicity and proper scaling
            inner.style.backgroundColor = 'transparent';
            inner.style.backgroundImage = `url('${imageSrc}')`;
            inner.style.backgroundSize = 'cover';
            inner.style.backgroundPosition = 'center';
            inner.style.backgroundRepeat = 'no-repeat';
        }
    } else {
        // For SVG shapes, convert to background image approach
        const inner = el.querySelector('.w-full.h-full');
        if (inner) {
            const svg = el.querySelector('svg');
            if (svg) {
                // Hide the SVG shape and use background image instead
                svg.style.display = 'none';

                inner.style.backgroundImage = `url('${imageSrc}')`;
                inner.style.backgroundSize = 'cover';
                inner.style.backgroundPosition = 'center';
                inner.style.backgroundRepeat = 'no-repeat';
            }
        }
    }
}

function createShapeElement(x, y, w, h) {
    x = snapValue(x, 'x');
    y = snapValue(y, 'y');
    const id = 'el-' + Date.now() + Math.floor(Math.random() * 1000);
    buildElement({
        id: id,
        type: 'shape',
        shapeType: currentShapeType,
        left: `${x}px`,
        top: `${y}px`,
        width: w ? `${w}px` : '150px',
        height: h ? `${h}px` : '150px',
        zIndex: zIndexCounter++,
        layerName: 'Shape',
        fill: '#e2e8f0',
        stroke: 'transparent', // Default outline removed
        strokeWidth: '0'       // Default outline removed
    });

    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) checkAndReparent(el);
        renderLayers();
        saveState();
    }, 0);

    setMode('move');
}

function createFrameElement(x, y, w, h) {
    x = snapValue(x, 'x');
    y = snapValue(y, 'y');

    let minZ = zIndexCounter;
    Array.from(document.querySelectorAll('.element-container')).forEach(el => {
        let z = parseInt(el.style.zIndex);
        if (z < minZ) minZ = z;
    });
    const newZ = minZ > 0 ? minZ - 1 : 0;

    const id = 'el-' + Date.now() + Math.floor(Math.random() * 1000);
    buildElement({
        id: id,
        type: 'frame',
        left: `${x}px`,
        top: `${y}px`,
        width: w ? `${w}px` : '800px',
        height: h ? `${h}px` : '600px',
        zIndex: newZ,
        layerName: 'Canvas',
        fill: '#ffffff'
    });

    setTimeout(() => {
        renderLayers();
        saveState();
    }, 0);

    setMode('move');
}

function buildElement(data) {
    const container = document.createElement('div');
    container.id = data.id;

    if (data.type === 'image') {
        container.className = 'element-container absolute select-none shadow-lg bg-white dark:bg-[#1a1a1a] p-1.5 rounded-lg border border-slate-200 dark:border-[#333] transition-shadow';
    } else {
        container.className = 'element-container absolute select-none transition-shadow rounded-[4px]';
    }

    container.style.left = data.left;
    container.style.top = data.top;
    container.style.zIndex = data.zIndex;
    container.style.opacity = (data.opacity !== undefined) ? data.opacity / 100 : 1;
    container.style.mixBlendMode = data.blendMode || 'normal';
    container.dataset.hidden = data.hidden || 'false';
    container.dataset.locked = data.locked || 'false';
    container.dataset.layerName = data.layerName || 'Item';
    container.dataset.type = data.type || 'image';
    container.dataset.rotation = data.rotation || '0';
    container.dataset.radius = data.radius || '0';
    container.dataset.opacity = data.opacity || '100';
    container.dataset.blendMode = data.blendMode || 'normal';
    if (data.fillOpacity) container.dataset.fillOpacity = data.fillOpacity;
    if (data.pointRadii) container.dataset.pointRadii = typeof data.pointRadii === 'string' ? data.pointRadii : JSON.stringify(data.pointRadii);

    if (data.rotation && data.rotation !== '0') container.style.transform = `rotate(${data.rotation}deg)`;
    if (data.type === 'shape') {
        container.dataset.shapeType = data.shapeType || 'rect';
        container.dataset.strokeAlign = data.strokeAlign || 'center';
    }
    if (data.fillImage) container.dataset.fillImage = data.fillImage;
    if (data.hasImageFill) container.dataset.hasImageFill = data.hasImageFill;

    if (container.dataset.hidden === 'true') { container.style.opacity = '0'; container.style.pointerEvents = 'none'; }
    else if (container.dataset.locked === 'true') { container.style.pointerEvents = 'none'; }
    else { container.style.pointerEvents = 'auto'; }

    let innerEl;

    if (data.type === 'text') {
        innerEl = document.createElement('div');
        innerEl.className = 'text-content w-full h-full outline-none font-sans whitespace-pre-wrap break-words cursor-text';
        innerEl.style.color = data.fill || (document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000');
        innerEl.style.fontSize = data.fontSize || '24px';
        if (data.fontFamily) innerEl.style.fontFamily = data.fontFamily;
        if (data.fontWeight) innerEl.style.fontWeight = data.fontWeight;
        if (data.fontStyle) innerEl.style.fontStyle = data.fontStyle;
        if (data.textAlign) innerEl.style.textAlign = data.textAlign;
        if (data.letterSpacing) innerEl.style.letterSpacing = data.letterSpacing;

        innerEl.innerHTML = data.content || 'Text';
        innerEl.style.minWidth = '50px';
        innerEl.style.minHeight = '30px';
        if (data.width) innerEl.style.width = data.width;
        if (data.height) innerEl.style.height = data.height;

        innerEl.ondblclick = (e) => {
            e.stopPropagation();
            innerEl.contentEditable = true;
            innerEl.focus();
        };
        innerEl.onblur = () => {
            innerEl.contentEditable = false;
            saveState();
        };
        innerEl.onmousedown = (e) => {
            if (innerEl.contentEditable === 'true') e.stopPropagation();
        };
    }
    else if (data.type === 'shape') {
        container.style.width = data.width || '150px';
        container.style.height = data.height || '150px';

        innerEl = document.createElement('div');

        const type = data.shapeType || 'rect';

        if (type === 'rect') {
            innerEl.className = 'w-full h-full shape-inner-wrapper';
            if (data.fillOpacity) {
                const rgb = hex2rgb(data.fill || '#e2e8f0');
                innerEl.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${data.fillOpacity / 100})`;
            } else {
                innerEl.style.backgroundColor = data.fill || '#e2e8f0';
            }
            innerEl.style.borderColor = data.stroke || 'transparent';
            innerEl.style.borderWidth = (data.strokeWidth || '0') + 'px';
            innerEl.style.borderStyle = 'solid';
        } else {
            innerEl.className = 'w-full h-full';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.style.overflow = 'visible';

            let shapeNode;
            if (type === 'circle') {
                shapeNode = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                shapeNode.setAttribute('cx', '50'); shapeNode.setAttribute('cy', '50');
                shapeNode.setAttribute('rx', '50'); shapeNode.setAttribute('ry', '50');
            } else if (type === 'triangle') {
                shapeNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const originalD = 'M 50 0 L 100 100 L 0 100 Z';
                shapeNode.setAttribute('d', originalD);
                shapeNode.setAttribute('data-original-d', originalD);
            } else if (type === 'star') {
                shapeNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const originalD = 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z';
                shapeNode.setAttribute('d', originalD);
                shapeNode.setAttribute('data-original-d', originalD);
            } else if (type === 'path') {
                shapeNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const originalD = data.pathData || '';
                shapeNode.setAttribute('d', originalD);
                shapeNode.setAttribute('data-original-d', originalD);
            }

            shapeNode.setAttribute('fill', data.fill || '#e2e8f0');
            if (data.fillOpacity) shapeNode.setAttribute('fill-opacity', data.fillOpacity / 100);
            shapeNode.setAttribute('stroke', data.stroke || 'transparent');
            shapeNode.setAttribute('stroke-width', data.strokeWidth || '0');
            shapeNode.setAttribute('vector-effect', 'non-scaling-stroke');
            shapeNode.className.baseVal = 'shape-svg-node';

            svg.appendChild(shapeNode);
            innerEl.appendChild(svg);
        }

        // Apply fill image if present
        if (data.fillImage && data.hasImageFill === 'true') {
            setTimeout(() => applyImageFillToShape(container, data.fillImage), 0);
        }
    }
    else if (data.type === 'frame') {
        container.style.width = data.width || '800px';
        container.style.height = data.height || '600px';

        // Editable Frame Label UI
        const label = document.createElement('input');
        label.type = 'text';
        label.className = 'absolute -top-7 left-0 bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-[#444] focus:border-brand-500 focus:bg-white dark:focus:bg-[#222] rounded px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 outline-none transition-all pointer-events-auto frame-label-ui z-50';
        label.value = data.layerName || 'Canvas';
        label.onmousedown = (e) => e.stopPropagation(); // prevent dragging frame when editing text
        label.onkeydown = (e) => { if (e.key === 'Enter') label.blur(); };
        label.onblur = () => {
            container.dataset.layerName = label.value;
            renderLayers();
            saveState();
        };
        container.appendChild(label);

        innerEl = document.createElement('div');
        innerEl.className = 'frame-content w-full h-full relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-black/50 bg-white';

        if (data.fillOpacity) {
            const rgb = hex2rgb(data.fill || '#ffffff');
            innerEl.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${data.fillOpacity / 100})`;
        } else {
            innerEl.style.backgroundColor = data.fill || '#ffffff';
        }

        if (data.strokeWidth && data.strokeWidth > 0) {
            innerEl.style.borderWidth = data.strokeWidth + 'px';
            innerEl.style.borderStyle = 'solid';
            innerEl.style.borderColor = data.stroke || '#000000';
        }
    }
    else {
        // Image
        innerEl = document.createElement('img');
        innerEl.src = data.src;
        innerEl.className = 'image-item max-w-[200px] sm:max-w-[300px] max-h-[300px] object-contain cursor-grab rounded-[4px] pointer-events-none bg-transparent';
        innerEl.draggable = false;
        if (data.width) {
            innerEl.style.width = data.width;
            innerEl.classList.remove('max-w-[200px]', 'sm:max-w-[300px]', 'max-h-[300px]');
        }
        if (data.height) innerEl.style.height = data.height;
    }

    container.appendChild(innerEl);

    // Apply Radius Logic
    if (data.radius && parseFloat(data.radius) > 0) {
        if (data.type === 'frame') {
            innerEl.style.borderRadius = data.radius + 'px';
        } else if (data.type === 'image') {
            innerEl.style.borderRadius = data.radius + 'px';
        } else if (data.type === 'shape' && data.shapeType === 'rect') {
            innerEl.style.borderRadius = data.radius + 'px';
            innerEl.style.overflow = 'hidden';
        } else if (data.type === 'shape' && data.shapeType !== 'rect') {
            container.style.borderRadius = '0px';
            container.style.overflow = 'visible';

            const shapeNode = innerEl.querySelector('.shape-svg-node');
            if (shapeNode && shapeNode.tagName.toLowerCase() === 'path' && shapeNode.hasAttribute('data-original-d')) {
                applyRoundedShapePath(container);
            }
        }
    }

    if (data.type === 'shape' && data.shapeType !== 'rect' && data.pointRadii) {
        applyRoundedShapePath(container);
    }

    if (data.type === 'shape' || data.type === 'frame') {
        syncStrokeVisuals(container);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10';
    deleteBtn.innerHTML = '<i class="ph ph-x text-xs"></i>';
    deleteBtn.title = "Delete";
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        container.remove();
        connections = connections.filter(c => c.from !== container.id && c.to !== container.id);
        selectedElements.delete(container.id);
        renderConnections();
        renderLayers();
        saveState();
    };

    // Handles HTML Injection (Sides & Corners)
    const handlesHTML = `
                <div class="handle rotate-nw absolute -top-5 -left-5 w-8 h-8 cursor-rotate-nw z-10 rounded-full" title="Rotate"></div>
                <div class="handle rotate-ne absolute -top-5 -right-5 w-8 h-8 cursor-rotate-ne z-10 rounded-full" title="Rotate"></div>
                <div class="handle rotate-sw absolute -bottom-5 -left-5 w-8 h-8 cursor-rotate-sw z-10 rounded-full" title="Rotate"></div>
                <div class="handle rotate-se absolute -bottom-5 -right-5 w-8 h-8 cursor-rotate-se z-10 rounded-full" title="Rotate"></div>
                
                <div class="handle resize-n absolute -top-1.5 left-2 right-2 h-3 cursor-n-resize z-20"></div>
                <div class="handle resize-s absolute -bottom-1.5 left-2 right-2 h-3 cursor-s-resize z-20"></div>
                <div class="handle resize-e absolute top-2 bottom-2 -right-1.5 w-3 cursor-e-resize z-20"></div>
                <div class="handle resize-w absolute top-2 bottom-2 -left-1.5 w-3 cursor-w-resize z-20"></div>
                
                <div class="handle resize-nw absolute -top-1.5 -left-1.5 w-3 h-3 cursor-nw-resize z-30 flex items-center justify-center"><div class="w-2 h-2 bg-white border border-brand-500 box-border"></div></div>
                <div class="handle resize-ne absolute -top-1.5 -right-1.5 w-3 h-3 cursor-ne-resize z-30 flex items-center justify-center"><div class="w-2 h-2 bg-white border border-brand-500 box-border"></div></div>
                <div class="handle resize-sw absolute -bottom-1.5 -left-1.5 w-3 h-3 cursor-sw-resize z-30 flex items-center justify-center"><div class="w-2 h-2 bg-white border border-brand-500 box-border"></div></div>
                <div class="handle resize-se absolute -bottom-1.5 -right-1.5 w-3 h-3 cursor-se-resize z-30 flex items-center justify-center"><div class="w-2 h-2 bg-white border border-brand-500 box-border"></div></div>
            `;
    container.insertAdjacentHTML('beforeend', handlesHTML);

    imageLayer.appendChild(container);

    container.addEventListener('mousedown', (e) => handleConnectionStart(e, container.id));
    container.addEventListener('touchstart', (e) => handleConnectionStart(e, container.id), { passive: false });
    container.addEventListener('mouseup', (e) => handleConnectionEnd(e, container.id));
    container.addEventListener('touchend', (e) => handleConnectionEnd(e, container.id));

    setupInteract(container, innerEl);
}

// --- Interaction Logic (Drag, Resize, Rotate) ---
function setupInteract(container, innerEl) {
    let isActive = false;
    let actMode = ''; // 'n','s','e','w','rotate','drag'
    let startX, startY, startW, startH, startL, startT, startAngle, currentRot;
    let dragOffsets = [];
    let hasMoved = false;
    let constrainFromStart = false;

    function getCenter() {
        const l = parseFloat(container.style.left) || 0;
        const t = parseFloat(container.style.top) || 0;
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        return { x: l + w / 2, y: t + h / 2 };
    }

    container.addEventListener('mousedown', onStart);
    container.addEventListener('touchstart', onStart, { passive: false });
    container.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (container.dataset.type === 'shape') {
            enterShapeEditMode(container.id);
        }
    });

    function onStart(e) {
        if (e.button !== 0 && e.type !== 'touchstart') return;
        if (currentMode !== 'move') return;
        if (container.dataset.locked === 'true') return;

        // Allow selecting text naturally if contentEditable is active
        if (container.dataset.type === 'text' && container.querySelector('.text-content')?.contentEditable === 'true') return;

        const target = e.target;

        if (target.classList.contains('resize-n')) actMode = 'n';
        else if (target.classList.contains('resize-s')) actMode = 's';
        else if (target.classList.contains('resize-e')) actMode = 'e';
        else if (target.classList.contains('resize-w')) actMode = 'w';
        else if (target.classList.contains('resize-nw') || target.closest('.resize-nw')) actMode = 'nw';
        else if (target.classList.contains('resize-ne') || target.closest('.resize-ne')) actMode = 'ne';
        else if (target.classList.contains('resize-sw') || target.closest('.resize-sw')) actMode = 'sw';
        else if (target.classList.contains('resize-se') || target.closest('.resize-se')) actMode = 'se';
        else if (target.classList.contains('rotate-nw') || target.classList.contains('rotate-ne') ||
            target.classList.contains('rotate-sw') || target.classList.contains('rotate-se') ||
            target.closest('.rotate-ne') || target.closest('.rotate-nw') || target.closest('.rotate-se') || target.closest('.rotate-sw')) {
            actMode = 'rotate';
        } else {
            actMode = 'drag';
        }

        e.stopPropagation();
        isActive = true;
        hasMoved = false;
        constrainFromStart = !!e.shiftKey && actMode !== 'drag';

        if (e.shiftKey && actMode === 'drag') {
            if (selectedElements.has(container.id)) { selectElement(container.id, true); return; }
            else { selectElement(container.id, true); }
        } else {
            if (!selectedElements.has(container.id)) selectElement(container.id, false);
        }

        let clientX = e.clientX, clientY = e.clientY;
        if (e.touches) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }

        if (actMode === 'drag') {
            const pos = getPointerPos(e);
            startX = pos.x;
            startY = pos.y;

            dragOffsets = Array.from(selectedElements).map(id => {
                const el = document.getElementById(id);
                if (!el) return null;

                const imgNode = el.querySelector('img');
                if (el.dataset.type === 'image' && imgNode) imgNode.classList.replace('cursor-grab', 'cursor-grabbing');
                el.classList.add('image-dragging');
                return { el, initialLeft: parseFloat(el.style.left) || 0, initialTop: parseFloat(el.style.top) || 0 };
            }).filter(Boolean);
            renderLayers();
        } else {
            const pos = getBoardPos(clientX, clientY);
            startX = pos.x;
            startY = pos.y;

            if (container.dataset.type === 'shape' || container.dataset.type === 'frame') {
                startW = container.clientWidth;
                startH = container.clientHeight;
            } else {
                startW = innerEl.clientWidth;
                startH = innerEl.clientHeight;
                innerEl.style.width = `${startW}px`;
                if (container.dataset.type !== 'image') innerEl.style.height = `${startH}px`;
                else innerEl.classList.remove('max-w-[200px]', 'sm:max-w-[300px]', 'max-h-[300px]');
            }

            startL = parseFloat(container.style.left) || 0;
            startT = parseFloat(container.style.top) || 0;
            currentRot = parseFloat(container.dataset.rotation) || 0;

            if (actMode === 'rotate') {
                const center = getCenter();
                startAngle = Math.atan2(pos.y - center.y, pos.x - center.x) * (180 / Math.PI) - currentRot;
            }
        }

        document.addEventListener(e.type === 'touchstart' ? 'touchmove' : 'mousemove', onMove, { passive: false });
        document.addEventListener(e.type === 'touchstart' ? 'touchend' : 'mouseup', onEnd);
    }

    function onMove(e) {
        if (!isActive) return;
        e.preventDefault();
        hasMoved = true;

        let clientX = e.clientX, clientY = e.clientY;
        if (e.touches) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
        const pos = getBoardPos(clientX, clientY);

        if (actMode === 'drag') {
            const dx = pos.x - startX;
            const dy = pos.y - startY;

            dragOffsets.forEach(item => {
                let newLeft = item.initialLeft + dx;
                let newTop = item.initialTop + dy;

                // Gunakan fungsi sentral snapValue (mendukung snapping ke guide dan grid)
                newLeft = snapValue(newLeft, 'x');
                newTop = snapValue(newTop, 'y');

                item.el.style.left = `${newLeft}px`;
                item.el.style.top = `${newTop}px`;
                updateTransformInputsFromElement(item.el);
            });
        }
        else if (actMode === 'rotate') {
            const center = getCenter();
            let angle = Math.atan2(pos.y - center.y, pos.x - center.x) * (180 / Math.PI);
            let newRot = angle - startAngle;
            if (isSnapEnabled || constrainFromStart || e.shiftKey) newRot = Math.round(newRot / 15) * 15;
            container.style.transform = `rotate(${newRot}deg)`;
            container.dataset.rotation = newRot;
            updateTransformInputsFromElement(container);
        }
        else {
            let dx = pos.x - startX;
            let dy = pos.y - startY;

            const rad = -currentRot * (Math.PI / 180);
            const rDx = dx * Math.cos(rad) - dy * Math.sin(rad);
            const rDy = dx * Math.sin(rad) + dy * Math.cos(rad);

            let w = startW, h = startH, l = startL, t = startT;

            if ((constrainFromStart || e.shiftKey) && (actMode === 'nw' || actMode === 'ne' || actMode === 'sw' || actMode === 'se')) {
                // Proportional scaling
                const ratio = startW / startH;
                let maxDelta = Math.max(Math.abs(rDx), Math.abs(rDy));
                let sign = 1;

                if (actMode === 'se') sign = (rDx + rDy > 0) ? 1 : -1;
                else if (actMode === 'nw') sign = (rDx + rDy < 0) ? 1 : -1;
                else if (actMode === 'ne') sign = (rDx - rDy > 0) ? 1 : -1;
                else if (actMode === 'sw') sign = (-rDx + rDy > 0) ? 1 : -1;

                let deltaW = maxDelta * sign;
                let deltaH = deltaW / ratio;

                if (actMode.includes('e')) w = startW + deltaW;
                if (actMode.includes('w')) { w = startW + deltaW; l = startL - deltaW; }
                if (actMode.includes('s')) h = startH + deltaH;
                if (actMode.includes('n')) { h = startH + deltaH; t = startT - deltaH; }

                // Optional: keep strict ratio for shift. Just apply original grid snap logic as fallback
                if (isSnapEnabled) {
                    w = Math.round(w / GRID_SIZE) * GRID_SIZE;
                    h = Math.round(h / GRID_SIZE) * GRID_SIZE;
                    l = Math.round(l / GRID_SIZE) * GRID_SIZE;
                    t = Math.round(t / GRID_SIZE) * GRID_SIZE;
                }
            } else {
                // Free scaling + Guide Snapping Implementation
                if (actMode.includes('e')) {
                    let targetRight = startL + startW + rDx;
                    targetRight = snapValue(targetRight, 'x');
                    w = targetRight - startL;
                }
                if (actMode.includes('w')) {
                    let targetL = startL + rDx;
                    targetL = snapValue(targetL, 'x');
                    w = startW - (targetL - startL);
                    l = targetL;
                }
                if (actMode.includes('s')) {
                    let targetBottom = startT + startH + rDy;
                    targetBottom = snapValue(targetBottom, 'y');
                    h = targetBottom - startT;
                }
                if (actMode.includes('n')) {
                    let targetT = startT + rDy;
                    targetT = snapValue(targetT, 'y');
                    h = startH - (targetT - startT);
                    t = targetT;
                }
            }

            const minW = container.dataset.type === 'shape' || container.dataset.type === 'frame' ? 20 : 40;
            const minH = container.dataset.type === 'shape' || container.dataset.type === 'frame' ? 20 : 20;

            if (w < minW) {
                if (actMode.includes('w')) l = startL + (startW - minW);
                w = minW;
            }
            if (h < minH) {
                if (actMode.includes('n')) t = startT + (startH - minH);
                h = minH;
            }

            if (container.dataset.type === 'shape' || container.dataset.type === 'frame') {
                container.style.width = `${w}px`; container.style.left = `${l}px`;
                container.style.height = `${h}px`; container.style.top = `${t}px`;
            } else {
                innerEl.style.width = `${w}px`; container.style.left = `${l}px`;
                if (container.dataset.type !== 'image') {
                    innerEl.style.height = `${h}px`; container.style.top = `${t}px`;
                } else {
                    if (actMode.includes('n') || actMode.includes('s')) {
                        innerEl.style.height = `${h}px`;
                        innerEl.classList.remove('max-h-[300px]');
                    }
                    container.style.top = `${t}px`;
                }
            }
            updateTransformInputsFromElement(container);
        }
        renderConnections();
    }

    function onEnd() {
        if (!isActive) return;
        isActive = false;

        if (actMode === 'drag') {
            // Logic to drop into frame if overlapping
            dragOffsets.forEach(item => {
                const el = item.el;
                const imgNode = el.querySelector('img');
                if (el.dataset.type === 'image' && imgNode) imgNode.classList.replace('cursor-grabbing', 'cursor-grab');
                el.classList.remove('image-dragging');

                // Only reparent if dropped outside its current parent
                const elRect = el.getBoundingClientRect();
                const elCenter = { x: elRect.left + elRect.width / 2, y: elRect.top + elRect.height / 2 };

                const frames = Array.from(document.querySelectorAll('.element-container[data-type="frame"]'))
                    .filter(f => f.id !== el.id && f.dataset.hidden !== 'true');

                let targetFrame = null;
                for (let i = frames.length - 1; i >= 0; i--) {
                    const fRect = frames[i].getBoundingClientRect();
                    if (elCenter.x >= fRect.left && elCenter.x <= fRect.right &&
                        elCenter.y >= fRect.top && elCenter.y <= fRect.bottom) {
                        targetFrame = frames[i];
                        break;
                    }
                }

                if (targetFrame) {
                    const frameContent = targetFrame.querySelector('.frame-content');
                    if (frameContent && el.parentElement !== frameContent) {
                        const fcRect = frameContent.getBoundingClientRect();
                        const relLeft = (elRect.left - fcRect.left) / zoomLevel;
                        const relTop = (elRect.top - fcRect.top) / zoomLevel;

                        frameContent.appendChild(el);
                        el.style.left = relLeft + 'px';
                        el.style.top = relTop + 'px';
                    }
                } else {
                    if (el.parentElement !== imageLayer) {
                        const boardRect = imageLayer.getBoundingClientRect();
                        const relLeft = (elRect.left - boardRect.left) / zoomLevel;
                        const relTop = (elRect.top - boardRect.top) / zoomLevel;

                        imageLayer.appendChild(el);
                        el.style.left = relLeft + 'px';
                        el.style.top = relTop + 'px';
                    }
                }
            });
        }

        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);

        if (hasMoved) saveState();
    }
}

function handleConnectionStart(e, id) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    const el = document.getElementById(id);
    if (currentMode !== 'connect' || el.dataset.locked === 'true') return;

    e.stopPropagation();
    isConnecting = true;
    startContainerId = id;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('id', 'temp-line');
    line.setAttribute('stroke', '#666');
    line.setAttribute('stroke-width', '4');
    line.setAttribute('stroke-dasharray', '5,5');

    // Get center relative to connectionLayer (which maps to boardContainer)
    const elRect = el.getBoundingClientRect();
    const boardRect = imageLayer.getBoundingClientRect();
    const cx = ((elRect.left - boardRect.left) + elRect.width / 2) / zoomLevel;
    const cy = ((elRect.top - boardRect.top) + elRect.height / 2) / zoomLevel;

    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', cx);
    line.setAttribute('y2', cy);

    if (connectionLayer) connectionLayer.appendChild(line);

    document.addEventListener('mousemove', drawConnection);
    document.addEventListener('touchmove', drawConnection, { passive: false });
    document.addEventListener('mouseup', cancelConnection);
    document.addEventListener('touchend', cancelConnection);
}

function drawConnection(e) {
    if (!isConnecting) return;
    e.preventDefault();
    const line = document.getElementById('temp-line');
    if (line) {
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        const pos = getBoardPos(clientX, clientY);
        line.setAttribute('x2', pos.x);
        line.setAttribute('y2', pos.y);
    }
}

function handleConnectionEnd(e, id) {
    if (!isConnecting || currentMode !== 'connect') return;
    e.stopPropagation();

    if (startContainerId && startContainerId !== id) {
        const exists = connections.some(c =>
            (c.from === startContainerId && c.to === id) ||
            (c.from === id && c.to === startContainerId)
        );

        if (!exists) {
            connections.push({ from: startContainerId, to: id, id: `conn-${Date.now()}` });
            renderConnections();
            saveState();
        }
    }
    cleanupConnectionState();
}

function cancelConnection(e) { cleanupConnectionState(); }

function cleanupConnectionState() {
    isConnecting = false;
    startContainerId = null;
    const tempLine = document.getElementById('temp-line');
    if (tempLine) tempLine.remove();
    document.removeEventListener('mousemove', drawConnection);
    document.removeEventListener('touchmove', drawConnection);
    document.removeEventListener('mouseup', cancelConnection);
    document.removeEventListener('touchend', cancelConnection);
}

function renderConnections() {
    if (!connectionLayer) return;
    connectionLayer.innerHTML = '';
    const boardRect = imageLayer.getBoundingClientRect();

    connections.forEach(conn => {
        const el1 = document.getElementById(conn.from);
        const el2 = document.getElementById(conn.to);
        if (!el1 || !el2) return;

        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        const x1 = ((rect1.left - boardRect.left) + rect1.width / 2) / zoomLevel;
        const y1 = ((rect1.top - boardRect.top) + rect1.height / 2) / zoomLevel;
        const x2 = ((rect2.left - boardRect.left) + rect2.width / 2) / zoomLevel;
        const y2 = ((rect2.top - boardRect.top) + rect2.height / 2) / zoomLevel;

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.style.pointerEvents = 'auto';
        group.style.cursor = 'pointer';
        group.setAttribute('title', 'Klik 2x untuk hapus kabel');
        group.ondblclick = (e) => {
            e.stopPropagation();
            connections = connections.filter(c => c.id !== conn.id);
            renderConnections();
            saveState();
        };

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#666');
        line.setAttribute('stroke-width', '3');

        const hoverArea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hoverArea.setAttribute('x1', x1); hoverArea.setAttribute('y1', y1);
        hoverArea.setAttribute('x2', x2); hoverArea.setAttribute('y2', y2);
        hoverArea.setAttribute('stroke', 'transparent');
        hoverArea.setAttribute('stroke-width', '20');

        group.appendChild(line);
        group.appendChild(hoverArea);
        connectionLayer.appendChild(group);
    });
}

// --- PDF Export (used by new export modal) ---
function openExportModal() { document.getElementById('export-modal')?.classList.remove('hidden'); }

async function _doPDFExport() {
    const size = document.getElementById('pdf-size').value;
    const mode = document.getElementById('pdf-mode').value;

    let minX = BOARD_SIZE, minY = BOARD_SIZE, maxX = 0, maxY = 0;
    let hasContent = false;

    const elements = Array.from(document.querySelectorAll('.element-container')).filter(el => el.dataset.hidden !== 'true');
    const boardRect = imageLayer.getBoundingClientRect();

    elements.forEach(el => {
        hasContent = true;
        const elRect = el.getBoundingClientRect();
        const l = (elRect.left - boardRect.left) / zoomLevel;
        const t = (elRect.top - boardRect.top) / zoomLevel;
        const r = l + elRect.width / zoomLevel;
        const b = t + elRect.height / zoomLevel;
        if (l < minX) minX = l;
        if (t < minY) minY = t;
        if (r > maxX) maxX = r;
        if (b > maxY) maxY = b;
    });

    const margin = 50;
    if (hasContent) {
        minX = Math.max(0, minX - margin);
        minY = Math.max(0, minY - margin);
        maxX = Math.min(BOARD_SIZE, maxX + margin);
        maxY = Math.min(BOARD_SIZE, maxY + margin);
    } else {
        minX = -panX / zoomLevel;
        minY = -panY / zoomLevel;
        maxX = minX + workspace.clientWidth / zoomLevel;
        maxY = minY + workspace.clientHeight / zoomLevel;
    }

    const exportWidth = maxX - minX;
    const exportHeight = maxY - minY;

    clearSelection();
    const isDarkMode = document.documentElement.classList.contains('dark');
    const originalTransform = boardContainer.style.transform;
    boardContainer.style.transform = `translate(0px, 0px) scale(1)`;

    const canvasRender = await html2canvas(boardContainer, {
        x: minX, y: minY,
        width: exportWidth, height: exportHeight,
        backgroundColor: isDarkMode ? '#0e0e0e' : '#fafafa',
        scale: _exportScale || 2
    });

    boardContainer.style.transform = originalTransform;

    const { jsPDF } = window.jspdf;
    const activeProj = projects.find(p => p.id === activeProjectId);
    const docTitle = activeProj.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (mode === 'fit') {
        const pdf = new jsPDF({ orientation: 'landscape', format: size });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const canvasRatio = exportWidth / exportHeight;
        const pdfRatio = pdfWidth / pdfHeight;
        let finalW = pdfWidth;
        let finalH = pdfHeight;

        if (canvasRatio > pdfRatio) { finalH = pdfWidth / canvasRatio; }
        else { finalW = pdfHeight * canvasRatio; }

        const xOffset = (pdfWidth - finalW) / 2;
        const yOffset = (pdfHeight - finalH) / 2;

        pdf.addImage(canvasRender, 'PNG', xOffset, yOffset, finalW, finalH);
        pdf.save(`${docTitle}.pdf`);

    } else if (mode === 'split') {
        const pdf = new jsPDF({ orientation: 'landscape', format: size });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        const pxToMm = 0.5;
        const mmTotalW = exportWidth * pxToMm;
        const mmTotalH = exportHeight * pxToMm;

        const cols = Math.ceil(mmTotalW / pdfW);
        const rows = Math.ceil(mmTotalH / pdfH);
        let isFirstPage = true;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!isFirstPage) pdf.addPage();
                isFirstPage = false;
                const offsetX = -(c * pdfW);
                const offsetY = -(r * pdfH);
                pdf.addImage(canvasRender, 'PNG', offsetX, offsetY, mmTotalW, mmTotalH);
            }
        }
        pdf.save(`${docTitle}_split.pdf`);
    }
}


// --- Keyboard shortcuts ---
document.addEventListener('keydown', (e) => {
    // Biarkan user mengetik saat input layer name atau text block aktif
    if (document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'text') return;
    if (document.activeElement.isContentEditable) return;

    // Handle Brush Size Shortcut '[' and ']'
    if (['pen', 'pencil', 'highlighter', 'eraser'].includes(currentMode)) {
        if (e.key === '[') {
            brushSizes[currentMode] = Math.max(1, brushSizes[currentMode] - 2);
            updateCanvasContext();
            updateBrushCursor();
            return;
        }
        if (e.key === ']') {
            brushSizes[currentMode] += 2;
            updateCanvasContext();
            updateBrushCursor();
            return;
        }
    }

    if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 's') { e.preventDefault(); saveProjectToLocal(); return; }
        if (e.key.toLowerCase() === 'n') { e.preventDefault(); createNewProject(); return; }
        if (e.key.toLowerCase() === 'a') {
            e.preventDefault();
            Array.from(document.querySelectorAll('.element-container')).forEach(el => {
                if (el.dataset.hidden !== 'true' && el.dataset.locked !== 'true') {
                    selectedElements.add(el.id);
                    el.classList.add('ring-1', 'ring-brand-500');
                }
            });
            renderLayers();
            updateFormatUI();
            return;
        }
        if (e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
        if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }

        // --- NEW: Copy and Paste Logic ---
        if (e.key.toLowerCase() === 'c') {
            pasteCount = 0; // Reset paste offset counter on new copy
            appClipboard = Array.from(selectedElements).map(id => {
                const el = document.getElementById(id);
                if (!el) return null;
                const type = el.dataset.type || 'image';
                const data = {
                    type: type,
                    width: type === 'shape' || type === 'frame' ? el.style.width : el.querySelector(type === 'text' ? '.text-content' : 'img')?.style.width || '',
                    height: type === 'shape' || type === 'frame' ? el.style.height : el.querySelector(type === 'text' ? '.text-content' : 'img')?.style.height || '',
                    left: el.style.left,
                    top: el.style.top,
                    layerName: (el.dataset.layerName || 'Copy') + ' (Copy)',
                    rotation: el.dataset.rotation || '0',
                    radius: el.dataset.radius || '0'
                };
                if (el.dataset.pointRadii) data.pointRadii = el.dataset.pointRadii;
                if (type === 'image') data.src = el.querySelector('img')?.src;
                if (type === 'text') {
                    const inner = el.querySelector('.text-content');
                    if (inner) {
                        data.content = inner.innerHTML;
                        data.fill = rgb2hex(inner.style.color); // FIX applied here
                        data.fontSize = inner.style.fontSize;
                        data.fontFamily = inner.style.fontFamily;
                        data.fontWeight = inner.style.fontWeight;
                        data.fontStyle = inner.style.fontStyle;
                        data.textAlign = inner.style.textAlign;
                        data.letterSpacing = inner.style.letterSpacing;
                    }
                }
                if (type === 'shape') {
                    if (el.dataset.shapeType === 'rect') {
                        const inner = el.querySelector('.shape-inner-wrapper');
                        if (inner) {
                            data.shapeType = 'rect';
                            data.fill = rgb2hex(inner.style.backgroundColor); // FIX applied here
                            data.stroke = rgb2hex(inner.style.borderColor); // FIX applied here
                            data.strokeWidth = parseFloat(inner.style.borderWidth) || 0;
                        }
                    } else {
                        const shapeNode = el.querySelector('.shape-svg-node');
                        if (shapeNode) {
                            data.shapeType = el.dataset.shapeType;
                            data.fill = rgb2hex(shapeNode.getAttribute('fill')); // FIX applied here
                            data.stroke = rgb2hex(shapeNode.getAttribute('stroke')); // FIX applied here
                            data.strokeWidth = shapeNode.getAttribute('stroke-width');
                            if (shapeNode.tagName.toLowerCase() === 'path') {
                                data.pathData = shapeNode.getAttribute('data-original-d') || shapeNode.getAttribute('d');
                            }
                        }
                    }
                }
                if (type === 'frame') {
                    const inner = el.querySelector('.frame-content');
                    if (inner) {
                        data.fill = rgb2hex(inner.style.backgroundColor); // FIX applied here
                        data.stroke = rgb2hex(inner.style.borderColor); // FIX applied here
                        data.strokeWidth = parseFloat(inner.style.borderWidth) || 0;
                    }
                }
                return data;
            }).filter(Boolean);
        }
        if (e.key.toLowerCase() === 'v') {
            if (appClipboard.length > 0) {
                clearSelection();
                pasteCount++;
                const offset = pasteCount * 25;

                appClipboard.forEach(data => {
                    const newData = { ...data };
                    newData.id = 'el-' + Date.now() + Math.floor(Math.random() * 1000);
                    newData.left = (parseFloat(newData.left) + offset) + 'px';
                    newData.top = (parseFloat(newData.top) + offset) + 'px';
                    newData.zIndex = zIndexCounter++;

                    buildElement(newData);
                    selectElement(newData.id, true);
                });
                saveState();
            }
        }
    }

    if (e.key === 'Escape' || e.key === 'Enter') {
        if (currentMode === 'pentool' && isDrawingPath) {
            finishPath();
            return;
        }
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElements.size > 0) {
            selectedElements.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
                connections = connections.filter(c => c.from !== id && c.to !== id);
            });
            selectedElements.clear();
            renderConnections();
            renderLayers();
            updateFormatUI();
            saveState();
        }
        return;
    }

    switch (e.key.toLowerCase()) {
        case 'v': setMode('move'); break;
        case 'c': setMode('connect'); break;
        case 'p': setMode('pen'); break;
        case 'n': if (!e.ctrlKey && !e.metaKey) setMode('pencil'); break;
        case 'h': setMode('highlighter'); break;
        case 'e': setMode('eraser'); break;
        case 't': if (!e.ctrlKey && !e.metaKey) setMode('text'); break;
        case 'r': if (!e.ctrlKey && !e.metaKey) setMode('shape'); break;
        case 'b': if (!e.ctrlKey && !e.metaKey) setMode('pentool'); break;
        case 'f': if (!e.ctrlKey && !e.metaKey) setMode('frame'); break;
        case 's': if (!e.ctrlKey && !e.metaKey) toggleSnap(); break;
        case '-': changeZoom(-0.1); break;
        case '=':
        case '+': changeZoom(0.1); break;
        case '0': centerBoard(); break;
    }
});

initApp();