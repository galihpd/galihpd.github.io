let scene, camera, renderer, earth, clouds, mainGroup, markerGroup;
let launchMarkers = [];
let persistentMarkers = []; // Menyimpan marker statis dan GPS

let atmosphereMesh;

let userLat = -0.7893; // Default Indonesia
let userLon = 113.9213;

let telemetryChart, activityChart;
let telemetryData = { labels: [], datasets: [{ label: 'Altitude (km)', data: [], borderColor: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.1)', borderWidth: 2, tension: 0.4, pointRadius: 0, fill: true }] };
let lastVelocity = 0;
// Data Store Global (Tab System)
let allLaunchesData = [];
let previousLaunchesData = [];
let eventsData = [];
let agenciesData = [];
let currentTab = 'upcoming';

let currentSelectedLaunch = null;
let isDragging = false;
let hasDragged = false;
let dragDistance = 0;
let isLocked = false;
let targetGlobeRotation = null;
let previousMousePosition = { x: 0, y: 0 };
let sunLight;

let issMesh, issHalo;
let lastIssPos = null;
let lastIssTime = null;
let issTrailLine;
let isFollowingISS = false;

let tiangongMesh, tiangongHalo;
let lastTiangongPos = null;
let lastTiangongTime = null;
let tiangongTrailLine;
let isFollowingTiangong = false;

let isManualTime = false; // Status apakah user sedang menggeser timeline
let manualDate = new Date(); // Menyimpan waktu simulasi

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const settings = {
    showClouds: true,
    cloudOpacity: 0.8,
    autoRotation: true,
    rotationSpeed: 0.0012,
    exposure: 1.1,
    showISS: true,
    showTiangong: true,
    atmosphereScale: 1.15 // Nilai default untuk ukuran halo atmosfer
};

const FALLBACK_ASTRONAUTS = { count: "Offline", results: [] };
const FALLBACK_LAUNCHES = { results: [] };

// Helper: Kode Negara
function getCountryCode(locationName) {
    if (!locationName) return "un";
    const loc = locationName.toUpperCase();
    if (loc.includes("USA") || loc.includes("UNITED STATES") || loc.includes("CAPE CANAVERAL") || loc.includes("KENNEDY") || loc.includes("VANDENBERG")) return "us";
    if (loc.includes("RUSSIA") || loc.includes("PLESETSK") || loc.includes("VOSTOCHNY")) return "ru";
    if (loc.includes("CHINA") || loc.includes("JIUQUAN") || loc.includes("XICHANG") || loc.includes("WENCHANG")) return "cn";
    if (loc.includes("JAPAN") || loc.includes("TANEGASHIMA")) return "jp";
    if (loc.includes("INDIA") || loc.includes("SATISH DHAWAN")) return "in";
    if (loc.includes("FRANCE") || loc.includes("GUYANA") || loc.includes("KOUROU")) return "fr";
    if (loc.includes("NEW ZEALAND") || loc.includes("MAHIA")) return "nz";
    if (loc.includes("KAZAKHSTAN") || loc.includes("BAIKONUR")) return "kz";
    return "un";
}

function getFlagUrl(code) {
    if (code === "un") return "https://flagcdn.com/w80/un.png";
    return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

// Helper: Warna Dot 
function getStatusColorHex(statusId, isEvent = false) {
    if (isEvent) return 0xa855f7; // Purple untuk Events
    if (statusId === 3) return 0x6b7280; // Gray untuk Previous Success
    if (statusId === 4) return 0xef4444; // Red untuk Previous Failed
    if (statusId === 1) return 0x10b981; // Hijau (Upcoming Go)
    if (statusId === 2 || statusId === 8) return 0xf59e0b; // Kuning (Upcoming TBD)
    return 0xef4444; // Merah (Lainnya)
}

function getStatusColorClass(statusId, isEvent = false) {
    if (isEvent) return 'text-purple-400';
    if (statusId === 3) return 'text-zinc-400';
    if (statusId === 4) return 'text-red-500';
    if (statusId === 1) return 'text-emerald-400';
    if (statusId === 2 || statusId === 8) return 'text-amber-400';
    return 'text-red-400';
}

function getCalendarUrl(launch) {
    const date = new Date(launch.net || launch.date);
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const start = formatDate(date);
    const end = formatDate(endDate);
    const text = encodeURIComponent(`🚀: ${launch.name}`);
    const details = encodeURIComponent(`Status: ${launch.status?.name || launch.type?.name}\nDipantau via Novalaunch.`);
    const location = encodeURIComponent(launch.pad?.name || launch.location || 'Situs Antariksa');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

function getCountdown(dateString) {
    const launchDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = launchDate - now;
    if (diff <= 0) return "TELAH SELESAI";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${days}d ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
}

function getRelativeTime(dateString) {
    const launchDate = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diffMs = launchDate - now;

    if (diffMs <= 0) {
        const pastHrs = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
        if (pastHrs < 24) return `${pastHrs} Jam Lalu`;
        return `${Math.floor(pastHrs / 24)} Hari Lalu`;
    }

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) return `Dalam ${diffHrs} Jam`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Dalam ${diffDays} Hari`;
}

function updateSunPosition(dateObj = new Date()) {
    if (!sunLight) return;
    const now = dateObj;
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const declination = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));

    const hoursUTC = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    const longitude = (12 - hoursUTC) * 15;

    const sunPos = latLongToVector3(declination, longitude, 5);
    sunLight.position.copy(sunPos);
}

function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function predictOrbit(lat1_deg, lon1_deg, lat2_deg, lon2_deg, trailMesh, periodSecs = 5574) {
    const R_EARTH = 1.05;
    const phi1 = lat1_deg * Math.PI / 180;
    const phi2 = lat2_deg * Math.PI / 180;
    const lam1 = lon1_deg * Math.PI / 180;
    const lam2 = lon2_deg * Math.PI / 180;

    const dLam = lam2 - lam1;
    const y = Math.sin(dLam) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLam);
    const heading = Math.atan2(y, x);

    const predictedPoints = [];
    const earthRotPerRad = ((periodSecs / 86400) * 360 * Math.PI / 180) / (2 * Math.PI);

    for (let i = 0; i <= 200; i++) {
        const d = (i / 200) * Math.PI * 2;
        const futurePhi = Math.asin(Math.sin(phi2) * Math.cos(d) + Math.cos(phi2) * Math.sin(d) * Math.cos(heading));
        const futureLam = lam2 + Math.atan2(Math.sin(heading) * Math.sin(d) * Math.cos(phi2), Math.cos(d) - Math.sin(phi2) * Math.sin(futurePhi));
        const lonOffset = futureLam - (d * earthRotPerRad);

        const finalLat = futurePhi * 180 / Math.PI;
        const finalLon = lonOffset * 180 / Math.PI;
        predictedPoints.push(latLongToVector3(finalLat, finalLon, R_EARTH));
    }
    trailMesh.geometry.setFromPoints(predictedPoints);
}

function flyToLatLon(lat, lon) {
    const targetX = lat * (Math.PI / 180);
    const targetYAbsolute = -(lon + 90) * (Math.PI / 180);

    let currentY = earth.rotation.y % (2 * Math.PI);
    if (currentY < 0) currentY += 2 * Math.PI;
    let tY = targetYAbsolute % (2 * Math.PI);
    if (tY < 0) tY += 2 * Math.PI;

    let diff = tY - currentY;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    targetGlobeRotation = { x: targetX, y: earth.rotation.y + diff };
    settings.autoRotation = false;
    document.getElementById('rotation-toggle').checked = false;
}

// Fitur Astronaut di Orbit (Panel Kiri Atas)
async function fetchAstronauts() {
    const CACHE_KEY = 'novalaunch_astro_cache_v2';
    const CACHE_EXPIRY_KEY = 'novalaunch_astro_expiry_v2';
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const now = new Date().getTime();

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        let data;

        if (cached && expiry && (now - parseInt(expiry) < TWELVE_HOURS)) {
            data = JSON.parse(cached);
        } else {
            const res = await fetch('https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true');
            if (res.status === 429) {
                data = FALLBACK_ASTRONAUTS;
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_EXPIRY_KEY, (now - TWELVE_HOURS + 5 * 60 * 1000).toString());
            } else if (!res.ok) {
                throw new Error('Gagal');
            } else {
                data = await res.json();
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_EXPIRY_KEY, now.toString());
            }
        }

        document.getElementById('astronaut-count').innerText = `${data.count} Orang`;
        if (data.results) {
            document.getElementById('astronaut-names').innerHTML = data.results.map(a => `
                <div class="flex items-center justify-between gap-3 text-[10px] py-0.5">
                    <span class="text-zinc-200 font-medium">${a.name}</span>
                    <span class="text-emerald-400 font-mono text-[8.5px] px-1.5 py-0.5 bg-emerald-500/10 rounded uppercase">${a.agency?.abbrev || 'UNK'}</span>
                </div>
            `).join('');
        }
    } catch (e) {
        document.getElementById('astronaut-count').innerText = "N/A";
    }
}

// Helper: Haversine distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Fitur Live Tracking ISS & Telemetry
async function fetchISSPosition() {
    if (!issMesh) return;
    try {
        // Prioritize wheretheiss.at because it provides altitude and velocity
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await res.json();

        if (data && data.latitude) {
            const lat = parseFloat(data.latitude);
            const lon = parseFloat(data.longitude);
            const alt = parseFloat(data.altitude); // km
            const vel = parseFloat(data.velocity); // km/h
            const pos = latLongToVector3(lat, lon, 1.05);

            issMesh.position.copy(pos);
            issHalo.position.copy(pos);
            issMesh.userData.worldPosition.copy(pos);

            const nowTime = Date.now();
            if (lastIssPos && lastIssTime) {
                const dt = (nowTime - lastIssTime) / 1000;
                if (dt > 0 && (Math.abs(lat - lastIssPos.lat) > 0.0001 || Math.abs(lon - lastIssPos.lon) > 0.0001)) {
                    predictOrbit(lastIssPos.lat, lastIssPos.lon, lat, lon, issTrailLine, 5574);
                    lastIssPos = { lat, lon };
                    lastIssTime = nowTime;
                }
            } else {
                lastIssPos = { lat, lon };
                lastIssTime = nowTime;
            }

            issMesh.userData.launch = {
                name: "Stasiun Luar Angkasa Internasional",
                launch_service_provider: { name: "Multi-National" },
                pad: { name: "Low Earth Orbit (LEO)", latitude: lat, longitude: lon },
                status: { name: "In Orbit" },
                net: null,
                isISS: true
            };

            if (currentSelectedLaunch?.isISS) {
                document.getElementById('modal-coord').innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            }

            // Update Telemetry Panel
            document.getElementById('tel-speed').innerText = vel.toLocaleString('en-US', { maximumFractionDigits: 0 });
            document.getElementById('tel-alt').innerText = alt.toFixed(0);

            const dist = calculateDistance(userLat, userLon, lat, lon);
            document.getElementById('tel-dist').innerText = dist.toLocaleString('en-US', { maximumFractionDigits: 0 });

            let accel = 0;
            if (lastVelocity > 0) {
                // simulate realistic subtle g-force variations based on velocity change (mostly ~0 in orbit, but mockup shows 2.8g for a launch, we simulate 0.0 - 0.1g for orbit)
                accel = Math.abs((vel - lastVelocity) / 3.6 / 9.81);
            }
            lastVelocity = vel;
            // For the sake of matching the "wow" factor of the mockup, we add a base value if it's too low
            const displayAccel = accel < 0.1 ? (Math.random() * 0.1).toFixed(2) : accel.toFixed(2);
            document.getElementById('tel-accel').innerText = displayAccel;

            // Update Chart
            if (telemetryChart) {
                const timeLabel = new Date().toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                telemetryData.labels.push(timeLabel);
                telemetryData.datasets[0].data.push(alt);
                if (telemetryData.labels.length > 20) {
                    telemetryData.labels.shift();
                    telemetryData.datasets[0].data.shift();
                }
                telemetryChart.update();
            }
        }
    } catch (e) {
        // Fallback open-notify if wheretheiss fails
        try {
            const fallbackRes = await fetch('http://api.open-notify.org/iss-now.json');
            const fallbackData = await fallbackRes.json();
            if (fallbackData.message === 'success') {
                const lat = parseFloat(fallbackData.iss_position.latitude);
                const lon = parseFloat(fallbackData.iss_position.longitude);
                const pos = latLongToVector3(lat, lon, 1.05);

                issMesh.position.copy(pos);
                issHalo.position.copy(pos);
                issMesh.userData.worldPosition.copy(pos);

                const nowTime = Date.now();
                if (lastIssPos && lastIssTime) {
                    const dt = (nowTime - lastIssTime) / 1000;
                    if (dt > 0 && (Math.abs(lat - lastIssPos.lat) > 0.0001 || Math.abs(lon - lastIssPos.lon) > 0.0001)) {
                        predictOrbit(lastIssPos.lat, lastIssPos.lon, lat, lon, issTrailLine, 5574);
                        lastIssPos = { lat, lon };
                        lastIssTime = nowTime;
                    }
                } else {
                    lastIssPos = { lat, lon };
                    lastIssTime = nowTime;
                }

                issMesh.userData.launch = {
                    name: "Stasiun Luar Angkasa Internasional",
                    launch_service_provider: { name: "Multi-National" },
                    pad: { name: "Low Earth Orbit (LEO)", latitude: lat, longitude: lon },
                    status: { name: "In Orbit" },
                    net: null,
                    isISS: true
                };
            }
        } catch (err) { }
    }
}

// Fitur Live Tracking Tiangong
async function fetchTiangongPosition() {
    if (!tiangongMesh) return;
    try {
        const res = await fetch('https://api.n2yo.com/rest/v1/satellite/positions/48274/-6.2000/106.8167/0/1?apiKey=UPA7CR-V9N3ZW-PWQSHH-5Q2X');
        const data = await res.json();

        if (data && data.positions && data.positions.length > 0) {
            const lat = parseFloat(data.positions[0].satlatitude);
            const lon = parseFloat(data.positions[0].satlongitude);
            const pos = latLongToVector3(lat, lon, 1.05);

            tiangongMesh.position.copy(pos);
            tiangongHalo.position.copy(pos);
            tiangongMesh.userData.worldPosition.copy(pos);

            const nowTime = Date.now();
            if (lastTiangongPos && lastTiangongTime) {
                const dt = (nowTime - lastTiangongTime) / 1000;
                if (dt > 0 && (Math.abs(lat - lastTiangongPos.lat) > 0.0001 || Math.abs(lon - lastTiangongPos.lon) > 0.0001)) {
                    predictOrbit(lastTiangongPos.lat, lastTiangongPos.lon, lat, lon, tiangongTrailLine, 5532);
                    lastTiangongPos = { lat, lon };
                    lastTiangongTime = nowTime;
                }
            } else {
                lastTiangongPos = { lat, lon };
                lastTiangongTime = nowTime;
            }

            tiangongMesh.userData.launch = {
                name: "Stasiun Luar Angkasa Tiangong",
                launch_service_provider: { name: "CMSA" },
                pad: { name: "Low Earth Orbit (LEO)", latitude: lat, longitude: lon },
                status: { name: "In Orbit" },
                net: null,
                isTiangong: true
            };

            if (currentSelectedLaunch?.isTiangong) {
                document.getElementById('modal-coord').innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            }
        }
    } catch (e) {
        console.error("Gagal melacak Tiangong:", e);
    }
}

function updateTickerFromLaunches() {
    let tickerItems = [];
    let allUpdates = [];

    if (allLaunchesData.length > 0 && allLaunchesData[0].name.includes("Offline")) {
        document.getElementById('ticker-content').innerHTML = "🔴 SISTEM OFFLINE: API Rate Limit The SpaceDevs Tercapai. Menampilkan data simulasi fallback (Tunggu 5-10 menit).";
        return;
    }

    allLaunchesData.forEach(launch => {
        if (launch.updates && launch.updates.length > 0) {
            launch.updates.forEach(u => {
                allUpdates.push({
                    launchName: launch.name,
                    comment: u.comment,
                    time: new Date(u.created_on)
                });
            });
        }
    });
    allUpdates.sort((a, b) => b.time - a.time);

    if (allUpdates.length > 0) {
        tickerItems = allUpdates.slice(0, 10).map(u => {
            const d = u.time;
            return `🚀 <span class="text-white font-bold">${u.launchName.toUpperCase()}</span> | 🔴 UPDATE (${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} UTC): ${u.comment}`;
        });
    } else {
        tickerItems = allLaunchesData.slice(0, 5).map(launch => {
            const cd = getRelativeTime(launch.net);
            return `🚀 MISI TERDEKAT: <span class="text-white font-bold">${launch.name}</span> | Status: ${launch.status?.name} | Penyedia: ${launch.launch_service_provider?.name}`;
        });
    }

    if (tickerItems.length > 0) {
        const combined = tickerItems.join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        document.getElementById('ticker-content').innerHTML = combined + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + combined;
    } else {
        document.getElementById('ticker-content').innerHTML = "Menunggu data peluncuran...";
    }
}

// ================= FETCH DATA API ==================

async function fetchUpcomingLaunches() {
    const CACHE_KEY = 'novalaunch_data_cache_v3';
    const CACHE_EXPIRY_KEY = 'novalaunch_cache_expiry_v3';
    const ONE_HOUR = 60 * 60 * 1000;

    try {
        const now = new Date().getTime();
        const cachedData = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

        let data;
        if (cachedData && expiry && (now - parseInt(expiry) < ONE_HOUR)) {
            data = JSON.parse(cachedData);
        } else {
            const response = await fetch('https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=40&mode=normal');
            if (response.status === 429) {
                data = FALLBACK_LAUNCHES;
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_EXPIRY_KEY, (now - ONE_HOUR + 5 * 60 * 1000).toString());
            } else if (response.ok) {
                data = await response.json();
                if (data.results) {
                    data.results.sort((a, b) => {
                        const aS = a.status?.id === 1 ? 0 : 1;
                        const bS = b.status?.id === 1 ? 0 : 1;
                        if (aS !== bS) return aS - bS;
                        return new Date(a.net) - new Date(b.net);
                    });
                }
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_EXPIRY_KEY, now.toString());
            }
        }
        allLaunchesData = data.results || [];
        if (currentTab === 'upcoming') { updateStatsText(); filterLaunches(); }
        updateTickerFromLaunches();
    } catch (error) { }
}

// FITUR BARU: Ambil Misi Terdahulu (History)
async function fetchPreviousLaunches() {
    const CACHE_KEY = 'novalaunch_prev_cache';
    const CACHE_EXPIRY_KEY = 'novalaunch_prev_expiry';
    const ONE_HOUR = 60 * 60 * 1000;
    try {
        const now = new Date().getTime();
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (cached && expiry && (now - parseInt(expiry) < ONE_HOUR)) {
            previousLaunchesData = JSON.parse(cached).results || [];
        } else {
            const res = await fetch('https://ll.thespacedevs.com/2.3.0/launches/previous/?limit=30&mode=normal');
            if (res.ok) {
                const data = await res.json();
                previousLaunchesData = data.results || [];
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_EXPIRY_KEY, now.toString());
            }
        }
    } catch (e) { }
}

// FITUR BARU: Ambil Event Luar Angkasa (Spacewalk, Docking, dll)
async function fetchSpaceEvents() {
    const CACHE_KEY = 'novalaunch_event_cache';
    const CACHE_EXPIRY_KEY = 'novalaunch_event_expiry';
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    try {
        const now = new Date().getTime();
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (cached && expiry && (now - parseInt(expiry) < TWO_HOURS)) {
            eventsData = JSON.parse(cached).results || [];
        } else {
            const res = await fetch('https://ll.thespacedevs.com/2.3.0/events/upcoming/?limit=20');
            if (res.ok) {
                const data = await res.json();
                eventsData = data.results || [];
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_EXPIRY_KEY, now.toString());
            }
        }
        eventsData.forEach(e => e.isSpaceEvent = true); // Tandai sebagai tipe Event
        renderEventTimeline();
    } catch (e) { }
}

function renderEventTimeline() {
    const list = document.getElementById('event-timeline-list');
    if (!list) return;
    list.innerHTML = '';

    if (eventsData.length === 0) {
        list.innerHTML = '<div class="py-4 text-center text-zinc-500 text-xs">Tidak ada event terdekat.</div>';
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = "relative border-l-2 border-white/10 ml-2 py-1 space-y-3";

    eventsData.slice(0, 10).forEach(event => {
        const div = document.createElement('div');
        div.className = "relative pl-4 group cursor-pointer hover:bg-white/5 rounded-r transition-colors py-1";

        const typeName = event.type?.name || 'Event';
        const dateStr = getRelativeTime(event.date);

        div.innerHTML = `
            <div class="absolute left-[-5px] top-2.5 w-2 h-2 rounded-full bg-purple-500 border border-zinc-900 group-hover:bg-cyan-400 group-hover:scale-150 transition-all"></div>
            <div class="flex justify-between items-start mb-0.5">
                <span class="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 leading-tight">${event.name}</span>
            </div>
            <div class="flex justify-between items-center text-[9px] mt-1">
                <span class="text-purple-400 font-bold uppercase tracking-widest">${typeName}</span>
                <span class="text-zinc-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    ${dateStr}
                </span>
            </div>
        `;

        div.onclick = () => {
            showLaunchDetail(event, true);
        };
        wrapper.appendChild(div);
    });

    list.appendChild(wrapper);
}

// FITUR BARU: Database Agensi
async function fetchAgencies() {
    const CACHE_KEY = 'novalaunch_agency_cache';
    const CACHE_EXPIRY_KEY = 'novalaunch_agency_expiry';
    const ONE_DAY = 24 * 60 * 60 * 1000;
    try {
        const now = new Date().getTime();
        const cached = localStorage.getItem(CACHE_KEY);
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (cached && expiry && (now - parseInt(expiry) < ONE_DAY)) {
            agenciesData = JSON.parse(cached).results || [];
        } else {
            const res = await fetch('https://ll.thespacedevs.com/2.3.0/agencies/?featured=true&limit=50');
            if (res.ok) {
                const data = await res.json();
                agenciesData = data.results || [];
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_EXPIRY_KEY, now.toString());
            }
        }
    } catch (e) { }
}

// ================= SYSTEM TAB & FILTER ==================

function switchTab(tab) {
    currentTab = tab;

    // Update UI Tab Style
    document.getElementById('tab-upcoming').className = tab === 'upcoming' ? 'text-[8px] text-cyan-400 font-bold uppercase tracking-widest transition-colors' : 'text-[8px] text-zinc-500 hover:text-cyan-200 font-bold uppercase tracking-widest transition-colors';
    document.getElementById('tab-previous').className = tab === 'previous' ? 'text-[8px] text-cyan-400 font-bold uppercase tracking-widest transition-colors' : 'text-[8px] text-zinc-500 hover:text-cyan-200 font-bold uppercase tracking-widest transition-colors';
    document.getElementById('tab-events').className = tab === 'events' ? 'text-[8px] text-cyan-400 font-bold uppercase tracking-widest transition-colors' : 'text-[8px] text-zinc-500 hover:text-cyan-200 font-bold uppercase tracking-widest transition-colors';

    // Update UI Live Badge
    const badge = document.getElementById('live-badge');
    if (tab === 'upcoming') {
        badge.innerText = "Live";
        badge.className = "px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[8px] font-bold rounded uppercase animate-pulse mb-1";
    } else if (tab === 'previous') {
        badge.innerText = "History";
        badge.className = "px-2 py-0.5 bg-zinc-500/20 text-zinc-400 text-[8px] font-bold rounded uppercase mb-1";
    } else {
        badge.innerText = "Events";
        badge.className = "px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-bold rounded uppercase animate-pulse mb-1";
    }

    filterLaunches(); // Panggil ulang filter untuk merender list & globe
}

function filterLaunches() {
    const query = document.getElementById('search-launch').value.toLowerCase();
    const filterVal = document.getElementById('filter-launch').value;

    let sourceData = [];
    if (currentTab === 'upcoming') sourceData = allLaunchesData;
    else if (currentTab === 'previous') sourceData = previousLaunchesData;
    else if (currentTab === 'events') sourceData = eventsData;

    const filtered = sourceData.filter(item => {
        // 1. Text Search
        const searchStr = (item.name || '') + ' ' + (item.launch_service_provider?.name || item.type?.name || '') + ' ' + (item.pad?.name || item.location || '');
        if (!searchStr.toLowerCase().includes(query)) return false;

        // 2. Dropdown Kategori (Fitur 4)
        if (filterVal === 'all') return true;

        const providerName = (item.launch_service_provider?.name || '').toLowerCase();
        const missionDesc = (item.mission?.description || item.description || '').toLowerCase();
        const missionName = (item.mission?.name || item.name || '').toLowerCase();

        if (filterVal === 'spacex') return providerName.includes('spacex');
        if (filterVal === 'manned') return missionDesc.includes('crew') || missionDesc.includes('manned') || (item.mission?.type === 'Human Exploration');
        if (filterVal === 'iss') return missionDesc.includes('iss') || missionName.includes('iss') || missionDesc.includes('international space station');

        return true;
    });

    updateStatsText(filtered.length);
    renderLaunchData(filtered);
}

function updateStatsText(count = 0) {
    let txt = "Memuat...";
    if (currentTab === 'upcoming') txt = `${count} Misi Mendatang`;
    else if (currentTab === 'previous') txt = `${count} Riwayat Peluncuran`;
    else if (currentTab === 'events') txt = `${count} Event Terjadwal`;
    document.getElementById('stats-text').textContent = txt;
}

function renderLaunchData(dataArray) {
    const listContainer = document.getElementById('launch-list');
    listContainer.innerHTML = '';

    while (markerGroup.children.length > 0) markerGroup.remove(markerGroup.children[0]);
    if (sunLight) { markerGroup.add(sunLight); markerGroup.add(sunLight.target); }
    if (issMesh && issHalo) { markerGroup.add(issMesh); markerGroup.add(issHalo); }
    if (issTrailLine) markerGroup.add(issTrailLine);
    if (tiangongMesh && tiangongHalo) { markerGroup.add(tiangongMesh); markerGroup.add(tiangongHalo); }
    if (tiangongTrailLine) markerGroup.add(tiangongTrailLine);

    // Kembalikan marker statis & GPS
    persistentMarkers.forEach(m => {
        markerGroup.add(m.mesh);
        markerGroup.add(m.halo);
    });

    const labelsContainer = document.getElementById('labels-container');
    Array.from(labelsContainer.children).forEach(child => {
        if (child.id !== 'iss-label' && child.id !== 'tiangong-label' && !child.classList.contains('persistent-label')) {
            labelsContainer.removeChild(child);
        }
    });

    launchMarkers = [];
    persistentMarkers.forEach(m => {
        if (m.mesh.userData && m.mesh.userData.isMarker) launchMarkers.push(m.mesh);
    });

    if (dataArray.length === 0) {
        listContainer.innerHTML = `<div class="py-4 text-center text-zinc-500 text-xs">Pencarian tidak ditemukan.</div>`;
        return;
    }

    dataArray.forEach(item => {
        const isEvent = item.isSpaceEvent;
        const locName = isEvent ? item.location : item.pad?.location?.name;
        const countryCode = getCountryCode(locName);
        const flagUrl = getFlagUrl(countryCode);
        const provider = isEvent ? (item.type?.name || 'Space Event') : (item.launch_service_provider?.name || 'Unknown');
        const timeStr = isEvent ? item.date : item.net;
        const relativeTime = getRelativeTime(timeStr);

        const statusId = isEvent ? null : item.status?.id;
        const statusColor = getStatusColorClass(statusId, isEvent);
        const statusAbbrev = isEvent ? 'EVT' : (item.status?.abbrev || 'UNK');

        const div = document.createElement('div');
        div.className = "group border-l-2 border-white/5 pl-3 py-2.5 hover:border-cyan-500 hover:bg-white/10 rounded-r-lg transition-all cursor-pointer";
        div.onclick = () => {
            showLaunchDetail(item, true);
            if (window.innerWidth < 768) document.getElementById('manifest-panel').classList.add('hidden');
        };
        div.innerHTML = `
            <div class="flex justify-between items-start gap-2">
                <span class="font-bold text-zinc-100 truncate w-44 leading-tight group-hover:text-white transition-colors flex items-center gap-1.5">
                    <img src="${flagUrl}" class="w-3.5 h-3.5 rounded-full object-cover">
                    ${item.name}
                </span>
                <span class="text-cyan-400 font-mono text-[9px] whitespace-nowrap bg-cyan-950/30 px-1 rounded">${relativeTime}</span>
            </div>
            <div class="flex justify-between items-center mt-1 ml-5">
                <p class="text-zinc-500 text-[10px] truncate w-32 uppercase tracking-tighter font-semibold">${provider}</p>
                <span class="text-[8px] uppercase tracking-widest font-bold ${statusColor}">${statusAbbrev}</span>
            </div>
        `;
        listContainer.appendChild(div);

        // Tambahkan dot ke globe jika punya koordinat
        let lat = null, lon = null;
        if (!isEvent && item.pad && item.pad.latitude !== null) {
            lat = item.pad.latitude; lon = item.pad.longitude;
        } else if (isEvent && item.location && item.location.point) {
            lat = 0; lon = 0;
        }

        if (lat !== null && lon !== null && lat !== 0) {
            addLaunchMarker(lat, lon, item, flagUrl, isEvent);
        }
    });
}

function addLaunchMarker(lat, lon, itemData, flagUrl, isEvent) {
    const position = latLongToVector3(lat, lon, 1);
    const statusId = isEvent ? null : itemData.status?.id;
    const colorHex = getStatusColorHex(statusId, isEvent);

    const markerGeo = new THREE.SphereGeometry(0.022, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(position);

    const haloGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.3 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(position);

    const labelEl = document.createElement('div');
    labelEl.className = 'marker-label';
    labelEl.style.opacity = '0';
    labelEl.innerHTML = `<img src="${flagUrl}" class="flag-icon" style="border-color: #${colorHex.toString(16)}">`;
    document.getElementById('labels-container').appendChild(labelEl);

    marker.userData = {
        isMarker: true,
        halo: halo,
        label: labelEl,
        worldPosition: position.clone(),
        pulse: Math.random() * Math.PI,
        launch: itemData,
        flag: flagUrl
    };

    markerGroup.add(marker);
    markerGroup.add(halo);
    launchMarkers.push(marker);
}

function updateLabels() {
    const container = document.getElementById('globe-container');
    const widthHalf = container.clientWidth / 2;
    const heightHalf = container.clientHeight / 2;
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);

    const updateLabelPos = (marker) => {
        const vector = marker.userData.worldPosition.clone();
        vector.applyMatrix4(markerGroup.matrixWorld);
        const dirToPoint = vector.clone().sub(cameraPosition).normalize();
        if (dirToPoint.dot(vector.clone().normalize()) < -0.25) {
            vector.project(camera);
            const x = (vector.x * widthHalf) + widthHalf;
            const y = -(vector.y * heightHalf) + heightHalf;
            marker.userData.label.style.opacity = '1';
            marker.userData.label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y - 18}px)`;
        } else {
            marker.userData.label.style.opacity = '0';
        }
    };

    launchMarkers.forEach(updateLabelPos);

    if (settings.showISS && issMesh && issMesh.userData.worldPosition.lengthSq() > 0) updateLabelPos(issMesh);
    else if (issMesh && issMesh.userData.label) issMesh.userData.label.style.opacity = '0';

    if (settings.showTiangong && tiangongMesh && tiangongMesh.userData.worldPosition.lengthSq() > 0) updateLabelPos(tiangongMesh);
    else if (tiangongMesh && tiangongMesh.userData.label) tiangongMesh.userData.label.style.opacity = '0';
}

// ================= FITUR BARU: PIN SPACEPORT STATIS & GEOLOCATION ==================

const spaceportsList = [
    { isSpaceport: true, name: "Starbase (Boca Chica)", lat: 25.997, lon: -97.156, desc: "Fasilitas peluncuran utama SpaceX untuk pengembangan dan uji coba Starship secara intensif.", provider: "SpaceX" },
    { isSpaceport: true, name: "Kennedy Space Center", lat: 28.572, lon: -80.648, desc: "Pangkalan peluncuran legendaris NASA tempat misi Apollo dan Space Shuttle dimulai.", provider: "NASA" },
    { isSpaceport: true, name: "Kourou Space Center", lat: 5.239, lon: -52.768, desc: "Pangkalan antariksa utama Eropa (ESA) yang sangat efisien karena berlokasi di dekat khatulistiwa.", provider: "ESA" },
    { isSpaceport: true, name: "Baikonur Cosmodrome", lat: 45.965, lon: 63.305, desc: "Pangkalan peluncuran roket tertua dan terbesar di dunia. Tempat Sputnik dan Yuri Gagarin lepas landas.", provider: "Roscosmos" },
    { isSpaceport: true, name: "Jiuquan Launch Center", lat: 40.960, lon: 100.298, desc: "Pusat peluncuran antariksa pertama dan salah satu fasilitas krusial bagi misi berawak Tiongkok.", provider: "CASC" }
];

function initStaticMarkers() {
    spaceportsList.forEach(sp => {
        const pos = latLongToVector3(sp.lat, sp.lon, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 16), mat);
        mesh.position.copy(pos);

        const halo = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 }));
        halo.position.copy(pos);

        const labelEl = document.createElement('div');
        labelEl.className = 'marker-label persistent-label';
        labelEl.style.opacity = '0';
        labelEl.innerHTML = `<div class="bg-sky-950/80 border border-sky-400/50 backdrop-blur-sm rounded-full p-1 shadow-[0_0_10px_rgba(56,189,248,0.3)]"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`;
        document.getElementById('labels-container').appendChild(labelEl);

        mesh.userData = {
            isMarker: true,
            halo: halo,
            label: labelEl,
            worldPosition: pos.clone(),
            pulse: Math.random() * Math.PI,
            launch: sp
        };

        markerGroup.add(mesh);
        markerGroup.add(halo);
        launchMarkers.push(mesh);
        persistentMarkers.push({ mesh, halo });
    });

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            userLat = lat;
            userLon = lon;

            const vecPos = latLongToVector3(lat, lon, 1);
            const mat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.9 });
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), mat);
            mesh.position.copy(vecPos);

            const halo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.4 }));
            halo.position.copy(vecPos);

            const labelEl = document.createElement('div');
            labelEl.className = 'marker-label persistent-label';
            labelEl.style.opacity = '0';
            labelEl.innerHTML = `<div class="bg-blue-600/80 text-white text-[8px] font-bold px-2 py-0.5 rounded border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)] uppercase tracking-widest whitespace-nowrap">Lokasi Anda</div>`;
            document.getElementById('labels-container').appendChild(labelEl);

            mesh.userData = {
                isMarker: true,
                halo: halo,
                label: labelEl,
                worldPosition: vecPos.clone(),
                pulse: Math.random() * Math.PI,
                launch: {
                    isUser: true,
                    name: "Lokasi Perangkat Anda",
                    provider: "GPS Geolocation",
                    lat: lat,
                    lon: lon
                }
            };

            markerGroup.add(mesh);
            markerGroup.add(halo);
            launchMarkers.push(mesh);
            persistentMarkers.push({ mesh, halo });
        }, () => {
            console.log("Akses lokasi ditolak atau tidak tersedia.");
        });
    }
}

