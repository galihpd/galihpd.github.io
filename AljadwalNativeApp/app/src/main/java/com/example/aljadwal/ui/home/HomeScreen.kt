package com.example.aljadwal.ui.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.aljadwal.R
import com.example.aljadwal.data.model.JadwalDetail
import com.example.aljadwal.data.model.KotaData
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.time.LocalDate
import java.time.chrono.HijrahDate
import java.time.temporal.ChronoField
import java.util.*
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException
import com.example.aljadwal.data.AuthRepository
import com.google.firebase.auth.FirebaseUser

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = viewModel(),
    onNavigateToQibla: () -> Unit = {},
    onNavigateToQuran: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()

    var currentTime by remember { mutableStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            currentTime = System.currentTimeMillis()
        }
    }

    val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    val dateFormat = SimpleDateFormat("EEEE, dd MMMM yyyy", Locale("id", "ID"))
    val dateString = dateFormat.format(Date(currentTime))
    val timeString = timeFormat.format(Date(currentTime))
    
    var showCityDialog by remember { mutableStateOf(false) }
    var showMonthlyDialog by remember { mutableStateOf(false) }
    var showNotificationSettings by remember { mutableStateOf(false) }
    var showProfileDialog by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = com.google.android.gms.auth.api.signin.GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                account?.idToken?.let { idToken ->
                    coroutineScope.launch {
                        val user = AuthRepository.signInWithGoogle(idToken)
                        viewModel.updateUser(user)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    val context = LocalContext.current
    val permissionLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.RequestPermission()
    ) {}

    LaunchedEffect(Unit) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            if (androidx.core.content.ContextCompat.checkSelfPermission(context, android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                permissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF061817))
            .systemBarsPadding()
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 100.dp)
        ) {
            item {
                HeaderSection(
                    time = timeString,
                    date = dateString,
                    cityName = uiState.cityName,
                    onCityClick = { showCityDialog = true },
                    onNotificationClick = { showNotificationSettings = true },
                    user = uiState.user,
                    onLoginClick = {
                        val client = AuthRepository.getGoogleSignInClient(context)
                        launcher.launch(client.signInIntent)
                    },
                    onProfileClick = { showProfileDialog = true }
                )
            }

            if (uiState.isLoading && uiState.jadwalHariIni == null) {
                item {
                    CircularProgressIndicator(
                        modifier = Modifier.fillMaxWidth().wrapContentWidth(Alignment.CenterHorizontally),
                        color = Color(0xFF2DD4BF)
                    )
                }
            } else if (uiState.jadwalHariIni != null) {
                item {
                    NextPrayerCard(uiState.jadwalHariIni!!, currentTime)
                }

                item {
                    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        Text("Jadwal Hari Ini", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        PrayerTimesRow(uiState.jadwalHariIni!!, currentTime)
                    }
                }

                item {
                    QuickActionsSection(
                        onNavigateToQibla = onNavigateToQibla,
                        onNavigateToQuran = onNavigateToQuran,
                        onOpenHijriCalendar = { showMonthlyDialog = true }
                    )
                }

                item {
                    HijriCalendarCard(
                        onOpenCalendar = { showMonthlyDialog = true }
                    )
                }
            }
        }

        if (showCityDialog) {
            CitySelectionDialog(
                kotaList = uiState.kotaList,
                onDismiss = { showCityDialog = false },
                onCitySelected = { 
                    viewModel.updateCity(it)
                    showCityDialog = false 
                }
            )
        }

        if (showMonthlyDialog) {
            MonthlyScheduleDialog(
                jadwalBulanan = uiState.jadwalBulanan,
                cityName = uiState.cityName,
                onDismiss = { showMonthlyDialog = false }
            )
        }

        if (showNotificationSettings) {
            NotificationSettingsDialog(
                toggles = uiState.notifToggles,
                soundEnabled = uiState.notifSound,
                vibrateEnabled = uiState.notifVibrate,
                onDismiss = { showNotificationSettings = false },
                onToggle = { prayer, isEnabled -> viewModel.toggleNotification(prayer, isEnabled) },
                onToggleSound = { isEnabled -> viewModel.toggleSound(isEnabled) },
                onToggleVibrate = { isEnabled -> viewModel.toggleVibrate(isEnabled) }
            )
        }

        if (showProfileDialog && uiState.user != null) {
            ProfileDialog(
                user = uiState.user!!,
                lastReadText = uiState.lastReadText,
                lastReadMushaf = uiState.lastReadMushaf,
                onDismiss = { showProfileDialog = false },
                onLogoutClick = {
                    AuthRepository.signOut(context)
                    viewModel.updateUser(null)
                    showProfileDialog = false
                }
            )
        }
    }
}

