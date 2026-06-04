/* dantist/js/app.js */

// Global App State
const state = {
  topology: new NetworkTopology(),
  simulator: null,
  selectedTool: 'select', // 'select', 'delete', 'hand', 'cable_straight', 'cable_crossover', 'router', 'switch', 'pc', 'server'
  selectedDevice: null,
  panX: 0,
  panY: 0,
  zoom: 1.0,
  isPanning: false,
  draggedDevice: null,
  dragOffset: { x: 0, y: 0 },
  
  // Cabling session state
  cableStartDevice: null,
  cableStartPort: null,
  tempCableLine: null,
  
  // Active CLI & Desktop
  activeCliSession: null,
  currentSideTab: 'overview', // 'overview', 'interfaces', 'cli', 'desktop'
  activeDesktopTool: null, // 'ipconfig', 'cmd', 'browser'
  
  // Selected simulation history item for OSI view
  selectedOsiEvent: null,

  // Playback control state
  simulationMode: 'run',
  deviceDetailsMode: 'sidebar' // 'sidebar', 'floating'
};

// Global context menu state
let contextDevice = null;

// NetSim Light-themed Circle Badges
const DEVICE_ICONS = {
  router: `<svg width="48" height="48" x="-24" y="-24" viewBox="0 0 64 64"><circle class="device-bg" cx="32" cy="32" r="26" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/><path d="M20 32h24M32 20v24M23 23l18 18M41 23L23 41" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="32" r="6" fill="#3b82f6"/></svg>`,
  switch: `<svg width="48" height="48" x="-24" y="-24" viewBox="0 0 64 64"><circle class="device-bg" cx="32" cy="32" r="26" fill="#f0fdfa" stroke="#0d9488" stroke-width="2"/><path d="M18 24h28M18 40h28M24 32h16" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="#0d9488"/></svg>`,
  pc: `<svg width="48" height="48" x="-24" y="-24" viewBox="0 0 64 64"><circle class="device-bg" cx="32" cy="28" r="22" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><rect x="22" y="18" width="20" height="14" rx="1.5" fill="none" stroke="#64748b" stroke-width="2"/><path d="M28 32v6h8v-6M24 38h16" fill="none" stroke="#64748b" stroke-width="2"/></svg>`,
  server: `<svg width="48" height="48" x="-24" y="-24" viewBox="0 0 64 64"><circle class="device-bg" cx="32" cy="32" r="26" fill="#faf5ff" stroke="#8b5cf6" stroke-width="2"/><rect x="20" y="16" width="24" height="32" rx="2" fill="none" stroke="#8b5cf6" stroke-width="2"/><path d="M24 24h16M24 32h16M24 40h16" stroke="#8b5cf6" stroke-width="2"/><circle cx="25" cy="20" r="1.5" fill="#10b981"/><circle cx="25" cy="28" r="1.5" fill="#10b981"/></svg>`,
  access_point: `<svg width="48" height="48" x="-24" y="-24" viewBox="0 0 64 64"><circle class="device-bg" cx="32" cy="32" r="26" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/><path d="M32 44v-8M24 28c3-4 13-4 16 0M20 23c6-6 18-6 24 0M16 18c9-9 23-9 32 0" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="36" r="3" fill="#ea580c"/></svg>`,
  laptop: `<svg width="48" height="48" x="-24" y="-24" viewBox="0 0 64 64"><circle class="device-bg" cx="32" cy="28" r="22" fill="#f8fafc" stroke="#475569" stroke-width="2"/><rect x="20" y="16" width="24" height="15" rx="1" fill="none" stroke="#475569" stroke-width="2"/><path d="M16 33h32l-4 4H20z" fill="none" stroke="#475569" stroke-width="2"/></svg>`,
  smartphone: `<svg width="48" height="48" x="-24" y="-24" viewBox="0 0 64 64"><circle class="device-bg" cx="32" cy="28" r="22" fill="#f8fafc" stroke="#0ea5e9" stroke-width="2"/><rect x="22" y="14" width="20" height="28" rx="3" fill="none" stroke="#0ea5e9" stroke-width="2"/><circle cx="32" cy="38" r="1.5" fill="#0ea5e9"/></svg>`
};

// DOM Element references
let elCanvas = null;
let elDevicesGroup = null;
let elCablesGroup = null;
let elStatusLightsGroup = null;
let elPacketsGroup = null;
let elWifiRangeGroup = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  elCanvas = document.getElementById('network-canvas');
  elDevicesGroup = document.getElementById('devices-group');
  elCablesGroup = document.getElementById('cables-group');
  elStatusLightsGroup = document.getElementById('status-lights-group');
  elPacketsGroup = document.getElementById('packets-group');
  elWifiRangeGroup = document.getElementById('wifi-range-group');
  
  // Setup simulator
  state.simulator = new NetworkSimulator(
    state.topology, 
    handleSimulationEvent, 
    handleSimulationFinished
  );

  setupEventListeners();
  drawGrid();
  selectTool('select');
  
  // Load default LAN Preset
  loadLabTemplate('lan');
  
  // Start dynamic clock & stats loop
  startUINoiseLoops();

  // Setup dragging for floating details window
  const panel = document.getElementById('panel-device-details');
  const header = document.getElementById('device-details-header');
  if (panel && header) {
    setupWindowDragging(panel, header);
  }
});

