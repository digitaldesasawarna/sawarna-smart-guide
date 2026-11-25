import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const tilesBaseDir = path.resolve('assets/maps/tiles/16');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ========================================================
// SVG GENERATOR UNTUK TIAP TILE (256 x 256)
// ========================================================

// 1. TILE 16/52120/34043: PESISIR TENGAH PANTAI CIANTIR (UTAMA & SURFING)
function getSvgPesisirTengah() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradient Laut Dalam -->
      <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0077b6" stop-opacity="0.95"/>
        <stop offset="35%" stop-color="#023e8a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#03045e" stop-opacity="0.96"/>
      </linearGradient>

      <!-- Gradient Air Dangkal / Toska -->
      <linearGradient id="shallowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ade8f4" stop-opacity="0.92"/>
        <stop offset="50%" stop-color="#48cae4" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#0096c7" stop-opacity="0.92"/>
      </linearGradient>

      <!-- Gradient Pasir Pantai Ciantir -->
      <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fdf0d5" stop-opacity="0.95"/>
        <stop offset="70%" stop-color="#f4e2bb" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#e8d5b5" stop-opacity="0.96"/>
      </linearGradient>

      <!-- Filter Bayangan Ombak -->
      <filter id="waveShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#023e8a" flood-opacity="0.3"/>
      </filter>
    </defs>

    <!-- 1. BASE: Laut Dalam (Menutupi bagian bawah tile) -->
    <rect x="0" y="0" width="256" height="256" fill="url(#oceanGrad)"/>

    <!-- Gelombang Laut Samudra (Ripples) -->
    <path d="M 10 210 Q 35 206 60 210 T 110 210 T 160 210 T 210 210 T 250 210" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.4"/>
    <path d="M 30 230 Q 60 226 90 230 T 150 230 T 210 230 T 255 230" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>
    <path d="M 0 190 Q 40 186 80 190 T 160 190 T 240 190" fill="none" stroke="#48cae4" stroke-width="1.2" opacity="0.45"/>

    <!-- 2. AIR DANGKAL / LAGOON (Toska Turqoise) -->
    <!-- Batas air dangkal mengikuti garis pantai diagonal (y=90 di kiri turun ke y=180 di kanan) -->
    <path d="M 0 0 L 256 0 L 256 185 Q 200 175 140 160 Q 80 145 0 120 Z" fill="url(#shallowGrad)"/>

    <!-- Swell Ombak Selancar (Surfing Break Lines) -->
    <path d="M 120 180 Q 160 165 200 175 Q 230 182 256 195" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.8" stroke-dasharray="8 3" filter="url(#waveShadow)"/>
    <path d="M 100 160 Q 140 145 180 155 Q 220 162 256 175" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.75" stroke-dasharray="12 4"/>

    <!-- Ikon Surfer di atas ombak Ciantir -->
    <g transform="translate(195, 168) scale(0.65)" opacity="0.9">
      <!-- Papan Selancar -->
      <ellipse cx="12" cy="12" rx="14" ry="4" transform="rotate(-25 12 12)" fill="#ffb703" stroke="#fb8500" stroke-width="1.5"/>
      <!-- Siluet Peselancar -->
      <circle cx="10" cy="5" r="2.5" fill="#183b50"/>
      <path d="M 10 7 L 11 12 L 8 16 M 11 10 L 15 9" stroke="#183b50" stroke-width="1.8" stroke-linecap="round"/>
    </g>

    <!-- 3. PASIR PANTAI CIANTIR (Golden White Sand) -->
    <!-- Garis pantai diagonal presisi Google Maps: mulai dari (x=0, y=85) sampai (x=256, y=145) -->
    <path d="M 0 0 L 256 0 L 256 142 Q 220 138 180 132 Q 130 120 80 102 Q 40 92 0 82 Z" fill="url(#sandGrad)"/>

    <!-- Tekstur Pasir Halus -->
    <circle cx="45" cy="50" r="1" fill="#d4a373" opacity="0.5"/>
    <circle cx="95" cy="70" r="1.2" fill="#d4a373" opacity="0.4"/>
    <circle cx="150" cy="85" r="1" fill="#d4a373" opacity="0.5"/>
    <circle cx="210" cy="105" r="1.2" fill="#d4a373" opacity="0.4"/>
    <circle cx="120" cy="40" r="1" fill="#d4a373" opacity="0.5"/>

    <!-- 4. GARIS BUIH OMBAK PANTAI (Shoreline Surf Foam) -->
    <!-- Lapisan buih putih tebal tepat di batas pasir dan air -->
    <path d="M 0 82 Q 40 92 80 102 Q 130 120 180 132 Q 220 138 256 142 L 256 148 Q 220 144 180 137 Q 130 125 80 107 Q 40 97 0 87 Z" fill="#ffffff" opacity="0.85" filter="url(#waveShadow)"/>
    <path d="M 0 85 Q 40 95 80 105 Q 130 123 180 135 Q 220 141 256 145" fill="none" stroke="#ade8f4" stroke-width="1" opacity="0.7"/>

    <!-- 5. ELEMEN WISATA PESISIR: Saung Gazebo & Pohon Kelapa Pesisir -->
    <!-- Gazebo Bambu Atap Jerami -->
    <g transform="translate(140, 60) scale(0.7)">
      <polygon points="12,2 2,12 22,12" fill="#b8860b"/>
      <rect x="5" y="12" width="14" height="8" fill="#d4a373"/>
      <line x1="7" y1="20" x2="7" y2="12" stroke="#8b5a2b" stroke-width="1.5"/>
      <line x1="17" y1="20" x2="17" y2="12" stroke="#8b5a2b" stroke-width="1.5"/>
    </g>
    <g transform="translate(170, 75) scale(0.65)">
      <polygon points="12,2 2,12 22,12" fill="#b8860b"/>
      <rect x="5" y="12" width="14" height="8" fill="#d4a373"/>
      <line x1="7" y1="20" x2="7" y2="12" stroke="#8b5a2b" stroke-width="1.5"/>
      <line x1="17" y1="20" x2="17" y2="12" stroke="#8b5a2b" stroke-width="1.5"/>
    </g>

    <!-- Pohon Kelapa Pesisir (Di area batas daratan utara y < 40) -->
    <g transform="translate(60, 15) scale(0.8)">
      <path d="M 12 30 Q 15 15 12 5" stroke="#7f5539" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Pelepah Kelapa Hijau -->
      <path d="M 12 5 Q 5 0 0 5" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 18 0 24 6" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 4 10 2 15" stroke="#40916c" stroke-width="1.8" fill="none"/>
      <path d="M 12 5 Q 20 10 22 16" stroke="#40916c" stroke-width="1.8" fill="none"/>
      <path d="M 12 5 Q 12 -4 14 -7" stroke="#52b788" stroke-width="1.8" fill="none"/>
    </g>
    <g transform="translate(100, 10) scale(0.75)">
      <path d="M 12 30 Q 8 15 12 5" stroke="#7f5539" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 12 5 Q 5 0 0 5" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 18 0 24 6" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 4 10 2 15" stroke="#40916c" stroke-width="1.8" fill="none"/>
      <path d="M 12 5 Q 20 10 22 16" stroke="#40916c" stroke-width="1.8" fill="none"/>
    </g>

    <!-- Payung Pantai Santai -->
    <g transform="translate(105, 55) scale(0.65)">
      <path d="M 2 12 A 10 10 0 0 1 22 12 Z" fill="#e63946"/>
      <path d="M 6 12 A 6 10 0 0 1 18 12 Z" fill="#f1faee"/>
      <line x1="12" y1="12" x2="12" y2="20" stroke="#457b9d" stroke-width="1.5"/>
    </g>
  </svg>`;
}

// 2. TILE 16/52119/34043: PESISIR BARAT & MUARA SUNGAI CISAWARNA
function getSvgPesisirBarat() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="oceanGradW" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0077b6" stop-opacity="0.95"/>
        <stop offset="40%" stop-color="#023e8a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#03045e" stop-opacity="0.96"/>
      </linearGradient>
      <linearGradient id="shallowGradW" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ade8f4" stop-opacity="0.92"/>
        <stop offset="60%" stop-color="#48cae4" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#0096c7" stop-opacity="0.92"/>
      </linearGradient>
      <linearGradient id="sandGradW" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fdf0d5" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#f4e2bb" stop-opacity="0.95"/>
      </linearGradient>
    </defs>

    <!-- Base Laut Dalam -->
    <rect x="0" y="0" width="256" height="256" fill="url(#oceanGradW)"/>

    <!-- Ripples Air Laut -->
    <path d="M 20 180 Q 60 176 100 180 T 180 180 T 250 180" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.4"/>
    <path d="M 10 220 Q 50 216 90 220 T 170 220 T 250 220" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>

    <!-- Air Dangkal Pesisir Barat -->
    <path d="M 0 0 L 256 0 L 256 120 Q 180 100 120 80 Q 70 65 0 50 Z" fill="url(#shallowGradW)"/>

    <!-- Pasir Pantai Barat Ciantir (Menghubung mulus ke tile tengah di y=82) -->
    <path d="M 60 0 L 256 0 L 256 82 Q 200 70 140 50 Q 100 35 60 0 Z" fill="url(#sandGradW)"/>

    <!-- Muara Sungai Cisawarna di sebelah barat (Kiri atas) -->
    <path d="M 0 0 Q 30 15 50 40 Q 65 65 40 100 Q 20 130 0 140 Z" fill="#48cae4" opacity="0.85"/>
    <path d="M 0 0 Q 20 15 35 40 Q 45 65 25 100 Q 10 120 0 130 Z" fill="#90e0ef" opacity="0.9"/>

    <!-- Garis Buih Ombak Pantai Barat -->
    <path d="M 60 0 Q 100 35 140 50 Q 200 70 256 82" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.85"/>
    <path d="M 60 2 Q 100 37 140 52 Q 200 72 256 84" fill="none" stroke="#ade8f4" stroke-width="1.5" opacity="0.6"/>

    <!-- Vegetasi & Pohon Kelapa Pesisir Barat -->
    <g transform="translate(180, 15) scale(0.75)">
      <path d="M 12 30 Q 15 15 12 5" stroke="#7f5539" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 12 5 Q 5 0 0 5" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 18 0 24 6" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 4 10 2 15" stroke="#40916c" stroke-width="1.8" fill="none"/>
      <path d="M 12 5 Q 20 10 22 16" stroke="#40916c" stroke-width="1.8" fill="none"/>
    </g>
  </svg>`;
}

