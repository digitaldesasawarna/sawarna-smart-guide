/**
 * SAWARNA SMART GUIDE - PANTAI CIANTIR (GOOGLE MAPS BASELINE + ILUSTRASI OVERLAY)
 * Baseline Layer: Google Maps TileLayer (Hybrid / Satelit / Roadmap)
 * Overlay Layer: Peta Ilustrasi Vektor Kawasan Pantai Ciantir
 * Batas Geografis: Terkunci khusus kawasan Pantai Ciantir (Pasir Putih, Homestay Cikaung, Jembatan Gantung)
 */

(function () {
  'use strict';

  // --- THEMED SVG VECTOR ICONS (BUATAN SENDIRI, TANPA EMOTICON) ---
  const THEME_ICONS = {
    bridge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19V6M21 19V6M3 9h18M2 19h20M3 9c4.5 7 13.5 7 18 0M9 12v7M15 12v7"/></svg>`,
    entrance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>`,
    beach: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="12" cy="5" r="2.5"/></svg>`,
    surfing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-30 12 12)"/><path d="M11 6l2 4 4 1"/></svg>`,
    homestay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z"/><path d="M9 21V12h6v9"/></svg>`,
    culinary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M21 2v4a3 3 0 0 1-3 3M3 2v7a4 4 0 0 0 4 4v9M7 2v7"/></svg>`,
    umkm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>`,
    parking: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4.5a3 3 0 0 1 0 6H9"/></svg>`,
    worship: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M12 3a7 7 0 0 1 7 7c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 7-7z"/><circle cx="12" cy="10" r="2"/></svg>`,
    toilet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a4 4 0 0 1 4 4v1M15 9l-3 3M15 9l3 3M15 9h-3M9 16v.01M13 16v.01M17 16v.01M11 20v.01M15 20v.01"/></svg>`,
    sanitation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a4 4 0 0 1 4 4v1M15 9l-3 3M15 9l3 3M15 9h-3M9 16v.01M13 16v.01M17 16v.01M11 20v.01M15 20v.01"/></svg>`,
    safety: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`,
    gazebo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l10-7 10 7M5 10v11M19 10v11M12 10v11M2 21h20"/></svg>`,
    rest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l10-7 10 7M5 10v11M19 10v11M12 10v11M2 21h20"/></svg>`,
    cleanliness: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>`,
    landmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`,
    default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`
  };

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
  let illustrationOverlay = null;
  let illustrationTileLayer = null;  // Tile pyramid overlay
  let googleBaseTileLayer = null;
  let currentActiveMarkerId = null;
  let currentActivePolyline = null;
  let currentFilter = 'all';
  let currentLayerMode = 'illustration'; // 'illustration', 'hybrid', 'google'
  let searchDebounceTimer = null;

  // Threshold Zoom Level di koordinat geografis
  // zoom < 16.5 = Tampilan Keseluruhan Makro (Kawasan)
  // zoom >= 16.5 = Tampilan Detail Mikro (Fasilitas)
  const LOD_ZOOM_THRESHOLD = 16.5;

  // --- DOM ELEMENTS ---
  const mapElement = document.getElementById('map');
  const filterChips = document.querySelectorAll('.filter-chip');
  const resetViewBtn = document.getElementById('btn-reset-view');
  const zoomInBtn = document.getElementById('btn-zoom-in');
  const zoomOutBtn = document.getElementById('btn-zoom-out');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const layerToggleBtn = document.getElementById('btn-toggle-layer');
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
  const btnOpenGmaps = document.getElementById('btn-open-gmaps');
  const sheetThumbnailWrap = document.getElementById('sheet-thumbnail-wrap');
  const sheetThumbnailImg = document.getElementById('sheet-thumbnail');

  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchDropdown = document.getElementById('search-dropdown');

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

      setupGeographicMap();
      renderAllMarkers();
      updateLODVisibility();
      setupSearch();
      setupEventHandlers();

    } catch (error) {
      console.error('Inisialisasi aplikasi gagal:', error);
      mapElement.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2rem;color:#183B50;">
          <h2 style="margin-bottom:0.5rem;font-weight:800;">Gagal Memuat Peta</h2>
          <p style="font-size:0.9rem;max-width:400px;color:#536e7e;">Terjadi kendala saat membaca data kawasan Pantai Ciantir.</p>
        </div>
      `;
    }
  }

  // --- SETUP GEOGRAPHIC LEAFLET MAP WITH GOOGLE MAPS BASELINE + TILE OVERLAY ---
  function setupGeographicMap() {
    const { geoBounds, view } = mapConfig;

    // Batas Geografis Kawasan Pantai Ciantir
    const illustrationBounds = L.latLngBounds(
      [geoBounds.south, geoBounds.west],
      [geoBounds.north, geoBounds.east]
    );

    // Batas maksimum navigasi (sedikit lebih luas dari ilustrasi)
    const maxBounds = L.latLngBounds(
      [geoBounds.south - 0.002, geoBounds.west - 0.002],
      [geoBounds.north + 0.002, geoBounds.east + 0.002]
    );

    map = L.map('map', {
      center: view.center,
      zoom: view.initialZoom,
      minZoom: view.minZoom,
      maxZoom: view.maxZoom,
      zoomControl: false,
      attributionControl: false,
      maxBounds: maxBounds,
      maxBoundsViscosity: view.maxBoundsViscosity || 0.95
    });

    // 1. BASELINE LAYER: Google Maps Hybrid (Satelit + Label Jalan)
    googleBaseTileLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
      alt: 'Google Maps Baseline'
    }).addTo(map);

    // 2. OVERLAY A: Tile Pyramid Ilustrasi (jika tiles sudah digenerate)
    //    Fallback ke single imageOverlay jika tile tidak tersedia
    if (mapConfig.tilesPath) {
      illustrationTileLayer = L.tileLayer(mapConfig.tilesPath + '/{z}/{x}/{y}.png', {
        tms: true,
        opacity: 0.92,
        maxZoom: view.maxZoom,
        minZoom: view.minZoom,
        bounds: illustrationBounds,
        zIndex: 10,
        errorTileUrl: ''
      }).addTo(map);
    } else {
      // Fallback: single SVG ImageOverlay
      illustrationOverlay = L.imageOverlay(mapConfig.image, illustrationBounds, {
        alt: mapConfig.name,
        interactive: true,
        opacity: 0.92,
        zIndex: 10
      }).addTo(map);
    }

    map.fitBounds(illustrationBounds);

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    map.on('zoomend', () => {
      updateLODVisibility();
    });
  }

  // Helper: get active overlay reference (tile layer or image overlay)
  function getActiveOverlay() {
    return illustrationTileLayer || illustrationOverlay;
  }

  // --- RENDER ALL MARKERS (REAL GEOGRAPHIC LAT/LNG) ---
  function renderAllMarkers() {
    facilitiesData.forEach((fac) => {
      const latLng = [fac.lat, fac.lng];
      const iconSvg = getIconSvg(fac.icon, fac.category);
      let markerIcon;

      if (fac.lodLevel === 'macro') {
        // Macro Zone Icon Badge (Zoom Out Mode)
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
        // Entrance Gate Beacon (Zoom In Mode)
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
        // Detail Facility Pin (Zoom In Mode)
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
          map.setView(latLng, Math.max(map.getZoom(), 17), { animate: true });
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
        zoomHint.textContent = 'Mode Kawasan Ciantir (Perbesar untuk detail fasilitas)';
      } else {
        zoomHint.textContent = 'Mode Fasilitas Detail (Jembatan, Homestay, Warung)';
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

    map.panTo([fac.lat, fac.lng], { animate: true, duration: 0.35 });

    const iconSvg = getIconSvg(fac.icon, fac.category);
    const catInfo = CATEGORY_MAP[fac.category] || CATEGORY_MAP.all;

    // --- THUMBNAIL ---
    const sheetThumbnailWrap = document.getElementById('sheet-thumbnail-wrap');
    const sheetThumbnailImg = document.getElementById('sheet-thumbnail');
    if (sheetThumbnailWrap && sheetThumbnailImg && fac.thumbnail) {
      sheetThumbnailImg.src = fac.thumbnail;
      sheetThumbnailImg.alt = fac.name;
      sheetThumbnailImg.onerror = () => {
        // If thumbnail fails to load, hide the wrap gracefully
        sheetThumbnailWrap.hidden = true;
      };
      sheetThumbnailImg.onload = () => {
        sheetThumbnailWrap.hidden = false;
      };
      // Start loading
      sheetThumbnailWrap.hidden = true; // hide until loaded
    } else if (sheetThumbnailWrap) {
      sheetThumbnailWrap.hidden = true;
    }

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

    // Tombol Jalur Desa dari Jembatan
    if (fac.isEntrance || fac.id === 'macro-jembatan-akses') {
      btnShowTrail.style.display = 'none';
    } else {
      btnShowTrail.style.display = 'inline-flex';
      btnShowTrail.onclick = () => drawTrailFromEntrance(fac);
    }

    // Tombol Pintasan Navigasi Google Maps Asli
    if (btnOpenGmaps) {
      btnOpenGmaps.href = `https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`;
    }

    openBottomSheet();
  }

  // --- DRAW REAL GEOGRAPHIC TRAIL FROM JEMBATAN GANTUNG ---
  function drawTrailFromEntrance(targetFac) {
    if (currentActivePolyline) {
      map.removeLayer(currentActivePolyline);
      currentActivePolyline = null;
    }

    const entrance = mapConfig.entrance;
    const startPoint = [entrance.lat, entrance.lng];
    const endPoint = [targetFac.lat, targetFac.lng];

    // Titik jalur persimpangan jalan desa Kampung Cikaung
    const wp1 = [-6.9849, 106.3056]; // Persimpangan Cikaung
    const wp2 = [-6.9875, 106.3066]; // Pintu transisi menuju pantai

    let latLngs = [];
    if (targetFac.lat < -6.9870) {
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

    const pathBounds = L.latLngBounds(latLngs).pad(0.25);
    map.fitBounds(pathBounds, { animate: true });

    if (window.innerWidth < 768) {
      closeBottomSheet();
    }
  }

  // --- TOGGLE LAYER BASELINE & OVERLAY ---
  function toggleLayerMode() {
    const overlay = illustrationTileLayer || illustrationOverlay;
    if (!overlay) return;

    if (currentLayerMode === 'illustration') {
      currentLayerMode = 'hybrid';
      overlay.setOpacity(0.55);
      if (layerToggleBtn) {
        layerToggleBtn.setAttribute('title', 'Mode: Hybrid (Ilustrasi + Satelit Google)');
        layerToggleBtn.classList.add('mode-hybrid');
        layerToggleBtn.classList.remove('mode-google');
      }
    } else if (currentLayerMode === 'hybrid') {
      currentLayerMode = 'google';
      overlay.setOpacity(0.05);
      if (layerToggleBtn) {
        layerToggleBtn.setAttribute('title', 'Mode: Satelit Google Maps Asli');
        layerToggleBtn.classList.add('mode-google');
        layerToggleBtn.classList.remove('mode-hybrid');
      }
    } else {
      currentLayerMode = 'illustration';
      overlay.setOpacity(0.92);
      if (layerToggleBtn) {
        layerToggleBtn.setAttribute('title', 'Mode: Peta Ilustrasi Pantai Ciantir');
        layerToggleBtn.classList.remove('mode-hybrid', 'mode-google');
      }
    }
  }

  // --- SEARCH FUNCTIONALITY ---
  function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      const q = searchInput.value.trim();
      if (searchClearBtn) searchClearBtn.hidden = q.length === 0;
      if (q.length < 2) {
        hideSearchDropdown();
        return;
      }
      searchDebounceTimer = setTimeout(() => performSearch(q), 180);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearSearch();
      } else if (e.key === 'Enter') {
        const firstItem = searchDropdown && searchDropdown.querySelector('li[role="option"]');
        if (firstItem) firstItem.click();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const items = searchDropdown ? searchDropdown.querySelectorAll('li[role="option"]') : [];
        if (items.length > 0) items[0].focus();
      }
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', clearSearch);
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (searchInput && !searchInput.contains(e.target) && searchDropdown && !searchDropdown.contains(e.target)) {
        hideSearchDropdown();
      }
    });
  }

  function performSearch(query) {
    const q = query.toLowerCase();
    const results = facilitiesData.filter(fac => {
      return (
        fac.name.toLowerCase().includes(q) ||
        fac.shortDesc.toLowerCase().includes(q) ||
        (fac.categoryLabel && fac.categoryLabel.toLowerCase().includes(q)) ||
        (fac.tags && fac.tags.some(t => t.toLowerCase().includes(q)))
      );
    }).slice(0, 7);

    renderSearchDropdown(results, query);
  }

  function renderSearchDropdown(results, query) {
    if (!searchDropdown) return;
    searchDropdown.innerHTML = '';

    if (results.length === 0) {
      const li = document.createElement('li');
      li.className = 'search-no-result';
      li.textContent = `Fasilitas "${query}" tidak ditemukan`;
      searchDropdown.appendChild(li);
    } else {
      results.forEach(fac => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '0');
        li.className = 'search-result-item';

        const catInfo = CATEGORY_MAP[fac.category] || CATEGORY_MAP.all;
        const iconSvg = getIconSvg(fac.icon, fac.category);

        li.innerHTML = `
          <span class="search-result-icon" style="background:${catInfo.color};">${iconSvg}</span>
          <span class="search-result-text">
            <span class="search-result-name">${highlightMatch(fac.name, query)}</span>
            <span class="search-result-cat">${fac.categoryLabel || catInfo.label}</span>
          </span>
        `;

        const handleSelect = () => {
          clearSearch();
          closeBottomSheet();
          // Pan and zoom to the facility
          const targetZoom = fac.lodLevel === 'macro' ? 17 : 18;
          map.setView([fac.lat, fac.lng], targetZoom, { animate: true });
          setTimeout(() => selectFacility(fac), 350);
        };

        li.addEventListener('click', handleSelect);
        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); }
          if (e.key === 'ArrowDown') { e.preventDefault(); const next = li.nextElementSibling; if (next) next.focus(); }
          if (e.key === 'ArrowUp') { e.preventDefault(); const prev = li.previousElementSibling; if (prev) prev.focus(); else searchInput.focus(); }
        });

        searchDropdown.appendChild(li);
      });
    }

    searchDropdown.hidden = false;
  }

  function highlightMatch(text, query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  function hideSearchDropdown() {
    if (searchDropdown) searchDropdown.hidden = true;
  }

  function clearSearch() {
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.hidden = true;
    hideSearchDropdown();
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

    if (layerToggleBtn) {
      layerToggleBtn.addEventListener('click', toggleLayerMode);
    }

    resetViewBtn.addEventListener('click', () => {
      const { geoBounds } = mapConfig;
      const bounds = L.latLngBounds(
        [geoBounds.south, geoBounds.west],
        [geoBounds.north, geoBounds.east]
      );
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
