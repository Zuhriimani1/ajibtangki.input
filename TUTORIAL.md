# Tutorial Setup dan Penggunaan Sistem CRUD Ajib Tangki

## Pendahuluan

Sistem CRUD Ajib Tangki adalah aplikasi web berbasis Google Apps Script yang dirancang khusus untuk mengelola bisnis pengiriman atau jasa tangki. Aplikasi ini menggunakan Google Sheets sebagai database dan menyediakan fitur lengkap untuk manajemen penjualan, pengeluaran, produk, pelanggan, serta perhitungan laba rugi dan rekap rit/retase.

## Fitur Utama

- ✅ **Autentikasi User**: Login dengan username dan password
- ✅ **Manajemen Penjualan**: Input, edit, hapus data penjualan dengan perhitungan otomatis
- ✅ **Manajemen Pengeluaran**: Input, edit, hapus data pengeluaran berdasarkan kategori
- ✅ **Manajemen Produk**: CRUD produk dengan harga dan satuan
- ✅ **Manajemen Pelanggan**: CRUD pelanggan dengan integrasi Google Maps
- ✅ **Perhitungan Laba Rugi**: Hitung laba kotor berdasarkan periode tanggal
- ✅ **Rekap Rit/Retase**: Hitung total perjalanan dan retase
- ✅ **Dashboard Performa**: Tampilan metrik bisnis real-time
- ✅ **Responsive Design**: UI yang dapat diakses dari desktop dan mobile
- ✅ **Real-time Updates**: Data ter-update secara otomatis

## Persiapan Setup

### 1. Membuat Google Spreadsheet Baru

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **"Blank"** atau **"+ New"** untuk membuat spreadsheet baru
3. Beri nama spreadsheet dengan **"Ajib Tangki - Database"** atau nama sesuai preferensi
4. Salin **Spreadsheet ID** dari URL:
   - URL format: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - Contoh: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Spreadsheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 2. Setup Sheet Database

Aplikasi membutuhkan 7 sheet dengan struktur kolom sebagai berikut:

#### Sheet 1: Penjualan
```
ID | Tanggal | PelangganID | ProdukID | Jumlah | Harga | Total | Rit | Status
```
- **ID**: Unique identifier (otomatis generate)
- **Tanggal**: Format YYYY-MM-DD
- **PelangganID**: ID dari sheet Pelanggan
- **ProdukID**: ID dari sheet Produk
- **Jumlah**: Jumlah unit yang dijual
- **Harga**: Harga per unit
- **Total**: Jumlah × Harga (otomatis)
- **Rit**: Jumlah perjalanan/pengiriman
- **Status**: "active" atau "inactive"

#### Sheet 2: Pengeluaran
```
ID | Tanggal | KategoriID | Jumlah | Deskripsi | Status
```
- **ID**: Unique identifier
- **Tanggal**: Format YYYY-MM-DD
- **KategoriID**: ID dari sheet KategoriPengeluaran
- **Jumlah**: Nominal pengeluaran
- **Deskripsi**: Penjelasan pengeluaran
- **Status**: "active" atau "inactive"

#### Sheet 3: Produk
```
ID | Nama | Harga | Satuan | Status
```
- **ID**: Unique identifier
- **Nama**: Nama produk (contoh: "Solar", "Air Bersih")
- **Harga**: Harga per satuan
- **Satuan**: Unit pengukuran (Liter, Kg, dll)
- **Status**: "active" atau "inactive"

#### Sheet 4: KategoriPengeluaran
```
ID | Nama | Status
```
- **ID**: Unique identifier
- **Nama**: Nama kategori (contoh: "BBM", "Maintenance", "Gaji")
- **Status**: "active" atau "inactive"

#### Sheet 5: Users
```
ID | Username | PasswordHash | Role | CreatedDate | Status
```
- **ID**: Unique identifier
- **Username**: Username untuk login
- **PasswordHash**: Hash password (otomatis generate)
- **Role**: "admin" atau "user"
- **CreatedDate**: Tanggal dibuat
- **Status**: "active" atau "inactive"

#### Sheet 6: Pelanggan
```
ID | Nama | Alamat | Telepon | Email | Status
```
- **ID**: Unique identifier
- **Nama**: Nama pelanggan
- **Alamat**: Alamat lengkap (untuk integrasi Google Maps)
- **Telepon**: Nomor telepon
- **Email**: Email (opsional)
- **Status**: "active" atau "inactive"

