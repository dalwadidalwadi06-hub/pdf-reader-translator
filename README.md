# PDF Reader Translator — Versi Website untuk Mac dan iPad

Versi website yang dapat di-host di internet, dibuka dari Safari di iPad dan browser di Mac. Tidak memerlukan API key untuk layanan terjemahan utama.

## Fitur

- Membuka PDF lokal pada perangkat.
- Pilih teks dengan mouse di Mac atau sentuhan di iPad.
- Terjemahan otomatis muncul di pop-up dekat pilihan teks.
- MyMemory tanpa API key sebagai layanan utama; LibreTranslate publik sebagai alternatif.
- Menyimpan halaman terakhir, favorit, riwayat hingga 200 terjemahan.
- Pengucapan teks menggunakan text-to-speech browser/perangkat.
- PWA: dapat ditambahkan ke Home Screen iPad setelah di-host melalui HTTPS.

## Cara paling mudah menerbitkan ke internet dengan GitHub Pages

1. Buat atau masuk ke akun GitHub.
2. Buat repository baru, misalnya `pdf-reader-translator`.
3. Upload semua file dari folder ini ke root repository. Jangan upload folder pembungkus yang membuat `index.html` berada satu tingkat lebih dalam.
4. Di repository, buka **Settings → Pages**.
5. Di bagian **Build and deployment**, pilih **Deploy from a branch**, pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
6. Tunggu sampai GitHub Pages menampilkan alamat website. Alamat biasanya berbentuk `https://nama-akun.github.io/pdf-reader-translator/`.
7. Buka alamat itu di Safari pada iPad dan di browser Mac.

## Menambahkan ikon di layar utama iPad

1. Buka website yang sudah diterbitkan di Safari.
2. Tekan tombol **Share/Bagikan**.
3. Pilih **Add to Home Screen / Tambahkan ke Layar Utama**.
4. Tekan **Add / Tambah**.

## Cara mencoba di iPad

1. Simpan buku PDF di aplikasi Files pada iPad.
2. Buka website melalui Safari.
3. Tekan **Pilih file PDF** lalu pilih file dari Files.
4. Sentuh dan tahan teks pada PDF, geser pegangan seleksi iPad untuk memilih kata atau kalimat.
5. Setelah teks terpilih, aplikasi mencoba menampilkan terjemahan otomatis dalam pop-up dekat teks. Bila menu seleksi iPad mengganggu atau seleksi tidak terdeteksi, coba sentuh pilihan teks sekali lagi atau gunakan panel Terjemahan.

## Penting

- Untuk pertama kali, koneksi internet dibutuhkan untuk memuat PDF.js dari CDN dan memanggil layanan terjemahan. Website tidak bisa dijamin bekerja sepenuhnya offline.
- MyMemory tanpa API key memiliki batas karakter/pemakaian. Aplikasi membatasi teks per permintaan menjadi 450 karakter; untuk paragraf panjang, pilih beberapa bagian.
- Server LibreTranslate publik dapat berubah, membatasi akses, atau tidak aktif.
- File PDF tidak diunggah ke server aplikasi; hanya teks yang dipilih untuk diterjemahkan yang dikirim ke penyedia terjemahan.
- Riwayat dan favorit disimpan di browser/perangkat menggunakan localStorage. **Tidak otomatis tersinkron antara Mac dan iPad**. Sinkronisasi lintas perangkat membutuhkan backend atau penyimpanan cloud tambahan.
- Beberapa PDF hasil scan membutuhkan OCR, yang belum termasuk.
- Pemilihan teks pada iPad dapat berbeda tergantung versi iPadOS/Safari dan PDF; uji pada beberapa dokumen.
- GitHub Pages meng-host file website statis, bukan file PDF pribadi Anda.
