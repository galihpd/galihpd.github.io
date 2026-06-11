# Museum Satria Mandala — Interactive Map Explorer 🗺️

Proyek peta interaktif untuk **Museum Satria Mandala** di Jakarta Selatan, Indonesia. Dibuat menggunakan HTML, CSS kustom, dan Leaflet.js dengan desain dark-glassmorphism modern yang responsif.

## Fitur Utama

- **Peta Terkunci (Locked Bounds)**: Peta berpusat pada kompleks Museum Satria Mandala dan membatasi gerak seret (pan) pengguna agar fokus pada wilayah museum.
- **Efek Pudar Tepian (Gradient Fade Mask)**: Menggunakan teknik polygon terbalik (world-sized polygon with museum hole) yang disandingkan dengan filter SVG Gaussian Blur untuk menghasilkan efek pudar gelap yang lembut di luar perimeter museum.
- **Interaksi Dua Arah**: Mengklik marker di peta membuka detail item di sidebar dan memusatkan peta. Sebaliknya, memilih item di daftar sidebar memusatkan peta ke lokasi marker tersebut.
- **Penyaringan & Pencarian**: Pengguna dapat mencari koleksi lewat kotak pencarian dan menyaring berdasarkan 5 kategori (Pesawat, Tank, Navy, Diorama, Artileri).
- **Desain Responsif (Bottom Sheet Mobile)**: Di perangkat seluler, sidebar kiri bertransformasi menjadi panel bottom sheet yang dapat diseret naik/turun demi mengoptimalkan porsi peta.

## Teknologi Terpasang

- **Core**: Vanilla HTML5 & JavaScript (ES6)
- **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, Grid, Glassmorphic Glass, CSS Animations)
- **Mapping**: Leaflet.js dengan CartoDB Dark Matter tileset (tanpa API key)
- **Aset Gambar**: Dibuat menggunakan AI image generator untuk merepresentasikan koleksi museum secara premium.

## Cara Menjalankan

Buka berkas `index.html` langsung pada peramban web modern Anda atau jalankan melalui web server lokal.