// 3. TILE 16/52121/34043: PESISIR TIMUR & TEBING KARANG (TANJUNG LAYAR SIDE)
function getSvgPesisirTimur() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="oceanGradE" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0077b6" stop-opacity="0.95"/>
        <stop offset="40%" stop-color="#023e8a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#03045e" stop-opacity="0.96"/>
      </linearGradient>
      <linearGradient id="shallowGradE" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ade8f4" stop-opacity="0.92"/>
        <stop offset="60%" stop-color="#48cae4" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#0096c7" stop-opacity="0.92"/>
      </linearGradient>
      <linearGradient id="sandGradE" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fdf0d5" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#e8d5b5" stop-opacity="0.95"/>
      </linearGradient>
      <!-- Gradient Batu Karang Eksotis -->
      <linearGradient id="rockGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7f7564"/>
        <stop offset="50%" stop-color="#5c5346"/>
        <stop offset="100%" stop-color="#3d372e"/>
      </linearGradient>
    </defs>

    <!-- Base Laut Dalam -->
    <rect x="0" y="0" width="256" height="256" fill="url(#oceanGradE)"/>

    <!-- Ripples Air Laut -->
    <path d="M 10 200 Q 50 196 90 200 T 170 200 T 250 200" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.4"/>
    <path d="M 20 235 Q 60 231 100 235 T 180 235 T 250 235" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>

    <!-- Air Dangkal Pesisir Timur (Menghubung mulus dari tile tengah y=185) -->
    <path d="M 0 0 L 256 0 L 256 220 Q 180 210 110 195 Q 50 190 0 185 Z" fill="url(#shallowGradE)"/>

    <!-- Pasir Pantai Timur Ciantir (Menghubung mulus dari tile tengah y=142) -->
    <path d="M 0 0 L 256 0 L 256 160 Q 180 155 100 150 Q 50 146 0 142 Z" fill="url(#sandGradE)"/>

    <!-- Formasi Gugusan Batu Karang Pantai Timur (Khas Sawarna) -->
    <!-- Karang Besar 1 -->
    <polygon points="170,140 195,120 225,125 240,150 220,165 180,160" fill="url(#rockGrad)"/>
    <!-- Karang Besar 2 -->
    <polygon points="120,170 140,155 160,160 165,180 145,190 125,185" fill="url(#rockGrad)"/>
    <!-- Karang Kecil di Laut -->
    <polygon points="70,185 85,175 95,180 90,195 75,195" fill="url(#rockGrad)"/>
    <polygon points="200,190 215,182 225,188 220,200 205,198" fill="url(#rockGrad)"/>

    <!-- Buih Ombak Pecah di Karang -->
    <path d="M 115 168 Q 140 150 165 158 Q 170 182 145 194 Z" fill="#ffffff" opacity="0.65"/>
    <path d="M 165 135 Q 195 115 230 120 Q 245 150 220 170 Z" fill="#ffffff" opacity="0.6"/>

    <!-- Garis Buih Ombak Pantai Timur -->
    <path d="M 0 142 Q 50 146 100 150 Q 180 155 256 160" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.85"/>
    <path d="M 0 144 Q 50 148 100 152 Q 180 157 256 162" fill="none" stroke="#ade8f4" stroke-width="1.5" opacity="0.6"/>

    <!-- Pohon Kelapa & Tebing Hijau di Daratan -->
    <g transform="translate(40, 40) scale(0.7)">
      <path d="M 12 30 Q 15 15 12 5" stroke="#7f5539" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 12 5 Q 5 0 0 5" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 18 0 24 6" stroke="#2d6a4f" stroke-width="2" fill="none"/>
      <path d="M 12 5 Q 4 10 2 15" stroke="#40916c" stroke-width="1.8" fill="none"/>
      <path d="M 12 5 Q 20 10 22 16" stroke="#40916c" stroke-width="1.8" fill="none"/>
    </g>
  </svg>`;
}

// 4. TILE 16/52119/34044: LAUT LEPAS SAMUDRA HINDIA (BARAT)
function getSvgLautBarat() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="deepOceanGradW" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#03045e" stop-opacity="0.96"/>
        <stop offset="50%" stop-color="#023e8a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#03045e" stop-opacity="0.96"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="url(#deepOceanGradW)"/>
    <!-- Ombak Samudra Lepas -->
    <path d="M 15 40 Q 55 35 95 40 T 175 40 T 250 40" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>
    <path d="M 30 90 Q 70 85 110 90 T 190 90 T 255 90" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.3"/>
    <path d="M 5 150 Q 45 145 85 150 T 165 150 T 245 150" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>
    <path d="M 25 210 Q 65 205 105 210 T 185 210 T 250 210" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.3"/>
  </svg>`;
}

