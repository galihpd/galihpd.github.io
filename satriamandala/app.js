// ============================================================================
// DATA KOLEKSI MUSEUM SATRIA MANDALA
// ============================================================================
const collections = [
  {
    id: "p51_mustang",
    title: "P-51 Mustang \"Cocor Merah\"",
    subtitle: "Pesawat Tempur Taktis Legendaris",
    category: "aircraft",
    categoryLabel: "Pesawat",
    color: "var(--color-aircraft)",
    lat: -6.2309,
    lng: 106.8186,
    year: "1940-an",
    origin: "Amerika Serikat",
    image: "images/p51_mustang.png",
    description: "Pesawat tempur kawal jarak jauh taktis peninggalan perang kemerdekaan. Dijuluki 'Cocor Merah' oleh pejuang tanah air karena moncongnya yang dicat merah terang mencolok. Pesawat pemburu ini memiliki peran sangat besar dalam sejarah militer Indonesia, terutama dalam menumpas berbagai pemberontakan dalam negeri seperti PRRI/Permesta dan mendukung kampanye pembebasan Irian Barat.",
    fact: "Pesawat P-51 Mustang ditenagai oleh mesin Rolls-Royce Merlin V-1650 yang mampu menghasilkan kecepatan maksimum hingga 700 km/jam pada ketinggian 7.600 meter, dipersenjatai dengan enam pucuk senapan mesin berat Browning kaliber 12,7 mm."
  },
  {
    id: "b25_mitchell",
    title: "B-25 J Mitchell",
    subtitle: "Pesawat Pembom Medium Sekutu",
    category: "aircraft",
    categoryLabel: "Pesawat",
    color: "var(--color-aircraft)",
    lat: -6.2311,
    lng: 106.8182,
    year: "1940-an",
    origin: "Amerika Serikat",
    image: "images/b25_mitchell.png",
    description: "Pesawat pembom medium bermesin ganda legendaris buatan North American Aviation. Digunakan secara luas oleh pasukan Sekutu di teater Pasifik semasa Perang Dunia II. Pasca-perang, pesawat-pesawat ini diserahkan kepada Angkatan Udara Republik Indonesia (AURI) dan menjadi andalan utama dalam menumpas berbagai aksi spionase maritim dan pemberontakan separatis di awal berdirinya Republik.",
    fact: "B-25 Mitchell dirancang serbaguna dan tangguh; tipe pembom inilah yang dipimpin oleh Letkol Jimmy Doolittle dalam misi penyerangan udara spektakuler pertama ke ibukota Tokyo pada April 1942."
  },
  {
    id: "mig21_fishbed",
    title: "MiG-21 Fishbed",
    subtitle: "Jet Tempur Supersonik Cepat",
    category: "aircraft",
    categoryLabel: "Pesawat",
    color: "var(--color-aircraft)",
    lat: -6.2307,
    lng: 106.8190,
    year: "1960-an",
    origin: "Uni Soviet",
    image: "images/mig21_fishbed.png",
    description: "Jet tempur supersonik pencegat bermesin tunggal buatan Biro Desain Mikoyan-Gurevich. Kehadiran armada MiG-21 di awal tahun 1960-an menjadikan AURI sebagai kekuatan udara paling ditakuti di belahan bumi selatan. Jet tempur lincah dengan sayap delta ini menjadi andalan utama pertahanan udara Indonesia selama kampanye konfrontasi pembebasan Irian Barat (Operasi Trikora).",
    fact: "MiG-21 adalah pesawat jet tempur supersonik yang paling banyak diproduksi sepanjang sejarah aviasi, terkenal karena biaya pembuatan yang relatif rendah serta perawatan yang sangat praktis."
  },
  {
    id: "a4_skyhawk",
    title: "A-4 Skyhawk",
    subtitle: "Pesawat Tempur Serang Darat",
    category: "aircraft",
    categoryLabel: "Pesawat",
    color: "var(--color-aircraft)",
    lat: -6.2308,
    lng: 106.8194,
    year: "1970-an",
    origin: "Amerika Serikat",
    image: "images/a4_skyhawk.png",
    description: "Pesawat tempur taktis serang darat ringan yang lincah dan andal. Dibeli oleh pemerintah Indonesia dari surplus Angkatan Udara Israel secara sangat rahasia pada akhir 1970-an melalui misi sandi 'Operasi Alpha'. Pesawat ini kemudian ditempatkan di Skuadron 11 dan Skuadron 12 untuk patroli kedaulatan wilayah perbatasan dan penindakan gerilya.",
    fact: "Meskipun ukurannya tergolong mungil untuk sebuah pesawat tempur jet, Skyhawk dijuluki 'Tinker Toy' karena mampu mengangkut beban amunisi bom dan roket seberat hampir 4,5 ton."
  },
  {
    id: "mi4_helicopter",
    title: "Helikopter Mil Mi-4",
    subtitle: "Helikopter Angkut Berat Angkatan Udara",
    category: "aircraft",
    categoryLabel: "Pesawat",
    color: "var(--color-aircraft)",
    lat: -6.2321,
    lng: 106.8175,
    year: "1950-an",
    origin: "Uni Soviet",
    image: "images/mi4_helicopter.png",
    description: "Helikopter angkut berat multiperan buatan pabrikan Mil Moscow Helicopter Plant. Helikopter piston bermesin tunggal ini dioperasikan oleh AURI sejak awal dekade 1960-an untuk mendukung berbagai operasi taktis pendaratan pasukan komando, pengangkutan logistik darurat ke daerah terisolasi, dan operasi evakuasi medis di pedalaman rimba Kalimantan.",
    fact: "Mi-4 memiliki pintu belakang tipe kerang (clamshell doors) yang sangat lebar, memungkinkan kendaraan militer sekelas jip tempur masuk langsung ke dalam ruang kargo utama helikopter."
  },
  {
    id: "m3_stuart",
    title: "Tank Ringan M3 Stuart",
    subtitle: "Tank Tempur Kavaleri Perang Dunia II",
    category: "tank",
    categoryLabel: "Tank & Panser",
    color: "var(--color-tank)",
    lat: -6.2316,
    lng: 106.8176,
    year: "1942",
    origin: "Amerika Serikat",
    image: "images/m3_stuart.png",
    description: "Tank ringan andalan pasukan Sekutu selama paruh pertama Perang Dunia II. Pasca-perang, sejumlah tank ini digunakan oleh tentara KNIL Belanda dalam agresi militer di Indonesia. Setelah pengakuan kedaulatan tahun 1949, tank M3 Stuart diserahkan secara massal kepada TNI AD dan menjadi armada rintisan pembentukan korps Kavaleri Indonesia pertama.",
    fact: "Stuart merupakan tank tempur pertama yang diawaki kru Amerika Serikat yang melakukan pertempuran lapis baja secara langsung melawan tank Jerman di padang pasir Afrika Utara."
  },
  {
    id: "ferret_panser",
    title: "Panser Ferret",
    subtitle: "Kendaraan Lapis Baja Pengintai Kavaleri",
    category: "tank",
    categoryLabel: "Tank & Panser",
    color: "var(--color-tank)",
    lat: -6.2315,
    lng: 106.8172,
    year: "1950-an",
    origin: "Inggris",
    image: "images/ferret_panser.png",
    description: "Panser pengintai ringan beroda empat (4x4) buatan perusahaan otomotif Daimler. Panser lincah berpelindung baja las ini dioperasikan oleh korps Kavaleri TNI AD untuk tugas pengawalan konvoi VIP, pengintaian cepat, patroli garis depan, dan pengamanan objek vital nasional selama gejolak pertengahan abad ke-20.",
    fact: "Desain bodi monokok baja Panser Ferret dibuat sangat rendah dan bersudut miring agar proyektil musuh dapat terpental sekaligus menyulitkan pembidik visual meriam lawan."
  },
  {
    id: "amx13_tank",
    title: "Tank AMX-13/75",
    subtitle: "Tank Ringan Kavaleri Modern",
    category: "tank",
    categoryLabel: "Tank & Panser",
    color: "var(--color-tank)",
    lat: -6.2319,
    lng: 106.8178,
    year: "1950-an",
    origin: "Perancis",
    image: "images/amx13_tank.png",
    description: "Tank ringan andalan kavaleri buatan pabrikan Atelier de Construction Roanne (ARE). Tank ini memiliki rancangan kubah berosilasi (oscillating turret) yang sangat inovatif di zamannya, serta dilengkapi dengan sistem pengisian peluru meriam mekanis otomatis (autoloader) berkapasitas dua magasin drum melingkar.",
    fact: "Indonesia mendatangkan AMX-13 dalam jumlah besar sejak awal dekade 1965 untuk modernisasi kavaleri TNI AD, menjadikannya salah satu tulang punggung pertahanan lapis baja darat terlama."
  },
  {
    id: "kri_matjan_tutul",
    title: "Replika KRI Matjan Tutul 602",
    subtitle: "Kapal Patroli Torpedo Cepat Angkatan Laut",
    category: "navy",
    categoryLabel: "Navy (KRI)",
    color: "var(--color-navy)",
    lat: -6.2328,
    lng: 106.8197,
    year: "1962",
    origin: "Jerman Barat / Indonesia",
    image: "images/kri_matjan_tutul.png",
    description: "Replika berukuran skala penuh dari kapal patroli cepat penyerang torpedo (MTB) kelas Jaguar buatan Lürssen, Jerman Barat. Kapal legendaris asli tenggelam secara heroik di Laut Arafura pada 15 Januari 1962 setelah dikepung dan ditembaki kapal perang Angkatan Laut Kerajaan Belanda demi mengalihkan perhatian agar dua kapal patroli kawan bisa menyelamatkan diri.",
    fact: "Di atas kapal patroli inilah Deputi Wilayah I KSAL Komodor Yos Sudarso gugur bersama para awak kapal terpilih, setelah mengirim pesan radio terakhir yang mengobarkan semangat pertempuran."
  },
  {
    id: "tandu_soedirman",
    title: "Tandu Perjuangan Jenderal Soedirman",
    subtitle: "Saksi Bisu Perang Gerilya Kemerdekaan",
    category: "diorama",
    categoryLabel: "Diorama & Relik",
    color: "var(--color-diorama)",
    lat: -6.2314,
    lng: 106.8188,
    year: "1948-1949",
    origin: "Indonesia",
    image: "images/tandu_soedirman.png",
    description: "Tandu kayu sederhana bersejarah yang digunakan untuk mengusung Panglima Besar Jenderal Soedirman saat memimpin perang gerilya melawan Agresi Militer Belanda II. Dalam kondisi fisik yang sangat lemah akibat penyakit paru-paru parah (hanya berfungsi satu paru-paru), sang panglima tetap memimpin jalannya taktik gerilya dari atas tandu ini melewati pegunungan terjal di pedalaman Jawa.",
    fact: "Tandu ini dipikul secara sukarela dan bergantian oleh para prajurit dan penduduk desa setempat menembus belantara sejauh lebih dari 1.200 kilometer selama hampir tujuh bulan."
  },
  {
    id: "rudal_sa75",
    title: "Rudal SA-75 (S-75 Dvina)",
    subtitle: "Peluru Kendali Pertahanan Udara SAM",
    category: "artillery",
    categoryLabel: "Artileri Berat",
    color: "var(--color-artillery)",
    lat: -6.2324,
    lng: 106.8191,
    year: "1960-an",
    origin: "Uni Soviet",
    image: "images/rudal_sa75.png",
    description: "Sistem peluru kendali pertahanan udara permukaan-ke-udara (SAM) taktis jarak jauh buatan Uni Soviet. Rudal bermesin pendorong roket padat ini didatangkan Indonesia menjelang Operasi Trikora untuk mengantisipasi potensi serangan udara pembom jarak jauh dan pesawat pengintai strategis Belanda di atas wilayah udara tanah air.",
    fact: "Rudal pertahanan udara tipe SA-75 inilah yang menembak jatuh pesawat mata-mata siluman legendaris U-2 Dragon Lady milik CIA Amerika Serikat di atas wilayah Sverdlovsk pada tahun 1960."
  },
  {
    id: "vickers_cannon",
    title: "Meriam Gunung Vickers 75mm",
    subtitle: "Artileri Medan Ringan Rampasan Perang",
    category: "artillery",
    categoryLabel: "Artileri Berat",
    color: "var(--color-artillery)",
    lat: -6.2329,
    lng: 106.8180,
    year: "1920-an",
    origin: "Inggris",
    image: "images/vickers_cannon.png",
    description: "Meriam artileri medan gunung kaliber 75 mm buatan pabrikan Vickers, Inggris. Awalnya meriam ini dioperasikan oleh KNIL Hindia Belanda untuk pertahanan benteng terluar, namun berhasil direbut oleh para pejuang kemerdekaan pada masa awal revolusi fisik tahun 1945. Meriam lincah ini kemudian digunakan secara aktif untuk mendukung pertahanan darat taktis.",
    fact: "Meriam gunung jenis ini dirancang khusus agar mudah dibongkar pasang menjadi beberapa komponen berat terbatas agar dapat diangkut menggunakan kuda melewati lereng perbukitan sempit."
  }
];