@Composable
fun HeaderSection(
    time: String,
    date: String,
    cityName: String,
    onCityClick: () -> Unit,
    onNotificationClick: () -> Unit,
    user: FirebaseUser? = null,
    onLoginClick: () -> Unit = {},
    onProfileClick: () -> Unit = {}
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text("Assalamu'alaikum \uD83D\uDC4B", color = Color.LightGray, fontSize = 16.sp)
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (user == null) {
                    IconButton(onClick = onLoginClick, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.AccountCircle, contentDescription = "Login", tint = Color.LightGray, modifier = Modifier.size(32.dp))
                    }
                } else {
                    IconButton(onClick = onProfileClick, modifier = Modifier.size(32.dp)) {
                        if (user.photoUrl != null) {
                            AsyncImage(
                                model = user.photoUrl,
                                contentDescription = "Profile",
                                modifier = Modifier.fillMaxSize().clip(CircleShape),
                                contentScale = ContentScale.Crop
                            )
                        } else {
                            Icon(Icons.Default.Person, contentDescription = "Profile", tint = Color(0xFF2DD4BF), modifier = Modifier.size(32.dp))
                        }
                    }
                }
                Spacer(modifier = Modifier.width(16.dp))
                Icon(Icons.Default.Notifications, contentDescription = "Notifikasi", tint = Color.LightGray, modifier = Modifier.padding(end = 12.dp).clickable(onClick = onNotificationClick))
                Icon(Icons.Default.Settings, contentDescription = "Pengaturan", tint = Color.LightGray)
            }
        }
        Text(time, color = Color.White, fontSize = 56.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(top = 8.dp))
        Text(date, color = Color.LightGray, fontSize = 14.sp, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(16.dp))
        Row(
            modifier = Modifier
                .clickable(onClick = onCityClick)
                .clip(RoundedCornerShape(50))
                .padding(vertical = 8.dp, horizontal = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.LocationOn, contentDescription = "Location", tint = Color(0xFF2DD4BF), modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text(cityName.lowercase().capitalize(Locale.getDefault()), color = Color(0xFF2DD4BF), fontSize = 14.sp, fontWeight = FontWeight.Medium)
            Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Dropdown", tint = Color(0xFF2DD4BF), modifier = Modifier.size(18.dp))
        }
    }
}

