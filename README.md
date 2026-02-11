# Prediksi Pakan Domba (Full Stack)

Aplikasi full stack untuk membantu prediksi kebutuhan pakan domba menggunakan pendekatan **multiple linear regression**. Pengguna dapat memilih jenis pakan default atau menambahkan jenis pakan kustom, kemudian menjalankan prediksi berdasarkan data domba.

## Fitur Utama

- Frontend responsif (desktop dan mobile) dengan halaman:
  - `index.html` (beranda)
  - `input-data.html` (form input & tambah pakan)
  - `proses.html` (loading/progress)
  - `hasil.html` (hasil prediksi)
- Backend Node.js + Express.js
- Database SQLite
- API untuk:
  - Ambil daftar jenis pakan
  - Tambah jenis pakan baru
  - Hitung prediksi dan simpan histori
- Integrasi frontend-backend menggunakan `fetch()`

---

## Struktur Repository

```txt
/README.md
/backend
  /server.js
  /routes
     feedTypes.js
     predict.js
  /models
     db.js
     feedTypeModel.js
     predictionModel.js
/database
  database.sqlite (dibuat otomatis saat server jalan)
/public
  /css
      style.css
  /js
      main.js
  /img
  index.html
  input-data.html
  proses.html
  hasil.html
package.json
```

---

## Setup & Menjalankan Lokal

### 1) Install dependency

```bash
npm install
```

### 2) Jalankan server

```bash
npm start
```

Server default berjalan di:

- `http://localhost:3000`

### 3) Jalankan mode development (opsional)

```bash
npm run dev
```

---

## Database

- Database menggunakan SQLite file: `database/database.sqlite`
- Tabel dibuat otomatis saat server start pertama kali:
  - `FeedTypes (id, name, protein, energy)`
  - `Predictions (id, berat, umur, jumlah, feedType, result, createdAt)`
- Data jenis pakan default otomatis di-seed:
  - Complete Feed
  - Breeding
  - Fattening
  - Silase

---

## Cara Perhitungan Regresi

Model regresi linear berganda yang dipakai:

\[
y = b_0 + b_1(berat) + b_2(umur) + b_3(jumlah) + b_4(protein) + b_5(energi)
\]

Dengan koefisien baseline pada aplikasi:

- `b0 = 5`
- `b1 = 0.25`
- `b2 = 0.1`
- `b3 = 0.5`
- `b4 = 1.2`
- `b5 = 0.003`

Nilai `protein` dan `energi` diambil dari jenis pakan (default atau kustom) sehingga feed type kustom otomatis ikut memengaruhi nilai prediksi.

---

## API Endpoint

## 1) GET `/api/feed-types`
Mengembalikan semua jenis pakan.

Contoh response:

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Complete Feed", "protein": 16, "energy": 2500 }
  ]
}
```

## 2) POST `/api/feed-types`
Simpan jenis pakan baru.

Body request:

```json
{
  "name": "Pakan Premium",
  "protein": 17.5,
  "energy": 2550
}
```

Contoh response sukses:

```json
{
  "success": true,
  "data": { "id": 5, "name": "Pakan Premium", "protein": 17.5, "energy": 2550 },
  "message": "Jenis pakan baru berhasil ditambahkan."
}
```

## 3) POST `/api/predict`
Hitung prediksi berdasarkan input pengguna.

Body request:

```json
{
  "berat": 35,
  "umur": 10,
  "jumlah": 12,
  "feedTypeId": 1
}
```

Contoh response:

```json
{
  "success": true,
  "data": {
    "prediction": 61.55,
    "feedType": { "id": 1, "name": "Complete Feed", "protein": 16, "energy": 2500 },
    "record": {
      "id": 3,
      "berat": 35,
      "umur": 10,
      "jumlah": 12,
      "feedType": "Complete Feed",
      "result": 61.55,
      "createdAt": "2026-01-01 10:10:10"
    }
  }
}
```

---

## Alur Penggunaan

1. Buka halaman `input-data.html`.
2. Isi berat, umur, jumlah domba.
3. Pilih jenis pakan.
4. Jika ingin pakan baru, pilih **Tambah Jenis Pakan** lalu isi form dan simpan.
5. Jalankan prediksi.
6. Halaman proses akan menampilkan loading.
7. Hasil akhir tampil di `hasil.html`.

---

## Catatan

- Sistem ini disiapkan agar rapi dan mudah dikembangkan untuk kebutuhan skripsi.
- Koefisien regresi dapat disesuaikan dengan hasil training data lapangan Anda.