// ============================================================================
// BATAS BOUNDS DAN POLYGON MUSEUM (GEOJSON OSM)
// ============================================================================
// Koordinat persis Museum Satria Mandala dari Nominatim OSM (dalam format [lng, lat] untuk MapLibre)
const museumPolygonCoords = [
  [106.8174411, -6.2315179], // entrance (top left)
  [106.8171, -6.2320],       // west edge of Dirgantara Park
  [106.8172, -6.2325],       // south-west corner of Dirgantara Park
  [106.8174, -6.2329],       // south-west corner (near Kuningan Barat road)
  [106.8180, -6.2329],       // along southern fence
  [106.8186, -6.2328],
  [106.8192, -6.2328],
  [106.8198, -6.2327],
  [106.8202, -6.2327],       // south-east corner
  [106.8202369, -6.2317043], // east edge
  [106.8192431, -6.2301963], // north-east corner (near Gatot Subroto)
  [106.8185215, -6.230649],  // north-west corner
  [106.8174411, -6.2315179]  // close
];

// Centroid museum untuk inisialisasi pusat peta
const mapCenter = [106.8188, -6.2315];

// Batas pergerakan peta agar user tidak bisa menggeser jauh keluar kompleks museum
const mapBounds = [
  [106.8155, -6.2345], // Pojok barat daya
  [106.8225, -6.2285]  // Pojok timur laut
];