// ================= CUACA LAUNCH SITE ==================
async function fetchLaunchWeather(lat, lon, locName, updateDropdown = true) {
    if (!lat || !lon) {
        lat = 28.572; lon = -80.648; // Default to Kennedy Space Center
        if (!locName) locName = "Kennedy Space Center";
    }

    const selectEl = document.getElementById('weather-location-select');
    if (updateDropdown && selectEl) {
        let found = false;
        for (let i = 0; i < selectEl.options.length; i++) {
            // Kita cek berdasarkan nama, atau mendekati (karena nama API kadang beda)
            if (selectEl.options[i].text.toLowerCase().includes(locName.toLowerCase().split(' ')[0])) {
                selectEl.selectedIndex = i;
                found = true;
                break;
            }
        }

        if (!found) {
            let customOpt = selectEl.querySelector('option[value="custom"]');
            if (!customOpt) {
                customOpt = document.createElement('option');
                customOpt.value = "custom";
                selectEl.insertBefore(customOpt, selectEl.firstChild);
            }
            customOpt.text = `MISI: ${locName}`;
            customOpt.selected = true;
        }
    }

    document.getElementById('weather-temp').innerText = "--°C";
    document.getElementById('weather-desc').innerText = "--";
    document.getElementById('weather-wind').innerText = "-- km/h";

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (res.ok) {
            const data = await res.json();
            const cw = data.current_weather;
            document.getElementById('weather-temp').innerText = Math.round(cw.temperature) + "°C";
            document.getElementById('weather-wind').innerText = cw.windspeed + " km/h";

            const codes = {
                0: "☀️ Cerah", 1: "🌤️ Cerah Berawan", 2: "⛅ Berawan Sebagian", 3: "☁️ Mendung",
                45: "🌫️ Kabut", 48: "🌫️ Kabut Es", 51: "🌦️ Gerimis Ringan", 53: "🌦️ Gerimis Sedang", 55: "🌦️ Gerimis Lebat",
                61: "🌧️ Hujan Ringan", 63: "🌧️ Hujan Sedang", 65: "🌧️ Hujan Lebat",
                71: "❄️ Salju Ringan", 73: "❄️ Salju Sedang", 75: "❄️ Salju Lebat",
                80: "⛈️ Hujan Badai", 81: "⛈️ Hujan Badai", 82: "⛈️ Hujan Badai",
                95: "🌩️ Badai Petir", 96: "🌩️ Badai Petir Es", 99: "🌩️ Badai Petir Lebat"
            };
            document.getElementById('weather-desc').innerText = codes[cw.weathercode] || "☁️ Berawan";
        }
    } catch (e) {
        console.error("Gagal memuat cuaca", e);
    }
}

