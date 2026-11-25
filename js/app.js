/**
 * SAWARNA SMART GUIDE - PANTAI CIANTIR (FASE 1 - PROGRESSIVE ZOOM LOD)
 * Technology: Vanilla JavaScript + Leaflet.js (CRS.Simple)
 * Features: Level of Detail (LOD) zoom-dependent markers, Fullscreen mode,
 *           Ciantir mapping (Jembatan, Homestay, UMKM, Pantai), Visual Trail
 */

(function () {
  'use strict';

  // --- APPLICATION STATE ---
  let map = null;
  let mapConfig = null;
  let facilitiesData = [];
  let markersLayer = {};
  let currentActiveMarkerId = null;
  let currentActivePolyline = null;
  let currentFilter = 'all';

  // Zoom Threshold for Level of Detail (LOD)
  // zoom < 0.15 = Overview Macro Mode (Show macro zone badges)
  // zoom >= 0.15 = Detail Facility Mode (Show detailed facility pins)
  const LOD_ZOOM_THRESHOLD = 0.15;

  // --- DOM ELEMENTS ---
  const mapElement = document.getElementById('map');
  const filterChips = document.querySelectorAll('.filter-chip');
  const resetViewBtn = document.getElementById('btn-reset-view');
  const zoomInBtn = document.getElementById('btn-zoom-in');
  const zoomOutBtn = document.getElementById('btn-zoom-out');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const zoomHint = document.getElementById('zoom-hint');

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

  // Category Dictionary
  const CATEGORY_MAP = {
    all: { label: 'Semua', icon: '📍', color: '#183B50' },
    access: { label: 'Akses & Pintu Masuk', icon: '🚪', color: '#C94747' },
    transport: { label: 'Parkir Kendaraan', icon: '🅿️', color: '#75553a' },
    homestay: { label: 'Homestay & Penginapan', icon: '🏡', color: '#d97746' },
    culinary: { label: 'Kuliner & Warung', icon: '🍽️', color: '#E8A23A' },
    attraction: { label: 'Pantai & Wisata', icon: '🏖️', color: '#2878B8' },
    worship: { label: 'Ibadah', icon: '🕌', color: '#4a9e52' },
    sanitation: { label: 'Bilas & Toilet', icon: '🚻', color: '#4fb3cb' },
    safety: { label: 'Keselamatan', icon: '🛟', color: '#dc3545' },
    umkm: { label: 'UMKM & Sewa Alat', icon: '🛍️', color: '#9059b5' },
    rest: { label: 'Saung / Gazebo', icon: '🛖', color: '#C5A47E' },
    cleanliness: { label: 'Kebersihan', icon: '🗑️', color: '#56B8D0' }
  };

  // --- INITIALIZATION ---
  async function initApp() {
    try {
      const [configRes, facilitiesRes] = await Promise.all([
        fetch('data/map-config.json'),
        fetch('data/facilities.json')
      ]);

      if (!configRes.ok || !facilitiesRes.ok) {
        throw new Error('Gagal memuat konfigurasi peta atau data fasilitas.');
      }

      mapConfig = await configRes.json();
      facilitiesData = await facilitiesRes.json();

      setupMap();
      renderAllMarkers();
      updateLODVisibility();
      setupEventHandlers();

    } catch (error) {
      console.error('Inisialisasi aplikasi gagal:', error);
      mapElement.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2rem;color:#183B50;">
          <h2 style="margin-bottom:0.5rem;font-weight:800;">Gagal Memuat Peta</h2>
          <p style="font-size:0.9rem;max-width:400px;color:#536e7e;">Terjadi kendala saat membaca data peta Pantai Ciantir. Silakan muat ulang halaman.</p>
        </div>
      `;
    }
  }

  // --- SETUP LEAFLET FULLSCREEN MAP ---
  function setupMap() {
    const { width, height } = mapConfig.dimensions;

    map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: mapConfig.view.minZoom,
      maxZoom: mapConfig.view.maxZoom,
      zoomControl: false,
      attributionControl: false,
      maxBoundsViscosity: mapConfig.view.maxBoundsViscosity || 0.85
    });

    const bounds = [[0, 0], [height, width]];
    map.setMaxBounds(bounds);

    L.imageOverlay(mapConfig.image, bounds, {
      alt: mapConfig.name,
      interactive: true
    }).addTo(map);

    map.fitBounds(bounds);

    // Zoom-dependent LOD Event
    map.on('zoomend', () => {
      updateLODVisibility();
    });
  }

  // Helper: Convert SVG coordinates to Leaflet CRS.Simple [lat, lng]
  function toLatLng(x, y) {
    const { height } = mapConfig.dimensions;
    return [height - y, x];
  }

  // --- RENDER ALL MARKERS (MACRO & DETAIL) ---
  function renderAllMarkers() {
    facilitiesData.forEach((fac) => {
      const latLng = toLatLng(fac.x, fac.y);
      const catInfo = CATEGORY_MAP[fac.category] || CATEGORY_MAP.all;
      let markerIcon;

      if (fac.lodLevel === 'macro') {
        // Macro Zone Badge (Shown when zoomed out)
        markerIcon = L.divIcon({
          className: 'macro-badge-wrap',
          html: `
            <div class="macro-badge" id="pin-${fac.id}">
              <span>${catInfo.icon}</span>
              <span>${fac.name}</span>
            </div>
          `,
          iconSize: [160, 36],
          iconAnchor: [80, 18]
        });
      } else if (fac.isEntrance) {
        // Entrance Gate Beacon
        markerIcon = L.divIcon({
          className: 'entrance-beacon-wrap',
          html: `
            <div class="entrance-beacon" id="pin-${fac.id}">
              <div class="beacon-pulse"></div>
              <div class="pin-bubble" style="background:#C94747;border-color:#ffffff;">
                <span class="pin-icon">🚪</span>
              </div>
              <div class="beacon-label">Jembatan Gantung</div>
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        });
      } else {
        // Detailed Facility Pin
        markerIcon = L.divIcon({
          className: 'custom-pin-wrap',
          html: `
            <div class="custom-pin pin-${fac.category}" id="pin-${fac.id}">
              <div class="pin-bubble">
                <span class="pin-icon">${catInfo.icon}</span>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });
      }

      const marker = L.marker(latLng, {
        icon: markerIcon,
        riseOnHover: true,
        title: fac.name
      }).addTo(map);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (fac.lodLevel === 'macro') {
          // If macro badge is clicked, zoom into that cluster!
          map.setView(latLng, Math.max(map.getZoom(), 0.6), { animate: true });
        }
        selectFacility(fac);
      });

      markersLayer[fac.id] = {
        marker,
        data: fac,
        latLng
      };
    });
  }

  // --- DYNAMIC LEVEL OF DETAIL (LOD) CONTROLLER ---
  function updateLODVisibility() {
    const currentZoom = map.getZoom();
    const isOverview = currentZoom < LOD_ZOOM_THRESHOLD;

    if (zoomHint) {
      if (isOverview) {
        zoomHint.textContent = '🔎 Tampilan Keseluruhan (Perbesar untuk melihat detail fasilitas)';
      } else {
        zoomHint.textContent = '📍 Mode Detail Kawasan Pantai Ciantir';
      }
    }

    Object.keys(markersLayer).forEach(id => {
      const item = markersLayer[id];
      const pinEl = document.getElementById(`pin-${id}`);
      if (!pinEl) return;

      const isMacro = item.data.lodLevel === 'macro';

      // 1. Zoom Hierarchy Check
      let shouldShow = false;
      if (isOverview) {
        // Zoom out: only show macro zone markers
        shouldShow = isMacro;
      } else {
        // Zoom in: show detailed facility markers, hide macro badges
        shouldShow = !isMacro;
      }

      // 2. Category Filter Check
      if (shouldShow && currentFilter !== 'all') {
        const matchesCat = item.data.category === currentFilter;
        const matchesEntrance = currentFilter === 'access' && item.data.isEntrance;
        shouldShow = matchesCat || matchesEntrance;
      }

      // Apply visibility
      pinEl.style.display = shouldShow ? 'inline-flex' : 'none';
    });
  }

  // --- SELECT & OPEN BOTTOM SHEET ---
  function selectFacility(fac) {
    currentActiveMarkerId = fac.id;

    document.querySelectorAll('.custom-pin, .macro-badge').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`pin-${fac.id}`);
    if (activeEl) {
      activeEl.classList.add('active');
    }

    const latLng = toLatLng(fac.x, fac.y);
    map.panTo(latLng, { animate: true, duration: 0.35 });

    const catInfo = CATEGORY_MAP[fac.category] || CATEGORY_MAP.all;
    sheetCategory.innerHTML = `${catInfo.icon} ${fac.categoryLabel || catInfo.label}`;
    sheetTitle.textContent = fac.name;
    sheetHours.textContent = fac.hours ? `🕒 ${fac.hours}` : '🕒 Buka setiap hari';
    sheetDesc.textContent = fac.details || fac.shortDesc;

    sheetTags.innerHTML = '';
    if (fac.tags && fac.tags.length > 0) {
      fac.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'sheet-tag-item';
        tagEl.textContent = `# ${tag}`;
        sheetTags.appendChild(tagEl);
      });
    }

    if (fac.isEntrance || fac.id === 'macro-jembatan-akses') {
      btnShowTrail.style.display = 'none';
    } else {
      btnShowTrail.style.display = 'inline-flex';
      btnShowTrail.onclick = () => drawTrailFromEntrance(fac);
    }

    openBottomSheet();
  }

  // --- DRAW VISUAL TRAIL FROM JEMBATAN GANTUNG ---
  function drawTrailFromEntrance(targetFac) {
    if (currentActivePolyline) {
      map.removeLayer(currentActivePolyline);
      currentActivePolyline = null;
    }

    const entrance = mapConfig.entrance;
    const startPoint = toLatLng(entrance.x, entrance.y);
    const endPoint = toLatLng(targetFac.x, targetFac.y);

    // Realistic village path waypoints through Cikaung
    const wp1 = toLatLng(460, 380); // Cikaung village junction
    const wp2 = toLatLng(660, 510); // Beach transition path

    let latLngs = [];
    if (targetFac.y > 520) {
      // Destination is at the beach/UMKM area: go through village route
      latLngs = [startPoint, wp1, wp2, endPoint];
    } else {
      // Destination is in the village / homestay area
      latLngs = [startPoint, wp1, endPoint];
    }

    currentActivePolyline = L.polyline(latLngs, {
      color: '#E8A23A',
      weight: 5,
      opacity: 0.95,
      className: 'animated-trail',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const pathBounds = L.latLngBounds(latLngs).pad(0.3);
    map.fitBounds(pathBounds, { animate: true });

    if (window.innerWidth < 768) {
      closeBottomSheet();
    }
  }

  // --- FILTER CHIPS LOGIC ---
  function applyFilter(categoryKey) {
    currentFilter = categoryKey;

    if (currentActivePolyline) {
      map.removeLayer(currentActivePolyline);
      currentActivePolyline = null;
    }

    filterChips.forEach(chip => {
      if (chip.getAttribute('data-category') === categoryKey) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    updateLODVisibility();
  }

  // --- FULLSCREEN TOGGLE ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err.message);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // --- BOTTOM SHEET CONTROLS ---
  function openBottomSheet() {
    bottomSheet.classList.add('open');
    sheetBackdrop.classList.add('open');
  }

  function closeBottomSheet() {
    bottomSheet.classList.remove('open');
    sheetBackdrop.classList.remove('open');
    document.querySelectorAll('.custom-pin, .macro-badge').forEach(el => el.classList.remove('active'));
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
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.getAttribute('data-category');
        applyFilter(cat);
      });
    });

    zoomInBtn.addEventListener('click', () => map.zoomIn());
    zoomOutBtn.addEventListener('click', () => map.zoomOut());

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

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

    sheetCloseBtn.addEventListener('click', closeBottomSheet);
    sheetBackdrop.addEventListener('click', closeBottomSheet);

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
        if (e.target === modal) closeModal(modal);
      });
    });

    map.on('click', () => {
      closeBottomSheet();
      if (currentActivePolyline) {
        map.removeLayer(currentActivePolyline);
        currentActivePolyline = null;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeBottomSheet();
        closeModal(helpModal);
        closeModal(legendModal);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