// ============================================================================
// KORDINAT JALUR LALU LINTAS GATOT SUBROTO (EAST & WEST LANES)
// ============================================================================
// Jalur arah timur (lampu depan kuning/amber)
const trafficEastCoords = [
  [106.8156, -6.2284],
  [106.8171, -6.2293],
  [106.8186, -6.2302],
  [106.8201, -6.2311],
  [106.8216, -6.2320],
  [106.8231, -6.2329]
];

// Jalur arah barat (lampu belakang merah)
const trafficWestCoords = [
  [106.8230, -6.2331],
  [106.8215, -6.2322],
  [106.8200, -6.2313],
  [106.8185, -6.2304],
  [106.8170, -6.2295],
  [106.8155, -6.2286]
];

// ============================================================================
// INSTANSI PETA MAPLIBRE GL JS
// ============================================================================
const map = new maplibregl.Map({
  container: 'map',
  style: {
    'version': 8,
    'sources': {
      'raster-tiles': {
        'type': 'raster',
        'tiles': [
          'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        ],
        'tileSize': 256,
        'attribution': '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }
    },
    'layers': [
      {
        'id': 'simple-tiles',
        'type': 'raster',
        'source': 'raster-tiles',
        'minzoom': 0,
        'maxzoom': 22
      }
    ]
  },
  center: mapCenter,
  zoom: 17.5,
  minZoom: 16.5,
  maxZoom: 21,
  pitch: 62, // Kemiringan kamera isometrik 3D
  bearing: 215, // Sudut hadap kamera dari arah Gatot Subroto (timur laut) menuju museum (barat daya)
  maxBounds: mapBounds
});

// Posisikan control zoom di pojok kanan bawah
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

// ============================================================================
// MAP LOADED: LAYERS & ANIMATIONS SETUP
// ============================================================================
map.on('load', () => {
  // 1. Tambah source untuk Polygon Mask luar (seluruh dunia dilubangi area museum)
  map.addSource('museum-mask-src', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]], // world ring
          museumPolygonCoords // hole
        ]
      }
    }
  });

  // Layer fill putih-abu (Slate-50) transparan untuk memudarkan area luar museum
  map.addLayer({
    'id': 'mask-fill-layer',
    'type': 'fill',
    'source': 'museum-mask-src',
    'paint': {
      'fill-color': '#f8fafc',
      'fill-opacity': 0.75
    }
  });

  // 2. Tambah source garis tepi museum khusus untuk efek blur & stroke dekoratif
  map.addSource('museum-boundary-src', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': museumPolygonCoords
      }
    }
  });

  // Layer garis tebal nge-blur putih-abu untuk efek transisi gradient fade luar museum
  map.addLayer({
    'id': 'mask-edge-blur-layer',
    'type': 'line',
    'source': 'museum-boundary-src',
    'paint': {
      'line-color': '#f8fafc',
      'line-width': 45,
      'line-blur': 25,
      'line-opacity': 0.85
    }
  });

  // Layer garis batas putus-putus berwarna biru transparan (dekorasi kustom)
  map.addLayer({
    'id': 'museum-border-stroke',
    'type': 'line',
    'source': 'museum-boundary-src',
    'paint': {
      'line-color': 'rgba(37, 99, 235, 0.5)',
      'line-width': 2,
      'line-dasharray': [3, 4]
    }
  });

  // 3. Tambah source dan layer lalu lintas Jalan Gatot Subroto
  // Arah Timur (Lampu depan sian)
  map.addSource('traffic-east-src', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': trafficEastCoords
      }
    }
  });

  map.addLayer({
    'id': 'traffic-east-layer',
    'type': 'line',
    'source': 'traffic-east-src',
    'paint': {
      'line-color': '#06b6d4', // Cyan traffic flow
      'line-width': 3.5,
      'line-blur': 1,
      'line-opacity': 0.75,
      'line-dasharray': [4, 4]
    }
  });

  // Arah Barat (Lampu belakang biru kustom)
  map.addSource('traffic-west-src', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': trafficWestCoords
      }
    }
  });

  map.addLayer({
    'id': 'traffic-west-layer',
    'type': 'line',
    'source': 'traffic-west-src',
    'paint': {
      'line-color': '#2563eb', // Royal Blue traffic flow
      'line-width': 3.5,
      'line-blur': 1,
      'line-opacity': 0.75,
      'line-dasharray': [4, 4]
    }
  });

  // Jalankan loop animasi traffic
  animateTraffic();
});

