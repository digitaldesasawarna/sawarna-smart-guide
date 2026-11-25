/**
 * SAWARNA SMART GUIDE - PANTAI CIANTIR (FASE 1)
 * Standar: Tanpa Emoticon, 100% SVG Vector Icons Buatan Sendiri Sesuai Tema
 * Hierarki Zoom: Macro Icon Pin (Zoom Out) & Detail Facility Pin (Zoom In)
 */

(function () {
  'use strict';

  // --- GENERATED SVG VECTOR ICONS (SESUAI TEMA WISATA PESISIR) ---
  const THEME_ICONS = {
    // 1. Pintu Masuk / Jembatan Gantung
    bridge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19V6M21 19V6M3 9h18M2 19h20M3 9c4.5 7 13.5 7 18 0M9 12v7M15 12v7"/></svg>`,
    entrance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>`,

    // 2. Pantai & Surfing
    beach: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="12" cy="5" r="2.5"/></svg>`,
    surfing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-30 12 12)"/><path d="M11 6l2 4 4 1"/></svg>`,

    // 3. Homestay / Penginapan Desa
    homestay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z"/><path d="M9 21V12h6v9"/></svg>`,

    // 4. Kuliner / Warung Pantai & Kelapa Muda
    culinary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M21 2v4a3 3 0 0 1-3 3M3 2v7a4 4 0 0 0 4 4v9M7 2v7"/></svg>`,

    // 5. UMKM / Sewa Alat Surfing & Kerajinan
    umkm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`,

    // 6. Parkir Kendaraan (Mobil & Motor)
    parking: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4.5a3 3 0 0 1 0 6H9"/></svg>`,

    // 7. Mushola / Ibadah
    worship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M12 3a7 7 0 0 1 7 7c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 7-7z"/><circle cx="12" cy="10" r="2"/></svg>`,

    // 8. Sanitasi / Kamar Mandi & Bilas Air Tawar
    toilet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a4 4 0 0 1 4 4v1M15 9l-3 3M15 9l3 3M15 9h-3M9 16v.01M13 16v.01M17 16v.01M11 20v.01M15 20v.01"/></svg>`,
    sanitation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a4 4 0 0 1 4 4v1M15 9l-3 3M15 9l3 3M15 9h-3M9 16v.01M13 16v.01M17 16v.01M11 20v.01M15 20v.01"/></svg>`,

    // 9. Keselamatan / Pos Balawista Lifeguard
    safety: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`,

    // 10. Saung / Gazebo Istirahat
    gazebo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l10-7 10 7M5 10v11M19 10v11M12 10v11M2 21h20"/></svg>`,
    rest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l10-7 10 7M5 10v11M19 10v11M12 10v11M2 21h20"/></svg>`,

    // 11. Tempat Sampah
    cleanliness: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>`,

    // 12. Landmark / Arah Wisata
    landmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`,

    // Fallback Icon
    default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`
  };

  // --- CATEGORY METADATA & COLOR SYSTEM ---
  const CATEGORY_MAP = {
    all: { label: 'Semua', color: '#183B50' },
    access: { label: 'Akses & Masuk', color: '#C94747' },
    transport: { label: 'Parkir Kendaraan', color: '#75553a' },
    homestay: { label: 'Homestay Desa', color: '#d97746' },
    culinary: { label: 'Kuliner & Warung', color: '#E8A23A' },
    attraction: { label: 'Pantai & Surfing', color: '#2878B8' },
    worship: { label: 'Ibadah', color: '#27ae60' },
    sanitation: { label: 'Bilas & Toilet', color: '#16a085' },
    safety: { label: 'Keselamatan', color: '#c0392b' },
    umkm: { label: 'UMKM & Sewa Alat', color: '#8e44ad' },
    rest: { label: 'Saung Gazebo', color: '#b8860b' },
    cleanliness: { label: 'Kebersihan', color: '#56B8D0' }
  };

  function getIconSvg(iconKey, catKey) {
    return THEME_ICONS[iconKey] || THEME_ICONS[catKey] || THEME_ICONS.default;
  }

  // --- STATE ---
  let map = null;
  let mapConfig = null;
  let facilitiesData = [];
  let markersLayer = {};
  let currentActiveMarkerId = null;
  let currentActivePolyline = null;
  let currentFilter = 'all';

  const LOD_ZOOM_THRESHOLD = 0.15;

  // --- DOM ELEMENTS ---
  const mapElement = document.getElementById('map');
  const filterChips = document.querySelectorAll('.filter-chip');
  const resetViewBtn = document.getElementById('btn-reset-view');
  const zoomInBtn = document.getElementById('btn-zoom-in');
  const zoomOutBtn = document.getElementById('btn-zoom-out');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const zoomHint = document.getElementById('zoom-hint');

  const bottomSheet = document.getElementById('bottom-sheet');
  const sheetBackdrop = document.getElementById('sheet-backdrop');
  const sheetCloseBtn = document.getElementById('sheet-close-btn');
  const sheetCategory = document.getElementById('sheet-category');
  const sheetTitle = document.getElementById('sheet-title');
  const sheetHours = document.getElementById('sheet-hours');
  const sheetDesc = document.getElementById('sheet-desc');
  const sheetTags = document.getElementById('sheet-tags');
  const btnShowTrail = document.getElementById('btn-show-trail');

  const btnHelp = document.getElementById('btn-help');
  const btnLegend = document.getElementById('btn-legend');
  const helpModal = document.getElementById('help-modal');
  const legendModal = document.getElementById('legend-modal');

  // --- INIT APPLICATION ---
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
          <p style="font-size:0.9rem;max-width:400px;color:#536e7e;">Terjadi kendala saat membaca data peta Pantai Ciantir.</p>
        </div>
      `;
    }
  }

  // --- SETUP LEAFLET MAP ---
  function setupMap() {
    const { width, height } = mapConfig.dimensions;

    map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: mapConfig.view.minZoom,
      maxZoom: mapConfig.view.maxZoom,
      zoomControl: false,
      attributionControl: false,
      maxBoundsViscosity: 0.85
    });

    const bounds = [[0, 0], [height, width]];
    map.setMaxBounds(bounds);

    const overlay = L.imageOverlay(mapConfig.image, bounds, {
      alt: mapConfig.name,
      interactive: true
    }).addTo(map);

    map.fitBounds(bounds);

    // Refresh layout size
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    map.on('zoomend', () => {
      updateLODVisibility();
    });
  }

  function toLatLng(x, y) {
    const { height } = mapConfig.dimensions;
    return [height - y, x];
  }

  // --- RENDER ALL MARKERS (ONLY THEME ICONS, NO EMOJIS, NO TEXT) ---
  function renderAllMarkers() {
    facilitiesData.forEach((fac) => {
      const latLng = toLatLng(fac.x, fac.y);
      const iconSvg = getIconSvg(fac.icon, fac.category);
      let markerIcon;

      if (fac.lodLevel === 'macro') {
        // Macro Zone Pin (Overview Mode) - Clean Circular Icon Badge
        markerIcon = L.divIcon({
          className: 'macro-icon-wrap',
          html: `
            <div class="macro-badge cat-${fac.category}" id="pin-${fac.id}" title="${fac.name}">
              <div class="macro-pulse"></div>
              <div class="macro-icon-inner">${iconSvg}</div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
      } else if (fac.isEntrance) {
        // Entrance Gate Beacon (Detail Mode)
        markerIcon = L.divIcon({
          className: 'entrance-beacon-wrap',
          html: `
            <div class="entrance-beacon" id="pin-${fac.id}" title="${fac.name}">
              <div class="beacon-pulse"></div>
              <div class="pin-bubble" style="background:#C94747;">
                <span class="pin-icon">${iconSvg}</span>
              </div>
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        });
      } else {
        // Detail Facility Pin (Zoom In Mode) - Clean Themed Bubble Pin
        markerIcon = L.divIcon({
          className: 'custom-pin-wrap',
          html: `
            <div class="custom-pin pin-${fac.category}" id="pin-${fac.id}" title="${fac.name}">
              <div class="pin-bubble">
                <span class="pin-icon">${iconSvg}</span>
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
        zoomHint.textContent = 'Mode Kawasan (Perbesar untuk melihat detail fasilitas)';
      } else {
        zoomHint.textContent = 'Mode Detail Fasilitas Pantai Ciantir';
      }
    }

    Object.keys(markersLayer).forEach(id => {
      const item = markersLayer[id];
      const pinEl = document.getElementById(`pin-${id}`);
      if (!pinEl) return;

      const isMacro = item.data.lodLevel === 'macro';

      let shouldShow = false;
      if (isOverview) {
        shouldShow = isMacro;
      } else {
        shouldShow = !isMacro;
      }

      if (shouldShow && currentFilter !== 'all') {
        const matchesCat = item.data.category === currentFilter;
        const matchesEntrance = currentFilter === 'access' && item.data.isEntrance;
        shouldShow = matchesCat || matchesEntrance;
      }

      pinEl.style.display = shouldShow ? 'flex' : 'none';
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

    const iconSvg = getIconSvg(fac.icon, fac.category);
    const catInfo = CATEGORY_MAP[fac.category] || CATEGORY_MAP.all;

    sheetCategory.innerHTML = `<span class="sheet-cat-svg">${iconSvg}</span><span>${fac.categoryLabel || catInfo.label}</span>`;
    sheetTitle.textContent = fac.name;
    sheetHours.textContent = fac.hours ? fac.hours : 'Buka setiap hari';
    sheetDesc.textContent = fac.details || fac.shortDesc;

    sheetTags.innerHTML = '';
    if (fac.tags && fac.tags.length > 0) {
      fac.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'sheet-tag-item';
        tagEl.textContent = tag;
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

    const wp1 = toLatLng(460, 380);
    const wp2 = toLatLng(660, 510);

    let latLngs = [];
    if (targetFac.y > 520) {
      latLngs = [startPoint, wp1, wp2, endPoint];
    } else {
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
        console.warn('Error enabling fullscreen:', err.message);
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

    window.addEventListener('resize', () => {
      if (map) map.invalidateSize();
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
