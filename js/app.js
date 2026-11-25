/**
 * SAWARNA SMART GUIDE - MAIN APPLICATION (FASE 1 MVP)
 * Technology: Vanilla JavaScript + Leaflet.js (CRS.Simple)
 * Architecture: Static Web App, zero-backend, mobile-first
 */

(function () {
  'use strict';

  // --- STATE ---
  let map = null;
  let mapConfig = null;
  let facilitiesData = [];
  let markersLayer = {};
  let currentActiveMarkerId = null;
  let currentActivePolyline = null;
  let currentFilter = 'all';

  // --- DOM ELEMENTS ---
  const mapElement = document.getElementById('map');
  const filterChips = document.querySelectorAll('.filter-chip');
  const resetViewBtn = document.getElementById('btn-reset-view');
  const zoomInBtn = document.getElementById('btn-zoom-in');
  const zoomOutBtn = document.getElementById('btn-zoom-out');

  // Bottom Sheet Elements
  const bottomSheet = document.getElementById('bottom-sheet');
  const sheetBackdrop = document.getElementById('sheet-backdrop');
  const sheetCloseBtn = document.getElementById('sheet-close-btn');
  const sheetCategory = document.getElementById('sheet-category');
  const sheetTitle = document.getElementById('sheet-title');
  const sheetHours = document.getElementById('sheet-hours');
  const sheetDesc = document.getElementById('sheet-desc');
  const sheetTags = document.getElementById('sheet-tags');
  const btnShowTrail = document.getElementById('btn-show-trail');

  // Modals Elements
  const btnHelp = document.getElementById('btn-help');
  const btnLegend = document.getElementById('btn-legend');
  const helpModal = document.getElementById('help-modal');
  const legendModal = document.getElementById('legend-modal');

  // Category Icon & Label Dictionary
  const CATEGORY_MAP = {
    all: { label: 'Semua', icon: '📍', color: '#183B50' },
    access: { label: 'Akses Masuk', icon: '🚪', color: '#C94747' },
    transport: { label: 'Parkir', icon: '🅿️', color: '#75553a' },
    info: { label: 'Informasi', icon: 'ℹ️', color: '#2878B8' },
    worship: { label: 'Ibadah', icon: '🕌', color: '#4a9e52' },
    sanitation: { label: 'Sanitasi', icon: '🚻', color: '#4fb3cb' },
    culinary: { label: 'Kuliner', icon: '🍽️', color: '#E8A23A' },
    umkm: { label: 'UMKM', icon: '🛍️', color: '#9059b5' },
    attraction: { label: 'Spot Wisata', icon: '📍', color: '#2878B8' },
    rest: { label: 'Istirahat', icon: '🛖', color: '#C5A47E' },
    safety: { label: 'Keselamatan', icon: '🛟', color: '#dc3545' },
    cleanliness: { label: 'Kebersihan', icon: '🗑️', color: '#56B8D0' }
  };

  // --- INITIALIZATION ---
  async function initApp() {
    try {
      // 1. Fetch Configuration & Data
      const [configRes, facilitiesRes] = await Promise.all([
        fetch('data/map-config.json'),
        fetch('data/facilities.json')
      ]);

      if (!configRes.ok || !facilitiesRes.ok) {
        throw new Error('Gagal memuat berkas konfigurasi peta atau data fasilitas.');
      }

      mapConfig = await configRes.json();
      facilitiesData = await facilitiesRes.json();

      // 2. Setup Leaflet Map
      setupMap();

      // 3. Render Markers
      renderMarkers();

      // 4. Bind Events & Modals
      setupEventHandlers();

    } catch (error) {
      console.error('Inisialisasi aplikasi gagal:', error);
      mapElement.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2rem;color:#183B50;">
          <h2 style="margin-bottom:0.5rem;font-weight:800;">Gagal Memuat Peta</h2>
          <p style="font-size:0.9rem;max-width:400px;color:#536e7e;">Terjadi kendala saat membaca data peta. Silakan pastikan server lokal atau hosting aktif.</p>
        </div>
      `;
    }
  }

  // --- SETUP LEAFLET MAP ---
  function setupMap() {
    const { width, height } = mapConfig.dimensions;

    // Leaflet CRS.Simple Map setup
    map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: mapConfig.view.minZoom,
      maxZoom: mapConfig.view.maxZoom,
      zoomControl: false,
      attributionControl: false,
      maxBoundsViscosity: mapConfig.view.maxBoundsViscosity || 0.8
    });

    // Image Bounds: [[latMin, lngMin], [latMax, lngMax]] -> [[0, 0], [height, width]]
    const bounds = [[0, 0], [height, width]];
    map.setMaxBounds(bounds);

    // Add SVG/Image Overlay
    L.imageOverlay(mapConfig.image, bounds, {
      alt: mapConfig.name,
      interactive: true
    }).addTo(map);

    // Initial View
    map.fitBounds(bounds);
  }

  // Helper: Convert SVG coordinates (x from left, y from top) to Leaflet CRS.Simple [lat, lng]
  function toLatLng(x, y) {
    const { height } = mapConfig.dimensions;
    return [height - y, x];
  }

  // --- RENDER MARKERS ---
  function renderMarkers() {
    facilitiesData.forEach((fac) => {
      const latLng = toLatLng(fac.x, fac.y);
      const catInfo = CATEGORY_MAP[fac.category] || CATEGORY_MAP.all;

      let markerIcon;

      if (fac.isEntrance) {
        // Special Entrance Gate Marker with Pulsing Ring
        markerIcon = L.divIcon({
          className: 'entrance-beacon-wrap',
          html: `
            <div class="entrance-beacon" id="pin-${fac.id}">
              <div class="beacon-pulse"></div>
              <div class="pin-bubble" style="background:#C94747;border-color:#ffffff;">
                <span class="pin-icon">🚪</span>
              </div>
              <div class="beacon-label">Pintu Masuk Utama</div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
      } else {
        // Standard Themed Facility Pin
        markerIcon = L.divIcon({
          className: 'custom-pin-wrap',
          html: `
            <div class="custom-pin pin-${fac.category}" id="pin-${fac.id}">
              <div class="pin-bubble">
                <span class="pin-icon">${catInfo.icon}</span>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38]
        });
      }

      const marker = L.marker(latLng, {
        icon: markerIcon,
        riseOnHover: true,
        title: fac.name
      }).addTo(map);

      // Handle Marker Click
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        selectFacility(fac);
      });

      markersLayer[fac.id] = {
        marker,
        data: fac,
        latLng
      };
    });
  }

  // --- SELECT & OPEN FACILITY BOTTOM SHEET ---
  function selectFacility(fac) {
    currentActiveMarkerId = fac.id;

    // Reset active pin styles
    document.querySelectorAll('.custom-pin').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`pin-${fac.id}`);
    if (activeEl) {
      activeEl.classList.add('active');
    }

    // Smooth pan to facility location
    const latLng = toLatLng(fac.x, fac.y);
    map.panTo(latLng, { animate: true, duration: 0.4 });

    // Populate Bottom Sheet details
    const catInfo = CATEGORY_MAP[fac.category] || CATEGORY_MAP.all;
    sheetCategory.innerHTML = `${catInfo.icon} ${fac.categoryLabel || catInfo.label}`;
    sheetTitle.textContent = fac.name;
    sheetHours.textContent = fac.hours ? `Jam: ${fac.hours}` : 'Jam: Mengikuti jam buka kawasan';
    sheetDesc.textContent = fac.details || fac.shortDesc;

    // Render Tags
    sheetTags.innerHTML = '';
    if (fac.tags && fac.tags.length > 0) {
      fac.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'sheet-tag-item';
        tagEl.textContent = `# ${tag}`;
        sheetTags.appendChild(tagEl);
      });
    }

    // Configure "Jalur dari Gerbang" button
    if (fac.isEntrance) {
      btnShowTrail.style.display = 'none';
    } else {
      btnShowTrail.style.display = 'inline-flex';
      btnShowTrail.onclick = () => drawTrailFromEntrance(fac);
    }

    // Open Bottom Sheet
    openBottomSheet();
  }

  // --- DRAW VISUAL TRAIL FROM ENTRANCE GATE ---
  function drawTrailFromEntrance(targetFac) {
    // Clear previous polyline
    if (currentActivePolyline) {
      map.removeLayer(currentActivePolyline);
      currentActivePolyline = null;
    }

    const entrance = mapConfig.entrance;
    const startPoint = toLatLng(entrance.x, entrance.y);
    const endPoint = toLatLng(targetFac.x, targetFac.y);

    // Natural curved intermediary waypoint along coastal path
    const midX = (entrance.x + targetFac.x) / 2 + 30;
    const midY = (entrance.y + targetFac.y) / 2 - 20;
    const midPoint = toLatLng(midX, midY);

    const latLngs = [startPoint, midPoint, endPoint];

    // Animated dashed trail line
    currentActivePolyline = L.polyline(latLngs, {
      color: '#E8A23A',
      weight: 4.5,
      opacity: 0.9,
      className: 'animated-trail',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Fit bounds to show both entrance and target
    const pathBounds = L.latLngBounds([startPoint, endPoint]).pad(0.35);
    map.fitBounds(pathBounds, { animate: true });

    // Temporarily minimize bottom sheet on mobile to let user see trail
    if (window.innerWidth < 768) {
      closeBottomSheet();
    }
  }

  // --- CATEGORY FILTERING ---
  function applyFilter(categoryKey) {
    currentFilter = categoryKey;

    // Clear active trail
    if (currentActivePolyline) {
      map.removeLayer(currentActivePolyline);
      currentActivePolyline = null;
    }

    // Update active filter chip UI
    filterChips.forEach(chip => {
      if (chip.getAttribute('data-category') === categoryKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Dim or show pins
    Object.keys(markersLayer).forEach(id => {
      const item = markersLayer[id];
      const pinEl = document.getElementById(`pin-${id}`);
      if (!pinEl) return;

      if (categoryKey === 'all') {
        pinEl.classList.remove('dimmed');
      } else if (item.data.category === categoryKey || (categoryKey === 'access' && item.data.isEntrance)) {
        pinEl.classList.remove('dimmed');
      } else {
        pinEl.classList.add('dimmed');
      }
    });
  }

  // --- BOTTOM SHEET CONTROLS ---
  function openBottomSheet() {
    bottomSheet.classList.add('open');
    sheetBackdrop.classList.add('open');
  }

  function closeBottomSheet() {
    bottomSheet.classList.remove('open');
    sheetBackdrop.classList.remove('open');

    // Deselect active pins
    document.querySelectorAll('.custom-pin').forEach(el => el.classList.remove('active'));
    currentActiveMarkerId = null;
  }

  // --- MODAL CONTROLS ---
  function openModal(modalEl) {
    closeBottomSheet();
    modalEl.classList.add('open');
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('open');
  }

  // --- EVENT HANDLERS ---
  function setupEventHandlers() {
    // Filter Chips click
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.getAttribute('data-category');
        applyFilter(cat);
      });
    });

    // Map Controls: Zoom & Reset
    zoomInBtn.addEventListener('click', () => map.zoomIn());
    zoomOutBtn.addEventListener('click', () => map.zoomOut());

    resetViewBtn.addEventListener('click', () => {
      const { width, height } = mapConfig.dimensions;
      const bounds = [[0, 0], [height, width]];
      map.fitBounds(bounds, { animate: true });

      if (currentActivePolyline) {
        map.removeLayer(currentActivePolyline);
        currentActivePolyline = null;
      }
      closeBottomSheet();
    });

    // Close bottom sheet events
    sheetCloseBtn.addEventListener('click', closeBottomSheet);
    sheetBackdrop.addEventListener('click', closeBottomSheet);

    // Help & Legend Modal triggers
    btnHelp.addEventListener('click', () => openModal(helpModal));
    btnLegend.addEventListener('click', () => openModal(legendModal));

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(helpModal);
        closeModal(legendModal);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Close on Map Click
    map.on('click', () => {
      closeBottomSheet();
      if (currentActivePolyline) {
        map.removeLayer(currentActivePolyline);
        currentActivePolyline = null;
      }
    });

    // Keyboard Accessibility (Esc to close)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeBottomSheet();
        closeModal(helpModal);
        closeModal(legendModal);
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