// Setup event handlers
function setupEventListeners() {
  const canvasContainer = document.querySelector('.canvas-container');
  
  // Canvas Panning triggers
  canvasContainer.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2 || state.selectedTool === 'hand') {
      state.isPanning = true;
      canvasContainer.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  canvasContainer.addEventListener('mousemove', (e) => {
    if (state.isPanning) {
      state.panX += e.movementX;
      state.panY += e.movementY;
      applyTransform();
    } else if (state.draggedDevice) {
      const rect = elCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - state.panX) / state.zoom - state.dragOffset.x;
      const y = (e.clientY - rect.top - state.panY) / state.zoom - state.dragOffset.y;
      
      // Grid Snapping
      state.draggedDevice.x = Math.round(x / 10) * 10;
      state.draggedDevice.y = Math.round(y / 10) * 10;
      
      updateDeviceElement(state.draggedDevice);
      updateDeviceCables(state.draggedDevice);
      
      // Update wireless connections dynamically
      if (state.draggedDevice.type === 'laptop' || state.draggedDevice.type === 'smartphone' || state.draggedDevice.type === 'access_point') {
        const wirelessChanged = updateWirelessConnections();
        if (wirelessChanged) {
          drawCables();
        }
      }
      if (state.draggedDevice.type === 'access_point') {
        drawWifiRanges();
      }
    } else if (state.cableStartDevice && state.tempCableLine) {
      const rect = elCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - state.panX) / state.zoom;
      const y = (e.clientY - rect.top - state.panY) / state.zoom;
      
      state.tempCableLine.setAttribute('x2', x);
      state.tempCableLine.setAttribute('y2', y);
    }
  });

  window.addEventListener('mouseup', () => {
    if (state.isPanning) {
      state.isPanning = false;
      canvasContainer.style.cursor = 'default';
    }
    if (state.draggedDevice) {
      if (state.draggedDevice.type === 'laptop' || state.draggedDevice.type === 'smartphone' || state.draggedDevice.type === 'access_point') {
        updateWirelessConnections();
      }
      drawCables();
    }
    state.draggedDevice = null;
  });

  // Zooming
  canvasContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const intensity = 0.05;
    if (e.deltaY < 0) zoomIn(intensity);
    else zoomOut(intensity);
  });

  canvasContainer.addEventListener('contextmenu', e => {
    e.preventDefault();
    hideDeviceContextMenu();
  });

  // Click on background
  elCanvas.addEventListener('click', (e) => {
    if (e.target === elCanvas || e.target.tagName === 'rect') {
      if (state.cableStartDevice) {
        cancelCabling();
        return;
      }
      
      const rect = elCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - state.panX) / state.zoom;
      const y = (e.clientY - rect.top - state.panY) / state.zoom;
      
      const roundedX = Math.round(x / 10) * 10;
      const roundedY = Math.round(y / 10) * 10;

      if (['router', 'switch', 'pc', 'server'].includes(state.selectedTool)) {
        addDevice(state.selectedTool, roundedX, roundedY);
        selectTool('select');
      } else {
        // Deselect
        deselectDevice();
      }
    }
  });

  // Toolbar actions
  document.getElementById('tool-select').addEventListener('click', () => selectTool('select'));
  document.getElementById('tool-delete').addEventListener('click', () => selectTool('delete'));
  document.getElementById('tool-hand').addEventListener('click', () => selectTool('hand'));
  document.getElementById('tool-cable-straight').addEventListener('click', () => selectTool('cable_straight'));
  document.getElementById('tool-cable-crossover').addEventListener('click', () => selectTool('cable_crossover'));
  document.getElementById('tool-ping-packet').addEventListener('click', () => selectTool('ping'));

  // Sidebar drag support
  document.querySelectorAll('.cabinet-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.getAttribute('data-type');
      selectTool(type);
    });
    
    item.addEventListener('dragstart', (e) => {
      const type = item.getAttribute('data-type');
      e.dataTransfer.setData('text/plain', type);
      selectTool(type);
    });
  });

  canvasContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  canvasContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (['router', 'switch', 'pc', 'server', 'access_point', 'laptop', 'smartphone'].includes(type)) {
      const rect = elCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - state.panX) / state.zoom;
      const y = (e.clientY - rect.top - state.panY) / state.zoom;
      
      const roundedX = Math.round(x / 10) * 10;
      const roundedY = Math.round(y / 10) * 10;

      addDevice(type, roundedX, roundedY);
      selectTool('select');
    }
  });

  // Speed Slider
  const speedSlider = document.getElementById('sim-speed');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const delay = parseInt(e.target.value);
      state.simulator.stepDelay = delay;
      document.getElementById('sim-delay-display').textContent = `${delay} ms`;
    });
  }

  // Floating Dropdown menu triggers
  const addBtn = document.getElementById('add-device-dropdown-btn');
  const addMenu = document.getElementById('add-device-dropdown-menu');
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    addMenu.classList.add('hidden');
    hideDeviceContextMenu();
  });

  // Real-time toggle listener
  const rtToggle = document.getElementById('realtime-toggle');
  if (rtToggle) {
    rtToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        playSimulation();
      } else {
        pauseSimulation();
      }
    });
  }

  // Scenario select listener
  const scenarioSelect = document.getElementById('scenario-select');
  if (scenarioSelect) {
    scenarioSelect.addEventListener('change', (e) => {
      loadLabTemplate(e.target.value);
    });
  }

  // Keyboard listeners: Delete to remove device, Ctrl+Z to undo
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
    
    if (!isTyping) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedDevice) {
          removeDevice(state.selectedDevice.id);
          e.preventDefault();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        triggerUndo();
        e.preventDefault();
      }
    }
  });

  // Resizable simulation log panel
  const logPanel = document.getElementById('simulation-log-panel');
  const logResizeHandle = document.getElementById('log-resize-handle');
  if (logPanel && logResizeHandle) {
    let isResizing = false;
    let startY = 0;
    let startHeight = 0;

    logResizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startY = e.clientY;
      startHeight = logPanel.getBoundingClientRect().height;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dy = e.clientY - startY;
      const newHeight = Math.max(100, Math.min(600, startHeight - dy));
      logPanel.style.height = `${newHeight}px`;
    });
    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
      }
    });
  }

  // Resizable sidebar panel
  const sidebarPanel = document.getElementById('sidebar-panel');
  const sidebarResizeHandle = document.getElementById('sidebar-resize-handle');
  if (sidebarPanel && sidebarResizeHandle) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    sidebarResizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = sidebarPanel.getBoundingClientRect().width;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = startX - e.clientX;
      const newWidth = Math.max(260, Math.min(600, startWidth + dx));
      sidebarPanel.style.width = `${newWidth}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
      }
    });
  }

  // Global Search Box implementation
  const searchInput = document.getElementById('global-search-input');
  const searchResults = document.getElementById('global-search-results');
  
  if (searchInput && searchResults) {
    // ⌘K or Ctrl+K shortcut to focus search
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchResults.classList.add('hidden');
        searchInput.blur();
      }
    });

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML = '';
        searchResults.classList.add('hidden');
        return;
      }

      const matches = state.topology.devices.filter(dev => {
        const nameMatch = dev.name.toLowerCase().includes(query);
        const typeMatch = dev.type.toLowerCase().includes(query);
        const ipMatch = dev.ports.some(p => p.ip && p.ip.toLowerCase().includes(query));
        return nameMatch || typeMatch || ipMatch;
      });

      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="px-4 py-2 text-slate-400 italic">No devices found</div>';
        searchResults.classList.remove('hidden');
        return;
      }

      searchResults.innerHTML = '';
      matches.forEach(dev => {
        const item = document.createElement('button');
        item.className = 'w-full text-left px-4 py-2 hover:bg-slate-50 transition flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer';
        
        let iconHtml = '';
        if (dev.type === 'router') iconHtml = '<span class="text-indigo-500 mr-2"><i class="fa-solid fa-cube"></i></span>';
        else if (dev.type === 'switch') iconHtml = '<span class="text-teal-500 mr-2"><i class="fa-solid fa-network-wired"></i></span>';
        else if (dev.type === 'pc') iconHtml = '<span class="text-slate-500 mr-2"><i class="fa-solid fa-desktop"></i></span>';
        else if (dev.type === 'server') iconHtml = '<span class="text-purple-500 mr-2"><i class="fa-solid fa-database"></i></span>';

        const activeIps = dev.ports.map(p => p.ip).filter(Boolean).join(', ');
        const ipInfo = activeIps ? `<span class="text-[9px] text-slate-400 block font-mono mt-0.5">${activeIps}</span>` : '';

        item.innerHTML = `
          <div class="flex items-center">
            ${iconHtml}
            <div>
              <span class="font-semibold text-slate-800 text-xs">${dev.name}</span>
              ${ipInfo}
            </div>
          </div>
          <span class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold uppercase">${dev.type}</span>
        `;

        item.onclick = () => {
          selectDevice(dev);
          
          // Center canvas on device
          const rect = elCanvas.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          state.panX = centerX - dev.x * state.zoom;
          state.panY = centerY - dev.y * state.zoom;
          applyTransform();

          // Clear search
          searchInput.value = '';
          searchResults.innerHTML = '';
          searchResults.classList.add('hidden');
          searchInput.blur();

          // Flash visual effect on the device badge
          const deviceEl = document.getElementById(dev.id);
          if (deviceEl) {
            deviceEl.classList.add('animate-pulse');
            setTimeout(() => deviceEl.classList.remove('animate-pulse'), 1500);
          }
        };

        searchResults.appendChild(item);
      });

      searchResults.classList.remove('hidden');
    });

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
      const container = document.getElementById('global-search-container');
      if (container && !container.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }

  // Bind custom context menu buttons
  const btnCable = document.getElementById('context-menu-cable');
  if (btnCable) {
    btnCable.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contextDevice) {
        const dev = contextDevice; // Keep a local reference before clearing
        hideDeviceContextMenu();
        
        // Check if there are free ports before initiating cabling
        const freePorts = dev.ports.filter(p => !p.connectedLink);
        if (freePorts.length === 0) {
          showToast(`No free interfaces on ${dev.name}`, 'error');
          selectTool('select');
          return;
        }

        if (!state.selectedTool || !state.selectedTool.startsWith('cable')) {
          selectTool('cable_straight');
        }
        handleCablingInteraction(dev);
      }
    });
  }

  const btnDelete = document.getElementById('context-menu-delete');
  if (btnDelete) {
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contextDevice) {
        const devId = contextDevice.id;
        hideDeviceContextMenu();
        removeDevice(devId);
      }
    });
  }
}

function selectTool(tool) {
  state.selectedTool = tool;
  
  // Style active button states
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.className = 'toolbar-btn text-slate-500 hover:text-slate-800 hover:bg-white p-1.5 rounded-md text-xs font-medium transition';
  });
  
  const activeBtn = document.getElementById(`tool-${tool}`);
  if (activeBtn) {
    activeBtn.className = 'toolbar-btn bg-indigo-600 text-white p-1.5 rounded-md text-xs font-medium transition';
  }

  // Active cabinet styles
  document.querySelectorAll('.cabinet-item').forEach(item => {
    item.classList.remove('border-indigo-500', 'bg-indigo-50/50');
  });

  const activeCabinet = document.querySelector(`.cabinet-item[data-type="${tool}"]`);
  if (activeCabinet) {
    activeCabinet.classList.add('border-indigo-500', 'bg-indigo-50/50');
  }

  // Cabling cancel check
  if (!tool.startsWith('cable') && state.cableStartDevice) {
    cancelCabling();
  }
}

// Canvas transform operations
function applyTransform() {
  const inner = document.getElementById('canvas-inner');
  if (inner) {
    inner.setAttribute('transform', `translate(${state.panX}, ${state.panY}) scale(${state.zoom})`);
  }
  document.getElementById('zoom-level-text').textContent = `${Math.round(state.zoom * 100)}%`;
}

function zoomIn(intensity = 0.1) {
  state.zoom = Math.min(2.5, state.zoom + intensity);
  applyTransform();
}

function zoomOut(intensity = 0.1) {
  state.zoom = Math.max(0.4, state.zoom - intensity);
  applyTransform();
}

function resetZoomPan() {
  state.zoom = 1.0;
  state.panX = 0;
  state.panY = 0;
  applyTransform();
}

function drawGrid() {
  const bg = document.getElementById('grid-bg');
  if (bg) {
    bg.setAttribute('width', '5000');
    bg.setAttribute('height', '5000');
    bg.setAttribute('fill', 'url(#grid-pattern)');
  }
}

// Spawning Devices
function addDevice(type, x, y, name = '') {
  const dev = state.topology.addDevice(type, x, y, name);
  renderDevice(dev);
  
  if (type === 'laptop' || type === 'smartphone' || type === 'access_point') {
    updateWirelessConnections();
    drawCables();
  }
  
  updateMetrics();
  
  // Auto select newly spawned device
  selectDevice(dev);
  return dev;
}

function showDeviceContextMenu(device, x, y) {
  contextDevice = device;
  const menu = document.getElementById('device-context-menu');
  const nameLabel = document.getElementById('context-menu-device-name');
  
  if (menu && nameLabel) {
    nameLabel.textContent = device.name;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.remove('hidden');
  }
}

function hideDeviceContextMenu() {
  const menu = document.getElementById('device-context-menu');
  if (menu) {
    menu.classList.add('hidden');
  }
  contextDevice = null;
}

function renderDevice(device) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', device.id);
  g.setAttribute('class', 'device-node');
  g.setAttribute('transform', `translate(${device.x}, ${device.y})`);
  
  g.innerHTML = `
    <g class="device-icon-wrapper">
      ${DEVICE_ICONS[device.type]}
    </g>
    <text x="0" y="38" text-anchor="middle" fill="#334155" class="text-[10px] font-bold select-none">${device.name}</text>
  `;

  g.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (state.selectedTool === 'delete') {
      removeDevice(device.id);
      selectTool('select');
      return;
    }

    if (state.selectedTool === 'ping') {
      handlePingPlacement(device);
      return;
    }

    if (state.selectedTool.startsWith('cable')) {
      handleCablingInteraction(device);
      return;
    }

    // Default selection / drag
    state.draggedDevice = device;
    const rect = elCanvas.getBoundingClientRect();
    state.dragOffset.x = (e.clientX - rect.left - state.panX) / state.zoom - device.x;
    state.dragOffset.y = (e.clientY - rect.top - state.panY) / state.zoom - device.y;

    selectDevice(device);
  });

  g.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showDeviceContextMenu(device, e.clientX, e.clientY);
  });

  elDevicesGroup.appendChild(g);
}

function selectDevice(device) {
  state.selectedDevice = device;
  
  // Highlight SVG element
  document.querySelectorAll('.device-node').forEach(n => n.classList.remove('selected'));
  const el = document.getElementById(device.id);
  if (el) el.classList.add('selected');

  // Toggle side panels depending on mode
  if (state.deviceDetailsMode === 'floating') {
    document.getElementById('panel-simulation-history').classList.remove('hidden');
  } else {
    document.getElementById('panel-simulation-history').classList.add('hidden');
  }
  document.getElementById('panel-device-details').classList.remove('hidden');

  // Populate dynamic drawer Overview
  document.getElementById('detail-device-name').textContent = device.name;
  document.getElementById('overview-hostname').value = device.name;
  
  let gatewayIpInput = document.getElementById('overview-gateway-ip');
  if (device.type === 'pc' || device.type === 'server') {
    gatewayIpInput.disabled = false;
    gatewayIpInput.value = device.gateway || '';
  } else if (device.type === 'switch') {
    gatewayIpInput.disabled = true;
    gatewayIpInput.value = 'N/A (Unmanaged Switch)';
  } else {
    gatewayIpInput.disabled = true;
    gatewayIpInput.value = 'N/A (L3 Routing Enabled)';
  }

  // Icon update in drawer header
  const iconSpan = document.getElementById('detail-device-icon');
  if (device.type === 'router') iconSpan.innerHTML = '<i class="fa-solid fa-cube text-indigo-500"></i>';
  else if (device.type === 'switch') iconSpan.innerHTML = '<i class="fa-solid fa-network-wired text-teal-500"></i>';
  else if (device.type === 'pc') iconSpan.innerHTML = '<i class="fa-solid fa-desktop text-slate-500"></i>';
  else if (device.type === 'server') iconSpan.innerHTML = '<i class="fa-solid fa-database text-purple-500"></i>';
  else if (device.type === 'access_point') iconSpan.innerHTML = '<i class="fa-solid fa-wifi text-orange-500"></i>';
  else if (device.type === 'laptop') iconSpan.innerHTML = '<i class="fa-solid fa-laptop text-slate-500"></i>';
  else if (device.type === 'smartphone') iconSpan.innerHTML = '<i class="fa-solid fa-mobile-screen-button text-sky-500"></i>';

  document.getElementById('overview-device-type').textContent = device.type.toUpperCase();

  // Toggle tab visibility based on device type
  const cliTab = document.getElementById('side-tab-cli');
  const desktopTab = document.getElementById('side-tab-desktop');
  const servicesTab = document.getElementById('side-tab-services');

  if (cliTab) {
    if (device.type === 'router') {
      cliTab.classList.remove('hidden');
      cliTab.textContent = 'CLI';
    } else if (device.type === 'pc' || device.type === 'server' || device.type === 'laptop' || device.type === 'smartphone') {
      cliTab.classList.remove('hidden');
      cliTab.textContent = 'CMD';
    } else {
      cliTab.classList.add('hidden');
    }
  }
  if (desktopTab) {
    if (device.type === 'pc' || device.type === 'server' || device.type === 'laptop' || device.type === 'smartphone') desktopTab.classList.remove('hidden');
    else desktopTab.classList.add('hidden');
  }
  if (servicesTab) {
    if (device.type === 'server' || device.type === 'access_point') servicesTab.classList.remove('hidden');
    else servicesTab.classList.add('hidden');
  }

  // Load default tab Overview
  selectSideTab('overview');
  drawWifiRanges();
}

function deselectDevice() {
  state.selectedDevice = null;
  document.querySelectorAll('.device-node').forEach(n => n.classList.remove('selected'));
  if (elWifiRangeGroup) elWifiRangeGroup.innerHTML = '';
  
  // Dock back if currently floating
  if (state.deviceDetailsMode === 'floating') {
    makeDeviceDetailsSidebar();
  }

  // Revert side panel
  document.getElementById('panel-device-details').classList.add('hidden');
  document.getElementById('panel-simulation-history').classList.remove('hidden');
}

function closeDeviceDetailsPanel() {
  deselectDevice();
}

function toggleDeviceDetailsFloat() {
  if (state.deviceDetailsMode === 'floating') {
    makeDeviceDetailsSidebar();
  } else {
    makeDeviceDetailsFloating();
  }
}

function makeDeviceDetailsFloating() {
  const panel = document.getElementById('panel-device-details');
  const sidebar = document.getElementById('sidebar-panel');
  const simHistory = document.getElementById('panel-simulation-history');
  const header = document.getElementById('device-details-header');
  
  state.deviceDetailsMode = 'floating';
  
  // 1. Show simulation history in sidebar
  if (simHistory) simHistory.classList.remove('hidden');
  
  // 2. Append panel to body so it pops out of sidebar constraints
  document.body.appendChild(panel);
  
  // 3. Add floating styling classes
  panel.classList.remove('h-full');
  panel.classList.add('floating-window', 'bg-white', 'border', 'border-slate-200', 'shadow-2xl', 'rounded-2xl', 'z-40');
  
  // Set initial position & dimensions
  panel.style.position = 'fixed';
  panel.style.top = '120px';
  panel.style.left = '120px';
  panel.style.width = '420px';
  panel.style.height = '480px';
  
  if (header) {
    header.style.cursor = 'move';
  }
  
  updateDeviceDetailsHeaderButtons();
}

function makeDeviceDetailsSidebar() {
  const panel = document.getElementById('panel-device-details');
  const sidebar = document.getElementById('sidebar-panel');
  const simHistory = document.getElementById('panel-simulation-history');
  const header = document.getElementById('device-details-header');
  
  state.deviceDetailsMode = 'sidebar';
  
  // 1. Hide simulation history in sidebar
  if (simHistory) simHistory.classList.add('hidden');
  
  // 2. Append panel back to sidebar
  if (sidebar && panel) sidebar.appendChild(panel);
  
  // 3. Reset styling
  panel.classList.add('h-full');
  panel.classList.remove('floating-window', 'bg-white', 'border', 'border-slate-200', 'shadow-2xl', 'rounded-2xl', 'z-40');
  
  panel.style.position = '';
  panel.style.top = '';
  panel.style.left = '';
  panel.style.width = '';
  panel.style.height = '';
  
  if (header) {
    header.style.cursor = 'default';
  }
  
  updateDeviceDetailsHeaderButtons();
}

function updateDeviceDetailsHeaderButtons() {
  const btn = document.getElementById('btn-toggle-float');
  if (btn) {
    if (state.deviceDetailsMode === 'floating') {
      btn.innerHTML = '<i class="fa-solid fa-right-to-bracket text-xs"></i>';
      btn.setAttribute('title', 'Dock to Sidebar');
    } else {
      btn.innerHTML = '<i class="fa-solid fa-up-right-from-square text-[10px]"></i>';
      btn.setAttribute('title', 'Float Window');
    }
  }
}

function setupWindowDragging(panel, dragHandle) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  dragHandle.addEventListener('mousedown', (e) => {
    if (state.deviceDetailsMode !== 'floating') return;
    if (e.button !== 0) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    panel.style.left = `${startLeft + dx}px`;
    panel.style.top = `${startTop + dy}px`;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
    }
  });
}

function selectSideTab(tab) {
  state.currentSideTab = tab;

  // Active tab classes
  document.querySelectorAll('[id^="side-tab-"]').forEach(btn => {
    btn.className = 'flex-1 text-center py-2.5 border-b-2 border-transparent hover:text-slate-800';
  });

  const activeBtn = document.getElementById(`side-tab-${tab}`);
  if (activeBtn) {
    activeBtn.className = 'flex-1 text-center py-2.5 border-b-2 border-indigo-600 text-indigo-600';
  }

  // Toggle screens
  document.getElementById('side-content-overview').classList.add('hidden');
  document.getElementById('side-content-interfaces').classList.add('hidden');
  document.getElementById('side-content-cli').classList.add('hidden');
  document.getElementById('side-content-desktop').classList.add('hidden');
  
  const servicesContent = document.getElementById('side-content-services');
  if (servicesContent) servicesContent.classList.add('hidden');

  const targetContent = document.getElementById(`side-content-${tab}`);
  if (targetContent) targetContent.classList.remove('hidden');

  const dev = state.selectedDevice;
  if (!dev) return;

  if (tab === 'overview') {
    // Already populated, wire up change triggers
    document.getElementById('overview-hostname').oninput = (e) => {
      dev.name = e.target.value;
      updateDeviceElement(dev);
      document.getElementById('detail-device-name').textContent = dev.name;
    };
    document.getElementById('overview-gateway-ip').onchange = (e) => {
      if (dev.type === 'pc' || dev.type === 'server' || dev.type === 'laptop' || dev.type === 'smartphone') {
        dev.gateway = e.target.value;
      }
    };
    renderWirelessSettings(dev);
  } 
  
  else if (tab === 'interfaces') {
    renderSidePanelInterfaces(dev);
  } 
  
  else if (tab === 'cli') {
    if (dev.type === 'router') {
      initializeSidePanelCli(dev);
    } else if (dev.type === 'pc' || dev.type === 'server' || dev.type === 'laptop' || dev.type === 'smartphone') {
      initializeSidePanelCmd(dev);
    } else {
      document.getElementById('side-content-cli').innerHTML = `
        <div class="text-center p-8 text-slate-400 text-xs italic">
          CLI Console is only available on Routers.
        </div>
      `;
    }
  } 
  
  else if (tab === 'desktop') {
    if (dev.type === 'pc' || dev.type === 'server' || dev.type === 'laptop' || dev.type === 'smartphone') {
      let grid = document.getElementById('desktop-tools-grid');
      let frame = document.getElementById('desktop-tool-frame');
      if (!grid || !frame) {
        const desktopContent = document.getElementById('side-content-desktop');
        if (desktopContent) {
          desktopContent.innerHTML = `
            <div id="desktop-tools-grid" class="grid grid-cols-2 gap-3">
              <button onclick="openSidebarDesktopTool('ipconfig')" class="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-xl transition">
                <div class="text-xl text-indigo-600"><i class="fa-solid fa-sliders"></i></div>
                <span class="text-[10px] font-bold text-slate-700">IP Settings</span>
              </button>
              <button onclick="openSidebarDesktopTool('cmd')" class="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-xl transition">
                <div class="text-xl text-slate-700"><i class="fa-solid fa-terminal"></i></div>
                <span class="text-[10px] font-bold text-slate-700">Command Cmd</span>
              </button>
              <button onclick="openSidebarDesktopTool('browser')" class="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-xl transition">
                <div class="text-xl text-teal-600"><i class="fa-solid fa-globe"></i></div>
                <span class="text-[10px] font-bold text-slate-700">Web Browser</span>
              </button>
              <button onclick="openSidebarDesktopTool('email')" class="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-xl transition">
                <div class="text-xl text-rose-500"><i class="fa-solid fa-envelope"></i></div>
                <span class="text-[10px] font-bold text-slate-700">Email Client</span>
              </button>
            </div>
            <div id="desktop-tool-frame" class="mt-4 border border-slate-100 bg-slate-50/50 p-3 rounded-xl hidden">
            </div>
          `;
          grid = document.getElementById('desktop-tools-grid');
          frame = document.getElementById('desktop-tool-frame');
        }
      }
      
      // Restore active desktop tool if it exists!
      if (dev.activeDesktopTool) {
        openSidebarDesktopTool(dev.activeDesktopTool);
      } else {
        if (grid) grid.classList.remove('hidden');
        if (frame) frame.classList.add('hidden');
      }
    } else {
      const desktopContent = document.getElementById('side-content-desktop');
      if (desktopContent) {
        desktopContent.innerHTML = `
          <div class="text-center p-8 text-slate-400 text-xs italic">
            Desktop Application suite is only available on PC/Server/Wireless hosts.
          </div>
        `;
      }
    }
  }

  else if (tab === 'services') {
    if (dev.type === 'server') {
      renderSidePanelServices(dev);
    } else if (dev.type === 'access_point') {
      renderApServices(dev);
    } else {
      document.getElementById('side-content-services').innerHTML = `
        <div class="text-center p-8 text-slate-400 text-xs italic">
          Services panel is only available on Server and Access Point devices.
        </div>
      `;
    }
  }
}

function renderSidePanelInterfaces(dev) {
  const container = document.getElementById('side-interfaces-container');
  container.innerHTML = '';

  dev.ports.forEach(port => {
    const isUp = port.status === 'up';
    const div = document.createElement('div');
    div.className = 'p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5 text-xs';
    
    if (dev.type === 'switch') {
      // Unmanaged Switch: port status and power toggle only (no IP configurations)
      const otherPort = port.getConnectedPort();
      const connText = otherPort ? 
        `Connected to ${otherPort.device.name} (${otherPort.name})` : 
        'Disconnected';
      
      div.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <span class="font-bold text-slate-700 block">${port.name}</span>
            <span class="text-[9px] text-slate-400 block mt-0.5">${connText}</span>
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer port-toggle" ${isUp ? 'checked' : ''} data-port="${port.name}">
            <div class="relative w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
            <span class="ms-1.5 text-[10px] font-bold text-slate-400 peer-checked:text-emerald-500 uppercase">Power</span>
          </label>
        </div>
      `;
      
      div.querySelector('.port-toggle').onchange = (e) => {
        port.status = e.target.checked ? 'up' : 'down';
        dev.updateConnectedRoutes();
        if (port.connectedLink) port.connectedLink.updateStatus();
        drawCables();
      };
    } else {
      // Other devices (Router, PC, Server): Show IP configurations
      if (port.dhcpEnabled === undefined) {
        port.dhcpEnabled = false;
      }
      const isClient = dev.type === 'pc' || dev.type === 'server' || dev.type === 'laptop' || dev.type === 'smartphone';
      
      div.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-700">${port.name}</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer port-toggle" ${isUp ? 'checked' : ''} data-port="${port.name}">
            <div class="relative w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
            <span class="ms-1.5 text-[10px] font-bold text-slate-400 peer-checked:text-emerald-500 uppercase">Power</span>
          </label>
        </div>
      `;

      if (isClient) {
        div.innerHTML += `
          <div class="flex items-center gap-3 bg-slate-100/60 p-1 rounded-lg border border-slate-200/50 my-1.5 font-semibold text-[9px]">
            <label class="inline-flex items-center cursor-pointer">
              <input type="radio" name="ip-mode-${port.name}" value="static" ${!port.dhcpEnabled ? 'checked' : ''} class="mr-1 accent-indigo-600 ip-mode-static" data-port="${port.name}"> Static
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input type="radio" name="ip-mode-${port.name}" value="dhcp" ${port.dhcpEnabled ? 'checked' : ''} class="mr-1 accent-indigo-600 ip-mode-dhcp" data-port="${port.name}"> DHCP
            </label>
          </div>
        `;
      }

      div.innerHTML += `
        <div class="grid grid-cols-2 gap-2 mt-1">
          <div>
            <span class="text-[8px] font-bold text-slate-400 block mb-0.5">IP Address</span>
            <input type="text" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700 port-ip" value="${port.ip || ''}" data-port="${port.name}" ${port.dhcpEnabled ? 'disabled' : ''}>
          </div>
          <div>
            <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Subnet Mask</span>
            <input type="text" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700 port-subnet" value="${port.subnet || ''}" data-port="${port.name}" ${port.dhcpEnabled ? 'disabled' : ''}>
          </div>
        </div>
        <div class="dhcp-status-msg text-[8px] mt-1 hidden font-semibold text-center py-0.5 rounded"></div>
      `;

      if (dev.type === 'router') {
        if (!port.dhcpPool) {
          port.dhcpPool = {
            enabled: false,
            startIp: '',
            maxUsers: 50,
            dnsServer: '',
            leases: {}
          };
        } else if (!port.dhcpPool.leases) {
          port.dhcpPool.leases = {};
        }
        
        const dhcpId = `dhcp-section-${port.name.replace('/', '-')}`;
        
        div.innerHTML += `
          <div class="border-t border-slate-200/60 pt-2 mt-2 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">DHCP Server Pool</span>
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer dhcp-toggle" ${port.dhcpPool.enabled ? 'checked' : ''} data-port="${port.name}">
                <div class="relative w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div id="${dhcpId}" class="space-y-2 ${port.dhcpPool.enabled ? '' : 'hidden'}">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Start IP Address</span>
                  <input type="text" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700 dhcp-start" value="${port.dhcpPool.startIp || ''}" placeholder="e.g. 192.168.1.100" data-port="${port.name}">
                </div>
                <div>
                  <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Max Users</span>
                  <input type="number" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700 dhcp-max" value="${port.dhcpPool.maxUsers || 50}" data-port="${port.name}">
                </div>
              </div>
              <div>
                <span class="text-[8px] font-bold text-slate-400 block mb-0.5">DNS Server IP</span>
                <input type="text" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700 dhcp-dns" value="${port.dhcpPool.dnsServer || ''}" placeholder="e.g. 8.8.8.8" data-port="${port.name}">
              </div>
            </div>
          </div>
        `;
      }

      const ipInput = div.querySelector('.port-ip');
      const subnetInput = div.querySelector('.port-subnet');

      div.querySelector('.port-toggle').onchange = (e) => {
        port.status = e.target.checked ? 'up' : 'down';
        dev.updateConnectedRoutes();
        if (port.connectedLink) port.connectedLink.updateStatus();
        drawCables();
      };

      ipInput.onchange = (e) => {
        port.ip = e.target.value;
        dev.updateConnectedRoutes();
      };

      subnetInput.onchange = (e) => {
        port.subnet = e.target.value;
        dev.updateConnectedRoutes();
      };

      if (isClient) {
        const radioStatic = div.querySelector('.ip-mode-static');
        const radioDhcp = div.querySelector('.ip-mode-dhcp');
        const statusMsg = div.querySelector('.dhcp-status-msg');

        const handleModeChange = () => {
          const isDhcp = radioDhcp.checked;
          port.dhcpEnabled = isDhcp;
          ipInput.disabled = isDhcp;
          subnetInput.disabled = isDhcp;

          if (isDhcp) {
            statusMsg.classList.remove('hidden');
            statusMsg.className = 'dhcp-status-msg text-[8px] mt-1 font-semibold text-center py-0.5 rounded text-amber-600 bg-amber-50 border border-amber-200';
            statusMsg.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Requesting DHCP IP...';

            setTimeout(() => {
              const dhcpResult = findDHCPLease(dev, port);
              if (dhcpResult.success) {
                statusMsg.className = 'dhcp-status-msg text-[8px] mt-1 font-semibold text-center py-0.5 rounded text-emerald-600 bg-emerald-50 border border-emerald-200';
                statusMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> DHCP Successful!';

                port.ip = dhcpResult.ip;
                port.subnet = dhcpResult.subnet;
                dev.gateway = dhcpResult.gateway;
                dev.dnsServer = dhcpResult.dnsServer;

                ipInput.value = port.ip;
                subnetInput.value = port.subnet;

                [ipInput, subnetInput].forEach(inp => {
                  inp.classList.add('bg-emerald-50', 'border-emerald-300');
                  setTimeout(() => inp.classList.remove('bg-emerald-50', 'border-emerald-300'), 1500);
                });
              } else {
                statusMsg.className = 'dhcp-status-msg text-[8px] mt-1 font-semibold text-center py-0.5 rounded text-rose-600 bg-rose-50 border border-rose-200';
                statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> DHCP Failed: ${dhcpResult.reason}`;

                port.ip = dhcpResult.ip;
                port.subnet = dhcpResult.subnet;
                dev.gateway = dhcpResult.gateway;
                dev.dnsServer = dhcpResult.dnsServer;

                ipInput.value = port.ip;
                subnetInput.value = port.subnet;

                [ipInput, subnetInput].forEach(inp => {
                  inp.classList.add('bg-rose-50', 'border-rose-200');
                  setTimeout(() => inp.classList.remove('bg-rose-50', 'border-rose-200'), 1500);
                });
              }
            }, 1000);
          } else {
            statusMsg.classList.add('hidden');
          }
        };

        radioStatic.addEventListener('change', handleModeChange);
        radioDhcp.addEventListener('change', handleModeChange);
      }

      if (dev.type === 'router') {
        const dhcpId = `dhcp-section-${port.name.replace('/', '-')}`;
        const dhcpSection = div.querySelector(`#${dhcpId}`);
        
        div.querySelector('.dhcp-toggle').onchange = (e) => {
          port.dhcpPool.enabled = e.target.checked;
          if (port.dhcpPool.enabled) {
            dhcpSection.classList.remove('hidden');
            if (!port.dhcpPool.startIp && port.ip) {
              const parts = port.ip.split('.');
              if (parts.length === 4) {
                port.dhcpPool.startIp = `${parts[0]}.${parts[1]}.${parts[2]}.100`;
                div.querySelector('.dhcp-start').value = port.dhcpPool.startIp;
              }
            }
          } else {
            dhcpSection.classList.add('hidden');
          }
        };

        div.querySelector('.dhcp-start').onchange = (e) => {
          port.dhcpPool.startIp = e.target.value;
        };

        div.querySelector('.dhcp-max').onchange = (e) => {
          port.dhcpPool.maxUsers = parseInt(e.target.value) || 50;
        };

        div.querySelector('.dhcp-dns').onchange = (e) => {
          port.dhcpPool.dnsServer = e.target.value;
        };
      }
    }

    container.appendChild(div);
  });
}

