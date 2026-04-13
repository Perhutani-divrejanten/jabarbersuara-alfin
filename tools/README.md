# 📰 BizNews Article Generator

Skrip otomatis untuk generate artikel dari Google Sheets dan mengintegrasikannya **langsung** ke website BizNews (menu News, Search, Related Articles).

## ✨ Fitur

- ✅ Baca data dari Google Sheets (via Apps Script JSON endpoint)
- ✅ **Otomatis update `articles.json`** (database pusat website)
- ✅ Generate file HTML artikel terintegrasi ke folder `article/`
- ✅ File HTML match styling & layout website yang sudah ada
- ✅ Support gambar lokal atau URL publik
- ✅ Otomatis muncul di **menu News**, **Search**, & **Related Articles**
- ✅ Slug otomatis dari judul atau kolom `slug`
- ✅ Backup otomatis `articles.json` sebelum update

## 📋 Persyaratan

- **Node.js 14+** (download dari https://nodejs.org)
- **Google Sheets** dengan data artikel terstruktur
- **Apps Script endpoint** sudah di-deploy (berisi URL: https://script.google.com/macros/s/AKfycbzk7H09i-P5_5wPc82mgr53poH-3wtJi8kEe3eIsTqHmcdutsT-T1sPgnA5qx1SLtzpSg/exec)
- **Folder `img/`** untuk menyimpan gambar artikel

## 🚀 Quick Start

### 1. Pastikan Dependencies Terinstall

Jika belum, jalankan di folder `tools/`:
```bash
npm install
```

### 2. Verifikasi Config

URL endpoint Google Sheets sudah benar di `generate.js`:
```javascript
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzk7H09i-P5_5wPc82mgr53poH-3wtJi8kEe3eIsTqHmcdutsT-T1sPgnA5qx1SLtzpSg/exec';
```

### 3. Jalankan Generator

```bash
npm start
```

atau:
```bash
node generate.js
```

**Output:**
- ✅ Artikel HTML baru di `article/` folder
- ✅ `articles.json` di-update dengan entry baru
- ✅ Backup otomatis: `articles.json.bak.xxxxx`
- ✅ Artikel otomatis muncul di `news.html` dan `search.html`

**Testing:**
1. Buka `news.html` → artikel terbaru akan di-list paling atas
2. Buka `search.html` → cari artikelberdasarkan judul atau kategori
3. Klik artikel → buka file HTML di `article/berita1-f.html` (atau nama slug Anda)

## 📊 Format Google Sheet

**Kolom minimal yang diperlukan:**

| slug | title | date | category | badge | image | excerpt | content | author |
|------|-------|------|----------|-------|-------|---------|---------|--------|
| berita1-f | Perhutani KPH... | 2026-02-02 | Lingkungan | Utama | beritaf1.jpg | Ringkasan... | `<p>Isi...</p>` | Alfin S. |

**Keterangan:**
- `slug`: ID unik artikel (nama file), lowercase, gunakan `-` bukan spasi. **Bisa kosong** ← akan auto-generate dari `title`.
- `title`: Judul artikel **(wajib)**.
- `date`: Format YYYY-MM-DD **(wajib)**. Atau format lokal: "02-Feb-2026", "Feb 2, 2026", dll.
- `category`: Kategori artikel (Lingkungan, Teknologi, dll) - akan muncul di `articles.json` & filter search.
- `badge`: Label badge (Utama, Trending, Breaking, dll) - akan ditampilkan di artikel.
- `image`: Nama file gambar (mis. `beritaf1.jpg`) atau URL publik (mis. `https://...`).
  - **Jika nama file:** taruh file di folder `img/` → generator otomatis membuat path `img/beritaf1.jpg`.
  - **Jika URL:** pastikan bisa diakses publik.
- `excerpt`: Ringkasan artikel (akan ditampilkan di daftar berita di `news.html`).
- `content`: Isi artikel (bisa HTML atau plaintext). **Wajib** kalau excerpt kosong.
- `author`: Penulis (opsional).

## 🖼️ Gambar

### Opsi 1: Local di Folder `img/` (Rekomendasi)
1. Upload gambar ke folder `img/` (misal: `img/beritaf1.jpg`).
2. Di Google Sheet, kolom `image` isi nama file: `beritaf1.jpg`
3. Generator otomatis membuat path: `../img/beritaf1.jpg`

### Opsi 2: URL Publik
1. Hosting gambar di server/CDN (atau Google Drive publik).
2. Di Google Sheet, kolom `image` isi URL lengkap: `https://example.com/foto1.jpg`
3. Generator menggunakan URL langsung.

**⚠️ Catatan:** Jika URL tidak accessible atau gambar terhapus, artikel akan tetap ditampilkan tapi tanpa gambar.

## 📁 Struktur & Alur Kerja

```
BizNews/
├── article/                    ← Output file HTML artikel (terintegrasi)
├── img/                        ← Simpan gambar di sini
├── css/                        ← Stylesheet (shared dengan seluruh site)
├── js/                         ← JavaScript
├── articles.json               ← 📊 DATABASE PUSAT (di-update oleh generator)
├── news.html                   ← 📰 Daftar artikel (baca dari articles.json)
├── search.html                 ← 🔍 Search artikel (baca dari articles.json)
├── index.html
└── tools/
    ├── template-new.html       ← Template artikel (match layout website)
    ├── generate.js             ← 🤖 Skrip generator utama
    ├── package.json
    └── README.md               ← File ini
```

**Alur Kerja:**
1. **User** isi data berita di Google Sheets
2. **Generator** (node generate.js) baca dari Google Sheets
3. **Generator** membuat/update file HTML di `article/` folder
4. **Generator** update `articles.json` dengan entry baru
5. **news.html** & **search.html** otomatis menampilkan artikel baru (baca dari articles.json)
6. **Pengunjung** bisa baca artikel, lihat di news list, search, & lihat related articles

## ⚙️ Customization

### Update Template HTML

Jika ingin styling atau struktur berbeda, edit `template-new.html`. Variabel handlebars yang tersedia:
- `{{title}}` - Judul artikel
- `{{date}}` - Tanggal artikel
- `{{badge}}` - Label badge kategori
- `{{category}}` - Kategori artikel (untuk filtering)
- `{{{content}}}` - Isi artikel (raw HTML, 3 kurung = no-escape)
- `{{image}}` - Path/URL gambar
- `{{excerpt}}` - Ringkasan artikel
- `{{author}}` - Nama penulis
- `{{slug}}` - Slug artikel (ID unik)

### Update Google Sheets Endpoint

Jika URL endpoint berubah, update di `generate.js`:
```javascript
const SHEETS_URL = 'https://script.google.com/macros/s/NEW_ID/exec';
```

### Automasi / Scheduling (Optional)

Jalankan generator secara otomatis dengan:
1. **Windows Task Scheduler** - jalankan `node generate.js` setiap jam
2. **GitHub Actions** - trigger kala ada perubahan di repo
3. **Cron (Linux/Mac)** - `0 * * * * cd /path/to/tools && npm start`

### Update Format Tanggal

Jika format tanggal dari Sheets berbeda, modifikasi di `generate.js` baris yang parse `article.date`.

## 🔧 Troubleshooting

### ❌ Error: "Template tidak ditemukan"
- ✅ Pastikan file `template-new.html` ada di folder `tools/`.
- ✅ Verifikasi path di `generate.js`: `const TEMPLATE_PATH = path.join(__dirname, 'template-new.html');`

### ❌ articles.json tidak update
- ✅ Pastikan path `articles.json` benar di `generate.js`.
- ✅ Pastikan file `articles.json` memiliki format JSON valid (bukan rusak).
- ✅ Lihat di terminal apakah ada error saat generate.

### ❌ Artikel tidak muncul di news.html atau search.html
- ✅ Cek `articles.json` - pastikan entry baru ada.
- ✅ Refresh browser (Ctrl+F5) untuk clear cache.
- ✅ Buka web browser console (F12) untuk lihat JavaScript error.
- ✅ Pastikan `news.html` & `search.html` punya JavaScript untuk load `articles.json`.

### ❌ Gambar tidak muncul
- ✅ **Jika lokal:** pastikan file gambar ada di folder `img/` dengan nama yang sama persis (case-sensitive di Linux/Mac).
- ✅ **Jika URL:** buka URL di browser untuk verifikasi akses & valid.
- ✅ Inspector (F12) → Network tab → lihat error saat load gambar.

### ❌ Slug tidak valid atau karakter aneh di filename
- ✅ Pastikan `title` atau `slug` di Sheet tidak ada karakter spesial yang berlebihan.
- ✅ Generator otomatis hapus karakter non-alphanumeric (kecuali `-` & space).

### ❌ Error "Data kosong atau format tidak valid"
- ✅ Buka endpoint Google Sheets di browser: https://script.google.com/macros/s/.../exec
- ✅ Pastikan mengembalikan JSON (bukan error atau HTML halaman).
- ✅ Cek sheet name di Apps Script: `getSheetByName('data')` harus sesuai nama sheet Anda.
- ✅ Pastikan baris pertama sheet adalah header & ada data di bawahnya.

### ℹ️ Cara Lihat Hasil Generate
1. Jalankan: `npm start`
2. Buka file di `article/berita1-f.html` menggunakan Live Server atau buka langsung di browser.
3. Cek: navbar, footer, styling, konten, gambar, & related articles sidebar.
4. Verify di `news.html` → artikel muncul di list dengan gambar & excerpt.
5. Test search di `search.html` → cari judul artikel baru.

## 📚 Referensi

- [Google Apps Script doGet()](https://developers.google.com/apps-script/guides/web/content)
- [Handlebars.js](https://handlebarsjs.com)
- [axios](https://github.com/axios/axios)

## 📞 Support

Jika ada pertanyaan atau masalah, hubungi tim development BizNews.

---

**Last updated:** February 12, 2026  
**Version:** 2.0 (articles.json integration)
