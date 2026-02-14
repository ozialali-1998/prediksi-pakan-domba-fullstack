# Prediksi Pakan Domba (Express + HTML Statis)

Aplikasi fullstack untuk memprediksi kebutuhan pakan domba **1 bulan ke depan** menggunakan **regresi linear berbasis data historis**, sekaligus menghitung nilai **MAPE** beserta interpretasi akurasinya.

## Fitur

- Form input berisi:
  - Bulan yang akan diprediksi
  - Jumlah domba
  - Konsumsi pakan
  - Jenis pakan (`Fattening`, `Breeding`, `Silase`, `Complete`)
- Prediksi menggunakan model regresi linear dari data bulan-bulan sebelumnya
- Menampilkan:
  - Nilai prediksi
  - MAPE (%)
  - Interpretasi akurasi (`Sangat Baik`, `Baik`, `Cukup`, `Buruk`)
- Frontend statis di folder `public`
- Backend Express.js + SQLite

## Struktur Proyek

```txt
/README.md
/backend
  /server.js
  /routes
    feedTypes.js
    prediksi.js
    predict.js
  /models
    db.js
    feedTypeModel.js
    predictionModel.js
  /services
    regressionService.js
/database
  database.sqlite (dibuat otomatis)
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

## Setup

1. Install dependency

```bash
npm install
```

2. Jalankan aplikasi

```bash
npm start
```

Aplikasi berjalan di `http://localhost:3000`.

## Database

Saat pertama dijalankan, sistem akan membuat tabel:

- `FeedTypes(id, name)`
- `HistoricalData(id, month, jumlah, konsumsi, feedType, actualNeed)`
- `Predictions(id, bulan, jumlah, konsumsi, feedType, prediksi, mape, interpretasi, createdAt)`

Data historis awal otomatis di-seed untuk tiap jenis pakan agar model bisa langsung dipakai.

## Metode Regresi

Model menggunakan regresi linear berganda dengan fitur:

- `month`
- `jumlah`
- `konsumsi`

Target yang diprediksi adalah `actualNeed`.

Persamaan umum:

\[
y = b_0 + b_1(month) + b_2(jumlah) + b_3(konsumsi)
\]

Koefisien `b` dihitung dengan Normal Equation:

\[
\beta = (X^T X)^{-1} X^T y
\]

## MAPE

MAPE dihitung dari data historis:

\[
MAPE = \frac{1}{n}\sum\left|\frac{actual - predicted}{actual}\right| \times 100\%
\]

Interpretasi:

- `< 10%` → **Sangat Baik**
- `< 20%` → **Baik**
- `< 50%` → **Cukup**
- `>= 50%` → **Buruk**

## API

### GET `/api/feed-types`
Mengambil daftar jenis pakan.

Contoh response:

```json
{
  "data": [
    { "id": 2, "name": "Breeding" },
    { "id": 4, "name": "Complete" }
  ]
}
```

### POST `/prediksi`
Menerima input prediksi dan mengembalikan output ringkas.

Contoh request:

```json
{
  "bulan": 7,
  "jumlahDomba": 25,
  "konsumsiPakan": 2.4,
  "jenisPakan": "Fattening"
}
```

Contoh response:

```json
{
  "prediksi": 56.8,
  "mape": 2.47,
  "interpretasi": "Sangat Baik"
}
```

> Endpoint `POST /prediksi` mengembalikan JSON persis dengan properti `prediksi`, `mape`, dan `interpretasi` sesuai kebutuhan.