function initializeSidePanelCli(dev) {
  const container = document.getElementById('side-content-cli');
  container.innerHTML = `
    <div class="flex-1 flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-3 text-xs leading-relaxed font-mono">
      <div id="cli-output" class="flex-1 overflow-y-auto whitespace-pre-wrap text-sky-400 mb-2 font-mono scroll-smooth max-h-[220px]"></div>
      <div class="flex items-center text-slate-200 border-t border-slate-800/60 pt-2 shrink-0">
        <span id="cli-prompt" class="text-indigo-400 font-bold mr-1 font-mono"></span>
        <input type="text" id="cli-input" class="flex-1 bg-transparent outline-none border-none text-slate-100 font-mono text-xs" autocomplete="off">
      </div>
    </div>
    <div class="text-[9px] text-slate-400 text-center mt-2 font-semibold">
      Type Cisco IOS inspired commands (e.g. <code>show ip route</code>, <code>enable</code>)
    </div>
  `;

  const cliOutput = document.getElementById('cli-output');
  const cliPrompt = document.getElementById('cli-prompt');
  const cliInput = document.getElementById('cli-input');

  cliOutput.textContent = dev.cliHistoryText || '';
  
  const print = (text) => {
    cliOutput.textContent += text;
    dev.cliHistoryText = cliOutput.textContent;
    cliOutput.scrollTop = cliOutput.scrollHeight;
  };

  // Cisco CLI execution engine setup
  if (!dev.cliSession) {
    dev.cliSession = new CiscoCLI(
      dev,
      (text) => print(text),
      (device, target, isContinuous, printCallback) => {
        let targetIp = target;
        const destDev = state.topology.getDeviceByName(target);
        if (destDev) targetIp = destDev.ports[0].ip || '';

        let isHostnameOrDomain = false;
        if (destDev) {
          isHostnameOrDomain = true;
        } else if (target.includes('.') && !/^\d/.test(target)) {
          isHostnameOrDomain = true;
        }

        if (!isHostnameOrDomain && !validateIpAddress(targetIp)) {
          printCallback(`% Invalid IP address or host name: "${target}"\r\n`);
          return;
        }

        device.activePing = {
          target: targetIp,
          targetInput: target,
          continuous: isContinuous,
          count: isContinuous ? 0 : 5,
          sent: 0,
          received: 0,
          terminalType: 'cli',
          startTime: Date.now()
        };

        const res = state.simulator.createPing(device, targetIp);
        if (res.success) {
          updateSimulationPanel();
          if (document.getElementById('realtime-toggle').checked) {
            playSimulation();
          }
        } else {
          printCallback(`% Error routing: ${res.error}\r\n`);
          device.activePing = null;
        }
      }
    );
  } else {
    dev.cliSession.onOutput = (text) => print(text);
  }

  state.activeCliSession = dev.cliSession;
  cliPrompt.textContent = state.activeCliSession.getPrompt();

  if (!dev.cliCommandHistory) dev.cliCommandHistory = [];
  if (dev.cliCommandHistoryIndex === undefined) dev.cliCommandHistoryIndex = 0;

  // Submission handler
  cliInput.onkeydown = (e) => {
    if (dev.activePing) {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        stopActivePing(dev);
      } else {
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      // Just standard abort prompt
      cliOutput.textContent += '^C\r\n';
      dev.cliHistoryText = cliOutput.textContent;
      cliOutput.scrollTop = cliOutput.scrollHeight;
      cliInput.value = '';
      return;
    }

    if (e.key === 'Enter') {
      const val = cliInput.value;
      if (val.trim()) {
        dev.cliCommandHistory.push(val);
      }
      dev.cliCommandHistoryIndex = dev.cliCommandHistory.length;
      cliInput.value = '';
      state.activeCliSession.handleInput(val);
      cliPrompt.textContent = state.activeCliSession.getPrompt();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (dev.cliCommandHistory.length > 0) {
        if (dev.cliCommandHistoryIndex > 0) dev.cliCommandHistoryIndex--;
        cliInput.value = dev.cliCommandHistory[dev.cliCommandHistoryIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (dev.cliCommandHistory.length > 0) {
        if (dev.cliCommandHistoryIndex < dev.cliCommandHistory.length - 1) {
          dev.cliCommandHistoryIndex++;
          cliInput.value = dev.cliCommandHistory[dev.cliCommandHistoryIndex];
        } else {
          dev.cliCommandHistoryIndex = dev.cliCommandHistory.length;
          cliInput.value = '';
        }
      }
    }
  };
}

// WiFi / Wireless client-AP auto-association logic
function updateWirelessConnections() {
  let changed = false;
  
  const clients = state.topology.devices.filter(d => d.type === 'laptop' || d.type === 'smartphone');
  const aps = state.topology.devices.filter(d => d.type === 'access_point');
  
  clients.forEach(client => {
    const clientPort = client.ports[0];
    if (!clientPort) return;
    
    let bestAp = null;
    let minDist = Infinity;
    
    aps.forEach(ap => {
      const ssidMatches = (ap.wirelessSettings.ssid && client.wirelessSettings.ssid && ap.wirelessSettings.ssid === client.wirelessSettings.ssid);
      const isSecured = ap.wirelessSettings.securityEnabled !== false;
      const keyMatches = !isSecured || (ap.wirelessSettings.wpa2Key === client.wirelessSettings.wpa2Key);
      
      if (ssidMatches && keyMatches) {
        const dx = client.x - ap.x;
        const dy = client.y - ap.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= ap.wirelessSettings.radius) {
          if (dist < minDist) {
            minDist = dist;
            bestAp = ap;
          }
        }
      }
    });
    
    const currentLink = clientPort.connectedLink;
    let linkEstablished = false;
    
    if (bestAp) {
      const apPort = bestAp.ports[1]; // AP's Wireless0 port
      
      if (currentLink && 
          ((currentLink.portA === clientPort && currentLink.portB === apPort) ||
           (currentLink.portB === clientPort && currentLink.portA === apPort))) {
        client.wirelessSettings.connectedAP = bestAp;
      } else {
        if (currentLink) {
          state.topology.removeLink(currentLink.id);
        }
        
        const newLink = state.topology.addLink('wireless', client.id, 'Wireless0', bestAp.id, 'Wireless0');
        if (newLink) {
          client.wirelessSettings.connectedAP = bestAp;
          changed = true;
          linkEstablished = true;
        }
      }
    } else {
      if (currentLink) {
        state.topology.removeLink(currentLink.id);
        client.wirelessSettings.connectedAP = null;
        changed = true;
      }
    }

    // Automatically trigger DHCP lease if client port has DHCP enabled and is wireless
    if (client.wirelessSettings.connectedAP) {
      if (clientPort.dhcpEnabled) {
        const ap = client.wirelessSettings.connectedAP;
        const hasValidIp = clientPort.ip && !clientPort.ip.startsWith('169.254') && clientPort.ip !== '0.0.0.0';
        
        // Trigger lease if IP is invalid/empty, if link was just established, or if the AP has DHCP enabled but no lease exists yet
        if (!hasValidIp || linkEstablished || (ap.dhcpSettings && ap.dhcpSettings.enabled && !ap.dhcpSettings.leases[clientPort.mac])) {
          if (ap.dhcpSettings && ap.dhcpSettings.enabled) {
            const lease = findDHCPLease(client, clientPort);
            if (lease) {
              clientPort.ip = lease.ip;
              clientPort.subnet = lease.subnet;
              client.gateway = lease.gateway;
              client.dnsServer = lease.dnsServer;
              changed = true;
            }
          } else {
            // If AP's DHCP server is disabled or off, client falls back to APIPA
            if (!clientPort.ip || !clientPort.ip.startsWith('169.254')) {
              const apipa = generateApipaIp();
              clientPort.ip = apipa;
              clientPort.subnet = '255.255.0.0';
              client.gateway = '';
              client.dnsServer = '';
              changed = true;
            }
          }
        }
      }
    } else {
      // Disconnected from AP. If DHCP enabled, clear IP or set to APIPA
      if (clientPort.dhcpEnabled) {
        if (clientPort.ip && !clientPort.ip.startsWith('169.254')) {
          const apipa = generateApipaIp();
          clientPort.ip = apipa;
          clientPort.subnet = '255.255.0.0';
          client.gateway = '';
          client.dnsServer = '';
          changed = true;
        }
      }
    }
  });
  
  return changed;
}

// Render dynamic wifi coverage range around selected AP
function drawWifiRanges() {
  if (!elWifiRangeGroup) return;
  elWifiRangeGroup.innerHTML = '';
  
  if (state.selectedDevice && state.selectedDevice.type === 'access_point') {
    const ap = state.selectedDevice;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', ap.x);
    circle.setAttribute('cy', ap.y);
    circle.setAttribute('r', ap.wirelessSettings.radius || 180);
    circle.setAttribute('fill', 'rgba(234, 88, 12, 0.05)');
    circle.setAttribute('stroke', '#ea580c');
    circle.setAttribute('stroke-width', '1.5');
    circle.setAttribute('stroke-dasharray', '5,5');
    circle.setAttribute('class', 'wifi-range-circle');
    elWifiRangeGroup.appendChild(circle);
  }
}

// Render inputs in Overview for wireless configuration
function renderWirelessSettings(dev) {
  const container = document.getElementById('side-overview-wireless-container');
  if (!container) return;

  if (dev.type === 'laptop' || dev.type === 'smartphone') {
    const connApName = dev.wirelessSettings.connectedAP ? dev.wirelessSettings.connectedAP.name : 'Disconnected';
    const connApColor = dev.wirelessSettings.connectedAP ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold';
    
    container.innerHTML = `
      <div class="border-t border-slate-100 pt-4 mt-3 space-y-3">
        <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Wireless LAN Settings (Wireless0)</h4>
        
        <div>
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">SSID</label>
          <input type="text" id="wireless-ssid" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" value="${dev.wirelessSettings.ssid}">
        </div>
        
        <div>
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">WPA2 Password</label>
          <input type="password" id="wireless-key" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" value="${dev.wirelessSettings.wpa2Key}">
        </div>

        <div class="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span class="text-slate-500 font-medium">Link Status:</span>
          <span id="wireless-link-status" class="${connApColor}">${connApName}</span>
        </div>
      </div>
    `;

    document.getElementById('wireless-ssid').oninput = (e) => {
      dev.wirelessSettings.ssid = e.target.value;
      updateWirelessConnections();
      drawCables();
      
      const statusSpan = document.getElementById('wireless-link-status');
      if (statusSpan) {
        const connApName = dev.wirelessSettings.connectedAP ? dev.wirelessSettings.connectedAP.name : 'Disconnected';
        const connApColor = dev.wirelessSettings.connectedAP ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold';
        statusSpan.className = connApColor;
        statusSpan.textContent = connApName;
      }
    };

    document.getElementById('wireless-key').oninput = (e) => {
      dev.wirelessSettings.wpa2Key = e.target.value;
      updateWirelessConnections();
      drawCables();
      
      const statusSpan = document.getElementById('wireless-link-status');
      if (statusSpan) {
        const connApName = dev.wirelessSettings.connectedAP ? dev.wirelessSettings.connectedAP.name : 'Disconnected';
        const connApColor = dev.wirelessSettings.connectedAP ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold';
        statusSpan.className = connApColor;
        statusSpan.textContent = connApName;
      }
    };

  } else if (dev.type === 'access_point') {
    const isSecurity = dev.wirelessSettings.securityEnabled !== false;

    container.innerHTML = `
      <div class="border-t border-slate-100 pt-4 mt-3 space-y-3">
        <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-wifi"></i> Wireless Configuration (Wireless0)
        </h4>
        
        <div>
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">SSID</label>
          <input type="text" id="wireless-ssid" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" value="${dev.wirelessSettings.ssid}">
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Enable WPA2 Password</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="wireless-security-toggle" class="sr-only peer" ${isSecurity ? 'checked' : ''}>
            <div class="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        <div id="wireless-password-section" class="${isSecurity ? '' : 'hidden'}">
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">WPA2 Password</label>
          <input type="password" id="wireless-key" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700" value="${dev.wirelessSettings.wpa2Key || ''}">
        </div>

        <div>
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coverage Radius (px)</label>
          <div class="flex items-center gap-2">
            <input type="range" id="wireless-radius" min="80" max="300" step="10" class="flex-1 accent-indigo-600" value="${dev.wirelessSettings.radius}">
            <span id="wireless-radius-val" class="text-xs font-mono font-bold text-slate-600 w-8">${dev.wirelessSettings.radius}px</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wireless-ssid').oninput = (e) => {
      dev.wirelessSettings.ssid = e.target.value;
      updateWirelessConnections();
      drawCables();
    };

    const wKeyInput = document.getElementById('wireless-key');
    if (wKeyInput) {
      wKeyInput.oninput = (e) => {
        dev.wirelessSettings.wpa2Key = e.target.value;
        updateWirelessConnections();
        drawCables();
      };
    }

    const radiusInput = document.getElementById('wireless-radius');
    const radiusVal = document.getElementById('wireless-radius-val');
    radiusInput.oninput = (e) => {
      dev.wirelessSettings.radius = parseInt(e.target.value, 10);
      radiusVal.textContent = `${dev.wirelessSettings.radius}px`;
      updateWirelessConnections();
      drawCables();
      drawWifiRanges();
    };

    document.getElementById('wireless-security-toggle').onchange = (e) => {
      dev.wirelessSettings.securityEnabled = e.target.checked;
      updateWirelessConnections();
      drawCables();
      renderWirelessSettings(dev);
    };

  } else {
    container.innerHTML = '';
  }
}

function renderApServices(dev) {
  const container = document.getElementById('side-content-services');
  if (!container) return;

  // Collect connected client MACs for easy booking suggestion
  const wireless0Port = dev.ports[1];
  const clientMacOptions = [];
  state.topology.links.forEach(link => {
    if (link.type === 'wireless' && (link.portA === wireless0Port || link.portB === wireless0Port)) {
      const clientPort = link.portA === wireless0Port ? link.portB : link.portA;
      if (clientPort && clientPort.device) {
        clientMacOptions.push({ mac: clientPort.mac, name: clientPort.device.name });
      }
    }
  });

  const isDhcp = dev.dhcpSettings.enabled === true;

  // Generate reservations HTML
  let reservationsHtml = '';
  if (dev.dhcpSettings.reservations && dev.dhcpSettings.reservations.length > 0) {
    reservationsHtml = dev.dhcpSettings.reservations.map((res, index) => `
      <div class="flex items-center justify-between text-[10px] bg-slate-50 border border-slate-100 p-1.5 rounded-lg mt-1">
        <div class="font-mono text-slate-600">
          <span class="font-semibold text-slate-800">${res.ip}</span> &larr; ${res.mac}
        </div>
        <button class="text-rose-500 hover:text-rose-700 font-bold delete-booking-btn" data-index="${index}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  } else {
    reservationsHtml = '<div class="text-[10px] text-slate-400 italic text-center py-1">No reservations booked</div>';
  }

  // Generate firewall rules HTML
  let firewallHtml = '';
  if (dev.firewallRules && dev.firewallRules.length > 0) {
    firewallHtml = dev.firewallRules.map((rule, index) => `
      <div class="flex flex-col text-[10px] bg-slate-50 border border-slate-100 p-2 rounded-lg gap-1 relative mt-1">
        <div class="flex justify-between items-center">
          <span class="font-bold uppercase ${rule.action === 'permit' ? 'text-emerald-600' : 'text-rose-600'}">${rule.action}</span>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" class="toggle-rule-btn accent-indigo-600 scale-90" data-index="${index}" ${rule.enabled ? 'checked' : ''}>
              <span class="text-[9px] text-slate-500 font-medium">Enabled</span>
            </label>
            <button class="text-rose-500 hover:text-rose-700 font-bold delete-rule-btn" data-index="${index}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-2 text-[9px] text-slate-500">
          <div>Prot: <span class="font-bold text-slate-700">${rule.protocol.toUpperCase()}</span></div>
          <div>Port: <span class="font-bold text-slate-700">${rule.port}</span></div>
          <div class="col-span-2">Src IP: <span class="font-mono text-slate-700">${rule.srcIp}</span></div>
          <div class="col-span-2">Dest IP: <span class="font-mono text-slate-700">${rule.destIp}</span></div>
        </div>
      </div>
    `).join('');
  } else {
    firewallHtml = '<div class="text-[10px] text-slate-400 italic text-center py-1">No firewall rules defined</div>';
  }

  container.innerHTML = `
    <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
      
      <!-- CARD 1: DHCP Server Settings -->
      <div class="bg-white border border-slate-100 shadow-sm p-3.5 rounded-xl space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-server"></i> DHCP Server
          </h4>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="ap-dhcp-toggle" class="sr-only peer" ${isDhcp ? 'checked' : ''}>
            <div class="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div id="ap-dhcp-fields" class="space-y-3 ${isDhcp ? '' : 'hidden'}">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gateway IP</label>
              <input type="text" id="ap-dhcp-ip" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700" value="${dev.dhcpSettings.ip}">
            </div>
            <div>
              <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subnet Mask</label>
              <input type="text" id="ap-dhcp-subnet" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700" value="${dev.dhcpSettings.subnet}">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start IP</label>
              <input type="text" id="ap-dhcp-start" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700" value="${dev.dhcpSettings.startIp}">
            </div>
            <div>
              <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Users</label>
              <input type="number" id="ap-dhcp-max" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700" value="${dev.dhcpSettings.maxUsers}">
            </div>
          </div>

          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">DNS Server</label>
            <input type="text" id="ap-dhcp-dns" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-700" value="${dev.dhcpSettings.dnsServer}">
          </div>
        </div>
      </div>

      <!-- CARD 2: DHCP Booking (IP Reservations) -->
      <div class="bg-white border border-slate-100 shadow-sm p-3.5 rounded-xl space-y-3 ${isDhcp ? '' : 'hidden'}">
        <div class="border-b border-slate-100 pb-1.5">
          <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-address-book"></i> DHCP IP Booking
          </h4>
        </div>

        <div class="space-y-1.5 max-h-24 overflow-y-auto">
          ${reservationsHtml}
        </div>

        <!-- Add reservation form -->
        <div class="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg space-y-2">
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Add IP Reservation</div>
          
          <div>
            <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Select Client MAC</label>
            <select id="booking-mac-select" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] font-semibold text-slate-700">
              <option value="">-- Choose Connected Client --</option>
              ${clientMacOptions.map(opt => `<option value="${opt.mac}">${opt.name} (${opt.mac})</option>`).join('')}
              <option value="custom">-- Custom MAC Address --</option>
            </select>
          </div>

          <div id="booking-mac-custom-field" class="hidden">
            <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Custom MAC</label>
            <input type="text" id="booking-mac-custom" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px]" placeholder="e.g. 00:60:2F:A2:3B:12">
          </div>

          <div>
            <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reserved IP</label>
            <input type="text" id="booking-ip" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px]" placeholder="e.g. 192.168.1.55">
          </div>

          <button id="add-booking-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-1.5 text-[9px] font-bold transition">
            Add Booking Reservation
          </button>
        </div>
      </div>

      <!-- CARD 3: AP Firewall Manager -->
      <div class="bg-white border border-slate-100 shadow-sm p-3.5 rounded-xl space-y-3">
        <div class="border-b border-slate-100 pb-1.5">
          <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-shield-halved"></i> AP Firewall
          </h4>
        </div>

        <div class="space-y-1.5 max-h-36 overflow-y-auto">
          ${firewallHtml}
        </div>

        <!-- Add firewall rule form -->
        <div class="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg space-y-2">
          <div class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Create Firewall Rule</div>
          
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Action</label>
              <select id="fw-action" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] font-semibold text-slate-700">
                <option value="deny">Deny</option>
                <option value="permit">Permit</option>
              </select>
            </div>
            <div>
              <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Protocol</label>
              <select id="fw-proto" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] font-semibold text-slate-700">
                <option value="any">Any</option>
                <option value="icmp">ICMP</option>
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Source IP / Subnet</label>
            <input type="text" id="fw-src-ip" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px]" value="any" placeholder="e.g. any, 192.168.1.55 or 192.168.1.0/24">
          </div>

          <div>
            <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Destination IP / Subnet</label>
            <input type="text" id="fw-dest-ip" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px]" value="any" placeholder="e.g. any or 10.0.0.0/8">
          </div>

          <div>
            <label class="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Destination Port</label>
            <input type="text" id="fw-port" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px]" value="any" placeholder="e.g. any or 80">
          </div>

          <button id="add-fw-rule-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-1.5 text-[9px] font-bold transition">
            Add Firewall Rule
          </button>
        </div>
      </div>

    </div>
  `;

  // DHCP server inputs basic wire-ups
  const apIpEl = document.getElementById('ap-dhcp-ip');
  if (apIpEl) {
    apIpEl.onchange = (e) => {
      dev.dhcpSettings.ip = e.target.value;
      renewWirelessDhcpLeases(dev);
    };
    document.getElementById('ap-dhcp-subnet').onchange = (e) => {
      dev.dhcpSettings.subnet = e.target.value;
      renewWirelessDhcpLeases(dev);
    };
    document.getElementById('ap-dhcp-start').onchange = (e) => {
      dev.dhcpSettings.startIp = e.target.value;
      renewWirelessDhcpLeases(dev);
    };
    document.getElementById('ap-dhcp-max').onchange = (e) => {
      dev.dhcpSettings.maxUsers = parseInt(e.target.value, 10) || 50;
      renewWirelessDhcpLeases(dev);
    };
    document.getElementById('ap-dhcp-dns').onchange = (e) => {
      dev.dhcpSettings.dnsServer = e.target.value;
      renewWirelessDhcpLeases(dev);
    };
  }

  // Interactive toggle for DHCP
  document.getElementById('ap-dhcp-toggle').onchange = (e) => {
    dev.dhcpSettings.enabled = e.target.checked;
    renewWirelessDhcpLeases(dev);
    renderApServices(dev);
  };

  // DHCP Booking Mac Select Suggestion Change Handler
  const macSelect = document.getElementById('booking-mac-select');
  const customMacField = document.getElementById('booking-mac-custom-field');
  if (macSelect) {
    macSelect.onchange = (e) => {
      if (e.target.value === 'custom') {
        customMacField.classList.remove('hidden');
      } else {
        customMacField.classList.add('hidden');
      }
    };
  }

  // Add DHCP Booking reservation
  const addBookingBtn = document.getElementById('add-booking-btn');
  if (addBookingBtn) {
    addBookingBtn.onclick = () => {
      let mac = macSelect.value;
      if (mac === 'custom') {
        mac = document.getElementById('booking-mac-custom').value.trim();
      }
      const ip = document.getElementById('booking-ip').value.trim();

      if (!mac || !ip) {
        showToast('Please fill in both MAC and IP Address!', 'error');
        return;
      }
      
      dev.dhcpSettings.reservations.push({ mac, ip });
      showToast('IP Reservation added successfully!', 'success');
      renewWirelessDhcpLeases(dev);
      renderApServices(dev);
    };
  }

  // Delete DHCP Booking reservation
  container.querySelectorAll('.delete-booking-btn').forEach(btn => {
    btn.onclick = () => {
      const index = parseInt(btn.getAttribute('data-index'), 10);
      dev.dhcpSettings.reservations.splice(index, 1);
      showToast('IP Reservation removed.', 'success');
      renewWirelessDhcpLeases(dev);
      renderApServices(dev);
    };
  });

  // Add Firewall Rule
  const addFwBtn = document.getElementById('add-fw-rule-btn');
  if (addFwBtn) {
    addFwBtn.onclick = () => {
      const action = document.getElementById('fw-action').value;
      const protocol = document.getElementById('fw-proto').value;
      const srcIp = document.getElementById('fw-src-ip').value.trim();
      const destIp = document.getElementById('fw-dest-ip').value.trim();
      const portVal = document.getElementById('fw-port').value.trim();

      if (!srcIp || !destIp || !portVal) {
        showToast('Please fill in source, destination, and port settings!', 'error');
        return;
      }

      const id = `fw_rule_${Date.now()}`;
      dev.firewallRules.push({
        id,
        action,
        protocol,
        srcIp,
        destIp,
        port: portVal,
        enabled: true
      });
      showToast('Firewall rule added successfully!', 'success');
      renderApServices(dev);
    };
  }

  // Toggle Firewall Rule Enabled state
  container.querySelectorAll('.toggle-rule-btn').forEach(chk => {
    chk.onchange = () => {
      const index = parseInt(chk.getAttribute('data-index'), 10);
      dev.firewallRules[index].enabled = chk.checked;
      showToast(`Rule ${chk.checked ? 'enabled' : 'disabled'}.`, 'success');
    };
  });

  // Delete Firewall Rule
  container.querySelectorAll('.delete-rule-btn').forEach(btn => {
    btn.onclick = () => {
      const index = parseInt(btn.getAttribute('data-index'), 10);
      dev.firewallRules.splice(index, 1);
      showToast('Firewall rule removed.', 'success');
      renderApServices(dev);
    };
  });
}

function findDhcpServer(clientPort, ignoreEnabled = false) {
  const visited = new Set();
  const queue = [];
  
  if (clientPort.connectedLink) {
    queue.push(clientPort.connectedLink);
    visited.add(clientPort.connectedLink.id);
  }
  
  while (queue.length > 0) {
    const link = queue.shift();
    const portA = link.portA;
    const portB = link.portB;
    const ends = [portA, portB];
    
    for (const p of ends) {
      if (p === clientPort) continue;
      
      const d = p.device;
      
      if (d.type === 'router') {
        if (p.status === 'up' && (ignoreEnabled || (p.dhcpPool && p.dhcpPool.enabled)) && p.ip && p.subnet) {
          return d;
        }
      } else if (d.type === 'access_point') {
        if (d.dhcpSettings && (ignoreEnabled || d.dhcpSettings.enabled)) {
          return d;
        }
        // If DHCP is disabled on the AP, act as L2 switch:
        d.ports.forEach(otherPort => {
          if (otherPort !== p && otherPort.connectedLink) {
            if (!visited.has(otherPort.connectedLink.id)) {
              visited.add(otherPort.connectedLink.id);
              queue.push(otherPort.connectedLink);
            }
          }
        });
      } else if (d.type === 'switch') {
        d.ports.forEach(otherPort => {
          if (otherPort !== p && otherPort.connectedLink) {
            if (!visited.has(otherPort.connectedLink.id)) {
              visited.add(otherPort.connectedLink.id);
              queue.push(otherPort.connectedLink);
            }
          }
        });
      }
    }
  }
  
  return null;
}

function renewWirelessDhcpLeases(ap) {
  state.topology.devices.forEach(client => {
    client.ports.forEach(clientPort => {
      if (clientPort.dhcpEnabled) {
        // Find if this clientPort's DHCP server segment is managed by this AP
        const serverDev = findDhcpServer(clientPort, true);
        if (serverDev === ap) {
          if (ap.dhcpSettings && ap.dhcpSettings.enabled) {
            if (ap.dhcpSettings.leases) {
              delete ap.dhcpSettings.leases[clientPort.mac];
            }
            
            const lease = findDHCPLease(client, clientPort);
            if (lease) {
              clientPort.ip = lease.ip;
              clientPort.subnet = lease.subnet;
              client.gateway = lease.gateway;
              client.dnsServer = lease.dnsServer;
            }
          } else {
            const apipa = generateApipaIp();
            clientPort.ip = apipa;
            clientPort.subnet = '255.255.0.0';
            client.gateway = '';
            client.dnsServer = '';
          }

          if (state.selectedDevice === client) {
            const ipInput = document.getElementById('side-desk-ip');
            const subnetInput = document.getElementById('side-desk-subnet');
            const gwInput = document.getElementById('side-desk-gw');
            const dnsInput = document.getElementById('side-desk-dns');
            if (ipInput) ipInput.value = clientPort.ip || '';
            if (subnetInput) subnetInput.value = clientPort.subnet || '';
            if (gwInput) gwInput.value = client.gateway || '';
            if (dnsInput) dnsInput.value = client.dnsServer || '';

            const portIpInput = document.querySelector(`.port-ip[data-port="${clientPort.name}"]`);
            const portSubnetInput = document.querySelector(`.port-subnet[data-port="${clientPort.name}"]`);
            if (portIpInput) portIpInput.value = clientPort.ip || '';
            if (portSubnetInput) portSubnetInput.value = clientPort.subnet || '';
          }
        }
      }
    });
  });
}

// Establish Remote CLI session when Telnet/SSH reply is received
window.establishRemoteSession = function(dev, targetIp, type) {
  if (!dev.pendingRemoteSession) return;
  const sess = dev.pendingRemoteSession;
  dev.pendingRemoteSession = null;

  let targetDev = null;
  state.topology.devices.forEach(d => {
    d.ports.forEach(p => {
      if (p.ip === targetIp) targetDev = d;
    });
  });

  if (!targetDev) {
    sess.outputElement.textContent += `\n% Connection established, but remote host CLI could not be initialized.\n\n`;
    dev.cmdHistoryText = sess.outputElement.textContent;
    return;
  }

  sess.outputElement.textContent += `\nConnection established.\n\n`;
  dev.cmdHistoryText = sess.outputElement.textContent;
  sess.outputElement.scrollTop = sess.outputElement.scrollHeight;

  // Clear prompt label
  document.querySelectorAll('.cmd-prompt-label').forEach(el => el.textContent = '');

  const printRemote = (text) => {
    sess.outputElement.textContent += text.replace(/\r\n/g, '\n');
    dev.cmdHistoryText = sess.outputElement.textContent;
    sess.outputElement.scrollTop = sess.outputElement.scrollHeight;
  };

  const remoteCli = new CiscoCLI(
    targetDev,
    (text) => printRemote(text),
    (device, target, isContinuous, printCallback) => {
      let targetIp = target;
      const destDev = state.topology.getDeviceByName(target);
      if (destDev) targetIp = destDev.ports[0].ip || '';

      let isHostnameOrDomain = false;
      if (destDev) {
        isHostnameOrDomain = true;
      } else if (target.includes('.') && !/^\d/.test(target)) {
        isHostnameOrDomain = true;
      }

      if (!isHostnameOrDomain && !validateIpAddress(targetIp)) {
        printCallback(`% Invalid IP address or host name: "${target}"\r\n`);
        return;
      }

      device.activePing = {
        target: targetIp,
        targetInput: target,
        continuous: isContinuous,
        count: isContinuous ? 0 : 5,
        sent: 0,
        received: 0,
        terminalType: 'remote',
        remoteSourceDev: dev,
        startTime: Date.now()
      };

      const res = state.simulator.createPing(device, targetIp);
      if (res.success) {
        updateSimulationPanel();
        if (document.getElementById('realtime-toggle').checked) {
          playSimulation();
        }
      } else {
        printCallback(`% Error routing: ${res.error}\r\n`);
        device.activePing = null;
      }
    },
    () => {
      closeRemoteSession(dev);
    }
  );

  dev.activeRemoteSession = {
    targetDevice: targetDev,
    cliInstance: remoteCli,
    type: type
  };
};

function closeRemoteSession(dev) {
  if (dev.activeRemoteSession) {
    dev.activeRemoteSession = null;
    document.querySelectorAll('.cmd-prompt-label').forEach(el => el.textContent = 'C:\\>');
    
    const sidePanelOutput = document.getElementById('side-panel-cmd-output');
    const sideCmdOutput = document.getElementById('side-cmd-output');
    const outDiv = sidePanelOutput || sideCmdOutput;
    if (outDiv) {
      outDiv.textContent += `\n% Connection closed by foreign host.\n\n`;
      dev.cmdHistoryText = outDiv.textContent;
      outDiv.scrollTop = outDiv.scrollHeight;
    }
    const inEl = document.getElementById('side-panel-cmd-input') || document.getElementById('side-cmd-input');
    if (inEl) inEl.focus();
  }
}

function validateIpAddress(ip) {
  if (!ip) return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  for (let i = 0; i < 4; i++) {
    const part = parts[i];
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
  }
  return true;
}

function printLineToDeviceConsole(dev, text, noNewline = false) {
  const ending = noNewline ? '' : '\n';
  
  if (dev.activePing && dev.activePing.terminalType === 'remote') {
    const srcDev = dev.activePing.remoteSourceDev;
    if (srcDev && srcDev.activeRemoteSession) {
      srcDev.activeRemoteSession.cliInstance.onOutput(text + (noNewline ? '' : '\r\n'));
    }
    return;
  }

  if (dev.activePing && dev.activePing.terminalType === 'cmd') {
    dev.cmdHistoryText = (dev.cmdHistoryText || '') + text + ending;
    
    const outDiv1 = document.getElementById('side-panel-cmd-output');
    if (outDiv1 && state.selectedDevice === dev && state.currentSideTab === 'cli') {
      outDiv1.textContent = dev.cmdHistoryText;
      outDiv1.scrollTop = outDiv1.scrollHeight;
    }
    const outDiv2 = document.getElementById('side-cmd-output');
    if (outDiv2 && state.selectedDevice === dev && state.currentSideTab === 'desktop' && dev.activeDesktopTool === 'cmd') {
      outDiv2.textContent = dev.cmdHistoryText;
      outDiv2.scrollTop = outDiv2.scrollHeight;
    }
  } else if (dev.activePing && dev.activePing.terminalType === 'cli') {
    dev.cliHistoryText = (dev.cliHistoryText || '') + text + (noNewline ? '' : '\r\n');
    
    const cliOutput = document.getElementById('cli-output');
    if (cliOutput && state.selectedDevice === dev && state.currentSideTab === 'cli') {
      cliOutput.textContent = dev.cliHistoryText;
      cliOutput.scrollTop = cliOutput.scrollHeight;
    }
  }
}

function stopActivePing(dev) {
  if (!dev.activePing) return;
  
  const activePing = dev.activePing;
  dev.activePing = null;
  
  const termType = activePing.terminalType;
  if (termType === 'cmd') {
    const outDiv1 = document.getElementById('side-panel-cmd-output');
    const outDiv2 = document.getElementById('side-cmd-output');
    const outDiv = outDiv1 || outDiv2;
    if (outDiv) {
      outDiv.textContent += `^C\n`;
      
      const lost = activePing.sent - activePing.received;
      const lossPct = activePing.sent > 0 ? Math.round((lost / activePing.sent) * 100) : 0;
      outDiv.textContent += `\nPing statistics for ${activePing.target}:\n`;
      outDiv.textContent += `    Packets: Sent = ${activePing.sent}, Received = ${activePing.received}, Lost = ${lost} (${lossPct}% loss)\n\n`;
      
      dev.cmdHistoryText = outDiv.textContent;
      
      if (outDiv1) {
        outDiv1.textContent = dev.cmdHistoryText;
        outDiv1.scrollTop = outDiv1.scrollHeight;
      }
      if (outDiv2) {
        outDiv2.textContent = dev.cmdHistoryText;
        outDiv2.scrollTop = outDiv2.scrollHeight;
      }
    }
    const inEl1 = document.getElementById('side-panel-cmd-input');
    const inEl2 = document.getElementById('side-cmd-input');
    const inEl = inEl1 || inEl2;
    if (inEl) {
      inEl.value = '';
      inEl.focus();
    }
  } else if (termType === 'cli') {
    const cliOutput = document.getElementById('cli-output');
    const cliPrompt = document.getElementById('cli-prompt');
    const cliInput = document.getElementById('cli-input');
    if (cliOutput) {
      cliOutput.textContent += `^C\n`;
      dev.cliHistoryText = cliOutput.textContent;
      cliOutput.scrollTop = cliOutput.scrollHeight;
    }
    if (cliPrompt && dev.cliSession) {
      cliPrompt.textContent = dev.cliSession.getPrompt();
    }
    if (cliInput) {
      cliInput.value = '';
      cliInput.focus();
    }
  } else if (termType === 'remote') {
    const srcDev = activePing.remoteSourceDev;
    if (srcDev && srcDev.activeRemoteSession) {
      srcDev.activeRemoteSession.cliInstance.onOutput('^C\r\n');
      srcDev.activeRemoteSession.cliInstance.showPrompt();
    }
  }
}

function processActivePings() {
  state.topology.devices.forEach(dev => {
    if (!dev.activePing) return;
    
    const activePing = dev.activePing;
    const history = state.simulator.history;
    let latestEvent = null;
    const matchesDevIp = (ip) => dev.ports.some(p => p.ip === ip) || ip === '127.0.0.1' || ip === 'localhost';
    
    for (let i = history.length - 1; i >= 0; i--) {
      const e = history[i];
      if (e.packet.type === 'ICMP_REPLY' && matchesDevIp(e.packet.destIp) && e.packet.srcIp === activePing.target) {
        latestEvent = e;
        break;
      }
      if (e.packet.type === 'ICMP_REQ' && matchesDevIp(e.packet.srcIp) && e.packet.destIp === activePing.target && e.status === 'dropped') {
        latestEvent = e;
        break;
      }
    }
    
    if (latestEvent) {
      if (latestEvent.packet.type === 'ICMP_REPLY' && latestEvent.status === 'success') {
        activePing.received++;
        const time = Math.round(state.simulator.stepDelay * (history.filter(h => h.packet.id === latestEvent.packet.id).length || 1) / 2);
        
        if (activePing.terminalType === 'cmd') {
          printLineToDeviceConsole(dev, `Reply from ${latestEvent.packet.srcIp}: bytes=32 time=${time}ms TTL=64`);
        } else if (activePing.terminalType === 'remote') {
          const srcDev = activePing.remoteSourceDev;
          if (srcDev && srcDev.activeRemoteSession) {
            srcDev.activeRemoteSession.cliInstance.onOutput('!');
          }
        } else {
          printLineToDeviceConsole(dev, `!`, true);
        }
      } else {
        if (activePing.terminalType === 'cmd') {
          printLineToDeviceConsole(dev, `Request timed out.`);
        } else if (activePing.terminalType === 'remote') {
          const srcDev = activePing.remoteSourceDev;
          if (srcDev && srcDev.activeRemoteSession) {
            srcDev.activeRemoteSession.cliInstance.onOutput('.');
          }
        } else {
          printLineToDeviceConsole(dev, `.`, true);
        }
      }
    } else {
      if (activePing.terminalType === 'cmd') {
        printLineToDeviceConsole(dev, `Request timed out.`);
      } else if (activePing.terminalType === 'remote') {
        const srcDev = activePing.remoteSourceDev;
        if (srcDev && srcDev.activeRemoteSession) {
          srcDev.activeRemoteSession.cliInstance.onOutput('.');
        }
      } else {
        printLineToDeviceConsole(dev, `.`, true);
      }
    }
    
    activePing.sent++;
    
    if (activePing.continuous || activePing.sent < activePing.count) {
      setTimeout(() => {
        if (!dev.activePing) return;
        
        let targetIp = activePing.target;
        const destDev = state.topology.getDeviceByName(activePing.targetInput);
        if (destDev) targetIp = destDev.ports[0].ip || '';
        
        if (!validateIpAddress(targetIp) && !destDev && !activePing.targetInput.includes('.')) {
          if (activePing.terminalType === 'remote') {
            const srcDev = activePing.remoteSourceDev;
            if (srcDev && srcDev.activeRemoteSession) {
              srcDev.activeRemoteSession.cliInstance.onOutput(`Ping: Destination host unreachable (Invalid IP format: ${targetIp})\r\n`);
            }
          } else {
            printLineToDeviceConsole(dev, `Ping: Destination host unreachable (Invalid IP format: ${targetIp})`);
          }
          stopActivePing(dev);
          return;
        }

        const res = state.simulator.createPing(dev, targetIp);
        if (res.success) {
          updateSimulationPanel();
          if (document.getElementById('realtime-toggle').checked) {
            playSimulation();
          }
        } else {
          if (activePing.terminalType === 'cmd') {
            printLineToDeviceConsole(dev, `Request timed out.`);
          } else if (activePing.terminalType === 'remote') {
            const srcDev = activePing.remoteSourceDev;
            if (srcDev && srcDev.activeRemoteSession) {
              srcDev.activeRemoteSession.cliInstance.onOutput('.');
            }
          } else {
            printLineToDeviceConsole(dev, `.`, true);
          }
          processActivePings();
        }
      }, 800);
    } else {
      const lost = activePing.sent - activePing.received;
      const lossPct = Math.round((lost / activePing.sent) * 100);
      
      if (activePing.terminalType === 'cmd') {
        printLineToDeviceConsole(dev, `\nPing statistics for ${activePing.target}:`);
        printLineToDeviceConsole(dev, `    Packets: Sent = ${activePing.sent}, Received = ${activePing.received}, Lost = ${lost} (${lossPct}% loss)`);
      } else if (activePing.terminalType === 'remote') {
        const srcDev = activePing.remoteSourceDev;
        if (srcDev && srcDev.activeRemoteSession) {
          srcDev.activeRemoteSession.cliInstance.onOutput(`\r\nSuccess rate is ${Math.round((activePing.received / activePing.sent) * 100)} percent (${activePing.received}/${activePing.sent})\r\n`);
          srcDev.activeRemoteSession.cliInstance.showPrompt();
        }
      } else {
        printLineToDeviceConsole(dev, `\r\nSuccess rate is ${Math.round((activePing.received / activePing.sent) * 100)} percent (${activePing.received}/${activePing.sent})\r\n`);
      }
      
      dev.activePing = null;
      
      if (activePing.terminalType === 'cli') {
        const cliPrompt = document.getElementById('cli-prompt');
        const cliInput = document.getElementById('cli-input');
        if (cliPrompt && dev.cliSession) {
          cliPrompt.textContent = dev.cliSession.getPrompt();
        }
        if (cliInput) {
          cliInput.value = '';
          cliInput.focus();
        }
      }
    }
  });
}

function executeCmdCommand(dev, line, outputElement) {
  const port = dev.ports[0];
  outputElement.textContent += `C:\\>${line}\n`;
  dev.cmdHistoryText = outputElement.textContent;

  if (line === '') return;

  const tokens = line.split(/\s+/);
  const cmd = tokens[0].toLowerCase();

  if (cmd === 'exit' || cmd === 'logout') {
    if (dev.activeRemoteSession) {
      closeRemoteSession(dev);
    } else {
      if (state.activeDesktopTool === 'cmd') {
        closeSidebarDesktopTool();
      } else {
        deselectDevice();
      }
    }
    return;
  }

  if (cmd === 'ipconfig') {
    outputElement.textContent += `FastEthernet Adapter:\n   IP: ${port.ip || '0.0.0.0'}\n   Subnet: ${port.subnet || '0.0.0.0'}\n   Gateway: ${dev.gateway || '0.0.0.0'}\n   DNS Server: ${dev.dnsServer || '0.0.0.0'}\n\n`;
  } else if (cmd === 'ping') {
    const isContinuous = tokens.includes('-t');
    const target = tokens.find((t, idx) => idx > 0 && t !== '-t');
    if (!target) {
      outputElement.textContent += `Usage: ping <ip_address> [-t]\n\n`;
    } else {
      let targetIp = target;
      let isHostnameOrDomain = false;
      const destDev = state.topology.getDeviceByName(target);
      if (destDev) {
        targetIp = destDev.ports[0].ip || '';
        isHostnameOrDomain = true;
      } else if (target.includes('.') && !/^\d/.test(target)) {
        isHostnameOrDomain = true;
      }
      
      if (!isHostnameOrDomain && !validateIpAddress(targetIp)) {
        outputElement.textContent += `Ping request could not find host ${target}. Please check the name and try again (Invalid IP format).\n\n`;
        dev.cmdHistoryText = outputElement.textContent;
        return;
      }
      
      outputElement.textContent += `\nPinging ${target} with 32 bytes of data:\n`;
      dev.cmdHistoryText = outputElement.textContent;
      
      dev.activePing = {
        target: targetIp,
        targetInput: target,
        continuous: isContinuous,
        count: isContinuous ? 0 : 4,
        sent: 0,
        received: 0,
        terminalType: 'cmd',
        startTime: Date.now()
      };
      
      const res = state.simulator.createPing(dev, targetIp);
      if (res.success) {
        updateSimulationPanel();
        if (document.getElementById('realtime-toggle').checked) {
          playSimulation();
        }
      } else {
        outputElement.textContent += `Ping request could not find host ${target}.\n\n`;
        dev.cmdHistoryText = outputElement.textContent;
        dev.activePing = null;
      }
    }
  } else if (cmd === 'telnet' || cmd === 'ssh') {
    const target = tokens.find((t, idx) => idx > 0 && !t.includes('@'));
    if (!target) {
      outputElement.textContent += `Usage: ${cmd} <ip_address>\n\n`;
    } else {
      let targetIp = target;
      if (cmd === 'ssh' && tokens[1] && tokens[1].includes('@')) {
        targetIp = tokens[1].split('@')[1];
      }
      
      const destDev = state.topology.getDeviceByName(targetIp);
      if (destDev) {
        targetIp = destDev.ports[0].ip || '';
      }

      if (!validateIpAddress(targetIp)) {
        outputElement.textContent += `% Invalid IP address format: "${targetIp}"\n\n`;
        dev.cmdHistoryText = outputElement.textContent;
        return;
      }

      outputElement.textContent += `Connecting to ${targetIp}...\n`;
      dev.cmdHistoryText = outputElement.textContent;
      outputElement.scrollTop = outputElement.scrollHeight;

      dev.pendingRemoteSession = {
        type: cmd,
        targetIp: targetIp,
        outputElement: outputElement
      };

      const res = state.simulator.createPacket(dev, targetIp, cmd === 'telnet' ? 'TELNET_REQ' : 'SSH_REQ', `${cmd.toUpperCase()} Connection Request`);
      if (res.success) {
        updateSimulationPanel();
        if (document.getElementById('realtime-toggle').checked) {
          playSimulation();
        }
      } else {
        outputElement.textContent += `% Connection failed: ${res.error}\n\n`;
        dev.cmdHistoryText = outputElement.textContent;
        dev.pendingRemoteSession = null;
      }
    }
  } else {
    outputElement.textContent += `'${cmd}' is not recognized as an internal command.\n\n`;
  }
  
  dev.cmdHistoryText = outputElement.textContent;
  outputElement.scrollTop = outputElement.scrollHeight;
}

function initializeSidePanelCmd(dev) {
  const container = document.getElementById('side-content-cli');
  container.innerHTML = `
    <div class="flex-1 flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-3 text-xs leading-relaxed font-mono">
      <div id="side-panel-cmd-output" class="flex-1 overflow-y-auto whitespace-pre-wrap text-sky-400 mb-2 font-mono scroll-smooth max-h-[220px]"></div>
      <div class="flex items-center text-slate-200 border-t border-slate-800/60 pt-2 shrink-0">
        <span class="cmd-prompt-label text-slate-400 mr-1 font-mono">C:\\></span>
        <input type="text" id="side-panel-cmd-input" class="flex-1 bg-transparent outline-none border-none text-slate-100 font-mono text-xs" autocomplete="off">
      </div>
    </div>
    <div class="text-[9px] text-slate-400 text-center mt-2 font-semibold">
      Type Command Prompt commands (e.g. <code>ipconfig</code>, <code>ping &lt;ip_address&gt;</code>)
    </div>
  `;

  const outDiv = document.getElementById('side-panel-cmd-output');
  outDiv.textContent = dev.cmdHistoryText || 'NetSim Command shell\nType "ipconfig" or "ping <ip>"\n\n';
  outDiv.scrollTop = outDiv.scrollHeight;

  const promptEl = document.querySelector('#side-content-cli .cmd-prompt-label');
  if (promptEl) {
    promptEl.textContent = dev.activeRemoteSession ? '' : 'C:\\>';
  }

  const inEl = document.getElementById('side-panel-cmd-input');

  if (!dev.cmdCommandHistory) dev.cmdCommandHistory = [];
  if (dev.cmdCommandHistoryIndex === undefined) dev.cmdCommandHistoryIndex = 0;

  inEl.onkeydown = (e) => {
    if (dev.activePing) {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        stopActivePing(dev);
      } else {
        e.preventDefault();
      }
      return;
    }

    if (dev.activeRemoteSession) {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        dev.activeRemoteSession.cliInstance.onOutput('^C\r\n');
        dev.activeRemoteSession.cliInstance.showPrompt();
        inEl.value = '';
        return;
      }
      if (e.key === 'Enter') {
        const val = inEl.value;
        inEl.value = '';
        if (!dev.remoteCommandHistory) dev.remoteCommandHistory = [];
        if (val.trim()) {
          dev.remoteCommandHistory.push(val);
        }
        dev.remoteCommandHistoryIndex = dev.remoteCommandHistory.length;
        
        dev.activeRemoteSession.cliInstance.onOutput(val);
        dev.activeRemoteSession.cliInstance.handleInput(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (dev.remoteCommandHistory && dev.remoteCommandHistory.length > 0) {
          if (dev.remoteCommandHistoryIndex > 0) dev.remoteCommandHistoryIndex--;
          inEl.value = dev.remoteCommandHistory[dev.remoteCommandHistoryIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (dev.remoteCommandHistory && dev.remoteCommandHistory.length > 0) {
          if (dev.remoteCommandHistoryIndex < dev.remoteCommandHistory.length - 1) {
            dev.remoteCommandHistoryIndex++;
            inEl.value = dev.remoteCommandHistory[dev.remoteCommandHistoryIndex];
          } else {
            dev.remoteCommandHistoryIndex = dev.remoteCommandHistory.length;
            inEl.value = '';
          }
        }
      }
      return;
    }

    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      outDiv.textContent += `^C\n`;
      dev.cmdHistoryText = outDiv.textContent;
      outDiv.scrollTop = outDiv.scrollHeight;
      inEl.value = '';
      return;
    }

    if (e.key === 'Enter') {
      const line = inEl.value.trim();
      if (inEl.value.trim()) {
        dev.cmdCommandHistory.push(inEl.value);
      }
      dev.cmdCommandHistoryIndex = dev.cmdCommandHistory.length;
      inEl.value = '';
      executeCmdCommand(dev, line, outDiv);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (dev.cmdCommandHistory.length > 0) {
        if (dev.cmdCommandHistoryIndex > 0) dev.cmdCommandHistoryIndex--;
        inEl.value = dev.cmdCommandHistory[dev.cmdCommandHistoryIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (dev.cmdCommandHistory.length > 0) {
        if (dev.cmdCommandHistoryIndex < dev.cmdCommandHistory.length - 1) {
          dev.cmdCommandHistoryIndex++;
          inEl.value = dev.cmdCommandHistory[dev.cmdCommandHistoryIndex];
        } else {
          dev.cmdCommandHistoryIndex = dev.cmdCommandHistory.length;
          inEl.value = '';
        }
      }
    }
  };
}

function openSidebarDesktopTool(tool) {
  const dev = state.selectedDevice;
  if (!dev) return;
  dev.activeDesktopTool = tool;
  const port = dev.ports[0];
  
  const grid = document.getElementById('desktop-tools-grid');
  const frame = document.getElementById('desktop-tool-frame');

  if (grid) grid.classList.add('hidden');
  if (frame) frame.classList.remove('hidden');

  if (tool === 'ipconfig') {
    if (port.dhcpEnabled === undefined) {
      port.dhcpEnabled = false;
    }
    const isClient = dev.type === 'pc' || dev.type === 'server' || dev.type === 'laptop' || dev.type === 'smartphone';  
    frame.innerHTML = `
      <div class="space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-1">
          <span class="font-bold text-slate-700">IP settings</span>
          <button onclick="closeSidebarDesktopTool()" class="text-indigo-600 font-bold hover:underline text-[10px]">Back</button>
        </div>
        
        <div class="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-100 mb-2 font-semibold">
          <label class="inline-flex items-center cursor-pointer">
            <input type="radio" name="ip-mode" value="static" ${!port.dhcpEnabled ? 'checked' : ''} class="mr-1.5 accent-indigo-600" id="ip-mode-static"> Static
          </label>
          <label class="inline-flex items-center cursor-pointer">
            <input type="radio" name="ip-mode" value="dhcp" ${port.dhcpEnabled ? 'checked' : ''} class="mr-1.5 accent-indigo-600" id="ip-mode-dhcp"> DHCP
          </label>
        </div>

        <div class="space-y-2">
          <div>
            <span class="text-[8px] font-bold text-slate-400 block mb-0.5">IP Address</span>
            <input type="text" id="side-desk-ip" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${port.ip || ''}" ${port.dhcpEnabled ? 'disabled' : ''}>
          </div>
          <div>
            <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Subnet Mask</span>
            <input type="text" id="side-desk-subnet" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${port.subnet || ''}" ${port.dhcpEnabled ? 'disabled' : ''}>
          </div>
          <div>
            <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Gateway IP</span>
            <input type="text" id="side-desk-gw" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${dev.gateway || ''}" ${port.dhcpEnabled ? 'disabled' : ''}>
          </div>
          <div>
            <span class="text-[8px] font-bold text-slate-400 block mb-0.5">DNS Server IP</span>
            <input type="text" id="side-desk-dns" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${dev.dnsServer || ''}" ${port.dhcpEnabled ? 'disabled' : ''}>
          </div>
        </div>
        
        <div id="dhcp-status-container" class="hidden text-[9px] font-semibold p-1.5 rounded-lg border text-center"></div>

        <button id="side-desk-ip-save" class="w-full bg-indigo-600 text-white text-[10px] font-bold py-1.5 px-3 rounded hover:bg-indigo-500 transition shadow-sm">Save Config</button>
      </div>
    `;

    const radioStatic = document.getElementById('ip-mode-static');
    const radioDhcp = document.getElementById('ip-mode-dhcp');
    const ipInput = document.getElementById('side-desk-ip');
    const subnetInput = document.getElementById('side-desk-subnet');
    const gwInput = document.getElementById('side-desk-gw');
    const dnsInput = document.getElementById('side-desk-dns');
    const statusContainer = document.getElementById('dhcp-status-container');

    const updateFieldsDisabledState = () => {
      const isDhcp = radioDhcp.checked;
      ipInput.disabled = isDhcp;
      subnetInput.disabled = isDhcp;
      gwInput.disabled = isDhcp;
      dnsInput.disabled = isDhcp;
    };

    radioStatic.addEventListener('change', updateFieldsDisabledState);
    radioDhcp.addEventListener('change', () => {
      updateFieldsDisabledState();
      triggerDHCPRequest();
    });

    const triggerDHCPRequest = () => {
      statusContainer.classList.remove('hidden');
      statusContainer.className = 'text-[9px] font-semibold p-1.5 rounded-lg border text-amber-600 bg-amber-50 border-amber-200 text-center';
      statusContainer.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Requesting DHCP IP address...';
      
      setTimeout(() => {
        const dhcpResult = findDHCPLease(dev, port);
        if (dhcpResult.success) {
          statusContainer.className = 'text-[9px] font-semibold p-1.5 rounded-lg border text-emerald-600 bg-emerald-50 border-emerald-200 text-center';
          statusContainer.innerHTML = '<i class="fa-solid fa-circle-check"></i> DHCP Request Successful!';
          
          ipInput.value = dhcpResult.ip;
          subnetInput.value = dhcpResult.subnet;
          gwInput.value = dhcpResult.gateway;
          dnsInput.value = dhcpResult.dnsServer;
          
          port.ip = dhcpResult.ip;
          port.subnet = dhcpResult.subnet;
          dev.gateway = dhcpResult.gateway;
          dev.dnsServer = dhcpResult.dnsServer;
          port.dhcpEnabled = true;
          
          [ipInput, subnetInput, gwInput, dnsInput].forEach(inp => {
            inp.classList.add('bg-emerald-50', 'border-emerald-300');
            setTimeout(() => inp.classList.remove('bg-emerald-50', 'border-emerald-300'), 1500);
          });
        } else {
          statusContainer.className = 'text-[9px] font-semibold p-1.5 rounded-lg border text-rose-600 bg-rose-50 border-rose-200 text-center';
          statusContainer.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> DHCP failed. ${dhcpResult.reason}`;
          
          ipInput.value = dhcpResult.ip;
          subnetInput.value = dhcpResult.subnet;
          gwInput.value = dhcpResult.gateway;
          dnsInput.value = dhcpResult.dnsServer;
          
          port.ip = dhcpResult.ip;
          port.subnet = dhcpResult.subnet;
          dev.gateway = dhcpResult.gateway;
          dev.dnsServer = dhcpResult.dnsServer;
          port.dhcpEnabled = true;
          
          [ipInput, subnetInput, gwInput, dnsInput].forEach(inp => {
            inp.classList.add('bg-rose-50', 'border-rose-200');
            setTimeout(() => inp.classList.remove('bg-rose-50', 'border-rose-200'), 1500);
          });
        }
      }, 1000);
    };

    document.getElementById('side-desk-ip-save').onclick = () => {
      port.dhcpEnabled = radioDhcp.checked;
      port.ip = ipInput.value;
      port.subnet = subnetInput.value;
      dev.gateway = gwInput.value;
      dev.dnsServer = dnsInput.value;
      
      showToast(port.dhcpEnabled ? 'DHCP configuration saved!' : 'Static IP configuration saved!', 'success');
      closeSidebarDesktopTool();
    };
  } 
  
  else if (tool === 'cmd') {
    frame.innerHTML = `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between border-b pb-1">
          <span class="font-bold text-slate-700 text-xs">Command Prompt</span>
          <button onclick="closeSidebarDesktopTool()" class="text-indigo-600 font-bold hover:underline text-[10px]">Back</button>
        </div>
        <div class="bg-slate-900 rounded-xl p-3 text-[10px] text-sky-400 leading-normal font-mono h-44 flex flex-col border border-slate-800">
          <div id="side-cmd-output" class="flex-1 overflow-y-auto whitespace-pre-wrap font-mono mb-2"></div>
          <div class="flex items-center border-t border-slate-800/80 pt-1 shrink-0">
            <span class="cmd-prompt-label text-slate-400 mr-1 font-mono">C:\\></span>
            <input type="text" id="side-cmd-input" class="flex-1 bg-transparent border-none outline-none text-white font-mono text-[10px]" autocomplete="off">
          </div>
        </div>
      </div>
    `;

    const outDiv = document.getElementById('side-cmd-output');
    outDiv.textContent = dev.cmdHistoryText || 'NetSim Command shell\nType "ipconfig" or "ping <ip>"\n\n';
    outDiv.scrollTop = outDiv.scrollHeight;

    const promptEl = document.querySelector('#desktop-tool-frame .cmd-prompt-label');
    if (promptEl) {
      promptEl.textContent = dev.activeRemoteSession ? '' : 'C:\\>';
    }

    const inEl = document.getElementById('side-cmd-input');

    if (!dev.cmdCommandHistory) dev.cmdCommandHistory = [];
    if (dev.cmdCommandHistoryIndex === undefined) dev.cmdCommandHistoryIndex = 0;

    inEl.onkeydown = (e) => {
      if (dev.activePing) {
        if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
          stopActivePing(dev);
        } else {
          e.preventDefault();
        }
        return;
      }

      if (dev.activeRemoteSession) {
        if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
          dev.activeRemoteSession.cliInstance.onOutput('^C\r\n');
          dev.activeRemoteSession.cliInstance.showPrompt();
          inEl.value = '';
          return;
        }
        if (e.key === 'Enter') {
          const val = inEl.value;
          inEl.value = '';
          if (!dev.remoteCommandHistory) dev.remoteCommandHistory = [];
          if (val.trim()) {
            dev.remoteCommandHistory.push(val);
          }
          dev.remoteCommandHistoryIndex = dev.remoteCommandHistory.length;
          
          dev.activeRemoteSession.cliInstance.onOutput(val);
          dev.activeRemoteSession.cliInstance.handleInput(val);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (dev.remoteCommandHistory && dev.remoteCommandHistory.length > 0) {
            if (dev.remoteCommandHistoryIndex > 0) dev.remoteCommandHistoryIndex--;
            inEl.value = dev.remoteCommandHistory[dev.remoteCommandHistoryIndex];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (dev.remoteCommandHistory && dev.remoteCommandHistory.length > 0) {
            if (dev.remoteCommandHistoryIndex < dev.remoteCommandHistory.length - 1) {
              dev.remoteCommandHistoryIndex++;
              inEl.value = dev.remoteCommandHistory[dev.remoteCommandHistoryIndex];
            } else {
              dev.remoteCommandHistoryIndex = dev.remoteCommandHistory.length;
              inEl.value = '';
            }
          }
        }
        return;
      }

      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        outDiv.textContent += `^C\n`;
        dev.cmdHistoryText = outDiv.textContent;
        outDiv.scrollTop = outDiv.scrollHeight;
        inEl.value = '';
        return;
      }

      if (e.key === 'Enter') {
        const line = inEl.value.trim();
        if (inEl.value.trim()) {
          dev.cmdCommandHistory.push(inEl.value);
        }
        dev.cmdCommandHistoryIndex = dev.cmdCommandHistory.length;
        inEl.value = '';
        executeCmdCommand(dev, line, outDiv);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (dev.cmdCommandHistory.length > 0) {
          if (dev.cmdCommandHistoryIndex > 0) dev.cmdCommandHistoryIndex--;
          inEl.value = dev.cmdCommandHistory[dev.cmdCommandHistoryIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (dev.cmdCommandHistory.length > 0) {
          if (dev.cmdCommandHistoryIndex < dev.cmdCommandHistory.length - 1) {
            dev.cmdCommandHistoryIndex++;
            inEl.value = dev.cmdCommandHistory[dev.cmdCommandHistoryIndex];
          } else {
            dev.cmdCommandHistoryIndex = dev.cmdCommandHistory.length;
            inEl.value = '';
          }
        }
      }
    };
  } 
  
  else if (tool === 'browser') {
    frame.innerHTML = `
      <div class="space-y-2 text-xs">
        <div class="flex items-center justify-between border-b pb-1">
          <span class="font-bold text-slate-700">Web Browser</span>
          <button onclick="closeSidebarDesktopTool()" class="text-indigo-600 font-bold hover:underline text-[10px]">Back</button>
        </div>
        <div class="flex items-center gap-1">
          <input type="text" id="side-browser-url" class="flex-1 bg-white border border-slate-200 rounded p-1 text-[10px]" placeholder="http://netsim.local">
          <button id="side-browser-go" class="bg-teal-600 text-white font-bold px-2 py-1 rounded text-[10px] hover:bg-teal-500">Go</button>
        </div>
        <div id="side-browser-viewport" class="bg-white border border-slate-150 rounded-lg p-2.5 h-36 overflow-y-auto text-[9px] leading-relaxed text-slate-600 font-sans shadow-inner">
          Enter server IP address or domain name and click Go.
        </div>
      </div>
    `;

    const urlIn = document.getElementById('side-browser-url');
    const view = document.getElementById('side-browser-viewport');

    urlIn.value = dev.browserUrl || '';
    view.innerHTML = dev.browserViewportHtml || 'Enter server IP address or domain name and click Go.';
    
    document.getElementById('side-browser-go').onclick = () => {
      let url = urlIn.value.trim().replace('http://', '').replace('/', '');
      if (!url) return;
      dev.browserUrl = urlIn.value;

      const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url);
      
      const proceedWithIp = (targetIp) => {
        let srv = null;
        state.topology.devices.forEach(d => {
          if (d.type === 'server') {
            d.ports.forEach(p => {
              if (p.ip === targetIp) srv = d;
            });
          }
        });

        if (!srv) {
          view.innerHTML = `<span class="text-rose-500 font-bold font-sans">Error: Connection Timeout to ${targetIp}</span>`;
          dev.browserViewportHtml = view.innerHTML;
          return;
        }

        view.innerHTML = `Connecting to HTTP Server at ${targetIp}...`;
        dev.browserViewportHtml = view.innerHTML;
        
        const res = state.simulator.createPacket(dev, targetIp, 'HTTP_REQ', '/');
                    
        if (res.success) {
          updateSimulationPanel();
          if (document.getElementById('realtime-toggle').checked) {
            playSimulation();
          }
          
          dev.onHTTPResponse = (htmlContent) => {
            view.innerHTML = htmlContent;
            dev.browserViewportHtml = view.innerHTML;
            dev.onHTTPResponse = null;
          };
          
          setTimeout(() => {
            if (dev.onHTTPResponse) {
              view.innerHTML = `<span class="text-rose-500 font-bold font-sans">Error: HTTP connection failed (timeout). Ensure server HTTP service is ON.</span>`;
              dev.browserViewportHtml = view.innerHTML;
              dev.onHTTPResponse = null;
            }
          }, 60000);
        } else {
          view.innerHTML = `<span class="text-rose-500">Network Routing Unreachable</span>`;
          dev.browserViewportHtml = view.innerHTML;
        }
      };

      if (!isIpAddress) {
        view.innerHTML = `Resolving domain name "${url}"...`;
        dev.browserViewportHtml = view.innerHTML;
        
        if (!dev.dnsServer) {
          setTimeout(() => {
            view.innerHTML = `<span class="text-rose-500 font-bold font-sans">Error: DNS server IP is not configured. Go to IP Settings.</span>`;
            dev.browserViewportHtml = view.innerHTML;
          }, 1000);
          return;
        }

        let dnsSrvDev = null;
        state.topology.devices.forEach(d => {
          if (d.type === 'server') {
            d.ports.forEach(p => {
              if (p.ip === dev.dnsServer) dnsSrvDev = d;
            });
          }
        });

        if (!dnsSrvDev) {
          setTimeout(() => {
            view.innerHTML = `<span class="text-rose-500 font-bold font-sans">Error: DNS Server at ${dev.dnsServer} is unreachable.</span>`;
            dev.browserViewportHtml = view.innerHTML;
          }, 1000);
          return;
        }

        const dnsRes = state.simulator.createPacket(dev, dev.dnsServer, 'DNS_REQ', url);
                       
        if (dnsRes.success) {
          updateSimulationPanel();
          if (document.getElementById('realtime-toggle').checked) {
            playSimulation();
          }
          
          dev.onDNSResolved = (resolvedIp) => {
            dev.onDNSResolved = null;
            if (resolvedIp === 'NXDOMAIN') {
              view.innerHTML = `<span class="text-rose-500 font-bold font-sans">Error: DNS Server failed to resolve name "${url}"</span>`;
              dev.browserViewportHtml = view.innerHTML;
            } else {
              view.innerHTML = `Resolved "${url}" to ${resolvedIp}.<br>Connecting...`;
              dev.browserViewportHtml = view.innerHTML;
              setTimeout(() => {
                proceedWithIp(resolvedIp);
              }, 1200);
            }
          };
          
          setTimeout(() => {
            if (dev.onDNSResolved) {
              view.innerHTML = `<span class="text-rose-500 font-bold font-sans">Error: DNS query timed out. Ensure DNS service is ON.</span>`;
              dev.browserViewportHtml = view.innerHTML;
              dev.onDNSResolved = null;
            }
          }, 60000);
          
        } else {
          view.innerHTML = `<span class="text-rose-500 font-bold font-sans">Error: Failed to send DNS request.</span>`;
          dev.browserViewportHtml = view.innerHTML;
        }
      } else {
        proceedWithIp(url);
      }
    };
  }

  else if (tool === 'email') {
    if (!dev.mailConfig) {
      dev.mailConfig = {
        configured: false,
        smtpServer: '',
        pop3Server: '',
        emailAddress: '',
        username: '',
        password: ''
      };
    }
    
    if (!dev.activeMailView) dev.activeMailView = dev.mailConfig.configured ? 'inbox' : 'config';

    const renderMailView = () => {
      const viewState = dev.activeMailView;
      
      if (viewState === 'config') {
        frame.innerHTML = `
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between border-b pb-1">
              <span class="font-bold text-slate-700">Email Settings</span>
              <button onclick="closeSidebarDesktopTool()" class="text-indigo-600 font-bold hover:underline text-[10px]">Back</button>
            </div>
            <div class="space-y-2">
              <div>
                <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Email Address</span>
                <input type="text" id="mail-cfg-addr" placeholder="user1@netsim.com" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${dev.mailConfig.emailAddress}">
              </div>
              <div class="border-t pt-2 mt-2">
                <span class="font-semibold text-slate-500 text-[9px] block mb-1">Server Info</span>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <span class="text-[8px] font-bold text-slate-400 block mb-0.5">SMTP (Outgoing)</span>
                    <input type="text" id="mail-cfg-smtp" placeholder="192.168.1.20" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${dev.mailConfig.smtpServer}">
                  </div>
                  <div>
                    <span class="text-[8px] font-bold text-slate-400 block mb-0.5">POP3 (Incoming)</span>
                    <input type="text" id="mail-cfg-pop3" placeholder="192.168.1.20" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${dev.mailConfig.pop3Server}">
                  </div>
                </div>
              </div>
              <div class="border-t pt-2 mt-2">
                <span class="font-semibold text-slate-500 text-[9px] block mb-1">Login Info</span>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Username</span>
                    <input type="text" id="mail-cfg-user" placeholder="user1" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${dev.mailConfig.username}">
                  </div>
                  <div>
                    <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Password</span>
                    <input type="password" id="mail-cfg-pass" placeholder="password" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700" value="${dev.mailConfig.password}">
                  </div>
                </div>
              </div>
            </div>
            <button id="mail-cfg-save" class="w-full bg-indigo-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg hover:bg-indigo-500 transition shadow-sm">Save Config</button>
          </div>
        `;
        
        document.getElementById('mail-cfg-save').onclick = () => {
          dev.mailConfig.emailAddress = document.getElementById('mail-cfg-addr').value.trim();
          dev.mailConfig.smtpServer = document.getElementById('mail-cfg-smtp').value.trim();
          dev.mailConfig.pop3Server = document.getElementById('mail-cfg-pop3').value.trim();
          dev.mailConfig.username = document.getElementById('mail-cfg-user').value.trim();
          dev.mailConfig.password = document.getElementById('mail-cfg-pass').value.trim();
          
          if (!dev.mailConfig.emailAddress || !dev.mailConfig.smtpServer || !dev.mailConfig.pop3Server || !dev.mailConfig.username || !dev.mailConfig.password) {
            showToast('All fields are required', 'error');
            return;
          }
          
          dev.mailConfig.configured = true;
          dev.activeMailView = 'inbox';
          renderMailView();
          showToast('Mail configuration configured!', 'success');
        };
      } 
      
      else if (viewState === 'inbox') {
        dev.receivedMails = dev.receivedMails || [];
        frame.innerHTML = `
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between border-b pb-1">
              <span class="font-bold text-slate-700">Inbox <span class="text-[8px] text-slate-400">(${dev.mailConfig.emailAddress})</span></span>
              <button onclick="closeSidebarDesktopTool()" class="text-indigo-600 font-bold hover:underline text-[10px]">Back</button>
            </div>
            
            <div class="flex gap-2">
              <button id="mail-btn-compose" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold py-1 rounded-md transition flex items-center justify-center gap-1"><i class="fa-solid fa-pen-to-square"></i> Compose</button>
              <button id="mail-btn-receive" class="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold py-1 rounded-md transition flex items-center justify-center gap-1"><i class="fa-solid fa-arrows-rotate animate-spin-hover"></i> Check Mail</button>
              <button id="mail-btn-setup" class="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition"><i class="fa-solid fa-gear"></i></button>
            </div>
            
            <div class="space-y-1.5 border-t pt-2">
              <div class="text-[8px] font-bold text-slate-400 uppercase">Messages</div>
              <div id="mail-list-container" class="h-28 overflow-y-auto border border-slate-100 rounded-lg p-1 bg-white space-y-1"></div>
            </div>
            
            <div id="mail-read-window" class="hidden bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1 shadow-sm">
              <div class="flex justify-between items-start border-b pb-1">
                <div>
                  <div class="font-bold text-slate-800 text-[9px]" id="mail-view-subject"></div>
                  <div class="text-[7px] text-slate-400" id="mail-view-from"></div>
                </div>
                <button class="text-slate-400 hover:text-slate-600" onclick="document.getElementById('mail-read-window').classList.add('hidden')"><i class="fa-solid fa-xmark"></i></button>
              </div>
              <div class="text-[9px] text-slate-600 whitespace-pre-wrap leading-normal pt-1 font-sans" id="mail-view-body"></div>
            </div>
          </div>
        `;
        
        const listEl = document.getElementById('mail-list-container');
        if (dev.receivedMails.length === 0) {
          listEl.innerHTML = '<div class="text-[9px] text-slate-400 italic text-center py-6">Inbox empty. Click Check Mail.</div>';
        } else {
          dev.receivedMails.forEach((mail) => {
            const row = document.createElement('button');
            row.className = 'w-full text-left p-1.5 rounded hover:bg-slate-50 border border-transparent hover:border-slate-150 transition flex flex-col gap-0.5';
            row.innerHTML = `
              <div class="flex justify-between items-center text-[9px]">
                <span class="font-bold text-slate-700 truncate max-w-[120px]">${mail.from}</span>
                <span class="text-[7px] text-slate-400">${new Date(mail.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div class="text-[8px] text-slate-500 truncate font-semibold">${mail.subject}</div>
            `;
            row.onclick = () => {
              document.getElementById('mail-read-window').classList.remove('hidden');
              document.getElementById('mail-view-subject').textContent = mail.subject;
              document.getElementById('mail-view-from').textContent = `From: ${mail.from}`;
              document.getElementById('mail-view-body').textContent = mail.body;
            };
            listEl.appendChild(row);
          });
        }
      }
    };
    renderMailView();
  }
}

function closeSidebarDesktopTool() {
  const dev = state.selectedDevice;
  if (dev) dev.activeDesktopTool = null;
  state.activeDesktopTool = null;
  const grid = document.getElementById('desktop-tools-grid');
  const frame = document.getElementById('desktop-tool-frame');
  if (grid) grid.classList.remove('hidden');
  if (frame) frame.classList.add('hidden');
}

function updateDeviceElement(device) {
  const g = document.getElementById(device.id);
  if (g) {
    g.setAttribute('transform', `translate(${device.x}, ${device.y})`);
    g.querySelector('text').textContent = device.name;
  }
}

const undoStack = [];

function pushToUndoStack(action) {
  undoStack.push(action);
  if (undoStack.length > 20) {
    undoStack.shift();
  }
}

function triggerUndo() {
  if (undoStack.length === 0) {
    showToast('Nothing to undo', 'info');
    return;
  }
  
  const action = undoStack.pop();
  if (action.type === 'delete_device') {
    const { device, links } = action.data;
    
    // 1. Add device back to topology
    state.topology.devices.push(device);
    
    // 2. Re-create DOM element on canvas
    renderDevice(device);
    
    // 3. Re-create links
    links.forEach(linkData => {
      state.topology.addLink(linkData.type, linkData.devAId, linkData.portAName, linkData.devBId, linkData.portBName);
    });
    
    // 4. Redraw elements
    drawCables();
    updateMetrics();
    selectDevice(device);
    
    showToast(`Restored device: ${device.name}`, 'success');
  }
}

function removeDevice(id) {
  const dev = state.topology.getDevice(id);
  if (!dev) return;

  // Record connected links for undo mapping
  const connectedLinks = state.topology.links.filter(
    link => link.portA.device === dev || link.portB.device === dev
  );

  const linksData = connectedLinks.map(link => ({
    type: link.type,
    devAId: link.portA.device.id,
    portAName: link.portA.name,
    devBId: link.portB.device.id,
    portBName: link.portB.name
  }));

  const removedDev = state.topology.removeDevice(id);
  if (removedDev) {
    pushToUndoStack({
      type: 'delete_device',
      data: {
        device: removedDev,
        links: linksData
      }
    });

    const el = document.getElementById(id);
    if (el) el.remove();
    updateWirelessConnections();
    drawCables();
    updateMetrics();
    deselectDevice();
    showToast(`Deleted ${removedDev.name}. Press Ctrl+Z to undo.`, 'info');
  }
}

// CABLING
function handleCablingInteraction(device) {
  const freePorts = device.ports.filter(p => !p.connectedLink);
  if (freePorts.length === 0) {
    showToast(`No free interfaces on ${device.name}`, 'error');
    return;
  }

  if (!state.cableStartDevice) {
    choosePortModal(device, freePorts, (port) => {
      state.cableStartDevice = device;
      state.cableStartPort = port;

      state.tempCableLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      state.tempCableLine.setAttribute('x1', device.x);
      state.tempCableLine.setAttribute('y1', device.y);
      state.tempCableLine.setAttribute('x2', device.x);
      state.tempCableLine.setAttribute('y2', device.y);
      state.tempCableLine.setAttribute('stroke', '#818cf8');
      state.tempCableLine.setAttribute('stroke-width', '2');
      if (state.selectedTool === 'cable_crossover') {
        state.tempCableLine.setAttribute('stroke-dasharray', '5,5');
      }
      elCablesGroup.appendChild(state.tempCableLine);
    });
  } else {
    if (state.cableStartDevice === device) {
      showToast('Cannot connect to same device!', 'error');
      cancelCabling();
      return;
    }

    choosePortModal(device, freePorts, (port) => {
      const type = state.selectedTool === 'cable_straight' ? 'straight' : 'crossover';
      state.topology.addLink(type, state.cableStartDevice.id, state.cableStartPort.name, device.id, port.name);
      
      cancelCabling();
      drawCables();
      updateMetrics();
      selectTool('select');
    });
  }
}

function cancelCabling() {
  state.cableStartDevice = null;
  state.cableStartPort = null;
  if (state.tempCableLine) {
    state.tempCableLine.remove();
    state.tempCableLine = null;
  }
}

function drawCables() {
  elCablesGroup.innerHTML = '';
  elStatusLightsGroup.innerHTML = '';

  state.topology.links.forEach(link => {
    const portA = link.portA;
    const portB = link.portB;
    const devA = portA.device;
    const devB = portB.device;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('id', link.id);
    
    let clsName = 'link-indicator';
    if (link.type === 'straight') clsName += ' cable-straight';
    else if (link.type === 'crossover') clsName += ' cable-crossover';
    else if (link.type === 'wireless') clsName += ' cable-wireless';

    line.setAttribute('class', clsName);
    line.setAttribute('x1', devA.x);
    line.setAttribute('y1', devA.y);
    line.setAttribute('x2', devB.x);
    line.setAttribute('y2', devB.y);

    if (link.type !== 'wireless') {
      const isUp = portA.status === 'up' && portB.status === 'up';
      line.setAttribute('stroke', isUp ? '#10b981' : '#cbd5e1');
      line.setAttribute('stroke-width', '2.5');
    }

    line.addEventListener('click', (e) => {
      if (state.selectedTool === 'delete') {
        state.topology.removeLink(link.id);
        drawCables();
        updateWirelessConnections();
        updateMetrics();
        selectTool('select');
      }
    });

    elCablesGroup.appendChild(line);

    if (link.type === 'wireless') {
      return; // Skip status lights and port labels for wireless links
    }

    // Cable lights & tags
    const dx = devB.x - devA.x;
    const dy = devB.y - devA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const ux = dx / dist;
      const uy = dy / dist;

      const lightAx = devA.x + ux * 35;
      const lightAy = devA.y + uy * 35;
      const lightBx = devB.x - ux * 35;
      const lightBy = devB.y - uy * 35;

      drawPortLight(lightAx, lightAy, portA.status, `${link.id}_lightA`);
      drawPortLight(lightBx, lightBy, portB.status, `${link.id}_lightB`);

      // Position label circle centered exactly on the device boundary (intersecting the cable)
      const distA = (devA.type === 'pc' ? 22 : 26) + 5.5;
      const labelAx = devA.x + ux * distA;
      const labelAy = devA.y + uy * distA;

      const distB = (devB.type === 'pc' ? 22 : 26) + 5.5;
      const labelBx = devB.x - ux * distB;
      const labelBy = devB.y - uy * distB;

      drawPortLabel(labelAx, labelAy, portA.name, `${link.id}_labelA`);
      drawPortLabel(labelBx, labelBy, portB.name, `${link.id}_labelB`);
    }
  });
}

function updateDeviceCables(device) {
  const connectedLinks = state.topology.links.filter(link => 
    link.portA.device === device || link.portB.device === device
  );

  connectedLinks.forEach(link => {
    const portA = link.portA;
    const portB = link.portB;
    const devA = portA.device;
    const devB = portB.device;

    const line = document.getElementById(link.id);
    if (line) {
      line.setAttribute('x1', devA.x);
      line.setAttribute('y1', devA.y);
      line.setAttribute('x2', devB.x);
      line.setAttribute('y2', devB.y);
    }

    if (link.type === 'wireless') {
      return; // Wireless links have no status lights or labels
    }

    const dx = devB.x - devA.x;
    const dy = devB.y - devA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const ux = dx / dist;
      const uy = dy / dist;

      const lightAx = devA.x + ux * 35;
      const lightAy = devA.y + uy * 35;
      const lightBx = devB.x - ux * 35;
      const lightBy = devB.y - uy * 35;

      const polyA = document.getElementById(`${link.id}_lightA`);
      if (polyA) {
        const size = 4;
        polyA.setAttribute('points', `${lightAx},${lightAy-size} ${lightAx-size},${lightAy+size} ${lightAx+size},${lightAy+size}`);
      }

      const polyB = document.getElementById(`${link.id}_lightB`);
      if (polyB) {
        const size = 4;
        polyB.setAttribute('points', `${lightBx},${lightBy-size} ${lightBx-size},${lightBy+size} ${lightBx+size},${lightBy+size}`);
      }

      const distA = (devA.type === 'pc' ? 22 : 26) + 5.5;
      const labelAx = devA.x + ux * distA;
      const labelAy = devA.y + uy * distA;

      const distB = (devB.type === 'pc' ? 22 : 26) + 5.5;
      const labelBx = devB.x - ux * distB;
      const labelBy = devB.y - uy * distB;

      const groupA = document.getElementById(`${link.id}_labelA`);
      if (groupA) {
        groupA.setAttribute('transform', `translate(${labelAx}, ${labelAy})`);
      }

      const groupB = document.getElementById(`${link.id}_labelB`);
      if (groupB) {
        groupB.setAttribute('transform', `translate(${labelBx}, ${labelBy})`);
      }
    }
  });

  if (state.selectedDevice === device && device.type === 'access_point') {
    drawWifiRanges();
  }
}

function drawPortLight(x, y, status, id = null) {
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  if (id) poly.setAttribute('id', id);
  const size = 4;
  const points = `${x},${y-size} ${x-size},${y+size} ${x+size},${y+size}`;
  poly.setAttribute('points', points);
  poly.setAttribute('class', `link-light ${status}`);
  elStatusLightsGroup.appendChild(poly);
}

function drawPortLabel(x, y, text, id = null) {
  const s = text.replace('FastEthernet', 'fa').replace('GigabitEthernet', 'gi').replace('Ethernet', 'eth');
  const r = 9; // Circular badge radius (smaller to fit neatly)

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  if (id) g.setAttribute('id', id);
  g.setAttribute('transform', `translate(${x}, ${y})`);
  g.setAttribute('pointer-events', 'none');

  const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circ.setAttribute('cx', '0');
  circ.setAttribute('cy', '0');
  circ.setAttribute('r', r);
  circ.setAttribute('fill', '#ffffff');
  circ.setAttribute('stroke', '#475569');
  circ.setAttribute('stroke-width', '0.85');

  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', '0');
  t.setAttribute('y', '0.5'); // Vertical offset correction for perfect centering
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('dominant-baseline', 'middle');
  t.setAttribute('fill', '#334155');
  t.setAttribute('font-family', "'JetBrains Mono', monospace");
  t.setAttribute('font-size', '5.8');
  t.setAttribute('font-weight', '700');
  t.setAttribute('letter-spacing', '-0.15');
  t.textContent = s.toLowerCase();

  g.appendChild(circ);
  g.appendChild(t);
  elStatusLightsGroup.appendChild(g);
}

function choosePortModal(device, ports, callback) {
  const modal = document.getElementById('port-select-modal');
  const dropdown = document.getElementById('port-select-dropdown');
  const chassis = document.getElementById('port-visual-chassis');
  const nameLabel = document.getElementById('port-select-device-name');
  const hoverInfo = document.getElementById('port-select-hover-info');

  // Fill device name
  nameLabel.textContent = device.name;
  
  // Reset hover info
  if (hoverInfo) {
    hoverInfo.textContent = 'Hover over ports to inspect connections';
    hoverInfo.className = 'text-[9px] font-semibold text-slate-400 block text-center mt-2';
  }
  
  // Clear lists
  dropdown.innerHTML = '';
  chassis.innerHTML = '';

  // Get available ports
  const availablePorts = ports;

  // 1. Populate Dropdown with available ports
  availablePorts.forEach(port => {
    const opt = document.createElement('option');
    opt.value = port.name;
    opt.textContent = port.name.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gig');
    dropdown.appendChild(opt);
  });

  // 2. Populate Chassis with all ports on device
  device.ports.forEach(port => {
    const isConnected = port.connectedLink !== null;
    const btn = document.createElement('button');
    btn.setAttribute('data-port', port.name);
    
    // Layout and click handler based on status
    if (isConnected) {
      const otherPort = port.getConnectedPort();
      const connInfo = otherPort ? `${otherPort.device.name} (${otherPort.name.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gig')})` : 'another device';
      
      btn.className = 'w-9 h-8 bg-slate-800 border border-slate-700 text-slate-500 rounded flex flex-col items-center justify-center cursor-not-allowed';
      btn.innerHTML = `<span class="text-[7px] leading-tight font-bold">${port.name.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gig')}</span><span class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>`;
      btn.disabled = true;
      btn.title = `Connected to: ${connInfo}`;
      
      btn.onmouseenter = () => {
        if (hoverInfo) {
          hoverInfo.textContent = `${port.name}: Connected to ${connInfo}`;
          hoverInfo.className = 'text-[9px] font-bold text-rose-500 block text-center mt-2';
        }
      };
      btn.onmouseleave = () => {
        if (hoverInfo) {
          hoverInfo.textContent = 'Hover over ports to inspect connections';
          hoverInfo.className = 'text-[9px] font-semibold text-slate-400 block text-center mt-2';
        }
      };
    } else {
      btn.className = 'w-9 h-8 bg-slate-950 border border-slate-750 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-950/20 rounded flex flex-col items-center justify-center cursor-pointer transition';
      btn.innerHTML = `<span class="text-[7px] leading-tight font-bold">${port.name.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gig')}</span><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5"></span>`;
      btn.title = `${port.name} - Available`;
      
      btn.onmouseenter = () => {
        if (hoverInfo) {
          hoverInfo.textContent = `${port.name}: Available (Click to select)`;
          hoverInfo.className = 'text-[9px] font-bold text-emerald-500 block text-center mt-2';
        }
      };
      btn.onmouseleave = () => {
        if (hoverInfo) {
          hoverInfo.textContent = 'Hover over ports to inspect connections';
          hoverInfo.className = 'text-[9px] font-semibold text-slate-400 block text-center mt-2';
        }
      };
      
      btn.onclick = (e) => {
        e.preventDefault();
        dropdown.value = port.name;
        highlightVisualPort(port.name);
      };
    }
    chassis.appendChild(btn);
  });

  // Helper to highlight active visual chassis button
  const highlightVisualPort = (portName) => {
    chassis.querySelectorAll('button').forEach(b => {
      if (!b.disabled) {
        b.className = 'w-9 h-8 bg-slate-950 border border-slate-750 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-950/20 rounded flex flex-col items-center justify-center cursor-pointer transition';
      }
    });
    const activeBtn = chassis.querySelector(`button[data-port="${portName}"]`);
    if (activeBtn) {
      activeBtn.className = 'w-9 h-8 bg-indigo-600 border border-indigo-400 text-white rounded flex flex-col items-center justify-center cursor-pointer ring-2 ring-indigo-300 ring-offset-1 ring-offset-slate-900 transition';
    }
  };

  // Sync dropdown change to highlight chassis
  dropdown.onchange = () => {
    highlightVisualPort(dropdown.value);
  };

  // Default highlight the first available port
  if (availablePorts.length > 0) {
    dropdown.value = availablePorts[0].name;
    highlightVisualPort(availablePorts[0].name);
  }

  // Position modal next to clicked device without fullscreen overlay
  const rect = elCanvas.getBoundingClientRect();
  const devClientX = rect.left + state.panX + device.x * state.zoom;
  const devClientY = rect.top + state.panY + device.y * state.zoom;

  modal.classList.remove('hidden');

  const modalWidth = 320;
  let posX = devClientX + 35;
  if (posX + modalWidth > window.innerWidth) {
    posX = devClientX - modalWidth - 35;
  }

  modal.style.position = 'fixed';
  modal.style.left = `${posX}px`;
  modal.style.top = `${devClientY - 80}px`;
  modal.style.margin = '0';
  modal.style.transform = 'none';

  // Wire confirm button
  document.getElementById('port-select-confirm').onclick = () => {
    const selectedPortName = dropdown.value;
    const port = availablePorts.find(p => p.name === selectedPortName);
    if (port) {
      modal.classList.add('hidden');
      callback(port);
    }
  };

  // Wire cancel button
  document.getElementById('port-select-cancel').onclick = () => {
    modal.classList.add('hidden');
    cancelCabling();
  };
}

// PINGS
let pingSourceDev = null;
function handlePingPlacement(device) {
  if (!pingSourceDev) {
    pingSourceDev = device;
    showToast(`Select target device to complete Ping from ${device.name}`, 'info');
  } else {
    if (pingSourceDev === device) {
      showToast('Cannot ping self!', 'warning');
      pingSourceDev = null;
      selectTool('select');
      return;
    }

     const res = state.simulator.createPing(pingSourceDev, device);
     if (res.success) {
       showToast('Ping initialized. Click Run/Forward to play.', 'success');
       updateSimulationPanel();
       if (document.getElementById('realtime-toggle').checked) {
         playSimulation();
       }
     } else {
       showToast(res.error, 'error');
     }
    pingSourceDev = null;
    selectTool('select');
  }
}

// METRICS
function updateMetrics() {
  document.getElementById('metric-devices-count').textContent = state.topology.devices.length;
  document.getElementById('metric-links-count').textContent = state.topology.links.length;
}

// LOG DRAWERS
function updateSimulationPanel() {
  const container = document.getElementById('sim-event-list');
  const logContainer = document.getElementById('sim-history-list');
  if (!container) return;

  container.innerHTML = '';

  const allEvents = [...state.simulator.history, ...state.simulator.eventQueue];

  if (allEvents.length === 0) {
    container.innerHTML = '<div class="text-slate-400 text-xs italic p-4 text-center py-10">No simulated traffic packets active</div>';
    logContainer.innerHTML = '<div class="text-slate-400 text-xs italic text-center py-10 font-sans">No routing simulation processes recorded yet.</div>';
    return;
  }

  // Right sidebar drawer list
  allEvents.forEach(event => {
    const p = event.packet;
    const div = document.createElement('div');
    div.className = `p-2.5 bg-slate-50 border-l-4 rounded-xl cursor-pointer hover:bg-indigo-50/40 border border-slate-150 transition flex items-center justify-between text-xs mb-2 ${
      event.status === 'success' ? 'border-l-emerald-500' : 
      event.status === 'dropped' ? 'border-l-rose-500' : 'border-l-indigo-500'
    }`;

    const typeColor = p.type.startsWith('ARP') ? 'text-amber-500' : 'text-indigo-600';
    div.innerHTML = `
      <div>
        <div class="font-bold text-slate-800 flex items-center gap-1.5">
          <span class="${typeColor}">${p.type.startsWith('ARP') ? '⚡' : '✉️'}</span> ${p.type}
        </div>
        <div class="text-[9px] text-slate-400 font-semibold mt-0.5">${p.srcIp} → ${p.destIp}</div>
      </div>
      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
        event.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
        event.status === 'dropped' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
      }">
        ${event.status || 'queued'}
      </span>
    `;

    div.onclick = () => openOsiInspector(event);
    container.appendChild(div);
  });

  // Bottom Center Log panel
  logContainer.innerHTML = '';
  allEvents.forEach(event => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const p = event.packet;
    const pEl = document.createElement('div');
    pEl.className = 'flex items-start gap-2 text-slate-600 hover:text-slate-900';
    
    let logMsg = '';
    if (event.status === 'dropped') {
      logMsg = `Packet ${p.type} dropped at ${event.fromPort ? event.fromPort.device.name : 'hop'}. Reason: Link down or interface unassigned.`;
    } else if (event.status === 'success') {
      logMsg = `ICMP echo reply successfully reached ${p.destIp}. Link delay ~12ms. Status: Success.`;
    } else {
      logMsg = `Forwarding ${p.type} packet (${p.info}) from ${event.fromPort.device.name} to ${event.toPort.device.name}.`;
    }

    const dotColor = event.status === 'success' ? 'bg-emerald-500' : event.status === 'dropped' ? 'bg-rose-500' : 'bg-indigo-500';
    
    pEl.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 shrink-0"></span>
      <span class="font-bold text-slate-400 shrink-0">[${time}]</span>
      <span>${logMsg}</span>
    `;
    logContainer.appendChild(pEl);
  });

  if (typeof updateDynamicStats === 'function') {
    updateDynamicStats();
  }
}

function handleSimulationEvent(event) {
  updateSimulationPanel();

  const p = event.packet;
  const startDev = event.fromPort.device;
  const endDev = event.toPort.device;

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('class', 'sim-packet');
  circle.setAttribute('r', '8');
  circle.setAttribute('style', `--packet-glow: ${p.color}; fill: ${p.color};`);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${startDev.x} ${startDev.y} L ${endDev.x} ${endDev.y}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'none');
  path.setAttribute('id', `path_${event.id}`);

  elPacketsGroup.appendChild(path);
  elPacketsGroup.appendChild(circle);

  circle.style.offsetPath = `path('M ${startDev.x} ${startDev.y} L ${endDev.x} ${endDev.y}')`;
  circle.style.offsetRotate = '0deg';
  
  const delaySec = state.simulator.stepDelay / 1000;
  circle.style.animation = `packet-flow ${delaySec}s cubic-bezier(0.4, 0, 0.2, 1) forwards`;

  setTimeout(() => {
    circle.remove();
    path.remove();
  }, state.simulator.stepDelay);
}

function handleSimulationFinished() {
  showToast('Simulation round finished.', 'success');
  updateSimulationPanel();
  processActivePings();

  // Handle pending remote session timeouts
  state.topology.devices.forEach(dev => {
    if (dev.pendingRemoteSession) {
      const sess = dev.pendingRemoteSession;
      sess.outputElement.textContent += `\n% Connection timed out or remote host not responding.\n\n`;
      dev.cmdHistoryText = sess.outputElement.textContent;
      sess.outputElement.scrollTop = sess.outputElement.scrollHeight;
      dev.pendingRemoteSession = null;
      
      const inEl = document.getElementById('side-panel-cmd-input') || document.getElementById('side-cmd-input');
      if (inEl) inEl.focus();
    }
  });
}

function playSimulation() {
  state.simulationMode = 'run';
  state.simulator.play();

  const rtToggle = document.getElementById('realtime-toggle');
  if (rtToggle) rtToggle.checked = true;

  const playBtn = document.getElementById('btn-play-sim');
  const pauseBtn = document.getElementById('btn-pause-sim');

  if (playBtn) {
    playBtn.className = "bg-white text-emerald-600 shadow-sm border border-slate-200/50 font-bold py-1.5 px-3 rounded-md text-xs transition flex items-center gap-1.5";
  }
  if (pauseBtn) {
    pauseBtn.className = "text-slate-400 hover:text-amber-500 hover:bg-white/50 py-1.5 px-2.5 rounded-md text-xs font-bold transition";
  }

  const statusText = document.getElementById('sim-status-text');
  if (statusText) {
    statusText.textContent = 'Running';
    statusText.className = 'text-sm font-bold text-emerald-600';
  }
  updateDynamicStats();
}

function pauseSimulation() {
  state.simulationMode = 'pause';
  state.simulator.stop();

  const rtToggle = document.getElementById('realtime-toggle');
  if (rtToggle) rtToggle.checked = false;

  const playBtn = document.getElementById('btn-play-sim');
  const pauseBtn = document.getElementById('btn-pause-sim');

  if (playBtn) {
    playBtn.className = "text-slate-400 hover:text-emerald-600 hover:bg-white/50 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center gap-1.5";
  }
  if (pauseBtn) {
    pauseBtn.className = "bg-white text-amber-600 shadow-sm border border-slate-200/50 font-bold py-1.5 px-2.5 rounded-md text-xs transition";
  }

  const statusText = document.getElementById('sim-status-text');
  if (statusText) {
    statusText.textContent = 'Paused';
    statusText.className = 'text-sm font-bold text-amber-500';
  }
  updateDynamicStats();
}

function stepSimulation() {
  state.simulator.step();
}

function clearSimulation() {
  state.simulator.clear();
  elPacketsGroup.innerHTML = '';
  updateSimulationPanel();
}

// OSI inspector dialog
function openOsiInspector(event) {
  state.selectedOsiEvent = event;
  document.getElementById('osi-inspector-modal').classList.remove('hidden');

  document.getElementById('osi-pdu-type').textContent = event.packet.type;
  document.getElementById('osi-pdu-info').textContent = event.packet.info;
  document.getElementById('osi-pdu-src').textContent = `${event.fromPort ? event.fromPort.device.name : 'N/A'} (IP: ${event.packet.srcIp})`;
  document.getElementById('osi-pdu-dest').textContent = `${event.toPort ? event.toPort.device.name : 'N/A'} (IP: ${event.packet.destIp})`;

  selectOsiLayer(1);
}

function closeOsiInspector() {
  document.getElementById('osi-inspector-modal').classList.add('hidden');
  state.selectedOsiEvent = null;
}

function selectOsiLayer(num) {
  document.querySelectorAll('.osi-layer-row').forEach(row => {
    row.className = 'osi-layer-row w-full text-left bg-white text-slate-500 hover:bg-slate-100 border border-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-between transition';
  });

  const active = document.getElementById(`osi-l${num}`);
  if (active) {
    active.className = 'osi-layer-row w-full text-left bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-between transition';
  }

  const inText = document.getElementById('osi-in-desc');
  const outText = document.getElementById('osi-out-desc');
  
  inText.textContent = 'Layer operations unassigned at this hop.';
  outText.textContent = 'Layer operations unassigned at this hop.';

  const event = state.selectedOsiEvent;
  if (!event) return;

  const desc = event.description;
  if (num === 1) {
    inText.textContent = desc.in.l1 || 'Physical signal incoming.';
    outText.textContent = desc.out.l1 || 'Physical signal outgoing.';
  } else if (num === 2) {
    inText.textContent = desc.in.l2 || 'No Data Link header parsed.';
    outText.textContent = desc.out.l2 || 'No MAC framing configured.';
  } else if (num === 3) {
    inText.textContent = desc.in.l3 || 'No IP addresses analyzed.';
    outText.textContent = desc.out.l3 || 'No routing pathways resolved.';
  } else if (num === 4) {
    inText.textContent = desc.in.l4 || 'No Transport layer info parsed.';
    outText.textContent = desc.out.l4 || 'No Transport layer segment configured.';
  } else if (num === 5) {
    inText.textContent = desc.in.l5 || 'No Session layer info parsed.';
    outText.textContent = desc.out.l5 || 'No Session layer segment configured.';
  } else if (num === 6) {
    inText.textContent = desc.in.l6 || 'No Presentation layer info parsed.';
    outText.textContent = desc.out.l6 || 'No Presentation layer segment configured.';
  } else if (num === 7) {
    inText.textContent = desc.in.l7 || 'No Application layer info parsed.';
    outText.textContent = desc.out.l7 || 'No Application layer payload configured.';
  }
}

// Preset Labs
function loadLabTemplate(type) {
  state.topology.clear();
  elDevicesGroup.innerHTML = '';
  elCablesGroup.innerHTML = '';
  elStatusLightsGroup.innerHTML = '';
  elPacketsGroup.innerHTML = '';

  const scenarioSelect = document.getElementById('scenario-select');
  if (scenarioSelect) {
    scenarioSelect.value = type;
  }

  if (type === 'lan') {
    const pc2 = addDevice('pc', 200, 350, 'Pc2');
    const router0 = addDevice('router', 380, 200, 'Router0');
    const ap0 = addDevice('access_point', 620, 200, 'Access_point0');
    const laptop0 = addDevice('laptop', 700, 350, 'Laptop0');

    pc2.ports[0].ip = '192.168.1.2';
    pc2.ports[0].subnet = '255.255.255.0';
    pc2.ports[0].dhcpEnabled = false;
    pc2.gateway = '192.168.1.1';

    const fa0 = router0.getPort('FastEthernet0/0');
    fa0.ip = '192.168.1.1';
    fa0.subnet = '255.255.255.0';
    fa0.status = 'up';

    const fa1 = router0.getPort('FastEthernet0/1');
    fa1.ip = '192.168.1.254';
    fa1.subnet = '255.255.255.0';
    fa1.status = 'up';

    router0.updateConnectedRoutes();

    ap0.ports[0].ip = '192.168.1.253';
    ap0.ports[0].subnet = '255.255.255.0';
    ap0.ports[1].ip = '192.168.1.252';
    ap0.ports[1].subnet = '255.255.255.0';

    ap0.wirelessSettings.ssid = 'NetSim-Wifi';
    ap0.wirelessSettings.securityEnabled = false;
    
    // Enable DHCP Server on the AP
    ap0.dhcpSettings.enabled = true;
    ap0.dhcpSettings.ip = '192.168.1.253'; // AP's management IP, hands out router's IP via auto-detection
    ap0.dhcpSettings.subnet = '255.255.255.0';
    ap0.dhcpSettings.startIp = '192.168.1.100';

    laptop0.ports[0].ip = '';
    laptop0.ports[0].subnet = '';
    laptop0.ports[0].dhcpEnabled = true;
    laptop0.gateway = '';
    laptop0.wirelessSettings.ssid = 'NetSim-Wifi';
    laptop0.wirelessSettings.wpa2Key = '';

    state.topology.addLink('straight', pc2.id, 'FastEthernet0', router0.id, 'FastEthernet0/0');
    state.topology.addLink('straight', router0.id, 'FastEthernet0/1', ap0.id, 'Port1');

    showToast('Loaded preset: Router & Access Point same-subnet bridge.', 'success');
  } 
  
  else if (type === 'routing') {
    const pcL = addDevice('pc', 150, 150, 'PC_Left');
    const swL = addDevice('switch', 240, 280, 'Switch_Left');
    const router = addDevice('router', 380, 200, 'Router_Core');
    const swR = addDevice('switch', 520, 280, 'Switch_Right');
    const pcR = addDevice('pc', 610, 150, 'PC_Right');

    pcL.ports[0].ip = '192.168.1.10';
    pcL.ports[0].subnet = '255.255.255.0';
    pcL.gateway = '192.168.1.1';

    pcR.ports[0].ip = '192.168.2.10';
    pcR.ports[0].subnet = '255.255.255.0';
    pcR.gateway = '192.168.2.1';

    const f0 = router.getPort('FastEthernet0/0');
    f0.ip = '192.168.1.1';
    f0.subnet = '255.255.255.0';
    f0.status = 'up';

    const f1 = router.getPort('FastEthernet0/1');
    f1.ip = '192.168.2.1';
    f1.subnet = '255.255.255.0';
    f1.status = 'up';

    router.updateConnectedRoutes();

    state.topology.addLink('straight', pcL.id, 'FastEthernet0', swL.id, 'FastEthernet0/1');
    state.topology.addLink('straight', swL.id, 'FastEthernet0/2', router.id, 'FastEthernet0/0');
    state.topology.addLink('straight', router.id, 'FastEthernet0/1', swR.id, 'FastEthernet0/1');
    state.topology.addLink('straight', swR.id, 'FastEthernet0/2', pcR.id, 'FastEthernet0');

    showToast('Loaded preset: Static route LAN routing.', 'success');
  } 
  
  else if (type === 'webserver') {
    const pc = addDevice('pc', 180, 200, 'WebClient');
    const sw = addDevice('switch', 300, 300, 'Switch-01');
    const srv = addDevice('server', 420, 200, 'WebServer');

    pc.ports[0].ip = '192.168.1.10';
    pc.ports[0].subnet = '255.255.255.0';
    pc.dnsServer = '192.168.1.20';

    srv.ports[0].ip = '192.168.1.20';
    srv.ports[0].subnet = '255.255.255.0';

    state.topology.addLink('straight', pc.id, 'FastEthernet0', sw.id, 'FastEthernet0/1');
    state.topology.addLink('straight', srv.id, 'FastEthernet0', sw.id, 'FastEthernet0/2');

    showToast('Loaded preset: Web Server (HTTP)', 'success');
  }
  
  else if (type === 'enterprise') {
    const coreRouter = addDevice('router', 380, 200, 'CoreRouter');
    const lanSwitch = addDevice('switch', 240, 320, 'LAN_Switch');
    const localPC = addDevice('pc', 150, 420, 'Local_PC');
    const entServer = addDevice('server', 300, 420, 'Enterprise_Server');

    const hqAP = addDevice('access_point', 550, 200, 'HQ_AP');
    const wirelessLaptop = addDevice('laptop', 650, 320, 'Wireless_Laptop');
    const wirelessPhone = addDevice('smartphone', 530, 350, 'Wireless_Phone');

    const fa0 = coreRouter.getPort('FastEthernet0/0');
    fa0.ip = '192.168.1.1';
    fa0.subnet = '255.255.255.0';
    fa0.status = 'up';

    const fa1 = coreRouter.getPort('FastEthernet0/1');
    fa1.ip = '192.168.2.1';
    fa1.subnet = '255.255.255.0';
    fa1.status = 'up';

    coreRouter.updateConnectedRoutes();

    localPC.ports[0].ip = '192.168.1.10';
    localPC.ports[0].subnet = '255.255.255.0';
    localPC.ports[0].dhcpEnabled = false;
    localPC.gateway = '192.168.1.1';
    localPC.dnsServer = '192.168.1.20';

    entServer.ports[0].ip = '192.168.1.20';
    entServer.ports[0].subnet = '255.255.255.0';
    entServer.ports[0].dhcpEnabled = false;
    entServer.gateway = '192.168.1.1';
    if (entServer.services && entServer.services.dns) {
      entServer.services.dns.enabled = true;
      entServer.services.dns.records = [
        { name: 'enterprise.local', ip: '192.168.1.20' }
      ];
    }

    hqAP.ports[0].ip = '192.168.2.2';
    hqAP.ports[0].subnet = '255.255.255.0';
    hqAP.ports[1].ip = '192.168.2.3';
    hqAP.ports[1].subnet = '255.255.255.0';

    hqAP.wirelessSettings.ssid = 'HQ-WiFi';
    hqAP.wirelessSettings.securityEnabled = false;
    hqAP.wirelessSettings.radius = 200;

    hqAP.dhcpSettings.enabled = true;
    hqAP.dhcpSettings.ip = '192.168.2.2';
    hqAP.dhcpSettings.subnet = '255.255.255.0';
    hqAP.dhcpSettings.startIp = '192.168.2.100';
    hqAP.dhcpSettings.dnsServer = '192.168.1.20';

    wirelessLaptop.ports[0].ip = '';
    wirelessLaptop.ports[0].subnet = '';
    wirelessLaptop.ports[0].dhcpEnabled = true;
    wirelessLaptop.gateway = '';
    wirelessLaptop.dnsServer = '';
    wirelessLaptop.wirelessSettings.ssid = 'HQ-WiFi';
    wirelessLaptop.wirelessSettings.wpa2Key = '';

    wirelessPhone.ports[0].ip = '';
    wirelessPhone.ports[0].subnet = '';
    wirelessPhone.ports[0].dhcpEnabled = true;
    wirelessPhone.gateway = '';
    wirelessPhone.dnsServer = '';
    wirelessPhone.wirelessSettings.ssid = 'HQ-WiFi';
    wirelessPhone.wirelessSettings.wpa2Key = '';

    state.topology.addLink('straight', localPC.id, 'FastEthernet0', lanSwitch.id, 'FastEthernet0/1');
    state.topology.addLink('straight', entServer.id, 'FastEthernet0', lanSwitch.id, 'FastEthernet0/2');
    state.topology.addLink('straight', coreRouter.id, 'FastEthernet0/0', lanSwitch.id, 'FastEthernet0/3');
    state.topology.addLink('straight', coreRouter.id, 'FastEthernet0/1', hqAP.id, 'Port1');

    showToast('Loaded preset: Hybrid Wired/Wireless Enterprise Subnet Routing.', 'success');
  }

  deselectDevice();
  drawCables();
  clearSimulation();
  updateMetrics();
  resetZoomPan();
  playSimulation();
}

// Dynamic stats calculator (Network Traffic and Packet Loss)
function updateDynamicStats() {
  const isPaused = (state.simulationMode === 'pause');
  
  // 1. Packet Loss calculation from simulator history
  const history = state.simulator ? state.simulator.history : [];
  const totalEvents = history.length;
  const droppedEvents = history.filter(e => e.status === 'dropped').length;
  const lossPercent = totalEvents > 0 ? (droppedEvents / totalEvents) * 100 : 0.0;
  
  const lossEl = document.getElementById('metric-packet-loss');
  const lossStatusEl = document.getElementById('metric-packet-loss-status');
  if (lossEl) {
    lossEl.textContent = `${lossPercent.toFixed(1)}%`;
  }
  if (lossStatusEl) {
    if (lossPercent === 0) {
      lossStatusEl.className = 'text-[9px] font-semibold text-emerald-500 block mt-1';
      lossStatusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Excellent';
    } else if (lossPercent <= 5) {
      lossStatusEl.className = 'text-[9px] font-semibold text-indigo-500 block mt-1';
      lossStatusEl.innerHTML = '<i class="fa-solid fa-circle-info"></i> Good';
    } else if (lossPercent <= 15) {
      lossStatusEl.className = 'text-[9px] font-semibold text-amber-500 block mt-1';
      lossStatusEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Warning';
    } else {
      lossStatusEl.className = 'text-[9px] font-semibold text-rose-500 block mt-1';
      lossStatusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Poor';
    }
  }

  // 2. Traffic Rate calculation
  let trafficRate = 0;
  let statusText = '';
  let statusClass = '';
  
  if (isPaused) {
    trafficRate = 0;
    statusText = '<i class="fa-solid fa-pause"></i> Paused';
    statusClass = 'text-[9px] font-semibold text-amber-500 block mt-1';
    
    const devices = state.topology.devices || [];
    const links = state.topology.links || [];
    
    // Count devices by type to calculate base background traffic load
    let numPcs = 0;
    let numServers = 0;
    let numSwitches = 0;
    let numRouters = 0;
    
    devices.forEach(dev => {
      if (dev.type === 'pc') numPcs++;
      else if (dev.type === 'server') numServers++;
      else if (dev.type === 'switch') numSwitches++;
      else if (dev.type === 'router') numRouters++;
    });
    
    // PC: ~1.5 Mbps chatter, Switch: ~3 Mbps STP, Server: ~6 Mbps daemon, Router: ~10 Mbps routing updates
    const baseBackgroundTraffic = (numPcs * 1.5) + (numSwitches * 3.0) + (numServers * 6.0) + (numRouters * 10.0);
    
    // Connection factor: If no cables exist, traffic drops to 0. Otherwise scales with density.
    const linkFactor = links.length === 0 ? 0 : Math.min(2.0, 0.5 + links.length * 0.25);
    
    let idleTraffic = baseBackgroundTraffic * linkFactor;
    if (idleTraffic > 0) {
      // Add slight fluctuation / jitter
      idleTraffic += (Math.random() * 4.0 - 2.0);
      idleTraffic = Math.max(1.0, idleTraffic);
    }

    const queueLength = state.simulator ? state.simulator.eventQueue.length : 0;
    const isTransmitting = queueLength > 0 || (state.simulator && state.simulator.isPlaying);
    
    if (isTransmitting) {
      // Calculate traffic spike depending on the actual protocols flying in the queue
      let packetSpike = 0;
      if (state.simulator && state.simulator.eventQueue.length > 0) {
        state.simulator.eventQueue.forEach(ev => {
          const type = ev.packet ? ev.packet.type : '';
          if (type.startsWith('HTTP')) {
            packetSpike += 180; // Large web asset transfers
          } else if (type.startsWith('SMTP') || type.startsWith('POP3')) {
            packetSpike += 110; // Medium email transfers
          } else if (type.startsWith('DNS')) {
            packetSpike += 35;  // Small DNS query
          } else if (type.startsWith('ARP')) {
            packetSpike += 15;  // Minor ARP requests
          } else {
            packetSpike += 25;  // Pings and miscellaneous traffic
          }
        });
        packetSpike = Math.min(500, packetSpike);
      } else {
        packetSpike = 50;
      }
      
      trafficRate = Math.round(idleTraffic + packetSpike + Math.random() * 15.0);
      statusText = '<i class="fa-solid fa-arrow-trend-up"></i> Active Transmission';
      statusClass = 'text-[9px] font-semibold text-indigo-500 block mt-1';
    } else {
      trafficRate = Math.round(idleTraffic);
      statusText = links.length === 0 
        ? '<i class="fa-solid fa-link-slash"></i> Offline (No Cables)' 
        : '<i class="fa-solid fa-arrow-down-long"></i> Idle (Background)';
      statusClass = links.length === 0 
        ? 'text-[9px] font-semibold text-rose-400 block mt-1' 
        : 'text-[9px] font-semibold text-slate-400 block mt-1';
    }
    
    // Update sidebar live stats
    const liveBw = document.getElementById('live-stat-bandwidth');
    if (liveBw) {
      liveBw.textContent = `${trafficRate} Mbps`;
    }
    const liveLat = document.getElementById('live-stat-latency');
    if (liveLat) {
      const latVal = (isTransmitting ? (5.0 + Math.random() * 4.0) : (links.length === 0 ? 0 : 10.0 + Math.random() * 3.0)).toFixed(1);
      liveLat.textContent = `${latVal} ms`;
    }
    const livePackets = document.getElementById('live-stat-packets');
    if (livePackets) {
      const totalPackets = history.length + queueLength;
      livePackets.textContent = totalPackets.toLocaleString();
    }
  }

  const trafficEl = document.getElementById('metric-traffic-rate');
  const trafficStatusEl = document.getElementById('metric-traffic-status');
  if (trafficEl) {
    trafficEl.textContent = `${trafficRate} Mbps`;
  }
  if (trafficStatusEl) {
    trafficStatusEl.className = statusClass;
    trafficStatusEl.innerHTML = statusText;
  }

  // 3. Latency Card calculation (Top Metrics Row)
  const metricLat = document.getElementById('metric-latency');
  const metricLatStatus = document.getElementById('metric-latency-status');
  if (metricLat) {
    if (isPaused) {
      metricLat.textContent = '0.0 ms';
      if (metricLatStatus) {
        metricLatStatus.className = 'text-[9px] font-semibold text-amber-500 block mt-1';
        metricLatStatus.innerHTML = '<i class="fa-solid fa-pause"></i> Paused';
      }
    } else {
      const queueLength = state.simulator ? state.simulator.eventQueue.length : 0;
      const isTransmitting = queueLength > 0 || (state.simulator && state.simulator.isPlaying);
      const latVal = (isTransmitting ? (5.0 + Math.random() * 4.0) : (10.0 + Math.random() * 3.0)).toFixed(1);
      metricLat.textContent = `${latVal} ms`;
      if (metricLatStatus) {
        if (parseFloat(latVal) < 10.0) {
          metricLatStatus.className = 'text-[9px] font-semibold text-emerald-500 block mt-1';
          metricLatStatus.innerHTML = '<i class="fa-solid fa-bolt"></i> Low Latency';
        } else {
          metricLatStatus.className = 'text-[9px] font-semibold text-indigo-500 block mt-1';
          metricLatStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Stable';
        }
      }
    }
  }

  // Update sparklines (if they still exist in the DOM)
  const bwPath = document.getElementById('sparkline-bandwidth-path');
  const latPath = document.getElementById('sparkline-latency-path');
  
  if (isPaused) {
    if (bwPath) bwPath.setAttribute('d', 'M 0,25 L 30,25 L 60,25 L 90,25 L 120,25');
    if (latPath) latPath.setAttribute('d', 'M 0,20 L 30,20 L 60,20 L 90,20 L 120,20');
  } else {
    const qLen = state.simulator ? state.simulator.eventQueue.length : 0;
    const isTransmitting = qLen > 0 || (state.simulator && state.simulator.isPlaying);
    const offsetMax = isTransmitting ? 12 : 3;
    const offsetMin = isTransmitting ? -12 : -3;
    
    if (bwPath) {
      const o1 = Math.round(Math.random() * (offsetMax - offsetMin) + offsetMin);
      const o2 = Math.round(Math.random() * (offsetMax - offsetMin) + offsetMin);
      const o3 = Math.round(Math.random() * (offsetMax - offsetMin) + offsetMin);
      bwPath.setAttribute('d', `M 0,25 Q 15,${20+o1} 30,20 T 60,${20-o2} T 90,25 T 120,${20+o3}`);
    }
    if (latPath) {
      const o1 = Math.round(Math.random() * (offsetMax - offsetMin) + offsetMin);
      const o2 = Math.round(Math.random() * (offsetMax - offsetMin) + offsetMin);
      latPath.setAttribute('d', `M 0,${20+o1} T 30,22 T 60,${18-o2} T 90,${15+o1} T 120,20`);
    }
  }
}

// dynamic stats & clock loop for mockup simulation
function startUINoiseLoops() {
  // 1. Clock counter
  let seconds = 930; // 00:15:30 representation
  setInterval(() => {
    if (state.simulationMode === 'run') {
      seconds++;
      const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      document.getElementById('sim-time-text').textContent = `${hrs}:${mins}:${secs}`;
    }
  }, 1000);

  // 2. Stats sparkline update loop
  setInterval(() => {
    updateDynamicStats();
  }, 1500);
}

// Alerts Toast helper
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const div = document.createElement('div');
  let bg = 'bg-white border-slate-200 text-slate-700';
  if (type === 'success') bg = 'bg-emerald-50 border-emerald-200 text-emerald-700';
  else if (type === 'error') bg = 'bg-rose-50 border-rose-200 text-rose-700';
  else if (type === 'warning') bg = 'bg-amber-50 border-amber-200 text-amber-700';

  div.className = `p-3 rounded-xl border shadow-sm text-xs font-semibold backdrop-blur-md flex items-center gap-2 ${bg}`;
  div.textContent = msg;

  container.appendChild(div);

  setTimeout(() => div.remove(), 4000);
}

// Render Services configuration panel inside Server side drawer sheet
function renderSidePanelServices(dev) {
  const container = document.getElementById('side-content-services');
  if (!container) return;

  // Track active sub-tab for this server
  if (!dev.activeServiceTab) dev.activeServiceTab = 'http';

  container.innerHTML = `
    <div class="space-y-4 font-sans text-xs">
      <!-- Service Sub-tabs selection -->
      <div class="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold text-slate-500">
        <button id="service-subtab-http" class="flex-1 py-1 rounded text-center" onclick="selectServiceSubTab('http')">HTTP</button>
        <button id="service-subtab-dns" class="flex-1 py-1 rounded text-center" onclick="selectServiceSubTab('dns')">DNS</button>
        <button id="service-subtab-mail" class="flex-1 py-1 rounded text-center" onclick="selectServiceSubTab('mail')">MAIL</button>
      </div>

      <!-- HTTP Web Server Section -->
      <div id="service-panel-http" class="space-y-3 hidden">
        <div class="flex items-center justify-between border-b pb-1.5">
          <span class="font-bold text-slate-700">HTTP Web Server</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" id="srv-http-toggle" class="sr-only peer" ${dev.services.http.enabled ? 'checked' : ''}>
            <div class="relative w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        <div class="space-y-1">
          <span class="text-[8px] font-bold text-slate-400 block uppercase">Index HTML Content</span>
          <textarea id="srv-http-content" class="w-full h-32 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-normal resize-none">${dev.services.http.content}</textarea>
        </div>
        <button id="srv-http-save" class="w-full bg-indigo-600 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg hover:bg-indigo-500 transition shadow-sm">Save Web Content</button>
      </div>

      <!-- DNS Domain Server Section -->
      <div id="service-panel-dns" class="space-y-3 hidden">
        <div class="flex items-center justify-between border-b pb-1.5">
          <span class="font-bold text-slate-700">DNS Server Service</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" id="srv-dns-toggle" class="sr-only peer" ${dev.services.dns.enabled ? 'checked' : ''}>
            <div class="relative w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        
        <!-- Add DNS Record inputs -->
        <div class="bg-slate-50 border border-slate-100 p-2.5 rounded-xl space-y-2">
          <span class="font-bold text-slate-700 text-[10px] block font-semibold">Add DNS Record</span>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Domain Name</span>
              <input type="text" id="srv-dns-name" placeholder="netsim.local" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] font-semibold text-slate-700">
            </div>
            <div>
              <span class="text-[8px] font-bold text-slate-400 block mb-0.5">IP Address</span>
              <input type="text" id="srv-dns-ip" placeholder="192.168.1.20" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] font-semibold text-slate-700">
            </div>
          </div>
          <button id="srv-dns-add" class="w-full bg-teal-600 text-white text-[9px] font-bold py-1 px-3 rounded-lg hover:bg-teal-500 transition">Add Record</button>
        </div>

        <!-- DNS Records list rendering -->
        <div class="space-y-1">
          <span class="text-[8px] font-bold text-slate-400 block uppercase">Host Records</span>
          <div id="srv-dns-list" class="max-h-24 overflow-y-auto space-y-1 pr-1"></div>
        </div>
      </div>

      <!-- MAIL Server Section -->
      <div id="service-panel-mail" class="space-y-3 hidden">
        <div class="flex items-center justify-between border-b pb-1.5">
          <span class="font-bold text-slate-700">SMTP/POP3 Mail Server</span>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" id="srv-mail-toggle" class="sr-only peer" ${dev.services.mail.enabled ? 'checked' : ''}>
            <div class="relative w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div>
          <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Mail Domain</span>
          <input type="text" id="srv-mail-domain" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] font-semibold text-slate-700" value="${dev.services.mail.domain || ''}">
        </div>

        <!-- Add Mail User account inputs -->
        <div class="bg-slate-50 border border-slate-100 p-2.5 rounded-xl space-y-2">
          <span class="font-bold text-slate-700 text-[10px] block font-semibold font-mono">Create Mail User</span>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Username</span>
              <input type="text" id="srv-mail-user" placeholder="user" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700">
            </div>
            <div>
              <span class="text-[8px] font-bold text-slate-400 block mb-0.5">Password</span>
              <input type="password" id="srv-mail-pass" placeholder="password" class="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700">
            </div>
          </div>
          <button id="srv-mail-add" class="w-full bg-teal-600 text-white text-[9px] font-bold py-1 px-3 rounded-lg hover:bg-teal-500 transition">Create User Account</button>
        </div>

        <!-- Mail accounts list rendering -->
        <div class="space-y-1">
          <span class="text-[8px] font-bold text-slate-400 block uppercase">Accounts</span>
          <div id="srv-mail-users-list" class="max-h-20 overflow-y-auto space-y-1 pr-1"></div>
        </div>
      </div>
    </div>
  `;

  // Select service sub-tab toggle handler
  window.selectServiceSubTab = (subtab) => {
    dev.activeServiceTab = subtab;
    
    container.querySelectorAll('[id^="service-subtab-"]').forEach(btn => {
      btn.className = 'flex-1 py-1 rounded text-center transition text-slate-500';
    });
    
    const actBtn = document.getElementById(`service-subtab-${subtab}`);
    if (actBtn) {
      actBtn.className = 'flex-1 py-1 bg-white text-indigo-600 shadow-sm rounded text-center font-extrabold';
    }

    const panelHttp = document.getElementById('service-panel-http');
    const panelDns = document.getElementById('service-panel-dns');
    const panelMail = document.getElementById('service-panel-mail');

    if (panelHttp) panelHttp.classList.add('hidden');
    if (panelDns) panelDns.classList.add('hidden');
    if (panelMail) panelMail.classList.add('hidden');

    const activePanel = document.getElementById(`service-panel-${subtab}`);
    if (activePanel) activePanel.classList.remove('hidden');
  };

  // Trigger initial selection
  selectServiceSubTab(dev.activeServiceTab);

  // Bind Web server controls
  const httpToggle = document.getElementById('srv-http-toggle');
  if (httpToggle) {
    httpToggle.onchange = (e) => {
      dev.services.http.enabled = e.target.checked;
      showToast(`HTTP server service ${dev.services.http.enabled ? 'ON' : 'OFF'}`, 'info');
    };
  }

  const httpSave = document.getElementById('srv-http-save');
  if (httpSave) {
    httpSave.onclick = () => {
      const textVal = document.getElementById('srv-http-content').value;
      dev.services.http.content = textVal;
      showToast('HTTP website content updated!', 'success');
    };
  }

  // Bind DNS server controls
  const dnsToggle = document.getElementById('srv-dns-toggle');
  if (dnsToggle) {
    dnsToggle.onchange = (e) => {
      dev.services.dns.enabled = e.target.checked;
      showToast(`DNS domain service ${dev.services.dns.enabled ? 'ON' : 'OFF'}`, 'info');
    };
  }

  const renderDnsList = () => {
    const listEl = document.getElementById('srv-dns-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    if (!dev.services.dns.records || dev.services.dns.records.length === 0) {
      listEl.innerHTML = '<div class="text-[9px] text-slate-400 italic text-center py-2">No DNS records configured.</div>';
      return;
    }

    dev.services.dns.records.forEach((record, index) => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono';
      item.innerHTML = `
        <div class="text-slate-700">
          <span class="font-bold text-indigo-600">${record.name}</span> &rarr; <span>${record.ip}</span>
        </div>
        <button class="text-rose-500 hover:text-rose-700 font-bold px-1" onclick="deleteDnsRecord(${index})">
          <i class="fa-solid fa-trash-can text-[9px]"></i>
        </button>
      `;
      listEl.appendChild(item);
    });
  };

  window.deleteDnsRecord = (idx) => {
    dev.services.dns.records.splice(idx, 1);
    renderDnsList();
    showToast('DNS record deleted', 'warning');
  };

  const dnsAddBtn = document.getElementById('srv-dns-add');
  if (dnsAddBtn) {
    dnsAddBtn.onclick = () => {
      const name = document.getElementById('srv-dns-name').value.trim();
      const ip = document.getElementById('srv-dns-ip').value.trim();
      if (!name || !ip) {
        showToast('Please enter both domain name and IP Address', 'error');
        return;
      }
      dev.services.dns.records.push({ name, ip });
      document.getElementById('srv-dns-name').value = '';
      document.getElementById('srv-dns-ip').value = '';
      renderDnsList();
      showToast('DNS record added!', 'success');
    };
  }

  renderDnsList();

  // Bind Mail server controls
  const mailToggle = document.getElementById('srv-mail-toggle');
  if (mailToggle) {
    mailToggle.onchange = (e) => {
      dev.services.mail.enabled = e.target.checked;
      showToast(`Mail service ${dev.services.mail.enabled ? 'ON' : 'OFF'}`, 'info');
    };
  }

  const mailDomain = document.getElementById('srv-mail-domain');
  if (mailDomain) {
    mailDomain.onchange = (e) => {
      dev.services.mail.domain = e.target.value.trim();
    };
  }

  const renderMailUsersList = () => {
    const listEl = document.getElementById('srv-mail-users-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!dev.services.mail.users || dev.services.mail.users.length === 0) {
      listEl.innerHTML = '<div class="text-[9px] text-slate-400 italic text-center py-2">No user mail accounts.</div>';
      return;
    }

    dev.services.mail.users.forEach((user, index) => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono';
      item.innerHTML = `
        <div class="text-slate-700">
          <span class="font-bold text-slate-800">${user.username}@${dev.services.mail.domain || 'netsim.com'}</span>
          <span class="text-slate-400 text-[8px]">(${user.mails ? user.mails.length : 0} emails)</span>
        </div>
        <button class="text-rose-500 hover:text-rose-700 font-bold px-1" onclick="deleteMailUser(${index})">
          <i class="fa-solid fa-trash-can text-[9px]"></i>
        </button>
      `;
      listEl.appendChild(item);
    });
  };

  window.deleteMailUser = (idx) => {
    dev.services.mail.users.splice(idx, 1);
    renderMailUsersList();
    showToast('Mail account deleted', 'warning');
  };

  const mailAddBtn = document.getElementById('srv-mail-add');
  if (mailAddBtn) {
    mailAddBtn.onclick = () => {
      const u = document.getElementById('srv-mail-user').value.trim();
      const p = document.getElementById('srv-mail-pass').value.trim();
      if (!u || !p) {
        showToast('Please enter both username and password', 'error');
        return;
      }
      if (dev.services.mail.users.some(usr => usr.username.toLowerCase() === u.toLowerCase())) {
        showToast('Account username already exists!', 'error');
        return;
      }
      dev.services.mail.users.push({ username: u, password: p, mails: [] });
      document.getElementById('srv-mail-user').value = '';
      document.getElementById('srv-mail-pass').value = '';
      renderMailUsersList();
      showToast('Mail user account created!', 'success');
    };
  }

  renderMailUsersList();
}

function findDHCPLease(clientDevice, clientPort) {
  const visited = new Set();
  const queue = [];
  
  if (clientPort.connectedLink) {
    queue.push(clientPort.connectedLink);
    visited.add(clientPort.connectedLink.id);
  }
  
  let dhcpServerPort = null;
  let dhcpServerDevice = null;
  
  while (queue.length > 0) {
    const link = queue.shift();
    const portA = link.portA;
    const portB = link.portB;
    const ends = [portA, portB];
    
    for (const p of ends) {
      if (p === clientPort) continue;
      
      const d = p.device;
      
      if (d.type === 'router') {
        if (p.status === 'up' && p.dhcpPool && p.dhcpPool.enabled && p.ip && p.subnet) {
          dhcpServerPort = p;
          dhcpServerDevice = d;
          break;
        }
      } else if (d.type === 'access_point') {
        if (d.dhcpSettings && d.dhcpSettings.enabled) {
          dhcpServerDevice = d;
          break;
        }
        // If DHCP is disabled on the AP, act as L2 switch:
        d.ports.forEach(otherPort => {
          if (otherPort !== p && otherPort.connectedLink) {
            if (!visited.has(otherPort.connectedLink.id)) {
              visited.add(otherPort.connectedLink.id);
              queue.push(otherPort.connectedLink);
            }
          }
        });
      } else if (d.type === 'switch') {
        d.ports.forEach(otherPort => {
          if (otherPort !== p && otherPort.connectedLink) {
            if (!visited.has(otherPort.connectedLink.id)) {
              visited.add(otherPort.connectedLink.id);
              queue.push(otherPort.connectedLink);
            }
          }
        });
      }
    }
    
    if (dhcpServerPort || dhcpServerDevice) break;
  }
  
  const apipa = generateApipaIp();
  
  if (dhcpServerPort || dhcpServerDevice) {
    const isAp = dhcpServerDevice && dhcpServerDevice.type === 'access_point';
    const pool = isAp ? dhcpServerDevice.dhcpSettings : dhcpServerPort.dhcpPool;
    const subnetStr = isAp ? pool.subnet : dhcpServerPort.subnet;
    let gatewayStr = isAp ? pool.ip : dhcpServerPort.ip;
    if (isAp) {
      let routerPort = null;
      state.topology.devices.forEach(d => {
        if (d.type === 'router') {
          d.ports.forEach(p => {
            if (p.status === 'up' && p.ip && ipInSubnet(p.ip, pool.ip, pool.subnet)) {
              routerPort = p;
            }
          });
        }
      });
      if (routerPort) {
        gatewayStr = routerPort.ip;
      }
    }
    const dnsServerStr = pool.dnsServer || '8.8.8.8';
    
    if (!pool.leases) {
      pool.leases = {};
    }
    
    let allocatedIp = '';
    
    // Check reservations (IP bookings)
    if (pool.reservations) {
      const reservation = pool.reservations.find(r => r.mac.toUpperCase() === clientPort.mac.toUpperCase());
      if (reservation && reservation.ip) {
        allocatedIp = reservation.ip;
      }
    }
    
    if (!allocatedIp) {
      const cachedIp = pool.leases[clientPort.mac];
      let cachedValid = false;
      if (cachedIp) {
        const startIpStr = pool.startIp || '192.168.1.100';
        const maxUsers = pool.maxUsers || 50;
        const startInt = ipToInt(startIpStr);
        const cachedInt = ipToInt(cachedIp);
        
        if (startInt && cachedInt && cachedInt >= startInt && cachedInt < startInt + maxUsers) {
          const poolSubnet = pool.subnet || (isAp ? '255.255.255.0' : dhcpServerPort.subnet);
          const poolNetwork = isAp ? pool.ip : dhcpServerPort.ip;
          if (ipInSubnet(cachedIp, poolNetwork, poolSubnet)) {
            cachedValid = true;
          }
        }
      }
      
      if (cachedValid) {
        allocatedIp = cachedIp;
      } else {
        if (cachedIp) {
          delete pool.leases[clientPort.mac];
        }
        const startIpStr = pool.startIp || '192.168.1.100';
        const maxUsers = pool.maxUsers || 50;
        
        let startInt = ipToInt(startIpStr);
        if (!startInt) startInt = ipToInt('192.168.1.100');
        
        const occupiedIPs = new Set();
        state.topology.devices.forEach(dev => {
          dev.ports.forEach(pt => {
            if (pt.ip) occupiedIPs.add(pt.ip);
          });
          if (dev.dhcpSettings && dev.dhcpSettings.enabled && dev.dhcpSettings.ip) {
            occupiedIPs.add(dev.dhcpSettings.ip);
          }
        });
        
        // Also add all IPs currently leased/reserved by this server to other MACs
        Object.entries(pool.leases).forEach(([mac, ip]) => {
          if (mac !== clientPort.mac) {
            occupiedIPs.add(ip);
          }
        });
        if (pool.reservations) {
          pool.reservations.forEach(r => {
            if (r.mac.toUpperCase() !== clientPort.mac.toUpperCase()) {
              occupiedIPs.add(r.ip);
            }
          });
        }
        
        for (let offset = 0; offset < maxUsers; offset++) {
          const candidateIp = intToIp(startInt + offset);
          if (!occupiedIPs.has(candidateIp)) {
            allocatedIp = candidateIp;
            break;
          }
        }
      }
    }
    
    if (allocatedIp) {
      pool.leases[clientPort.mac] = allocatedIp;
      const event = {
        id: `dhcp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        status: 'success',
        packet: {
          type: 'DHCP',
          srcIp: '0.0.0.0',
          destIp: '255.255.255.255',
          color: '#eab308',
          info: 'DHCP Request'
        },
        isDhcp: true,
        message: `DHCP Request from ${clientDevice.name} (${clientPort.name}): assigned IP ${allocatedIp}, Gateway ${gatewayStr}, DNS ${dnsServerStr}`,
        description: {
          in: {
            l1: 'Physical port received broadcast frame.',
            l2: `Source MAC: ${clientPort.mac}. Broadcast Destination.`,
            l3: 'IP Address 0.0.0.0 sending DHCP DISCOVER.'
          },
          out: {
            l1: 'Physical port sending response.',
            l2: `Destination MAC: ${clientPort.mac}.`,
            l3: `Allocated IP: ${allocatedIp}. Gateway: ${gatewayStr}. DNS: ${dnsServerStr}.`
          }
        }
      };
      
      if (state.simulator) {
        state.simulator.history.push(event);
      }
      
      return {
        success: true,
        ip: allocatedIp,
        subnet: subnetStr,
        gateway: gatewayStr,
        dnsServer: dnsServerStr
      };
    } else {
      const event = {
        id: `dhcp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        status: 'dropped',
        packet: {
          type: 'DHCP',
          srcIp: '0.0.0.0',
          destIp: '255.255.255.255',
          color: '#ef4444',
          info: 'DHCP Failed'
        },
        isDhcp: true,
        message: `DHCP Request failed on ${clientDevice.name} (${clientPort.name}). Reason: DHCP IP pool exhausted. Fallback to APIPA: ${apipa}`,
        description: {
          in: {
            l1: 'Physical port initiated DHCP broadcast.',
            l2: `Source MAC: ${clientPort.mac}. Broadcast Destination.`,
            l3: 'Requesting dynamic IP configuration.'
          },
          out: {
            l1: 'No physical response received.',
            l2: 'DHCP request timed out.',
            l3: `APIPA auto-configuration fallback. Assigned IP: ${apipa}.`
          }
        }
      };
      
      if (state.simulator) {
        state.simulator.history.push(event);
      }
      
      return {
        success: false,
        reason: 'DHCP IP pool exhausted.',
        ip: apipa,
        subnet: '255.255.0.0',
        gateway: '',
        dnsServer: ''
      };
    }
  } else {
    const event = {
      id: `dhcp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      status: 'dropped',
      packet: {
        type: 'DHCP',
        srcIp: '0.0.0.0',
        destIp: '255.255.255.255',
        color: '#ef4444',
        info: 'DHCP Failed'
      },
      isDhcp: true,
      message: `DHCP Request failed on ${clientDevice.name} (${clientPort.name}). Reason: No DHCP server found. Fallback to APIPA: ${apipa}`,
      description: {
        in: {
          l1: 'Physical port initiated DHCP broadcast.',
          l2: `Source MAC: ${clientPort.mac}. Broadcast Destination.`,
          l3: 'Requesting dynamic IP configuration.'
        },
        out: {
          l1: 'No physical response received.',
          l2: 'DHCP request timed out.',
          l3: `APIPA auto-configuration fallback. Assigned IP: ${apipa}.`
        }
      }
    };
    
    if (state.simulator) {
      state.simulator.history.push(event);
    }
    
    return {
      success: false,
      reason: 'No DHCP server responded.',
      ip: apipa,
      subnet: '255.255.0.0',
      gateway: '',
      dnsServer: ''
    };
  }
}

function generateApipaIp() {
  const b3 = Math.floor(Math.random() * 254) + 1;
  const b4 = Math.floor(Math.random() * 254) + 1;
  return `169.254.${b3}.${b4}`;
}