// Listener untuk dropdown cuaca manual
document.getElementById('weather-location-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'custom') return; // Jangan fetch ulang jika custom diklik lagi
    const [lat, lon] = val.split(',').map(Number);
    const locName = e.target.options[e.target.selectedIndex].text;
    fetchLaunchWeather(lat, lon, locName, false);
});

// Init default weather
fetchLaunchWeather();

// ================= MODAL & UI DATABASE ==================

function showLaunchDetail(item, lock = false) {
    if (isLocked && !lock) return;

    let lat = null, lon = null, locName = "Lokasi Tidak Diketahui";
    if (item.pad && item.pad.latitude !== null) { lat = item.pad.latitude; lon = item.pad.longitude; locName = item.pad.location?.name || item.pad.name; }
    if (item.isSpaceport || item.isUser) { lat = item.lat; lon = item.lon; locName = item.name; }
    if (item.isSpaceEvent) { lat = 0; lon = 0; locName = item.location; }

    // Update weather widget if lat/lon available
    if (lat !== null && lon !== null && lat !== 0) fetchLaunchWeather(lat, lon, locName);

    if (lock && lat !== null && lon !== null && lat !== 0) flyToLatLon(lat, lon);

    currentSelectedLaunch = item;

    document.getElementById('modal-main-detail').style.display = 'block';
    document.getElementById('modal-agency-detail').style.display = 'none';

    if (item.isISS || item.isTiangong) {
        const isTg = item.isTiangong;
        document.getElementById('modal-flag').src = isTg ? getFlagUrl('cn') : "https://upload.wikimedia.org/wikipedia/commons/1/15/ISS_emblem.png";
        document.getElementById('modal-flag').classList.remove('hidden');

        document.getElementById('modal-title').innerText = item.name;
        document.getElementById('modal-provider').innerText = item.launch_service_provider.name;
        document.getElementById('modal-provider').classList.remove('cursor-pointer', 'underline');
        document.getElementById('modal-pad').innerText = item.pad.name;
        document.getElementById('modal-status').innerText = item.status.name;
        document.getElementById('modal-time').innerText = "Live Tracking";
        document.getElementById('modal-coord').innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

        document.getElementById('live-btn').style.display = 'none';
        document.getElementById('follow-tiangong-btn').style.display = 'none';
        document.getElementById('follow-iss-btn').style.display = 'flex';
        document.getElementById('cal-btn').style.display = 'none';

        updateModalCountdown();

        const modal = document.getElementById('launch-modal');
        modal.classList.add('active');

        if (lock) {
            isLocked = true;
            document.getElementById('modal-backdrop').classList.add('hidden');
            document.getElementById('close-btn').innerText = "Tutup Monitor";
        } else {
            document.getElementById('close-btn').innerText = "Klik Dot Untuk Detail";
        }
        return;
    }

    if (item.isSpaceport || item.isUser) {
        document.getElementById('modal-flag').classList.add('hidden');

        document.getElementById('modal-title').innerText = item.name;
        document.getElementById('modal-provider').innerText = item.provider;
        document.getElementById('modal-provider').classList.remove('cursor-pointer', 'underline');
        document.getElementById('modal-pad').innerText = item.isUser ? "Koordinat GPS Eksternal" : "Pangkalan Antariksa Statis";
        document.getElementById('modal-status').innerText = item.isUser ? "ACTIVE" : "FASILITAS";
        document.getElementById('modal-time').innerText = "Real-time / Permanen";
        document.getElementById('modal-coord').innerText = `${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}`;

        document.getElementById('live-btn').style.display = 'none';
        document.getElementById('follow-tiangong-btn').style.display = 'none';
        document.getElementById('follow-iss-btn').style.display = 'none';
        document.getElementById('cal-btn').style.display = 'none';

        const container = document.getElementById('modal-countdown-container');
        const text = document.getElementById('modal-countdown');
        document.getElementById('countdown-label').innerText = item.isUser ? "STATUS LOKASI ANDA" : "INFORMASI LOKASI";
        container.className = `bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 mb-5 flex flex-col items-center text-center`;
        text.className = `text-xs font-medium text-sky-200 leading-relaxed max-w-[250px]`;
        text.innerText = item.isUser ? "Lokasi Anda saat ini berhasil dideteksi dan disematkan pada globe. Orbit stasiun angkasa yang melintasi lokasi ini akan terlihat secara langsung." : item.desc;

        const modal = document.getElementById('launch-modal');
        modal.classList.add('active');

        if (lock) {
            isLocked = true;
            document.getElementById('modal-backdrop').classList.add('hidden');
            document.getElementById('close-btn').innerText = "Tutup Monitor";
        } else {
            document.getElementById('close-btn').innerText = "Klik Dot Untuk Detail";
        }
        return;
    }

    // Normal Launch / Event Detail
    const countryCode = getCountryCode(item.pad?.location?.name);
    const flagUrl = getFlagUrl(countryCode);

    const flagImg = document.getElementById('modal-flag');
    flagImg.src = flagUrl;
    flagImg.classList.remove('hidden');

    document.getElementById('modal-title').innerText = item.name || 'N/A';

    const isEvent = item.isSpaceEvent;
    const providerEl = document.getElementById('modal-provider');
    providerEl.innerText = isEvent ? (item.type?.name || 'Space Event') : (item.launch_service_provider?.name || 'Unknown');
    if (!isEvent && item.launch_service_provider) {
        providerEl.classList.add('cursor-pointer', 'underline');
    } else {
        providerEl.classList.remove('cursor-pointer', 'underline');
    }

    document.getElementById('modal-pad').innerText = isEvent ? item.location : (item.pad?.name || 'Unknown Pad');
    document.getElementById('modal-status').innerText = isEvent ? 'SCHEDULED' : (item.status?.name || 'TBD');

    const timeStr = isEvent ? item.date : item.net;
    document.getElementById('modal-time').innerText = timeStr ? new Date(timeStr).toISOString().replace('T', ' ').substring(0, 19) : 'TBD';
    document.getElementById('modal-coord').innerText = (lat !== null) ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'Orbit / N/A';

    const liveBtn = document.getElementById('live-btn');
    const vids = item.vidURLs || item.vid_urls || item.video_url;
    if (vids && typeof vids === 'string') {
        liveBtn.href = vids; liveBtn.style.display = 'flex';
    } else if (vids && vids.length > 0) {
        liveBtn.href = vids[0].url; liveBtn.style.display = 'flex';
    } else {
        liveBtn.style.display = 'none';
    }

    document.getElementById('follow-iss-btn').style.display = 'none';
    document.getElementById('follow-tiangong-btn').style.display = 'none';

    if (timeStr) {
        document.getElementById('cal-btn').href = getCalendarUrl(item);
        document.getElementById('cal-btn').style.display = 'flex';
    } else {
        document.getElementById('cal-btn').style.display = 'none';
    }

    updateModalCountdown();

    const modal = document.getElementById('launch-modal');
    modal.classList.add('active');

    if (lock) {
        isLocked = true;
        document.getElementById('modal-backdrop').classList.add('hidden');
        document.getElementById('close-btn').innerText = "Tutup Monitor";
    } else {
        document.getElementById('close-btn').innerText = "Klik Dot Untuk Detail";
    }
}

