package com.example.aljadwal.ui.home

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.aljadwal.data.api.RetrofitClient
import com.example.aljadwal.data.model.JadwalDetail
import com.example.aljadwal.data.model.KotaData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import com.example.aljadwal.data.AuthRepository
import com.example.aljadwal.data.HistoryRepository
import com.example.aljadwal.data.LastRead
import com.google.firebase.auth.FirebaseUser

data class HomeState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val jadwalHariIni: JadwalDetail? = null,
    val jadwalBulanan: List<JadwalDetail> = emptyList(),
    val cityId: String = "1301", // Default Jakarta
    val cityName: String = "KOTA JAKARTA",
    val kotaList: List<KotaData> = emptyList(),
    val notifToggles: Map<String, Boolean> = mapOf(
        "Subuh" to true, "Dzuhur" to true, "Ashar" to true, "Maghrib" to true, "Isya" to true
    ),
    val notifSound: Boolean = true,
    val notifVibrate: Boolean = true,
    val user: FirebaseUser? = null,
    val lastReadText: LastRead? = null,
    val lastReadMushaf: LastRead? = null
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = application.getSharedPreferences("aljadwal_prefs", Context.MODE_PRIVATE)
    private val historyRepo = HistoryRepository()

    private val _uiState = MutableStateFlow(HomeState())
    val uiState: StateFlow<HomeState> = _uiState.asStateFlow()

    init {
        val savedCityId = prefs.getString("city_id", "1301") ?: "1301"
        val savedCityName = prefs.getString("city_name", "KOTA JAKARTA") ?: "KOTA JAKARTA"
        
        val savedNotifToggles = mapOf(
            "Subuh" to prefs.getBoolean("notif_Subuh", true),
            "Dzuhur" to prefs.getBoolean("notif_Dzuhur", true),
            "Ashar" to prefs.getBoolean("notif_Ashar", true),
            "Maghrib" to prefs.getBoolean("notif_Maghrib", true),
            "Isya" to prefs.getBoolean("notif_Isya", true)
        )
        
        val savedSound = prefs.getBoolean("notif_sound", true)
        val savedVibrate = prefs.getBoolean("notif_vibrate", true)

        _uiState.value = _uiState.value.copy(
            cityId = savedCityId, 
            cityName = savedCityName, 
            notifToggles = savedNotifToggles,
            notifSound = savedSound,
            notifVibrate = savedVibrate
        )
        
        updateUser(AuthRepository.getCurrentUser())
        
        fetchJadwalHariIni(savedCityId)
        fetchJadwalBulanan(savedCityId)
        fetchSemuaKota()
    }

    fun updateUser(user: FirebaseUser?) {
        _uiState.value = _uiState.value.copy(user = user)
        if (user != null) {
            viewModelScope.launch {
                val textHistory = historyRepo.getLastReadText(user.uid)
                val mushafHistory = historyRepo.getLastReadMushaf(user.uid)
                _uiState.value = _uiState.value.copy(lastReadText = textHistory, lastReadMushaf = mushafHistory)
            }
        } else {
            _uiState.value = _uiState.value.copy(lastReadText = null, lastReadMushaf = null)
        }
    }

    fun toggleNotification(prayerName: String, isEnabled: Boolean) {
        prefs.edit().putBoolean("notif_$prayerName", isEnabled).apply()
        val newToggles = _uiState.value.notifToggles.toMutableMap()
        newToggles[prayerName] = isEnabled
        _uiState.value = _uiState.value.copy(notifToggles = newToggles)
        
        // Reschedule alarms with new settings
        _uiState.value.jadwalHariIni?.let { schedulePrayerAlarms(getApplication<Application>(), it, newToggles) }
    }

    fun toggleSound(isEnabled: Boolean) {
        prefs.edit().putBoolean("notif_sound", isEnabled).apply()
        _uiState.value = _uiState.value.copy(notifSound = isEnabled)
        _uiState.value.jadwalHariIni?.let { schedulePrayerAlarms(getApplication<Application>(), it) }
    }

    fun toggleVibrate(isEnabled: Boolean) {
        prefs.edit().putBoolean("notif_vibrate", isEnabled).apply()
        _uiState.value = _uiState.value.copy(notifVibrate = isEnabled)
        _uiState.value.jadwalHariIni?.let { schedulePrayerAlarms(getApplication<Application>(), it) }
    }

    fun updateCity(kota: KotaData) {
        prefs.edit().putString("city_id", kota.id).putString("city_name", kota.lokasi).apply()
        _uiState.value = _uiState.value.copy(cityId = kota.id, cityName = kota.lokasi)
        fetchJadwalHariIni(kota.id)
        fetchJadwalBulanan(kota.id)
    }

    private fun fetchSemuaKota() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.myQuranApi.getSemuaKota()
                if (response.status) {
                    _uiState.value = _uiState.value.copy(kotaList = response.data)
                }
            } catch (e: Exception) {
                // Ignore errors for city list fetching
            }
        }
    }

    fun fetchJadwalHariIni(cityId: String = _uiState.value.cityId) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            try {
                // Get current date
                val dateFormat = SimpleDateFormat("yyyy/MM/dd", Locale.getDefault())
                val currentDate = dateFormat.format(Date())
                val parts = currentDate.split("/")
                val tahun = parts[0]
                val bulan = parts[1]
                val tanggal = parts[2]

                val response = RetrofitClient.myQuranApi.getJadwalHarian(cityId, tahun, bulan, tanggal)
                if (response.status) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        jadwalHariIni = response.data.jadwal,
                        cityName = response.data.lokasi
                    )
                    schedulePrayerAlarms(getApplication<Application>(), response.data.jadwal)
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Gagal mengambil data jadwal"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.localizedMessage ?: "Terjadi kesalahan jaringan"
                )
            }
        }
    }

    fun fetchJadwalBulanan(cityId: String = _uiState.value.cityId) {
        viewModelScope.launch {
            try {
                val dateFormat = SimpleDateFormat("yyyy/MM", Locale.getDefault())
                val currentDate = dateFormat.format(Date())
                val parts = currentDate.split("/")
                val tahun = parts[0]
                val bulan = parts[1]

                val response = RetrofitClient.myQuranApi.getJadwalBulanan(cityId, tahun, bulan)
                if (response.status) {
                    _uiState.value = _uiState.value.copy(jadwalBulanan = response.data.jadwal)
                }
            } catch (e: Exception) {
                // Ignore error for monthly schedule fetching for now
            }
        }
    }

    private fun schedulePrayerAlarms(context: Context, jadwal: JadwalDetail, toggles: Map<String, Boolean>? = null) {
        val activeToggles = toggles ?: _uiState.value.notifToggles
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
        
        val prayers = listOf(
            "Subuh" to jadwal.subuh,
            "Dzuhur" to jadwal.dzuhur,
            "Ashar" to jadwal.ashar,
            "Maghrib" to jadwal.maghrib,
            "Isya" to jadwal.isya
        )

        val now = System.currentTimeMillis()

        for (prayer in prayers) {
            try {
                val intent = android.content.Intent(context, com.example.aljadwal.receiver.PrayerNotificationReceiver::class.java).apply {
                    putExtra("PRAYER_NAME", prayer.first)
                }
                val pendingIntent = android.app.PendingIntent.getBroadcast(
                    context,
                    prayer.first.hashCode(),
                    intent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )

                if (activeToggles[prayer.first] == true) {
                    val dateStr = "${jadwal.date} ${prayer.second}"
                    val targetDate = sdf.parse(dateStr)
                    if (targetDate != null && targetDate.time > now) {
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                            if (alarmManager.canScheduleExactAlarms()) {
                                alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetDate.time, pendingIntent)
                            }
                        } else {
                            alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetDate.time, pendingIntent)
                        }
                    }
                } else {
                    // Cancel if disabled
                    alarmManager.cancel(pendingIntent)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