@Composable
fun ProfileDialog(
    user: FirebaseUser,
    lastReadText: com.example.aljadwal.data.LastRead?,
    lastReadMushaf: com.example.aljadwal.data.LastRead?,
    onDismiss: () -> Unit,
    onLogoutClick: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF132A29)),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (user.photoUrl != null) {
                    AsyncImage(
                        model = user.photoUrl,
                        contentDescription = "Profile Picture",
                        modifier = Modifier.size(80.dp).clip(CircleShape),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(modifier = Modifier.size(80.dp).background(Color.Gray, CircleShape), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = Color.White, modifier = Modifier.size(40.dp))
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(user.displayName ?: "User", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(user.email ?: "", color = Color.Gray, fontSize = 14.sp)
                
                Spacer(modifier = Modifier.height(24.dp))
                
                val joinDate = user.metadata?.creationTimestamp?.let { 
                    SimpleDateFormat("dd MMM yyyy", Locale.getDefault()).format(Date(it)) 
                } ?: "Tidak diketahui"
                
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text("Terdaftar Sejak", color = Color.Gray, fontSize = 12.sp)
                    Text(joinDate, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text("Pencapaian Bacaan (Progress)", color = Color.Gray, fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    if (lastReadMushaf != null) {
                        val page = lastReadMushaf.mushafPage ?: 1
                        Text("Mode Mushaf: Halaman $page dari 604", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(4.dp))
                        LinearProgressIndicator(progress = { page / 604f }, modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)), color = Color(0xFF2DD4BF), trackColor = Color.White.copy(alpha = 0.1f))
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                    
                    if (lastReadText != null) {
                        Text("Mode Teks (Surah ${lastReadText.surahName}): Ayat ${lastReadText.ayahNumber} dari ${lastReadText.totalAyahs}", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(4.dp))
                        val prog = if (lastReadText.totalAyahs > 0) lastReadText.ayahNumber.toFloat() / lastReadText.totalAyahs.toFloat() else 0f
                        LinearProgressIndicator(progress = { prog }, modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)), color = Color(0xFF2DD4BF), trackColor = Color.White.copy(alpha = 0.1f))
                    }
                    
                    if (lastReadMushaf == null && lastReadText == null) {
                        Text("Belum ada riwayat", color = Color.White, fontSize = 14.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
                
                Button(
                    onClick = onLogoutClick,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red.copy(alpha = 0.2f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Keluar (Logout)", color = Color.Red, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

fun getNextPrayer(jadwal: JadwalDetail, currentTime: Long): Pair<String, String> {
    val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
    val currentStr = timeFormat.format(Date(currentTime))
    
    val prayers = listOf(
        "Imsak" to jadwal.imsak,
        "Subuh" to jadwal.subuh,
        "Dzuhur" to jadwal.dzuhur,
        "Ashar" to jadwal.ashar,
        "Maghrib" to jadwal.maghrib,
        "Isya" to jadwal.isya
    )
    
    for (prayer in prayers) {
        if (currentStr < prayer.second) {
            return prayer
        }
    }
    return "Imsak" to jadwal.imsak
}

fun getNextPrayerCountdown(targetTimeStr: String, currentTime: Long): String {
    val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
    val currentStr = timeFormat.format(Date(currentTime))
    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    val dateStr = sdf.format(Date(currentTime))
    
    val fullSdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
    try {
        var targetDate = fullSdf.parse("$dateStr $targetTimeStr")
        if (currentStr > targetTimeStr) {
            val cal = Calendar.getInstance()
            cal.time = targetDate!!
            cal.add(Calendar.DAY_OF_MONTH, 1)
            targetDate = cal.time
        }
        val diffMs = targetDate!!.time - currentTime
        if (diffMs < 0) return "00j 00m lagi"
        val hours = (diffMs / (1000 * 60 * 60)) % 24
        val mins = (diffMs / (1000 * 60)) % 60
        return String.format(Locale.getDefault(), "%02dj %02dm lagi", hours, mins)
    } catch (e: Exception) {
        return ""
    }
}

fun getPuasaLabel(dateStr: String): Pair<String, Color> {
    try {
        val date = LocalDate.parse(dateStr)
        val hijriDate = HijrahDate.from(date)
        val hD = hijriDate.get(ChronoField.DAY_OF_MONTH)
        val hM = hijriDate.get(ChronoField.MONTH_OF_YEAR)
        val dayOfWeek = date.dayOfWeek.value
        
        var label = "-"
        var color = Color.LightGray

        if ((hM == 12 && (hD == 10 || hD == 11 || hD == 12 || hD == 13)) || (hM == 10 && hD == 1)) {
            label = "Haram Puasa"
            color = Color(0xFFEF4444)
        } else if (hM == 9) {
            label = "Ramadhan"
            color = Color(0xFF22C55E)
        } else if (hM == 12 && hD == 9) {
            label = "Arafah"
            color = Color(0xFF14B8A6)
        } else if (hM == 1 && hD == 9) {
            label = "Tasu'a"
            color = Color(0xFF3B82F6)
        } else if (hM == 1 && hD == 10) {
            label = "Asyura"
            color = Color(0xFF3B82F6)
        } else if (hD == 13 || hD == 14 || hD == 15) {
            label = "Ayyamul Bidh"
            color = Color(0xFFD946EF)
        } else if (dayOfWeek == 1) {
            label = "Senin"
            color = Color(0xFF8B5CF6)
        } else if (dayOfWeek == 4) {
            label = "Kamis"
            color = Color(0xFF8B5CF6)
        }
        
        if (dayOfWeek == 5 && hM != 9 && label != "-" && label != "Haram Puasa") {
            label = "-"
            color = Color.LightGray
        }
        
        return Pair(label, color)
    } catch (e: Exception) {
        return Pair("-", Color.LightGray)
    }
}

fun getHijriDateString(dateStr: String): String {
    try {
        val date = LocalDate.parse(dateStr)
        val hijriDate = HijrahDate.from(date)
        val hD = hijriDate.get(ChronoField.DAY_OF_MONTH)
        val hM = hijriDate.get(ChronoField.MONTH_OF_YEAR)
        val hY = hijriDate.get(ChronoField.YEAR)
        
        val monthNames = listOf("Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah")
        val monthName = if (hM in 1..12) monthNames[hM - 1] else hM.toString()
        
        return "$hD $monthName $hY H"
    } catch (e: Exception) {
        return ""
    }
}

@Composable
fun NextPrayerCard(jadwal: JadwalDetail, currentTime: Long) {
    val nextPrayer = getNextPrayer(jadwal, currentTime)
    val nextPrayerName = nextPrayer.first
    val nextPrayerTime = nextPrayer.second
    val countdown = getNextPrayerCountdown(nextPrayerTime, currentTime)

    Card(
        modifier = Modifier.fillMaxWidth().height(180.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF132A29)),
        shape = RoundedCornerShape(24.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Column(modifier = Modifier.padding(24.dp).align(Alignment.TopStart)) {
                Text("Waktu Sholat Berikutnya", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                Spacer(modifier = Modifier.height(8.dp))
                Text(nextPrayerName, color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                Text(nextPrayerTime, color = Color(0xFF2DD4BF), fontSize = 36.sp, fontWeight = FontWeight.Black)
                Spacer(modifier = Modifier.weight(1f))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Schedule, contentDescription = "Time", tint = Color.Gray, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(countdown, color = Color.Gray, fontSize = 12.sp)
                }
            }
            
            // Mosque image with arch clip
            Image(
                painter = painterResource(id = R.drawable.mosque_sunset),
                contentDescription = "Mosque Sunset",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 24.dp, bottom = 0.dp)
                    .width(100.dp)
                    .height(130.dp)
                    .clip(RoundedCornerShape(topStart = 100.dp, topEnd = 100.dp, bottomStart = 8.dp, bottomEnd = 8.dp))
            )
        }
    }
}

@Composable
fun PrayerTimesRow(jadwal: JadwalDetail, currentTime: Long) {
    val nextPrayerName = getNextPrayer(jadwal, currentTime).first
    val prayers = listOf(
        PrayerInfo("Subuh", jadwal.subuh, "🌆", nextPrayerName == "Subuh"),
        PrayerInfo("Dzuhur", jadwal.dzuhur, "☀️", nextPrayerName == "Dzuhur"),
        PrayerInfo("Ashar", jadwal.ashar, "⛅", nextPrayerName == "Ashar"),
        PrayerInfo("Maghrib", jadwal.maghrib, "🌇", nextPrayerName == "Maghrib"),
        PrayerInfo("Isya", jadwal.isya, "🌙", nextPrayerName == "Isya")
    )

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        prayers.forEach { prayer ->
            PrayerTimeSmallCard(prayer)
        }
    }
}

data class PrayerInfo(val name: String, val time: String, val icon: String, val isNext: Boolean = false)

@Composable
fun PrayerTimeSmallCard(prayer: PrayerInfo) {
    val bgColor = if (prayer.isNext) Color.White.copy(alpha = 0.1f) else Color.White.copy(alpha = 0.03f)
    
    Card(
        colors = CardDefaults.cardColors(containerColor = bgColor),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.width(65.dp).height(105.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxSize().padding(vertical = 12.dp)
        ) {
            Text(prayer.icon, fontSize = 24.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(prayer.name, color = Color.LightGray, fontSize = 10.sp, fontWeight = FontWeight.Medium)
            Text(prayer.time, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            if (prayer.isNext) {
                Spacer(modifier = Modifier.weight(1f))
                Box(
                    modifier = Modifier
                        .background(Color(0xFF2DD4BF).copy(alpha = 0.2f), RoundedCornerShape(50))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text("Berikutnya", color = Color(0xFF2DD4BF), fontSize = 8.sp, fontWeight = FontWeight.Bold)
                }
            } else if (prayer.name == "Subuh") {
                Spacer(modifier = Modifier.weight(1f))
                Box(modifier = Modifier.height(2.dp).width(20.dp).background(Color(0xFF2DD4BF)))
            }
        }
    }
}

@Composable
fun QuickActionsSection(
    onNavigateToQibla: () -> Unit = {},
    onNavigateToQuran: () -> Unit = {},
    onOpenHijriCalendar: () -> Unit = {}
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.03f)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Aksi Cepat", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                QuickActionItem(Icons.Default.MenuBook, "Al-Quran", Modifier.weight(1f), onClick = onNavigateToQuran)
                Box(modifier = Modifier.height(40.dp).width(1.dp).background(Color.White.copy(alpha = 0.1f)))
                QuickActionItem(Icons.Default.Explore, "Kiblat", Modifier.weight(1f), onClick = onNavigateToQibla)
                Box(modifier = Modifier.height(40.dp).width(1.dp).background(Color.White.copy(alpha = 0.1f)))
                QuickActionItem(Icons.Default.CalendarToday, "Hijriah", Modifier.weight(1f), onClick = onOpenHijriCalendar)
            }
        }
    }
}

@Composable
fun QuickActionItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = modifier.clickable { onClick() }) {
        Icon(icon, contentDescription = label, tint = Color(0xFF2DD4BF), modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.height(8.dp))
        Text(label, color = Color.LightGray, fontSize = 12.sp)
    }
}