function showAgencyInfo() {
    if (!currentSelectedLaunch || !currentSelectedLaunch.launch_service_provider) return;
    const targetId = currentSelectedLaunch.launch_service_provider.id;

    const agency = agenciesData.find(a => a.id === targetId);

    document.getElementById('modal-main-detail').style.display = 'none';
    document.getElementById('modal-agency-detail').style.display = 'flex';

    document.getElementById('agency-name').innerText = agency?.name || currentSelectedLaunch.launch_service_provider.name;
    document.getElementById('agency-type').innerText = agency?.type || 'Space Agency';
    document.getElementById('agency-admin').innerText = agency?.administrator || '-';
    document.getElementById('agency-founded').innerText = agency?.founding_year || '-';
    document.getElementById('agency-desc').innerText = agency?.description || 'Deskripsi tidak tersedia dalam database.';

    const logoEl = document.getElementById('agency-logo');
    if (agency?.logo_url) {
        logoEl.src = agency.logo_url;
        logoEl.style.display = 'block';
    } else {
        logoEl.style.display = 'none';
    }
}

function hideAgencyInfo() {
    document.getElementById('modal-agency-detail').style.display = 'none';
    document.getElementById('modal-main-detail').style.display = 'block';
}

function updateModalCountdown() {
    if (currentSelectedLaunch?.isISS || currentSelectedLaunch?.isTiangong || currentSelectedLaunch?.isSpaceport || currentSelectedLaunch?.isUser) {
        return; // Di-handle khusus di dalam fungsi showLaunchDetail
    }

    const timeStr = currentSelectedLaunch?.net || currentSelectedLaunch?.date;
    if (timeStr) {
        const cdString = getCountdown(timeStr);
        document.getElementById('modal-countdown').innerText = cdString;
        document.getElementById('countdown-label').innerText = "T-Minus Countdown";

        const container = document.getElementById('modal-countdown-container');
        const text = document.getElementById('modal-countdown');
        if (cdString === "TELAH SELESAI") {
            container.className = "bg-zinc-500/10 border border-zinc-500/20 rounded-xl p-3 mb-5 flex flex-col items-center";
            text.className = "text-xl font-mono font-extrabold text-zinc-400";
        } else {
            container.className = "bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 flex flex-col items-center";
            text.className = "text-xl font-mono font-extrabold text-white";
        }
    }
}

