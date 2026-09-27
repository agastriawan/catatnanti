# CatatNanti

Aplikasi web sederhana untuk mahasiswa mencatat dan mengingat hal-hal kecil yang perlu dilakukan.
Dibuat dengan HTML, CSS, dan JavaScript vanilla (tanpa framework/backend), data disimpan di `localStorage` browser.

## Struktur File

```
catatnanti/
├── index.html      # struktur halaman
├── style.css       # tampilan (UI sederhana, bersih, responsif)
├── script.js       # logika CRUD + localStorage
├── vercel.json     # konfigurasi deploy Vercel
└── README.md
```

## Fitur

- Tambah catatan (judul, detail opsional, pengingat opsional)
- Edit catatan
- Hapus catatan (dengan konfirmasi)
- Tandai selesai / belum selesai
- Filter: Semua / Belum Selesai / Selesai
- Penanda visual untuk pengingat yang sudah lewat waktu (overdue)
- Data tersimpan otomatis di localStorage, tetap ada walau browser ditutup

## Menjalankan Secara Lokal

Cukup buka `index.html` langsung di browser, atau jalankan server statis sederhana:

```bash
npx serve .
```

## Deploy ke Vercel

**Cara 1 — Vercel CLI**
```bash
npm i -g vercel
cd catatnanti
vercel
```

**Cara 2 — Import via Dashboard**
1. Push folder ini ke repository GitHub.
2. Buka https://vercel.com/new dan import repo tersebut.
3. Framework Preset pilih **Other** (static site) — tidak perlu build command.
4. Klik Deploy.

Tidak ada proses build maupun dependency; semua file langsung disajikan sebagai static site.
