# Cara Upload Gambar ke Google Drive untuk Jabar Bersuara

## Langkah-langkah Upload Gambar:

### 1. Upload Gambar ke Google Drive
- Buka [Google Drive](https://drive.google.com)
- Upload gambar berita ke folder yang diinginkan
- Klik kanan pada gambar → **Get shareable link**

### 2. Ubah Permission Gambar
- Pastikan gambar di-set ke **"Anyone with the link can view"**
- Klik kanan gambar → Share → Change ke "Anyone with the link"

### 3. Copy Link Sharing
Link yang didapat akan seperti ini:
```
https://drive.google.com/file/d/FILE_ID/view?usp=sharing
```

### 4. Masukkan ke Spreadsheet
- Copy link sharing tersebut
- Paste ke kolom **image** di Google Sheets
- Sistem akan otomatis mengubahnya menjadi direct link yang bisa diakses

## Contoh:
- **Link Sharing**: `https://drive.google.com/file/d/1ABC123.../view?usp=sharing`
- **Otomatis jadi**: `https://drive.google.com/uc?export=view&id=1ABC123...`

## Tips:
- Pastikan gambar dalam format JPG, PNG, atau WebP
- Ukuran gambar maksimal 10MB
- Nama file gambar harus deskriptif (misal: `perhutani-majalengka-2025.jpg`)

## Troubleshooting:
- Jika gambar tidak muncul, pastikan permission "Anyone with the link can view"
- Jika masih tidak muncul, coba refresh halaman atau clear cache browser