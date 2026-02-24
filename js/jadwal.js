document.addEventListener("DOMContentLoaded", function () {
    const timezoneSelect = document.getElementById("timezoneSelect");
    let jadwalSholat = {}; // Simpan jadwal di memori

    function updateClock() {
        const now = new Date();
        const tz = timezoneSelect.value;
        
        // Format waktu sesuai timezone
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: tz };
        const optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: tz };
        const optionsDay = { weekday: 'long', timeZone: tz };

        document.getElementById("time").textContent = new Intl.DateTimeFormat('en-GB', optionsTime).format(now);
        document.getElementById("date").textContent = new Intl.DateTimeFormat('en-GB', optionsDate).format(now);
        document.getElementById("dayOfWeek").textContent = translateDayOfWeek(new Intl.DateTimeFormat('en-US', optionsDay).format(now));

        // Update semua countdown
        if (jadwalSholat.subuh) {
            updateAllCountdowns(now, tz);
        }
    }

    async function fetchData() {
        const selectedTimezone = timezoneSelect.value;
        let cityId = 1301; // Default Jakarta
        
        if(selectedTimezone === "Asia/Makassar") cityId = 2622;
        if(selectedTimezone === "Asia/Jayapura") cityId = 3329;

        // Ambil waktu sekarang untuk parameter API
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        const apiSholat = `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`;

        try {
            const response = await fetch(apiSholat);
            const resData = await response.json();
            const jadwal = resData.data.jadwal;

            // Update UI Jadwal
            const prayerKeys = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
            prayerKeys.forEach(key => {
                document.getElementById(key).textContent = jadwal[key];
                jadwalSholat[key] = jadwal[key]; // Simpan ke variabel global
            });
        } catch (error) {
            console.error("Gagal ambil jadwal:", error);
        }
    }

    function updateAllCountdowns(now, tz) {
        const prayerKeys = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
        const dateStr = now.toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD

        prayerKeys.forEach(key => {
            const timeString = jadwalSholat[key];
            const target = new Date(`${dateStr}T${timeString}:00`);
            
            // Handle jika waktu sholat sudah lewat, bisa ditambah logika buat besok (opsional)
            const diff = target - now;
            document.getElementById(`${key}Countdown`).textContent = formatCountdown(diff);
        });
    }

    function formatCountdown(ms) {
        if (ms <= 0) return "Adzan!";
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function translateDayOfWeek(day) {
        const map = { "Sunday": "Minggu", "Monday": "Senin", "Tuesday": "Selasa", "Wednesday": "Rabu", "Thursday": "Kamis", "Friday": "Jumat", "Saturday": "Sabtu" };
        return map[day] || day;
    }

    // Jalankan
    fetchData(); 
    setInterval(updateClock, 1000); // Update tampilan jam tiap detik tanpa fetch
    timezoneSelect.addEventListener("change", fetchData); // Fetch ulang hanya jika zona ganti
});