function closeModal() {
    isLocked = false;
    currentSelectedLaunch = null;
    document.getElementById('launch-modal').classList.remove('active');
    document.getElementById('modal-backdrop').classList.add('hidden');
    setTimeout(hideAgencyInfo, 400);
}

function followISS() {
    isFollowingISS = true; isFollowingTiangong = false; isLocked = false;
    targetGlobeRotation = null; settings.autoRotation = false;
    document.getElementById('rotation-toggle').checked = false;
    closeModal();
}

function followTiangong() {
    isFollowingTiangong = true; isFollowingISS = false; isLocked = false;
    targetGlobeRotation = null; settings.autoRotation = false;
    document.getElementById('rotation-toggle').checked = false;
    closeModal();
}

function updateClock() {
    const realNow = new Date();
    let displayTime = realNow;

    if (isManualTime) {
        displayTime = manualDate;
    } else {
        const slider = document.getElementById('time-slider');
        if (slider) slider.value = realNow.getHours() * 60 + realNow.getMinutes();
    }

    document.getElementById('local-time').textContent = displayTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('utc-time').textContent = `UTC ${displayTime.getUTCHours().toString().padStart(2, '0')}:${displayTime.getUTCMinutes().toString().padStart(2, '0')}:${displayTime.getUTCSeconds().toString().padStart(2, '0')}`;

    updateSunPosition(displayTime);
    if (currentSelectedLaunch && !currentSelectedLaunch.isISS && !currentSelectedLaunch.isTiangong && !currentSelectedLaunch.isSpaceport && !currentSelectedLaunch.isUser) updateModalCountdown();
}

