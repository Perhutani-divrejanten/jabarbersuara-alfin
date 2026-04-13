# 📸 Panduan Google Drive Images untuk Jabar Bersuara

## 🎯 **Cara Agar Google Drive Images Bisa Kebaca**

### **Metode 1: Gunakan Thumbnail URL (REKOMENDASI)**
Google Drive secara otomatis mengkonversi sharing links ke thumbnail format yang bisa diakses publik.

**Format Input di Google Sheets:**
```
https://drive.google.com/file/d/1w30gzB_ayOtouh-NwmjqV2qG8lhBaqhl/view?usp=sharing
```

**Otomatis diubah menjadi:**
```
https://drive.google.com/thumbnail?id=1w30gzB_ayOtouh-NwmjqV2qG8lhBaqhl&sz=w1000
```

### **Metode 2: Set Permissions ke "Anyone with link can view"**
1. **Upload gambar** ke Google Drive
2. **Klik kanan** pada file → **Get shareable link**
3. **Set permissions** ke **"Anyone with the link"**
4. **Copy link** dan paste ke Google Sheets

### **Metode 3: Gunakan Direct Image URL (Alternatif)**
Jika thumbnail tidak bekerja, gunakan direct image URL:

**Format:**
```
https://drive.google.com/uc?export=view&id=FILE_ID_HERE
```

**Contoh:**
```
https://drive.google.com/uc?export=view&id=1w30gzB_ayOtouh-NwmjqV2qG8lhBaqhl
```

### **Metode 4: Upload ke Folder img/ (Backup)**
Jika Google Drive bermasalah, upload langsung ke folder `img/` di project:

1. **Upload gambar** ke folder `img/`
2. **Di Google Sheets** isi column `image` dengan: `img/nama-gambar.jpg`

## 🔧 **Troubleshooting**

### **Gambar Tidak Muncul?**
1. ✅ **Cek Permissions**: Pastikan file "Anyone with link can view"
2. ✅ **Cek URL Format**: Gunakan thumbnail format
3. ✅ **Test URL**: Buka URL langsung di browser
4. ✅ **Clear Cache**: Ctrl+F5 untuk hard refresh

### **Error Loading Images?**
- **Console Error**: `Failed to load resource`
- **Solusi**: Cek network tab di browser dev tools
- **Fallback**: Script otomatis pakai `img/placeholder.jpg`

## 📊 **Format yang Didukung**

| Format Input | Status | Output |
|-------------|--------|--------|
| `drive.google.com/file/d/.../view` | ✅ Auto-convert | `drive.google.com/thumbnail?id=...&sz=w1000` |
| `drive.google.com/open?id=...` | ✅ Auto-convert | `drive.google.com/thumbnail?id=...&sz=w1000` |
| `drive.google.com/uc?export=view&id=...` | ✅ Direct | Tetap sama |
| `img/filename.jpg` | ✅ Local | Tetap sama |

## 🚀 **Workflow Otomatis**

Ketika Anda push ke GitHub:
1. **GitHub Actions** menjalankan `npm run generate`
2. **Script otomatis** mengkonversi semua Google Drive links
3. **articles.json** terupdate dengan URL yang benar
4. **Homepage** otomatis load gambar yang benar

## 📝 **Tips untuk Google Sheets**

### **Column Setup:**
- **Column A**: `title` - Judul artikel
- **Column B**: `excerpt` - Ringkasan
- **Column C**: `category` - Kategori (Lingkungan, Local, dll)
- **Column D**: `date` - Tanggal (format: YYYY-MM-DD)
- **Column E**: `image` - **URL Google Drive di sini**
- **Column F**: `url` - Link artikel (article/filename.html)

### **Contoh Data:**
```
Title: Perhutani Bandung Selatan Sukseskan Pembangunan Kehutanan
Excerpt: Perhutani KPH Bandung Selatan berkoordinasi dengan CDK V wilayah V...
Category: Lingkungan
Date: 2026-01-05
Image: https://drive.google.com/file/d/1w30gzB_ayOtouh-NwmjqV2qG8lhBaqhl/view?usp=sharing
URL: article/berita18-f.html
```

## 🎉 **Hasil Akhir**

Dengan setup yang benar:
- ✅ **Gambar tampil** di homepage
- ✅ **Loading cepat** dengan thumbnail format
- ✅ **Responsive** di semua device
- ✅ **Error handling** dengan fallback images
- ✅ **Auto-update** setiap ada perubahan di Sheets

**Gambar Google Drive Anda sekarang siap digunakan!** 📸✨</content>
<parameter name="filePath">c:\KULIAH\MAGANG\Magang di Perhutani\jabarbersuara\GOOGLE_DRIVE_IMAGES_GUIDE.md