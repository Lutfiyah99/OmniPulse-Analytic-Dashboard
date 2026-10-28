OmniPulse - Inventory Management & Restock Simulator 📦⚡

OmniPulse adalah aplikasi web interaktif untuk simulasi manajemen inventaris dan restock (pengisian ulang stok). Dirancang dengan arsitektur yang fleksibel, aplikasi ini dapat diadaptasi untuk berbagai jenis bisnis retail maupun gudang barang. Aplikasi ini memungkinkan pengguna untuk memantau status stok barang, melakukan simulasi pergerakan inventaris harian, dan mengeksekusi pembelian barang baru sesuai dengan budget yang tersedia.

🚀 Fitur Utama

- Dashboard KPI (Key Performance Indicator): Memantau Total Modal Uang, Status Kritis (SKU yang perlu segera di-restock), Potensi Omzet, dan Sisa Budget.
- Simulasi Waktu: Fitur "+1 Hari" untuk mensimulasikan pergerakan stok harian secara otomatis.
- Tabel Inventaris Dinamis:
  - Menampilkan daftar produk dengan detail Kategori, Harga, Stok, Status (Kritis, Waspada, Aman, Overstock, Dead Stock), dan Sisa Hari.
  - Dilengkapi fitur Pencarian (Search), Filter berdasarkan Kategori & Status, serta Pengurutan (Sorting).
- Simulator Restock (Keranjang Belanja):
  - Tombol "Auto-Fill Produk Kritis" untuk otomatis memasukkan barang yang habis ke keranjang.
  - Indikator persentase pemakaian budget harian/total.
  - Penyesuaian kuantitas barang (+/-) sebelum eksekusi.
- Distribusi Modal: Progress bar yang menunjukkan persentase modal yang tertahan pada setiap kategori (Peripherals, Audio, Wearables, Accessories).
- Log Riwayat Aktivitas: Mencatat setiap tindakan simulasi dan transaksi restock yang dilakukan pengguna berdasarkan hari.
- Dark Mode: Dukungan mode gelap/terang (Toggle di sudut kanan atas).

📁 Struktur Proyek

Berikut adalah struktur direktori proyek ini:

```
├── data/
│   └── dummyData.json      # File berisi data mentah/awal produk
├── dist/
│   └── output.css          # File CSS hasil kompilasi (misal: dari Tailwind CSS)
├── logic/
│   ├── app.js              # Logika utama aplikasi (DOM manipulation, state)
│   └── helpers.js          # Fungsi-fungsi bantuan (format mata uang, kalkulasi)
├── node_modules/           # Dependensi Node.js
├── src/                    # File sumber (misal: input.css untuk framework styling)
├── .gitignore              # Konfigurasi pengecualian Git
├── index.html              # Halaman utama struktur UI aplikasi
├── package-lock.json       # Kunci versi dependensi
├── package.json            # Konfigurasi project dan daftar dependensi npm
└── README.md               # Dokumentasi proyek ini
```

🛠️ Teknologi yang Digunakan

- HTML5
- CSS3 & Framework Tailwind
- JavaScript (Vanilla JS) (Pemrosesan logika).
- JSON (Sumber data dummy).
- NPM (Manajemen paket).

💻 Cara Menjalankan Proyek (Local Development)

1. Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di komputer Anda.
2. Clone repositori ini atau ekstrak file proyek ke komputer Anda.
3. Buka terminal/command prompt dan arahkan ke direktori proyek.
4. Instal dependensi dengan menjalankan perintah:
    ```bash
    npm install
    ```
5. Jalankan build script yang ada di `package.json` (`npm run build`).
6. (Opsional) Buka file `index.html` menggunakan ekstensi Live Server di VS Code.