@Composable
fun HijriCalendarCard(onOpenCalendar: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onOpenCalendar),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.03f)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.CalendarToday, contentDescription = "Calendar", tint = Color(0xFF2DD4BF), modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("24 Dzulqa'dah 1447 H", color = Color.White, fontSize = 14.sp)
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Lihat Kalender", color = Color.Gray, fontSize = 12.sp)
                Icon(Icons.Default.ChevronRight, contentDescription = "Arrow", tint = Color.Gray, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CitySelectionDialog(
    kotaList: List<KotaData>,
    onDismiss: () -> Unit,
    onCitySelected: (KotaData) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val filteredList = kotaList.filter { it.lokasi.contains(searchQuery, ignoreCase = true) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF132A29)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp).heightIn(max = 500.dp)) {
            Text("Pilih Kota", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Cari kota...", color = Color.Gray) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF2DD4BF),
                    unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )
            Spacer(modifier = Modifier.height(16.dp))
            LazyColumn {
                items(filteredList) { kota ->
                    Text(
                        text = kota.lokasi,
                        color = Color.White,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onCitySelected(kota) }
                            .padding(vertical = 12.dp)
                    )
                    Divider(color = Color.White.copy(alpha = 0.1f))
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MonthlyScheduleDialog(jadwalBulanan: List<JadwalDetail>, cityName: String, onDismiss: () -> Unit) {
    val listState = androidx.compose.foundation.lazy.rememberLazyListState()
    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    val today = sdf.format(Date())

    LaunchedEffect(jadwalBulanan) {
        val index = jadwalBulanan.indexOfFirst { it.date == today }
        if (index != -1) {
            listState.scrollToItem(index)
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF132A29)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp).heightIn(max = 600.dp)) {
            Text("Jadwal Bulanan", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(cityName, color = Color.Gray, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(16.dp))
            
            LazyColumn(state = listState, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(jadwalBulanan) { jadwal ->
                    val isToday = jadwal.date == today
                    val dateParts = jadwal.tanggal.split(", ")
                    val dayName = if (dateParts.size > 1) dateParts[0] else ""
                    val dateStr = if (dateParts.size > 1) dateParts.subList(1, dateParts.size).joinToString(", ") else jadwal.tanggal
                    val dateNum = dateStr.split(" ")[0]
                    val dayShort = if(dayName.isNotEmpty()) dayName.take(3) else ""

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = if (isToday) Color(0xFF0D2421) else Color(0xFF0B1917)),
                        shape = RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(
                            if (isToday) 2.dp else 1.dp, 
                            if (isToday) Color(0xFF2DD4BF) else Color(0xFF1B403B)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp).fillMaxWidth()
                        ) {
                            Row(modifier = Modifier.fillMaxWidth()) {
                                // Left Number Badge
                                Box(
                                    modifier = Modifier
                                        .padding(top = 4.dp, end = 16.dp)
                                        .size(40.dp)
                                        .background(Color(0xFF2DD4BF).copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = jadwal.date.substringAfterLast("-"),
                                        color = Color(0xFF2DD4BF),
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                }
                                
                                // Right Content: Dates and Puasa Box
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Column {
                                        Text("$dayName, $dateStr", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(getHijriDateString(jadwal.date), color = Color(0xFF2DD4BF), fontSize = 12.sp)
                                    }
                                    
                                    val puasaInfo = getPuasaLabel(jadwal.date)
                                    if (puasaInfo.first != "-") {
                                        Box(
                                            modifier = Modifier
                                                .background(puasaInfo.second.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 4.dp)
                                        ) {
                                            Text(puasaInfo.first, color = puasaInfo.second, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            // Bottom Row: Times (Full Width)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                MonthlyTimeColumn("Imsak", jadwal.imsak)
                                MonthlyTimeColumn("Subuh", jadwal.subuh)
                                MonthlyTimeColumn("Dzuhur", jadwal.dzuhur)
                                MonthlyTimeColumn("Ashar", jadwal.ashar)
                                MonthlyTimeColumn("Maghrib", jadwal.maghrib, isHighlight = true)
                                MonthlyTimeColumn("Isya", jadwal.isya)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MonthlyTimeColumn(label: String, time: String, isHighlight: Boolean = false) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = Color.LightGray, fontSize = 10.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Text(time, color = if (isHighlight) Color(0xFF2DD4BF) else Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationSettingsDialog(
    toggles: Map<String, Boolean>,
    soundEnabled: Boolean,
    vibrateEnabled: Boolean,
    onDismiss: () -> Unit,
    onToggle: (String, Boolean) -> Unit,
    onToggleSound: (Boolean) -> Unit,
    onToggleVibrate: (Boolean) -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF132A29)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            Text("Pengaturan Notifikasi Sholat", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Bunyikan Suara", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                Switch(checked = soundEnabled, onCheckedChange = onToggleSound, colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Color(0xFF2DD4BF), uncheckedThumbColor = Color.Gray, uncheckedTrackColor = Color.DarkGray))
            }
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Getar", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                Switch(checked = vibrateEnabled, onCheckedChange = onToggleVibrate, colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Color(0xFF2DD4BF), uncheckedThumbColor = Color.Gray, uncheckedTrackColor = Color.DarkGray))
            }
            
            Divider(modifier = Modifier.padding(vertical = 12.dp), color = Color.White.copy(alpha = 0.1f))
            
            val prayers = listOf("Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya")
            prayers.forEach { prayer ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(prayer, color = Color.White, fontSize = 16.sp)
                    Switch(
                        checked = toggles[prayer] == true,
                        onCheckedChange = { isChecked -> onToggle(prayer, isChecked) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = Color(0xFF2DD4BF),
                            uncheckedThumbColor = Color.Gray,
                            uncheckedTrackColor = Color.DarkGray
                        )
                    )
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
