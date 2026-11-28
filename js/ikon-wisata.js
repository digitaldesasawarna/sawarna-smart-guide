/*
 * Ikon ilustrasi khas tiap wisata untuk peta besar Sawarna (docs/DESIGN.md §4.14).
 * Gambar kecil berwarna bergaya peta (garis tepi tipis), viewBox 100×100, alas di bawah tengah.
 */
(function () {
  const G = 'stroke="#26313D" stroke-opacity=".45" stroke-width="1" stroke-linejoin="round"';
  const laut = (cy = 72, rx = 44, ry = 17) => `<ellipse cx="50" cy="${cy + 4}" rx="${rx}" ry="${ry}" fill="#152638" opacity=".18"/>
    <ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="#4E98CB" ${G}/><ellipse cx="50" cy="${cy - 2}" rx="${rx - 6}" ry="${ry - 5}" fill="#6FB3E0"/>`;
  const ombak = (y) => `<path d="M14 ${y}q6-3 12 0t12 0M60 ${y + 4}q6-3 12 0t12 0M34 ${y + 9}q5-3 10 0t10 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>`;
  const kelapa = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0q-3-14 2-28" stroke="#8A5A36" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M2-28q-12-6-18 2q9-4 18-2zM2-28q12-6 18 3q-9-5-18-3zM2-28q-4-10-14-10q8 3 14 10zM2-28q6-10 15-8q-9 2-15 8z" fill="#3E8A4E" ${G}/></g>`;

  const IKON = {
    // pasir putih melengkung, ombak, papan selancar & kelapa
    ciantir: `${laut(70)}${ombak(64)}
      <path d="M6 72q44 30 88 0q-10 14-44 15q-34-1-44-15z" fill="#F7EACB" ${G}/><path d="M12 76q38 20 76 0" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/>
      ${kelapa(22, 80, 1.05)}
      <g transform="translate(66 80) rotate(-10)"><ellipse cx="0" cy="-17" rx="5.5" ry="19" fill="#F2C14E" ${G}/><path d="M0-35V1" stroke="#E0674F" stroke-width="2"/></g>`,
    // dua batu karang kembar seperti layar kapal
    "tanjung-layar": `${laut(76, 44, 15)}${ombak(72)}
      <path d="M28 80l4-46q6-8 12-2l4 48z" fill="#8C7A68" ${G}/><path d="M32 34q6-8 12-2l-2 6q-5-4-10 0z" fill="#5E9A45"/><path d="M44 34l4 46h-6l-2-44z" fill="#6E5F51"/>
      <path d="M52 80l3-30q5-6 10-1l3 31z" fill="#9C8A76" ${G}/><path d="M55 50q5-6 10-1l-1 5q-4-3-8 0z" fill="#5E9A45"/><path d="M65 49l3 31h-5l-1-30z" fill="#7A6A5A"/>
      <path d="M22 81q8-5 14 0q6-6 12 0q6-5 12 0q6-6 14 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    // teluk tenang, perahu nelayan, matahari terbit
    "legon-pari": `<circle cx="70" cy="40" r="12" fill="#F6B04B"/><circle cx="70" cy="40" r="17" fill="#F6B04B" opacity=".25"/>
      <path d="M6 66q2-22 22-26q22-4 44 2q20 6 22 24z" fill="#6FAE4E" ${G}/><path d="M18 48q8 6 4 14M78 48q-6 8 0 16" stroke="#4E8B3A" stroke-width="2" fill="none"/>
      ${laut(72, 40, 15)}<path d="M14 74q36 18 72 0" stroke="#F7EACB" stroke-width="4" fill="none"/>
      <g transform="translate(48 70)"><path d="M-14 0h28l-5 6h-18z" fill="#E0674F" ${G}/><path d="M0 0v-20" stroke="#5C4538" stroke-width="1.4"/><path d="M1-19l10 16h-10z" fill="#fff" ${G}/></g>`,
    // mulut gua karang di tepi laut
    "goa-langir": `${laut(76, 44, 15)}${ombak(74)}
      <path d="M12 78q-2-30 20-40q18-8 36 0q22 10 20 40z" fill="#A08C74" ${G}/><path d="M20 50q14-12 30-12" stroke="#BFAE96" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M30 78q0-22 20-22q20 0 20 22z" fill="#2E2A26" ${G}/><path d="M36 78q0-14 14-14" stroke="#4A433C" stroke-width="2" fill="none"/>
      <path d="M26 36q10-10 22-8q10-6 20 4" stroke="#5E9A45" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M24 80q6-4 12 0q14-5 28 0q6-4 12 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    // bongkah karang besar seperti bokor, ombak memecah
    "karang-bokor": `${laut(76, 44, 15)}${ombak(76)}
      <path d="M18 78q-4-18 12-26q20-10 40 0q16 8 12 26z" fill="#8F7E6C" ${G}/><path d="M24 56q18-10 34-2" stroke="#ADA08C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M30 52q10-8 22-6q8 0 14 6" stroke="#5E9A45" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M80 70q8-14 4-26q8 10 6 26zM84 60q6-6 10-4q-4 6-10 4z" fill="#fff" opacity=".95"/><circle cx="76" cy="50" r="2.4" fill="#fff"/><circle cx="88" cy="46" r="1.8" fill="#fff"/>`,
    // karang bertingkat, ombak jatuh berundak seperti air terjun laut
    "karang-taraje": `${laut(78, 44, 14)}
      <path d="M18 80v-14h64v14z" fill="#8C7A68" ${G}/><path d="M24 66v-12h52v12z" fill="#9C8A76" ${G}/><path d="M32 54v-12h36v12z" fill="#AC9A84" ${G}/>
      <path d="M32 42h36" stroke="#5E9A45" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 42v12M52 42v12M60 42v12M38 54v12M50 54v12M62 54v12M30 66v14M44 66v14M56 66v14M70 66v14" stroke="#E4F4FC" stroke-width="2.4" stroke-linecap="round" opacity=".95"/>
      <path d="M16 82q8-5 16 0q8-5 16 0q8-5 16 0q8-5 16 0q4-3 8 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  };
  window.ikonWisata = (id) => `<svg class="iw-svg" viewBox="0 0 100 100" aria-hidden="true">${IKON[id] || IKON.ciantir}</svg>`;
})();
