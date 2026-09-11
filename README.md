# PVC & Alum by Sumber Kenari Jaya

Website toko online Panel PVC, Plafon PVC, dan Aluminium menggunakan HTML, CSS, JavaScript, PHP, dan MySQL tanpa framework.

## 1. Menjalankan di XAMPP
1. Install dan buka XAMPP.
2. Jalankan Apache dan MySQL.
3. Salin folder `pvc-living` ke `C:\xampp\htdocs\`.
4. Buka `http://localhost/phpmyadmin`.
5. Buat/import database menggunakan file `pvc_shop.sql`.
6. Buka `http://localhost/pvc-living/`.

## 2. Login Admin
- Username: `admin`
- Password: `admin123`
- URL: `http://localhost/pvc-living/admin.html`

## 3. Kelola Produk
Di dashboard admin:
- Tambah Produk: isi nama, kode, harga, stok, kategori, gambar, dan deskripsi.
- Edit: ubah data produk.
- +10 / -5: menambah atau mengurangi stok.
- Stok: memasukkan stok manual.
- Hapus: hapus setelah konfirmasi.

## 4. Pengaturan Toko
Edit objek `SETTINGS` di `script.js`:
- `whatsapp`: nomor WhatsApp format internasional tanpa `+`, contoh `6281234567890`.
- `email`: alamat email toko.
- `address`: alamat toko.
- `googleMaps`: URL iframe Google Maps.

## 5. Mengganti Password Admin
Di phpMyAdmin jalankan:
```sql
UPDATE users SET password = MD5('password-baru') WHERE username = 'admin';
```

Catatan: MD5 dipakai karena mengikuti spesifikasi awal proyek. Untuk produksi yang lebih aman, migrasikan password ke `password_hash()`/`password_verify()`.

## 6. Hosting
1. Pilih hosting yang mendukung PHP + MySQL.
2. Upload seluruh isi folder `pvc-living` ke public_html/domain.
3. Buat database dan user MySQL.
4. Import `pvc_shop.sql`.
5. Edit `config/database.php` dengan host, nama database, username, dan password hosting.
6. Edit `script.js` dan sesuaikan `SETTINGS`.
7. Karena API memakai `window.location.origin`, tidak perlu mengubah API URL jika folder website/API berada pada domain yang sama.

## 7. Troubleshooting
- Koneksi database gagal: cek MySQL aktif dan isi `config/database.php`.
- 404 API: pastikan folder `api` berada di dalam folder website dan URL website benar.
- Login gagal: pastikan database sudah diimport dan user admin tersedia.
- Gambar tidak muncul: cek path gambar; `assets/images/default.svg` dipakai sebagai fallback.
- CORS: API sudah menyediakan header CORS dasar.