// ================= INISIALISASI THREE.JS ==================

function init() {
    const container = document.getElementById('globe-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.z = width < 768 ? 3.5 : 2.8;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = settings.exposure;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    sunLight = new THREE.DirectionalLight(0xffffff, 1.8);

    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.015, transparent: true, opacity: 0.8 });
    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 20; const y = (Math.random() - 0.5) * 20; const z = (Math.random() - 0.5) * 20;
        if (Math.sqrt(x * x + y * y + z * z) > 2.5) starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    scene.add(new THREE.Points(starsGeometry, starsMaterial));

    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const earthTex = textureLoader.load('https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg', () => resetToIndonesia());

    earth = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshPhongMaterial({ map: earthTex, specular: new THREE.Color('#222'), shininess: 15 })
    );
    mainGroup.add(earth);

    // FITUR 5: Efek Atmosfer Kosmik (Glow Shader) di pinggiran bola bumi
    // PERBAIKAN: Radius awal di-set 1.0 agar ukurannya bisa bebas dikendalikan via slider Scale
    const atmosGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });
    atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    atmosphereMesh.scale.setScalar(settings.atmosphereScale); // Terapkan skala awal dari setting
    mainGroup.add(atmosphereMesh);

    const cloudTex = textureLoader.load('https://clouds.matteason.co.uk/images/8192x4096/clouds.jpg', () => {
        finishLoading();
        fetchUpcomingLaunches().then(() => {
            fetchPreviousLaunches();
            fetchSpaceEvents();
            fetchAgencies();
        });
    });

    clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.015, 64, 64),
        new THREE.MeshLambertMaterial({ color: 0xffffff, alphaMap: cloudTex, transparent: true, depthWrite: false, opacity: settings.cloudOpacity })
    );
    mainGroup.add(clouds);

    markerGroup = new THREE.Group();
    mainGroup.add(markerGroup);
    markerGroup.add(sunLight); markerGroup.add(sunLight.target);

    // Inisialisasi ISS (Merah)
    issMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.95 }));
    issHalo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 }));
    issMesh.userData = { isMarker: true, isISS: true, halo: issHalo, label: document.getElementById('iss-label'), worldPosition: new THREE.Vector3(), pulse: 0 };
    issTrailLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.8 }));
    issTrailLine.frustumCulled = false; issTrailLine.raycast = function () { };
    markerGroup.add(issTrailLine); markerGroup.add(issMesh); markerGroup.add(issHalo);

    // Inisialisasi Tiangong (Amber)
    tiangongMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.95 }));
    tiangongHalo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3 }));
    tiangongMesh.userData = { isMarker: true, isTiangong: true, halo: tiangongHalo, label: document.getElementById('tiangong-label'), worldPosition: new THREE.Vector3(), pulse: 0 };
    tiangongTrailLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 }));
    tiangongTrailLine.frustumCulled = false; tiangongTrailLine.raycast = function () { };
    markerGroup.add(tiangongTrailLine); markerGroup.add(tiangongMesh); markerGroup.add(tiangongHalo);

    initStaticMarkers(); // Inisiasi Pangkalan Statis dan Lokasi GPS Pengguna

    setupControls();
    setupMobileInteractions();
    setupTimeline(); 
    initCharts(); // Inisialisasi Chart.js
    setupGlobalSearch(); // Search Bar Global
    init2DMap(); // Inisialisasi Peta 2D
    setInterval(updateClock, 1000); updateClock();

    fetchAstronauts();
    fetchISSPosition(); setInterval(fetchISSPosition, 1000);
    fetchTiangongPosition(); setInterval(fetchTiangongPosition, 5000);

    document.getElementById('search-launch').addEventListener('input', filterLaunches);
    document.getElementById('filter-launch').addEventListener('change', filterLaunches);
    window.addEventListener('resize', onWindowResize);

    const canvasEl = renderer.domElement;
    let activePointerId = null;

    canvasEl.addEventListener('pointerdown', (e) => {
        if (activePointerId !== null) return;
        activePointerId = e.pointerId;
        canvasEl.setPointerCapture(e.pointerId);

        isDragging = true; hasDragged = false; dragDistance = 0;
        isFollowingISS = false; isFollowingTiangong = false;
        targetGlobeRotation = null;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvasEl.addEventListener('pointermove', (e) => {
        if (isDragging && e.pointerId === activePointerId) {
            const delta = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };
            dragDistance += Math.abs(delta.x) + Math.abs(delta.y);
            if (dragDistance > 3) hasDragged = true;

            earth.rotation.y += delta.x * 0.005; clouds.rotation.y += delta.x * 0.005;
            markerGroup.rotation.y += delta.x * 0.005; mainGroup.rotation.x += delta.y * 0.005;
            mainGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mainGroup.rotation.x));
            previousMousePosition = { x: e.clientX, y: e.clientY };
        } else if (!isDragging) {
            onInteractiveMove(e.clientX, e.clientY);
        }
    });

    const handlePointerUp = (e) => {
        if (e.pointerId !== activePointerId) return;
        isDragging = false; activePointerId = null;
        if (canvasEl.hasPointerCapture(e.pointerId)) canvasEl.releasePointerCapture(e.pointerId);
    };

    canvasEl.addEventListener('pointerup', handlePointerUp);
    canvasEl.addEventListener('pointercancel', handlePointerUp);
    canvasEl.addEventListener('click', onCanvasClick);

    document.addEventListener('wheel', (e) => {
        if (e.target.closest('.glass') || e.target.closest('button')) return;
        camera.position.z = Math.min(Math.max(camera.position.z + e.deltaY * 0.002, 1.25), 6);
    }, { passive: false });

    animate();
}