#### Sheet 7: Log
```
ID | Timestamp | User | Action | Details | IPAddress
```
- **ID**: Unique identifier
- **Timestamp**: Waktu aksi
- **User**: Username yang melakukan aksi
- **Action**: Jenis aksi (LOGIN, CREATE, UPDATE, DELETE)
- **Details**: Detail aksi
- **IPAddress**: Alamat IP (opsional)

### 3. Setup Google Apps Script

1. Di spreadsheet yang sudah dibuat, klik **"Extensions"** → **"Apps Script"**
2. Hapus kode default yang ada
3. Salin seluruh isi file `code.gs` ke editor Apps Script
4. **Ganti SPREADSHEET_ID** pada baris 8 dengan ID spreadsheet Anda:
   ```javascript
   var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
5. Klik **"Save"** (Ctrl + S)

### 4. Deploy Web App

1. Di Apps Script editor, klik **"Deploy"** → **"New deployment"**
2. Pilih tipe: **"Web app"**
3. Isi pengaturan:
   - **Description**: "Ajib Tangki Web App"
   - **Execute as**: "Me" (yourself)
   - **Who has access**: "Anyone" (untuk akses publik) atau "Anyone with the link"
4. Klik **"Deploy"**
5. Salin **Web App URL** yang dihasilkan
6. URL format: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`

## Cara Penggunaan

### Login ke Sistem

1. Buka Web App URL di browser
2. Masukkan kredensial default:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Klik tombol **"Masuk"**

### Dashboard Performa

Setelah login, Anda akan melihat dashboard dengan metrik:
- **Total Penjualan**: Total pendapatan dari semua transaksi
- **Total Pengeluaran**: Total pengeluaran bisnis
- **Laba Kotor**: Penjualan dikurangi pengeluaran
- **Total Produk**: Jumlah produk aktif
- **Produk Terlaris**: 5 produk dengan penjualan tertinggi
- **Pelanggan Terbaik**: 5 pelanggan dengan pembelian terbanyak

### Manajemen Penjualan

#### Input Penjualan Baru:
1. Klik tab **"Penjualan"**
2. Isi form:
   - **Tanggal**: Pilih tanggal transaksi
   - **Pelanggan**: Pilih dari dropdown (harus sudah ada di database)
   - **Produk**: Pilih dari dropdown (harga otomatis terisi)
   - **Jumlah**: Masukkan jumlah unit
   - **Harga**: Harga per unit (otomatis dari produk)
   - **Rit**: Jumlah perjalanan/pengiriman
3. **Total** akan terhitung otomatis
4. Klik **"Tambah"**

#### Edit/Hapus Penjualan:
- Klik tombol **"Edit"** (ikon pensil) pada tabel
- Klik tombol **"Hapus"** (ikon tempat sampah) pada tabel
- Konfirmasi untuk menghapus

### Manajemen Pengeluaran

#### Input Pengeluaran Baru:
1. Klik tab **"Pengeluaran"**
2. Isi form:
   - **Tanggal**: Pilih tanggal pengeluaran
   - **Kategori**: Pilih kategori pengeluaran
   - **Jumlah**: Nominal pengeluaran
   - **Deskripsi**: Penjelasan pengeluaran
3. Klik **"Tambah"**

#### Edit/Hapus Pengeluaran:
- Klik tombol **"Edit"** atau **"Hapus"** pada tabel

### Manajemen Produk

#### Tambah Produk Baru:
1. Klik tab **"Produk"**
2. Isi form:
   - **Nama Produk**: Nama produk
   - **Harga**: Harga per satuan
   - **Satuan**: Unit pengukuran
3. Klik **"Tambah"**

#### Edit/Hapus Produk:
- Klik tombol **"Edit"** atau **"Hapus"** pada tabel

### Manajemen Pelanggan

#### Tambah Pelanggan Baru:
1. Klik tab **"Pelanggan"**
2. Isi form:
   - **Nama**: Nama pelanggan
   - **Alamat**: Alamat lengkap (untuk Google Maps)
   - **Telepon**: Nomor telepon
   - **Email**: Email (opsional)
3. Klik **"Tambah"**

#### Fitur Google Maps:
- Klik alamat pelanggan di tabel untuk membuka Google Maps
- URL akan otomatis generate dari alamat

#### Edit/Hapus Pelanggan:
- Klik tombol **"Edit"** atau **"Hapus"** pada tabel

### Perhitungan Laba Rugi