// ============================================================================
// ANIMASI ALIRAN LALU LINTAS KENDARAAN
// ============================================================================
let dashStep = 0;
function animateTraffic() {
  dashStep = (dashStep + 0.1) % 8;

  if (map.getLayer('traffic-east-layer')) {
    // Arah timur bergerak maju
    map.setPaintProperty('traffic-east-layer', 'line-dasharray', [4, 4, dashStep, 8 - dashStep]);
  }
  if (map.getLayer('traffic-west-layer')) {
    // Arah barat bergerak mundur (arah berlawanan)
    map.setPaintProperty('traffic-west-layer', 'line-dasharray', [4, 4, 8 - dashStep, dashStep]);
  }

  requestAnimationFrame(animateTraffic);
}

// ============================================================================
// MARKERS & POPUPS RENDERING (MAPLIBRE GL JS)
// ============================================================================
const markersMap = new Map(); // Relasi ID -> Instance Marker
let activeMarker = null;

// Mengatur list marker HTML ke peta
function setupMarkers() {
  collections.forEach(item => {
    // Membuat element HTML penanda custom
    const el = document.createElement('div');
    el.className = 'custom-marker-container';
    el.innerHTML = `
      <div class="custom-marker" style="--marker-color: ${item.color};">
        <div class="marker-pulse"></div>
        <div class="marker-pin"></div>
      </div>
    `;

    // Popup HTML custom
    const popupContent = `
      <div class="popup-header" style="--popup-badge-color: ${item.color};">
        <span class="popup-title">${item.title}</span>
        <span class="popup-badge">${item.categoryLabel}</span>
      </div>
      <div class="popup-desc">${item.subtitle}</div>
      <button class="popup-action" onclick="showDetail('${item.id}', true)">
        Selengkapnya
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    `;

    const popup = new maplibregl.Popup({
      offset: 15,
      closeButton: false,
      closeOnClick: false
    }).setHTML(popupContent);

    // Tempel marker ke MapLibre
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([item.lng, item.lat])
      .setPopup(popup)
      .addTo(map);

    // Simpan relasi untuk interaksi
    markersMap.set(item.id, marker);

    // Event listener element HTML diklik
    el.addEventListener('click', (e) => {
      e.stopPropagation(); // Blok event click menjalar ke kanvas peta
      selectMarker(item.id);
      showDetail(item.id, false); // Tampilkan di sidebar tapi jangan lakukan flyTo ganda
    });
  });
}

