# 📰 Script Automation: Generate 34 Portal Berita

Saya telah membuat sistem otomatis untuk generate **34 folder website portal berita** dengan tema yang berbeda-beda, tapi konten yang sama.

---

## 📋 File yang Dibuat

### 1. **`tools/sites-config.json`**
Template konfigurasi untuk 34 portal berita. Berisi:
- **folderName**: Nama folder untuk setiap site (site-01, site-02, dst)
- **siteName**: Nama portal berita (akan replace "BizNews")
- **email**: Email portal (akan replace "jabarbersuara@gmail.com")
- **socialHandle**: Handle social media (akan replace "jabarbersuara")
- **colors**: Tema warna
  - **primary**: Warna utama kuning (contoh: #0EA5E9 → custom)
  - **dark**: Warna gelap hitam (contoh: #075985 → custom)
  - **secondary**: Warna sekunder

### 2. **`tools/generate-sites.js`**
Script Node.js yang akan:
1. Membaca `sites-config.json`
2. Untuk setiap dari 34 site:
   - Copy folder **BizNews** → folder baru
   - Replace otomatis di **semua file** (.html, .css, .js, .json):
     - Nama portal berita
     - Email
     - Handle social media
     - Warna tema

---

## 🚀 Cara Menggunakan

### **Langkah 1: Siapkan Daftar Portal & Warna**

Kumpulkan informasi untuk 34 portal Anda:
- Nama portal berita (contoh: "Tech Daily", "Sports News", dst)
- Email portal (contoh: "techdaily@gmail.com")
- Warna tema (primary color & dark color dalam format HEX, contoh: #FF6B35)

Contoh daftar bisa seperti ini:
```
1. Tech Daily - #FF6B35 (dark: #001E3C) - techdaily@gmail.com
2. Sports Daily - #FF1493 (dark: #0A0E27) - sportsdaily@gmail.com
3. Finance Daily - #00D9FF (dark: #0B3446) - financedaily@gmail.com
... (34 total)
```

### **Langkah 2: Edit `sites-config.json`**

Buka file `tools/sites-config.json` dan edit untuk setiap site:

```json
{
  "id": 1,
  "folderName": "site-01-techdaily",
  "siteName": "Tech Daily",
  "email": "techdaily@gmail.com",
  "socialHandle": "techdaily",
  "colors": {
    "primary": "#FF6B35",
    "dark": "#001E3C",
    "secondary": "#2C3E50"
  }
}
```

**Yang perlu di-edit:**
- `folderName`: Ganti nama folder (gunakan lowercase, no spaces)
- `siteName`: Ganti nama portal
- `email`: Ganti email
- `socialHandle`: Ganti handle social media (tanpa @)
- `colors.primary`: Ganti warna utama
- `colors.dark`: Ganti warna gelap
- `colors.secondary`: Ganti warna sekunder (opsional)

### **Langkah 3: Jalankan Script**

Buka **Terminal** di folder project dan jalankan:

```bash
cd tools
node generate-sites.js
```

Atau dari root folder:
```bash
node tools/generate-sites.js
```

### **Langkah 4: Hasilnya**

Script akan membuat 34 folder baru:
```
📁 site-01-techdaily/
📁 site-02-sportsdaily/
📁 site-03-financedaily/
...
📁 site-34-...
```

Setiap folder berisi website portal berita lengkap dengan:
- ✅ Nama portal + email + social handle custom
- ✅ Warna tema sesuai konfigurasi
- ✅ Konten/artikel sama persis

---

## 📝 Yang Akan Di-Replace Otomatis

Script akan mengganti di **semua file** (.html, .css, .js):

| Yang Direplac | Diganti Dengan |
|---|---|
| `BizNews` | `siteName` dari config |
| `jabarbersuara` | `siteName` (tanpa spaces) |
| `jabarbersuara` | `socialHandle` |
| `jabarbersuara@gmail.com` | `email` |
| `#0EA5E9` (primary) | Warna primary dari config |
| `#075985` (dark) | Warna dark dari config |
| `#1F5F1F` (secondary) | Warna secondary dari config |

---

## 🔄 Jika Ingin Generate Ulang

Kalau Anda ingin update warna atau nama portal, tinggal:
1. Edit `sites-config.json`
2. Jalankan `node tools/generate-sites.js` lagi
3. Script akan **otomatis delete folder lama dan bikin yang baru** dengan konfigurasi terbaru

---

## ⚡ Contoh Cepat (Pre-filled)

Di `sites-config.json` sudah ada **34 template dengan warna berbeda**. Kalau Anda ingin test cepat:

1. Jalankan langsung: `node tools/generate-sites.js`
2. Akan generate 34 folder dengan default values
3. Kemudian edit warna dan nama sesuai keinginan
4. Jalankan lagi untuk update

---

## 🎨 Color Palette Suggestions

Jika belum punya ide warna, berikut saran:

| Kategori | Warna Primary | Warna Dark |
|---|---|---|
| Tech/IT | #0099FF | #001E3C |
| Sports | #FF1493 | #0A0E27 |
| Finance | #00D9FF | #0B3446 |
| Health | #7FFF00 | #1A2E0E |
| Education | #FF4500 | #2B1A0F |
| Travel | #00CED1 | #0D2E37 |
| Food | #FFD700 | #2B2713 |
| Lifestyle | #FF69B4 | #3D1F2E |
| News | #FF6B35 | #001E3C |
| Business | #1E90FF | #0F1F3F |

---

## 📞 Troubleshooting

### Script error "Config not found"
- Pastikan Anda menjalankan dari folder yang tepat
- Periksa `tools/sites-config.json` ada di tempat yang benar

### Warna tidak berubah di website
- Periksa format HEX warna (#RRGGBB)
- Pastikan tidak ada typo di config
- Jalankan script lagi

### Folder duplikat
- Script otomatis akan delete folder lama sebelum membuat yang baru
- Jadi aman untuk re-run berkali-kali

---

## ✨ Keuntungan Sistem Ini

✅ **Otomatis**: Generate 34 folder sekaligus dalam hitungan detik  
✅ **Consistent**: Semua file ter-replace dengan sempurna  
✅ **Flexible**: Gampang di-edit dan di-update  
✅ **Scalable**: Bisa di-expand ke lebih dari 34 jika perlu  
✅ **Safe**: Original folder BizNews tidak akan di-delete  

---

Sekarang tinggal Anda cari nama-nama 34 portal berita dan warna-warnanya, terus edit config file dan jalankan scriptnya! 🚀
