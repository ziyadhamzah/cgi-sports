# CGI Sports

Marketplace alat olahraga berbasis Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 4). Seluruh data bersifat demo dan disimpan di browser pengguna.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Skrip lain:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm start
```

Salin `.env.example` menjadi `.env.local` untuk konfigurasi lokal. `NEXT_PUBLIC_SITE_URL` dipakai untuk metadata canonical dan Open Graph.

## Konfigurasi admin

Panel analitik berada di `/admin/analytics` dan dilindungi oleh sesi berbasis cookie `httpOnly` yang ditandatangani di server.

```bash
CGI_SPORTS_ADMIN_PASSWORD=PasswordAnda
CGI_SPORTS_ADMIN_SECRET=RahasiaHMACAnda
```

Keduanya opsional untuk `npm run dev`. Jika tidak diatur, kata sandi default `cgi-admin` dipakai. Di `production`, endpoint admin menolak semua permintaan dengan `503` sampai kedua variabel diisi dan `CGI_SPORTS_ADMIN_SECRET` berbeda dari kata sandi. **Ganti keduanya sebelum deploy**; jangan gunakan nilai demo.

## Alur demo

- **Akun:** halaman `/login` dan `/register` menerima nama dan email bebas. Semua akun demo berperan `user`; panel admin memakai kata sandi terpisah.
- **Belanja:** `/products` → detail produk → keranjang → `/checkout` → buat pesanan → konfirmasi pembayaran di halaman detail pesanan.
- **Pembayaran:** seluruh metode adalah simulasi. QRIS dan nomor VA/E-wallet bukan instrumen pembayaran nyata. Nomor resi hanya dibuat setelah tombol konfirmasi demo ditekan.
- **Pengiriman:** `/lacak` menerima nomor pesanan atau resi. Pesanan demo: `CGI-20261120-4821`.
- **Penjual:** `/seller/dashboard` dapat membuka toko, menambah produk, dan mengunggah foto (tersimpan di `localStorage`).
- **Layanan:** `/services` berisi empat layanan dengan form pengajuan; hasilnya tampil di `/account`.
- **Konsultan:** `/api/chat` adalah aturan berbasis kata kunci, bukan model bahasa. Pembatas 12 pesan/menit per kombinasi IP dan user-agent berlaku dalam memori proses; header proxy dapat dipalsukan, jadi ini bukan pengganti rate limiter edge/WAF.

Voucher yang tersedia:

| Kode | Syarat |
| --- | --- |
| `CGI10` | Diskon 10% maksimal Rp50.000, belanja minimal Rp150.000 |
| `LARI15` | Diskon 15% untuk kategori Lari, minimal Rp250.000 pada produk kategori Lari |
| `HEMAT20K` | Potongan Rp20.000, belanja minimal Rp100.000 |

## Struktur

- `src/app` — halaman App Router dan route handler API.
- `src/components` — komponen landing, katalog, checkout, pesanan, penjual, dan layout.
- `src/lib/mock-data.ts` — katalog, penjual, layanan, voucher, dan pesanan demo.
- `src/lib/store/StoreProvider.tsx` — state global dengan `useSyncExternalStore`, persist ke `localStorage`.
- `src/app/api/admin/session/route.ts` — login/logout admin dan verifikasi cookie sesi.
- `src/app/api/chat/route.ts` — endpoint konsultan berbasis aturan.

State disimpan dengan kunci berawalan `cgi_sports_` di `localStorage` (voucher menggunakan `sessionStorage`). Data demo seperti pesanan dan notifikasi akan ditambahkan kembali saat halaman dimuat setelah dihapus. Gambar hasil unggahan disimpan sebagai data URL, jadi ukuran besar dapat memenuhi kuota penyimpanan browser.

## Batasan

Proyek ini berfungsi sebagai prototipe frontend: tidak ada database, pembayaran sungguhan, autentikasi pengguna yang aman, atau pengiriman nyata. Foto katalog, layanan, penjual, dan hero adalah berkas JPEG lokal di `public/images` (sumber: Pexels), sehingga tetap tampil tanpa koneksi internet saat runtime. Satu JPEG generik tetap dipakai sebagai placeholder saat penjual belum mengunggah foto produk. Analitik hanya mengukur aktivitas di browser yang sama. Pesanan, notifikasi, voucher, dan sesi admin adalah data contoh; tidak ada database atau pembayaran sungguhan.
