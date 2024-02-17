document.addEventListener("DOMContentLoaded", function () {
    
    const timezoneSelect = document.getElementById("timezoneSelect");
    const dateElement = document.getElementById("date");
    const timeElement = document.getElementById("time");
    const dayOfWeekElement = document.getElementById("dayOfWeek");

    function fetchData() {
        const selectedTimezone = timezoneSelect.value;
        const apiTanggal = `https://api.codetabs.com/v1/proxy?quest=https://timeapi.io/api/Time/current/zone?timeZone=${selectedTimezone}`;
        var id;

        fetch(apiTanggal)
        .then(response => response.json())
        .then(data => {
            dateElement.textContent = data.day + "/" + data.month + "/" + data.year;
            timeElement.textContent = formatTimeUnit(data.hour) + ":" + formatTimeUnit(data.minute) + ":" + formatTimeUnit(data.seconds);
            dayOfWeekElement.textContent = translateDayOfWeek(data.dayOfWeek);

            if(selectedTimezone=="Asia/Jakarta"){ id=1301; }
            else if(selectedTimezone=="Asia/Makassar"){ id=2622; }
            else if(selectedTimezone=="Asia/Jayapura"){ id=3329; }

            const apiSholat = `https://api.codetabs.com/v1/proxy?quest=https://api.myquran.com/v2/sholat/jadwal/${id}/${data.year}/${data.month}/${data.day}`;

            fetch(apiSholat)
            .then(response => response.json())
            .then(data2 => {
                subuh.textContent = data2.data.jadwal.subuh;
                dzuhur.textContent = data2.data.jadwal.dzuhur;
                ashar.textContent = data2.data.jadwal.ashar;
                maghrib.textContent = data2.data.jadwal.maghrib;
                isya.textContent = data2.data.jadwal.isya;

                const prayerTimes = {
                    subuh: data2.data.jadwal.subuh,
                    dzuhur: data2.data.jadwal.dzuhur,
                    ashar: data2.data.jadwal.ashar,
                    maghrib: data2.data.jadwal.maghrib,
                    isya: data2.data.jadwal.isya,
                };

                const currentTime = new Date(data.year, data.month - 1, data.day, data.hour, data.minute, data.seconds);

                Object.keys(prayerTimes).forEach(prayer => {
                    const prayerTime = new Date(`${data.year}-${data.month}-${data.day} ${prayerTimes[prayer]}`);
                    const countdownElement = document.getElementById(`${prayer}Countdown`);

                    countdownElement.textContent = calculateTimeRemaining(prayerTime);
                });
            });
        });
    }

    function formatTimeUnit(unit) {
        return unit < 10 ? "0" + unit : unit;
    }

    function translateDayOfWeek(dayOfWeek) {
        const translations = {
            "Sunday": "Minggu",
            "Monday": "Senin",
            "Tuesday": "Selasa",
            "Wednesday": "Rabu",
            "Thursday": "Kamis",
            "Friday": "Jumat",
            "Saturday": "Sabtu"
        };
        return translations[dayOfWeek] || dayOfWeek;
    }

    function calculateTimeRemaining(targetTime) {
        const currentTime = new Date();
        const difference = targetTime - currentTime;

        if (difference <= 0) {
            return "Sudah Adzan!";
        }

        const seconds = Math.floor(difference / 1000) % 60;
        const minutes = Math.floor(difference / (1000 * 60)) % 60;
        const hours = Math.floor(difference / (1000 * 60 * 60));

        return `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)}`;
    }

    fetchData();
    const refreshInterval = 1000;
    setInterval(fetchData, refreshInterval);

    timezoneSelect.addEventListener("change", fetchData);
});