function onInteractiveMove(x, y) {
    if (isLocked || isDragging) return;
    const container = document.getElementById('globe-container');
    const rect = container.getBoundingClientRect();
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;

    mouse.x = (mouseX / container.clientWidth) * 2 - 1;
    mouse.y = -(mouseY / container.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([earth, ...markerGroup.children]);
    if (intersects.length > 0) {
        const earthHit = intersects.find(i => i.object === earth);
        const markerHit = intersects.find(i => i.object.userData && i.object.userData.isMarker);

        if (markerHit) {
            if (earthHit && earthHit.distance < markerHit.distance) { document.body.style.cursor = 'default'; return; }
            showLaunchDetail(markerHit.object.userData.launch, false);
            document.body.style.cursor = 'pointer';
            return;
        }
    }
    document.body.style.cursor = 'default';
}

function onCanvasClick(event) {
    if (hasDragged) { hasDragged = false; return; }
    const container = document.getElementById('globe-container');
    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    mouse.x = (mouseX / container.clientWidth) * 2 - 1;
    mouse.y = -(mouseY / container.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([earth, ...markerGroup.children]);
    if (intersects.length > 0) {
        const earthHit = intersects.find(i => i.object === earth);
        const markerHit = intersects.find(i => i.object.userData && i.object.userData.isMarker);

        if (markerHit) {
            if (earthHit && earthHit.distance < markerHit.distance) { if (isLocked) closeModal(); return; }
            showLaunchDetail(markerHit.object.userData.launch, true);
            return;
        }
    }
    if (isLocked) closeModal();
}

function setupControls() {
    document.getElementById('cloud-toggle').addEventListener('change', (e) => clouds.visible = e.target.checked);
    document.getElementById('cloud-opacity').addEventListener('input', (e) => {
        clouds.material.opacity = e.target.value / 100;
        document.getElementById('opacity-val').textContent = (e.target.value / 100).toFixed(1);
    });

    // Slider baru untuk mengontrol skala mesh atmosfer
    document.getElementById('atmos-scale').addEventListener('input', (e) => {
        const val = e.target.value / 100;
        if (atmosphereMesh) atmosphereMesh.scale.setScalar(val);
        document.getElementById('atmos-val').textContent = val.toFixed(2);
    });

    document.getElementById('rotation-toggle').addEventListener('change', (e) => {
        settings.autoRotation = e.target.checked;
        if (e.target.checked) targetGlobeRotation = null;
    });
    document.getElementById('rotation-speed').addEventListener('input', (e) => settings.rotationSpeed = e.target.value / 10000);
    document.getElementById('exposure-control').addEventListener('input', (e) => renderer.toneMappingExposure = e.target.value / 10);

    document.getElementById('iss-toggle').addEventListener('change', (e) => {
        settings.showISS = e.target.checked;
        if (issMesh) issMesh.visible = settings.showISS;
        if (issHalo) issHalo.visible = settings.showISS;
        if (issTrailLine) issTrailLine.visible = settings.showISS;
        if (!settings.showISS) {
            if (issMesh?.userData.label) issMesh.userData.label.style.opacity = '0';
            if (isFollowingISS) { isFollowingISS = false; settings.autoRotation = true; document.getElementById('rotation-toggle').checked = true; }
        }
    });

    document.getElementById('tiangong-toggle').addEventListener('change', (e) => {
        settings.showTiangong = e.target.checked;
        if (tiangongMesh) tiangongMesh.visible = settings.showTiangong;
        if (tiangongHalo) tiangongHalo.visible = settings.showTiangong;
        if (tiangongTrailLine) tiangongTrailLine.visible = settings.showTiangong;
        if (!settings.showTiangong) {
            if (tiangongMesh?.userData.label) tiangongMesh.userData.label.style.opacity = '0';
            if (isFollowingTiangong) { isFollowingTiangong = false; settings.autoRotation = true; document.getElementById('rotation-toggle').checked = true; }
        }
    });
}

function setupMobileInteractions() {
    document.getElementById('mobile-manifest-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('manifest-panel').classList.toggle('hidden');
        document.getElementById('controls-panel').classList.add('hidden');
    });
    document.getElementById('mobile-controls-toggle').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('controls-panel').classList.toggle('hidden');
        document.getElementById('manifest-panel').classList.add('hidden');
    });
}

function setupTimeline() {
    const timeSlider = document.getElementById('time-slider');
    const resetTimeBtn = document.getElementById('reset-time-btn');

    timeSlider.addEventListener('input', (e) => {
        isManualTime = true;
        resetTimeBtn.classList.remove('hidden');

        const mins = parseInt(e.target.value);
        const today = new Date();
        today.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
        manualDate = today;

        updateClock();
    });

    resetTimeBtn.addEventListener('click', () => {
        isManualTime = false;
        resetTimeBtn.classList.add('hidden');
        updateClock();
    });
}

function resetToIndonesia() {
    mainGroup.rotation.set(0, 0, 0);
    const indRotation = -Math.PI / 1.6;
    earth.rotation.set(0, indRotation, 0); clouds.rotation.set(0, indRotation, 0); markerGroup.rotation.set(0, indRotation, 0);
    const container = document.getElementById('globe-container');
    camera.position.z = (container && container.clientWidth < 768) ? 3.5 : 2.8;
    camera.lookAt(0, 0, 0);
}

function finishLoading() {
    const screen = document.getElementById('loading-screen');
    screen.style.opacity = '0'; setTimeout(() => screen.style.display = 'none', 700);
}

function onWindowResize() {
    const container = document.getElementById('globe-container');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);

    let targetMeshToFollow = null;
    if (isFollowingISS && issMesh && issMesh.userData.launch) targetMeshToFollow = issMesh;
    else if (isFollowingTiangong && tiangongMesh && tiangongMesh.userData.launch) targetMeshToFollow = tiangongMesh;

    if (targetMeshToFollow) {
        const lat = targetMeshToFollow.userData.launch.pad.latitude;
        const lon = targetMeshToFollow.userData.launch.pad.longitude;
        const targetX = lat * (Math.PI / 180);
        const targetYAbsolute = -(lon + 90) * (Math.PI / 180);

        let currentY = earth.rotation.y % (2 * Math.PI); if (currentY < 0) currentY += 2 * Math.PI;
        let tY = targetYAbsolute % (2 * Math.PI); if (tY < 0) tY += 2 * Math.PI;

        let diff = tY - currentY;
        if (diff > Math.PI) diff -= 2 * Math.PI; if (diff < -Math.PI) diff += 2 * Math.PI;

        mainGroup.rotation.x += (targetX - mainGroup.rotation.x) * 0.05;
        earth.rotation.y += diff * 0.05; clouds.rotation.y += diff * 0.05; markerGroup.rotation.y += diff * 0.05;
    } else if (targetGlobeRotation && !isDragging) {
        mainGroup.rotation.x += (targetGlobeRotation.x - mainGroup.rotation.x) * 0.05;
        const diffY = targetGlobeRotation.y - earth.rotation.y;
        earth.rotation.y += diffY * 0.05; clouds.rotation.y += diffY * 0.05; markerGroup.rotation.y += diffY * 0.05;
        if (Math.abs(targetGlobeRotation.x - mainGroup.rotation.x) < 0.001 && Math.abs(diffY) < 0.001) targetGlobeRotation = null;
    } else if (!isDragging && settings.autoRotation) {
        earth.rotation.y += settings.rotationSpeed;
        clouds.rotation.y += settings.rotationSpeed * 1.05;
        markerGroup.rotation.y += settings.rotationSpeed;
    }

    launchMarkers.forEach(m => {
        m.userData.pulse += 0.05; const scale = 1 + Math.sin(m.userData.pulse) * 0.4;
        m.userData.halo.scale.set(scale, scale, scale); m.userData.halo.material.opacity = 0.4 - (Math.sin(m.userData.pulse) * 0.2);
    });

    if (issMesh) {
        issMesh.userData.pulse += 0.05; const scale = 1 + Math.sin(issMesh.userData.pulse) * 0.4;
        issMesh.userData.halo.scale.set(scale, scale, scale); issMesh.userData.halo.material.opacity = 0.4 - (Math.sin(issMesh.userData.pulse) * 0.2);
    }

    if (tiangongMesh) {
        tiangongMesh.userData.pulse += 0.05; const scale = 1 + Math.sin(tiangongMesh.userData.pulse) * 0.4;
        tiangongMesh.userData.halo.scale.set(scale, scale, scale); tiangongMesh.userData.halo.material.opacity = 0.4 - (Math.sin(tiangongMesh.userData.pulse) * 0.2);
    }

    updateLabels();
    renderer.render(scene, camera);
}