// 5. TILE 16/52120/34044: LAUT TENGAH SAMUDRA HINDIA (DENGAN PERAHU NELAYAN JUKUNG)
function getSvgLautTengah() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="deepOceanGradM" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#03045e" stop-opacity="0.96"/>
        <stop offset="50%" stop-color="#023e8a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#03045e" stop-opacity="0.96"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="url(#deepOceanGradM)"/>
    <path d="M 0 35 Q 40 30 80 35 T 160 35 T 240 35" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>
    <path d="M 20 85 Q 60 80 100 85 T 180 85 T 255 85" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.3"/>
    <path d="M 10 145 Q 50 140 90 145 T 170 145 T 250 145" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>
    <path d="M 30 205 Q 70 200 110 205 T 190 205 T 255 205" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.3"/>

    <!-- Perahu Nelayan Tradisional Sawarna (Jukung dengan Katir Sayap) -->
    <g transform="translate(110, 110) scale(0.85)" opacity="0.92">
      <!-- Bayangan Perahu di Air -->
      <ellipse cx="20" cy="18" rx="22" ry="5" fill="#001233" opacity="0.4"/>
      <!-- Badan Perahu (Kayu Putih & Biru) -->
      <path d="M 0 12 Q 20 18 40 12 L 36 16 Q 20 20 4 16 Z" fill="#ffffff" stroke="#0077b6" stroke-width="1"/>
      <path d="M 5 13 L 35 13 L 33 15 L 7 15 Z" fill="#e63946"/>
      <!-- Tiang Layar & Layar Segitiga Kuning Ceria -->
      <line x1="20" y1="12" x2="20" y2="0" stroke="#7f5539" stroke-width="1.5"/>
      <polygon points="20,1 32,10 20,10" fill="#ffb703" opacity="0.95"/>
      <!-- Katir / Sayap Penyeimbang Bambu Tradisional -->
      <line x1="10" y1="10" x2="6" y2="22" stroke="#d4a373" stroke-width="1.2"/>
      <line x1="30" y1="10" x2="34" y2="22" stroke="#d4a373" stroke-width="1.2"/>
      <line x1="2" y1="22" x2="38" y2="22" stroke="#ffffff" stroke-width="2"/>
    </g>
  </svg>`;
}

// 6. TILE 16/52121/34044: LAUT LEPAS SAMUDRA HINDIA (TIMUR)
function getSvgLautTimur() {
  return `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="deepOceanGradE" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#03045e" stop-opacity="0.96"/>
        <stop offset="50%" stop-color="#023e8a" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#03045e" stop-opacity="0.96"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" fill="url(#deepOceanGradE)"/>
    <path d="M 10 45 Q 50 40 90 45 T 170 45 T 250 45" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>
    <path d="M 25 95 Q 65 90 105 95 T 185 95 T 255 95" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.3"/>
    <path d="M 5 155 Q 45 150 85 155 T 165 155 T 245 155" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.35"/>
    <path d="M 20 215 Q 60 210 100 215 T 180 215 T 250 215" fill="none" stroke="#48cae4" stroke-width="1.5" opacity="0.3"/>
  </svg>`;
}

// ========================================================
// RENDER KE PNG TILE MENGGUNAKAN SHARP
// ========================================================

const tileGenerators = [
  { x: 52119, y: 34043, svg: getSvgPesisirBarat(), name: 'Pesisir Barat' },
  { x: 52120, y: 34043, svg: getSvgPesisirTengah(), name: 'Pesisir Tengah Ciantir' },
  { x: 52121, y: 34043, svg: getSvgPesisirTimur(), name: 'Pesisir Timur Karang' },
  { x: 52119, y: 34044, svg: getSvgLautBarat(), name: 'Laut Barat' },
  { x: 52120, y: 34044, svg: getSvgLautTengah(), name: 'Laut Tengah' },
  { x: 52121, y: 34044, svg: getSvgLautTimur(), name: 'Laut Timur' }
];

async function generateAllTiles() {
  console.log('Mulai rendering tile ilustrasi presisi (Zoom 16)...');

  for (const t of tileGenerators) {
    const colDir = path.join(tilesBaseDir, String(t.x));
    ensureDir(colDir);

    const outPath = path.join(colDir, `${t.y}.png`);
    const svgBuffer = Buffer.from(t.svg);

    await sharp(svgBuffer)
      .resize(256, 256)
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outPath);

    console.log(`Rendered: ${outPath} (${t.name})`);
  }

  console.log('Semua 6 tile laut & pesisir selesai dibuat!');
}

generateAllTiles();