// Highlight marker terpilih
function selectMarker(id) {
  // Reset marker aktif sebelumnya
  markersMap.forEach((marker) => {
    const el = marker.getElement();
    if (el) {
      const markerDiv = el.querySelector('.custom-marker');
      if (markerDiv) markerDiv.classList.remove('active');
    }
  });

  const marker = markersMap.get(id);
  if (marker) {
    const el = marker.getElement();
    if (el) {
      const markerDiv = el.querySelector('.custom-marker');
      if (markerDiv) markerDiv.classList.add('active');
    }
    activeMarker = marker;
  }
}

// ============================================================================
// SIDEBAR CONTROLS & INTERACTIVITY
// ============================================================================
const collectionListEl = document.getElementById('collection-list');
const defaultPanel = document.getElementById('default-panel');
const detailPanel = document.getElementById('detail-panel');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const collectionCountEl = document.getElementById('collection-count');
const filterTabs = document.querySelectorAll('.filter-tab');

// Detail Panel Elements
const detailImage = document.getElementById('detail-image');
const detailBadge = document.getElementById('detail-badge');
const detailTitle = document.getElementById('detail-title');
const detailYear = document.getElementById('detail-year');
const detailOrigin = document.getElementById('detail-origin');
const detailDescription = document.getElementById('detail-description');
const detailFact = document.getElementById('detail-fact');
const closeDetailBtn = document.getElementById('close-detail-btn');
const locateOnMapBtn = document.getElementById('locate-on-map-btn');

