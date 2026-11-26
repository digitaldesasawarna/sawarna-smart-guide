# Sawarna Smart Guide — Peta Interaktif Pantai Ciantir

## Acuan wajib
- Baca `docs/PRD.md` (apa & mengapa) dan `docs/DESIGN.md` (bagaimana tampil) sebelum merencanakan atau membangun fitur. Folder `docs/` hanya ada lokal (tidak di-commit).
- Target rilis 6 Desember 2026. Teks antarmuka berbahasa Indonesia (dengan versi Inggris), mobile-first.
- Pesan commit dan deskripsi PR tanpa baris atribusi Claude.

## Skill antarmuka (`.claude/skills/`, dari jakubkrehel/skills, MIT)
Pakai skill yang sesuai setiap kali mengerjakan antarmuka, dan ikuti `docs/DESIGN.md` bila keduanya berbeda:

| Pekerjaan | Skill |
|---|---|
| Tinjauan menyeluruh satu layar/alur | `better-interface` |
| Permukaan, sudut, bayangan, ikon (pin, tombol, kartu) | `better-ui` |
| Palet, token warna, kontras | `better-colors` |
| Huruf, skala teks, pemotongan teks | `better-typography` |
| Tata letak, jarak, responsif HP/laptop | `better-layout` |
| Animasi (pembuka, panel, riak) | `better-motion` |
| Keyboard, fokus, ARIA, WCAG 2.2 | `better-accessibility` |
| Teks antarmuka ID/EN, pesan kosong & galat | `better-writing` |
| Membangun dari gambar/desain | `build-design` |

Dipanggil manual oleh pengguna: `interface-review`, `explain-interface`, `break`, `state-machine`, `variant`, `afk`, `upskill`.

<!-- rtk-instructions v2 -->
# Command output

Command output here is condensed to save tokens, keeping every signal and
dropping costly noise. Treat it as the complete result: run commands
normally, and batch related commands into one call to avoid extra turns.
Truncated results state their recovery path in their own output. Re-run a
command as `rtk bypass <cmd>` only when its result is unusable: empty when
output was clearly expected, contradicting its exit code, or garbled.
<!-- /rtk-instructions -->