1. Klik tab **"Laba Rugi"**
2. Pilih **"Tanggal Mulai"** dan **"Tanggal Akhir"**
3. Klik **"Hitung"**
4. Lihat hasil:
   - **Total Penjualan**: Pendapatan dalam periode
   - **Total Pengeluaran**: Biaya dalam periode
   - **Laba Kotor**: Selisih penjualan dan pengeluaran

### Rekap Rit/Retase

1. Klik tab **"Rekap Rit"**
2. Pilih **"Tanggal Mulai"** dan **"Tanggal Akhir"**
3. Klik **"Hitung"**
4. Lihat hasil:
   - **Total Rit**: Total perjalanan dalam periode
   - **Total Retase**: Total pendapatan dari semua rit
   - **Rata-rata per Rit**: Pendapatan rata-rata per perjalanan

### Pengaturan Kategori Pengeluaran

1. Klik tab **"Pengaturan"**
2. Di bagian **"Kategori Pengeluaran"**:
   - Masukkan nama kategori baru
   - Klik **"Tambah Kategori"**
3. Kategori akan muncul di dropdown saat input pengeluaran

## Penggunaan Lanjutan

### Mengubah Password Default

1. Login dengan kredensial default
2. Akses sheet **"Users"** di spreadsheet
3. Edit kolom **"PasswordHash"** dengan hash password baru
4. Gunakan tool online untuk generate SHA-256 hash

### Backup Data

1. Buka Google Spreadsheet
2. Klik **"File"** → **"Download"** → **"Microsoft Excel"** atau **"PDF"**
3. Simpan file backup secara berkala

### Monitoring Log

1. Buka sheet **"Log"** di spreadsheet
2. Monitor aktivitas user:
   - Login attempts
   - Data creation/update/deletion
   - Error logs

## Troubleshooting

### Masalah Login
- Pastikan username dan password benar
- Username: `admin`, Password: `admin123`
- Cek sheet **"Users"** jika ada masalah autentikasi

### Data Tidak Muncul
- Refresh halaman (Ctrl + F5)
- Cek koneksi internet
- Pastikan spreadsheet ID sudah benar di code.gs

### Error "Sheet not found"
- Pastikan semua sheet sudah dibuat sesuai tutorial
- Cek nama sheet persis sama (case-sensitive)

### Performa Lambat
- Kurangi jumlah data dalam satu sheet
- Gunakan filter di DataTables
- Archive data lama ke sheet terpisah

### Google Maps Tidak Berfungsi
- Pastikan alamat pelanggan diisi dengan lengkap
- Cek format alamat (jalan, kota, kode pos)
- Buka Google Maps secara manual untuk test

## Tips Penggunaan Optimal

### Input Data Efisien
- Input data penjualan dan pengeluaran setiap hari
- Gunakan kategori pengeluaran yang konsisten
- Pastikan data pelanggan dan produk lengkap sebelum input transaksi

### Analisis Bisnis
- Gunakan fitur Laba Rugi untuk analisis periode tertentu
- Monitor Rekap Rit untuk efisiensi operasional
- Pantau dashboard untuk tracking performa real-time

### Keamanan Data
- Jaga kerahasiaan Web App URL
- Backup data secara rutin
- Monitor log aktivitas user
- Gunakan password yang kuat untuk akun Google

### Mobile Usage
- Aplikasi responsive untuk semua device
- Gunakan browser Chrome untuk performa optimal
- Bookmark Web App URL untuk akses cepat

## Support dan Development

### Menambah Fitur Baru
1. Edit file `code.gs` untuk backend
2. Edit file `index.html` untuk frontend
3. Deploy ulang web app setelah perubahan

### Customisasi UI
- Edit CSS di `index.html` untuk styling
- Modifikasi struktur HTML sesuai kebutuhan
- Tambah tab baru untuk fitur tambahan

### Integrasi API
- Tambah Google Maps API untuk fitur lanjutan
- Integrasikan dengan sistem akuntansi lain
- Export data ke format lain (PDF, CSV)

---

**Catatan Penting:**
- Pastikan Google Account memiliki akses edit ke spreadsheet
- Jaga keamanan Spreadsheet ID dan Web App URL
- Lakukan backup rutin untuk menghindari kehilangan data
- Monitor quota Google Apps Script untuk penggunaan optimal

Dengan mengikuti tutorial ini, Anda akan memiliki sistem manajemen bisnis yang lengkap dan siap digunakan untuk operasional bisnis Ajib Tangki.