// Status Filter & Search
let currentCategory = 'all';
let searchQuery = '';

// Render daftar koleksi di sidebar
function renderCollectionList() {
  const filteredCollections = collections.filter(item => {
    const matchCategory = currentCategory === 'all' || item.category === currentCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery) ||
                        item.subtitle.toLowerCase().includes(searchQuery) ||
                        item.description.toLowerCase().includes(searchQuery) ||
                        item.categoryLabel.toLowerCase().includes(searchQuery);
    return matchCategory && matchSearch;
  });

  collectionListEl.innerHTML = '';
  collectionCountEl.textContent = `Menampilkan ${filteredCollections.length} Koleksi`;

  if (filteredCollections.length === 0) {
    collectionListEl.innerHTML = `
      <div class="empty-list" style="text-align: center; padding: 2.5rem 1rem; color: var(--ink-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</p>
        <p style="font-size: 13px;">Koleksi tidak ditemukan.<br>Coba gunakan kata kunci pencarian lain.</p>
      </div>
    `;
    return;
  }

  filteredCollections.forEach(item => {
    const isActive = activeMarker && markersMap.get(item.id) === activeMarker;
    const itemCard = document.createElement('div');
    itemCard.className = `collection-item ${isActive ? 'active' : ''}`;
    itemCard.style.setProperty('--cat-color', item.color);
    itemCard.innerHTML = `
      <div class="item-thumb">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='https://placehold.co/120x120/1a1a17/a1a19a?text=Museum'">
      </div>
      <div class="item-text">
        <h3 class="item-title">${item.title}</h3>
        <p class="item-subtitle">${item.subtitle}</p>
        <div class="item-tags">
          <span class="item-badge" style="--cat-color: ${item.color}">${item.categoryLabel}</span>
          <span class="item-year-badge">${item.year}</span>
        </div>
      </div>
    `;
    
    itemCard.addEventListener('click', () => {
      showDetail(item.id, true);
    });
    
    collectionListEl.appendChild(itemCard);
  });
}