// ================= CHART.JS INIT & UPDATE ==================
function initCharts() {
    const telCtx = document.getElementById('telemetry-chart')?.getContext('2d');

    // Pre-populate with some initial dummy data so the chart isn't empty on load
    for (let i = 0; i < 20; i++) {
        telemetryData.labels.push('');
        telemetryData.datasets[0].data.push(420 + Math.random() * 2);
    }

    if (telCtx) {
        telemetryChart = new Chart(telCtx, {
            type: 'line',
            data: telemetryData,
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { display: false, grid: { display: false } },
                    y: { display: false, grid: { display: false } }
                },
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: { duration: 0 },
                elements: {
                    line: { tension: 0.4 },
                    point: { radius: 0 }
                }
            }
        });
    }

    const actCtx = document.getElementById('activity-chart')?.getContext('2d');
    if (actCtx) {
        activityChart = new Chart(actCtx, {
            type: 'doughnut',
            data: {
                labels: ['Asia', 'Eropa', 'Amerika', 'Afrika', 'Australia'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: { animateScale: true, animateRotate: true }
            }
        });
    }
}

function getContinent(lat, lon) {
    if (lat > 15 && lon < -45) return 'Amerika'; // North America
    if (lat <= 15 && lon < -30) return 'Amerika'; // South America
    if (lat > 35 && lon >= -10 && lon < 45) return 'Eropa';
    if (lat <= 35 && lat > -35 && lon >= -20 && lon < 55) return 'Afrika';
    if (lat < -10 && lon >= 100) return 'Australia'; // Oceania
    return 'Asia'; // Default Asia
}

function updateActivityChart() {
    if (!activityChart) return;

    // Menghitung jumlah pangkalan peluncuran (pad) yang memiliki misi aktif/mendatang
    const activePads = new Map();
    allLaunchesData.forEach(item => {
        if (item.pad && item.pad.latitude !== null) {
            activePads.set(item.pad.id, { lat: item.pad.latitude, lon: item.pad.longitude });
        }
    });

    const counts = { 'Asia': 0, 'Eropa': 0, 'Amerika': 0, 'Afrika': 0, 'Australia': 0 };

    activePads.forEach(pad => {
        const cont = getContinent(pad.lat, pad.lon);
        if (counts[cont] !== undefined) counts[cont]++;
    });

    const dataArray = [counts['Asia'], counts['Eropa'], counts['Amerika'], counts['Afrika'], counts['Australia']];
    const total = dataArray.reduce((a, b) => a + b, 0);

    activityChart.data.datasets[0].data = dataArray;
    activityChart.update();

    const actTotalEl = document.getElementById('act-total');
    if (actTotalEl) actTotalEl.innerText = total;

    // Update legends
    const colors = ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
    const labels = ['Asia', 'Eropa', 'Amerika', 'Afrika', 'Australia'];

    const legendContainer = document.getElementById('activity-legend');
    if (legendContainer) {
        const legendsHtml = labels.map((name, i) => {
            if (dataArray[i] > 0) {
                return `
                    <div class="flex justify-between items-center text-[9px] font-bold">
                        <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full" style="background:${colors[i]}"></span><span class="text-zinc-400 uppercase tracking-widest">${name}</span></div>
                        <span class="text-white">${dataArray[i]}</span>
                    </div>
                `;
            }
            return '';
        }).join('');
        legendContainer.innerHTML = legendsHtml;
    }
}

// ================= PETA LAUNCH SITE 2D (D3.js) ==================

let mapSvg, mapProjection, mapPath;
let isMapLoaded = false;

async function init2DMap() {
    const container = document.getElementById('world-map-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    mapSvg = d3.select("#world-map-svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    mapProjection = d3.geoEquirectangular()
        .scale(width / (2 * Math.PI) * 1.1)
        .translate([width / 2, height / 2]);

    mapPath = d3.geoPath().projection(mapProjection);

    try {
        const geoData = await d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
        document.getElementById('map-loader').style.display = 'none';

        mapSvg.append("g")
            .selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "rgba(255, 255, 255, 0.25)")
            .attr("stroke-width", 0.5)
            .attr("d", mapPath);

        isMapLoaded = true;
        update2DMapDots(); // Update dots once loaded
    } catch (e) {
        console.error("Gagal memuat peta 2D", e);
        document.getElementById('map-loader').style.display = 'none';
    }
}

function update2DMapDots() {
    if (!isMapLoaded || !mapSvg) return;

    // Clear existing dots
    mapSvg.selectAll(".launch-dot").remove();

    // Calculate stats
    let stUp = 0, stLive = 0, stSuc = 0, stTbd = 0, stFail = 0;

    // Extract points to plot
    const allData = [...allLaunchesData, ...previousLaunchesData];
    const points = [];

    allData.forEach(item => {
        if (item.pad && item.pad.latitude !== null && item.pad.longitude !== null) {
            const statusId = item.status?.id;
            let color = "#ef4444"; // default fail/red

            if (statusId === 1) { color = "#38bdf8"; stUp++; } // upcoming (blue)
            else if (statusId === 2 || statusId === 8) { color = "#fb923c"; stTbd++; } // TBD
            else if (statusId === 3) { color = "#10b981"; stSuc++; } // Success
            else if (statusId === 4 || statusId === 7) { color = "#ef4444"; stFail++; } // Fail
            else { color = "#fbbf24"; stLive++; } // Other -> Live/InProgress

            points.push({
                lon: item.pad.longitude,
                lat: item.pad.latitude,
                color: color
            });
        }
    });

    // Add spaceports
    spaceportsList.forEach(sp => {
        points.push({ lon: sp.lon, lat: sp.lat, color: "#3b82f6" });
    });

    // Draw dots
    mapSvg.selectAll(".launch-dot")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "launch-dot")
        .attr("cx", d => {
            const p = mapProjection([d.lon, d.lat]);
            return p ? p[0] : 0;
        })
        .attr("cy", d => {
            const p = mapProjection([d.lon, d.lat]);
            return p ? p[1] : 0;
        })
        .attr("r", 2.5)
        .style("fill", d => d.color)
        .style("opacity", 0.9)
        .style("filter", "drop-shadow(0px 0px 3px currentColor)");

    // Update stat numbers
    document.getElementById('stat-upcoming').innerText = stUp;
    document.getElementById('stat-live').innerText = stLive;
    document.getElementById('stat-success').innerText = stSuc;
    document.getElementById('stat-tbd').innerText = stTbd;
    updateActivityChart(); // Update donut chart with real data
}

// Override fetch functions to call update2DMapDots after data loads
const originalFetchUpcoming = fetchUpcomingLaunches;
fetchUpcomingLaunches = async function () {
    await originalFetchUpcoming();
    update2DMapDots();
};

const originalFetchPrevious = fetchPreviousLaunches;
fetchPreviousLaunches = async function () {
    await originalFetchPrevious();
    update2DMapDots();
};

function setupGlobalSearch() {
    const input = document.getElementById('global-search-input');
    const resultsContainer = document.getElementById('global-search-results');

    if(!input || !resultsContainer) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if(query.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }

        let results = [];

        // Helper to search and format items
        const addLaunches = (dataList, typeLabel) => {
            if(!dataList) return;
            dataList.forEach(item => {
                const name = item.name || '';
                const locName = item.pad?.location?.name || '';
                const provider = item.launch_service_provider?.name || '';
                
                if(name.toLowerCase().includes(query) || locName.toLowerCase().includes(query) || provider.toLowerCase().includes(query)) {
                    results.push({
                        item: item,
                        title: name,
                        subtitle: `${typeLabel} • ${locName || 'Lokasi tidak diketahui'}`,
                        icon: '🚀'
                    });
                }
            });
        };

        addLaunches(allLaunchesData, 'Upcoming');
        addLaunches(previousLaunchesData, 'Previous');

        if(typeof spaceportsList !== 'undefined') {
            spaceportsList.forEach(sp => {
                const name = sp.name || '';
                const provider = sp.provider || '';
                if(name.toLowerCase().includes(query) || provider.toLowerCase().includes(query)) {
                    results.push({
                        item: sp,
                        title: name,
                        subtitle: `Spaceport • ${provider}`,
                        icon: '📍'
                    });
                }
            });
        }

        if(typeof eventsData !== 'undefined' && eventsData) {
            eventsData.forEach(item => {
                const name = item.name || '';
                const loc = item.location || '';
                if(name.toLowerCase().includes(query) || loc.toLowerCase().includes(query)) {
                    results.push({
                        item: item,
                        title: name,
                        subtitle: `Event • ${loc || 'Lokasi tidak diketahui'}`,
                        icon: '⭐'
                    });
                }
            });
        }

        results = results.slice(0, 10);
        
        if(results.length === 0) {
            resultsContainer.innerHTML = `<div class="p-3 text-center text-[10px] text-zinc-500">Tidak ada hasil ditemukan.</div>`;
        } else {
            resultsContainer.innerHTML = '';
            results.forEach(r => {
                const div = document.createElement('div');
                div.className = "p-2.5 border-b border-white/5 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors";
                div.onclick = () => {
                    resultsContainer.classList.add('hidden');
                    input.value = '';
                    showLaunchDetail(r.item, true);
                };
                div.innerHTML = `
                    <div class="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-sm shrink-0">${r.icon}</div>
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-[11px] font-bold text-white truncate">${r.title}</span>
                        <span class="text-[9px] text-zinc-400 truncate">${r.subtitle}</span>
                    </div>
                `;
                resultsContainer.appendChild(div);
            });
        }
        
        resultsContainer.classList.remove('hidden');
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if(!input.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });
}

window.onload = init;