// Tampilkan Detail Koleksi di Panel Kiri
function showDetail(id, zoomTo = true) {
  const item = collections.find(x => x.id === id);
  if (!item) return;
  
  // Set data detail panel
  detailImage.src = item.image;
  detailImage.alt = item.title;
  detailImage.onerror = function() {
    this.src = `https://placehold.co/600x375/1a1a17/a1a19a?text=${encodeURIComponent(item.title)}`;
  };
  
  detailBadge.textContent = item.categoryLabel;
  detailBadge.style.backgroundColor = item.color;
  detailBadge.style.color = getContrastColor(item.color);
  
  detailTitle.textContent = item.title;
  detailYear.textContent = item.year;
  detailOrigin.textContent = item.origin;
  detailDescription.textContent = item.description;
  detailFact.textContent = item.fact;
  
  // Highlight marker
  selectMarker(id);
  
  // Pergerakan kamera 3D flyTo
  if (zoomTo) {
    map.flyTo({
      center: [item.lng, item.lat],
      zoom: 19,
      pitch: 65,
      bearing: 215,
      essential: true,
      speed: 1.0,
      curve: 1.4
    });
    
    // Buka popup marker setelah flyTo
    setTimeout(() => {
      const marker = markersMap.get(id);
      if (marker) {
        // Hapus popup lain dulu
        markersMap.forEach(m => {
          const pop = m.getPopup();
          if (pop && pop.isOpen()) pop.remove();
        });
        marker.togglePopup();
      }
    }, 900);
  }

  // Tampilkan panel detail
  defaultPanel.classList.add('hidden');
  detailPanel.classList.remove('hidden');

  renderCollectionList();

  // Mobile drawer sliding up
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 850 && !sidebar.classList.contains('active')) {
    toggleMobileSidebar(true);
  }
}

function getContrastColor(colorVar) {
  if (colorVar.includes('aircraft') || colorVar.includes('navy')) return '#fff';
  return '#000';
}

// Tutup Panel Detail
function closeDetail() {
  defaultPanel.classList.remove('hidden');
  detailPanel.classList.add('hidden');
  
  // Hapus marker aktif & tutup popup
  if (activeMarker) {
    const el = activeMarker.getElement();
    if (el) {
      const markerDiv = el.querySelector('.custom-marker');
      if (markerDiv) markerDiv.classList.remove('active');
    }
    const pop = activeMarker.getPopup();
    if (pop && pop.isOpen()) pop.remove();
    activeMarker = null;
  }
  
  renderCollectionList();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
// Pencarian
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  if (searchQuery.length > 0) {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }
  renderCollectionList();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.classList.add('hidden');
  renderCollectionList();
  searchInput.focus();
});

// Klik Filter Kategori
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.getAttribute('data-category');
    renderCollectionList();
  });
});

// Tombol Fokus Peta di Panel Detail
locateOnMapBtn.addEventListener('click', () => {
  if (activeMarker) {
    const coords = activeMarker.getLngLat();
    map.flyTo({
      center: coords,
      zoom: 20,
      pitch: 65,
      bearing: 215,
      essential: true,
      speed: 0.9
    });
    
    setTimeout(() => {
      // Hapus popup lain
      markersMap.forEach(m => {
        const pop = m.getPopup();
        if (pop && pop.isOpen()) pop.remove();
      });
      activeMarker.togglePopup();
    }, 700);

    // Di mobile: tutup bottom drawer agar peta terlihat penuh
    if (window.innerWidth <= 850) {
      toggleMobileSidebar(false);
    }
  }
});

// Klik penutup detail
closeDetailBtn.addEventListener('click', closeDetail);

// Close popups on clicking map elsewhere
map.on('click', () => {
  // Jika klik area kosong di peta, tutup popup aktif
  markersMap.forEach(m => {
    const pop = m.getPopup();
    if (pop && pop.isOpen()) pop.remove();
  });
});

// ============================================================================
// MOBILE BOTTOM DRAWER SLIDING HANDLERS
// ============================================================================
const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
const sidebarEl = document.getElementById('sidebar');

function toggleMobileSidebar(forceState = null) {
  const isOpen = forceState !== null ? forceState : !sidebarEl.classList.contains('active');
  const openIcon = mobileToggleBtn.querySelector('.toggle-icon-open');
  const closeIcon = mobileToggleBtn.querySelector('.toggle-icon-close');

  if (isOpen) {
    sidebarEl.classList.add('active');
    openIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
  } else {
    sidebarEl.classList.remove('active');
    openIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
  }
}

mobileToggleBtn.addEventListener('click', () => toggleMobileSidebar());

document.querySelector('.sidebar-header').addEventListener('click', () => {
  if (window.innerWidth <= 850) {
    toggleMobileSidebar();
  }
});

// ============================================================================
// INITIAL RUN
// ============================================================================
setupMarkers();
renderCollectionList();
