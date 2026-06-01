package com.example.aljadwal.ui.quran

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import com.example.aljadwal.data.LastRead
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.aljadwal.data.model.EquranSurah
import com.example.aljadwal.data.model.EquranSurahDetail
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import com.example.aljadwal.R

val amiriFontFamily = FontFamily(
    Font(R.font.amiri_regular)
)

@Composable
fun QuranScreen(viewModel: QuranViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    var isMushafMode by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    var mushafInitialPage by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(1) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF061817))
            .systemBarsPadding()
    ) {
        if (isMushafMode) {
            MushafScreen(
                initialPage = mushafInitialPage,
                lastRead = uiState.lastReadMushaf,
                onBackClick = { isMushafMode = false },
                onSaveHistory = { page -> viewModel.saveMushafHistory(page) }
            )
        } else if (uiState.selectedSurah != null) {
            SurahDetailScreen(
                surahDetail = uiState.selectedSurah!!,
                lastRead = uiState.lastReadText,
                onBackClick = { viewModel.clearSelectedSurah() },
                onSaveHistory = { surahNum, surahName, ayahNum, totalAyahs ->
                    viewModel.saveHistory(surahNum, surahName, ayahNum, totalAyahs)
                }
            )
        } else {
            SurahListScreen(
                uiState = uiState,
                onSurahClick = { surahNumber ->
                    viewModel.fetchDetailSurah(surahNumber)
                },
                onResumeClick = { surahNumber ->
                    viewModel.fetchDetailSurah(surahNumber)
                },
                onResumeMushafClick = { page ->
                    mushafInitialPage = page
                    isMushafMode = true
                },
                onToggleMushafMode = {
                    mushafInitialPage = 1
                    isMushafMode = true
                }
            )
        }

        if (uiState.isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center),
                color = Color(0xFF2DD4BF)
            )
        }
    }
}

@Composable
fun SurahListScreen(
    uiState: QuranState, 
    onSurahClick: (Int) -> Unit,
    onResumeClick: (Int) -> Unit = {},
    onResumeMushafClick: (Int) -> Unit = {},
    onToggleMushafMode: () -> Unit = {}
) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(modifier = Modifier.fillMaxWidth().padding(top = 24.dp, bottom = 16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Baca Al-Quran \uD83D\uDCD6", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
            Button(
                onClick = onToggleMushafMode,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFDE68A)),
                shape = RoundedCornerShape(12.dp),
                contentPadding = PaddingValues(12.dp),
                modifier = Modifier.size(48.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.MenuBook, contentDescription = "Mode Mushaf", tint = Color(0xFF061817), modifier = Modifier.size(24.dp))
            }
        }
        val latestReadText = uiState.lastReadText
        val latestReadMushaf = uiState.lastReadMushaf
        
        val latestRead = listOfNotNull(latestReadText, latestReadMushaf).maxByOrNull { it.timestamp }
        
        if (uiState.user != null && latestRead != null) {
            val isMushaf = latestRead.isMushafMode
            Card(
                modifier = Modifier.fillMaxWidth().clickable { 
                    if (isMushaf) onResumeMushafClick(latestRead.mushafPage ?: 1)
                    else onResumeClick(latestRead.surahNumber)
                }.padding(bottom = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2DD4BF).copy(alpha = 0.1f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2DD4BF))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Lanjutkan Bacaan", color = Color(0xFF2DD4BF), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    if (isMushaf) {
                        Text("Mushaf Halaman ${latestRead.mushafPage} (Surah ${latestRead.surahName})", color = Color.White, fontSize = 16.sp)
                    } else {
                        Text("Surah ${latestRead.surahName}, Ayat ${latestRead.ayahNumber}", color = Color.White, fontSize = 16.sp)
                    }
                }
            }
        }
        
        if (uiState.errorMessage != null && !uiState.isLoading) {
            Text(uiState.errorMessage, color = Color.Red, modifier = Modifier.padding(16.dp))
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(uiState.listSurah) { surah ->
                SurahItemCard(surah, onClick = { onSurahClick(surah.nomor) })
            }
        }
    }
}

@Composable
fun SurahItemCard(surah: EquranSurah, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier.size(40.dp).background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(50)),
                contentAlignment = Alignment.Center
            ) {
                Text(surah.nomor.toString(), color = Color.White, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(surah.namaLatin, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("${surah.tempatTurun} • ${surah.jumlahAyat} Ayat", color = Color.Gray, fontSize = 12.sp)
            }
            Text(surah.nama, color = Color(0xFF2DD4BF), fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun SurahDetailScreen(
    surahDetail: EquranSurahDetail, 
    lastRead: LastRead?,
    onBackClick: () -> Unit,
    onSaveHistory: (Int, String, Int, Int) -> Unit = {_,_,_,_ ->}
) {

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp).padding(top = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(surahDetail.namaLatin, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("${surahDetail.tempatTurun} • ${surahDetail.jumlahAyat} Ayat", color = Color.Gray, fontSize = 12.sp)
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(surahDetail.ayat) { ayat ->
                val isHighlighted = lastRead?.surahNumber == surahDetail.nomor && lastRead?.ayahNumber == ayat.nomorAyat
                Card(
                    modifier = Modifier.fillMaxWidth().combinedClickable(
                        onClick = {},
                        onLongClick = { onSaveHistory(surahDetail.nomor, surahDetail.namaLatin, ayat.nomorAyat, surahDetail.jumlahAyat) }
                    ),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isHighlighted) Color(0xFF2DD4BF).copy(alpha = 0.15f) else Color.White.copy(alpha = 0.05f)
                    ),
                    shape = RoundedCornerShape(16.dp),
                    border = if (isHighlighted) androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF2DD4BF)) else null
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Box(
                                modifier = Modifier.size(32.dp).background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(50)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(ayat.nomorAyat.toString(), color = Color.White, fontSize = 12.sp)
                            }
                            Text(
                                text = ayat.teksArab,
                                color = Color.White,
                                fontSize = 32.sp,
                                fontFamily = amiriFontFamily,
                                textAlign = TextAlign.End,
                                lineHeight = 48.sp,
                                modifier = Modifier.weight(1f).padding(start = 16.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(text = ayat.teksLatin, color = Color(0xFF2DD4BF), fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = ayat.teksIndonesia, color = Color.LightGray, fontSize = 14.sp)
                    }
                }
            }
        }
    }
}

@OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
fun MushafScreen(
    initialPage: Int,
    lastRead: LastRead?,
    onBackClick: () -> Unit,
    onSaveHistory: (Int) -> Unit
) {
    val pagerState = androidx.compose.foundation.pager.rememberPagerState(
        initialPage = if (initialPage in 1..604) 604 - initialPage else 603,
        pageCount = { 604 }
    )
    val context = androidx.compose.ui.platform.LocalContext.current
    var isIndexExpanded by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    val coroutineScope = androidx.compose.runtime.rememberCoroutineScope()
    
    Column(modifier = Modifier.fillMaxSize().padding(bottom = 80.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp).padding(top = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            val actualPageStr = (604 - pagerState.currentPage).toString()
            Text("Halaman $actualPageStr", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            
            Spacer(modifier = Modifier.weight(1f))
            Box {
                Button(
                    onClick = { isIndexExpanded = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2DD4BF).copy(alpha = 0.2f))
                ) {
                    Text("Daftar Isi", color = Color(0xFF2DD4BF))
                }
                DropdownMenu(
                    expanded = isIndexExpanded,
                    onDismissRequest = { isIndexExpanded = false },
                    modifier = Modifier.background(Color(0xFF0F2926)).heightIn(max = 400.dp)
                ) {
                    com.example.aljadwal.data.model.MushafIndex.surahList.forEach { surah ->
                        DropdownMenuItem(
                            text = { Text("${surah.number}. ${surah.name} (Hal ${surah.startPage})", color = Color.White) },
                            onClick = {
                                isIndexExpanded = false
                                val targetIndex = 604 - surah.startPage
                                coroutineScope.launch {
                                    pagerState.scrollToPage(targetIndex)
                                }
                            }
                        )
                    }
                }
            }
        }

        val pageInfoText = com.example.aljadwal.data.model.PageInfo.pageMapping[604 - pagerState.currentPage] ?: ""
        Row(modifier = Modifier.fillMaxWidth().background(Color(0xFF0F2926)).padding(vertical = 8.dp), horizontalArrangement = Arrangement.Center) {
            Text(pageInfoText, color = Color(0xFF2DD4BF), fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        
        var isZoomed by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }

        androidx.compose.foundation.pager.HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize().background(Color(0xFFFFF5E1)),
            userScrollEnabled = !isZoomed
        ) { pageIndex ->
            val actualPage = 604 - pageIndex
            val isHighlighted = lastRead?.isMushafMode == true && lastRead.mushafPage == actualPage
            
            var scale by androidx.compose.runtime.remember { androidx.compose.runtime.mutableFloatStateOf(1f) }
            var offset by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(androidx.compose.ui.geometry.Offset.Zero) }

            androidx.compose.runtime.LaunchedEffect(scale) {
                isZoomed = scale > 1f
            }
            androidx.compose.runtime.LaunchedEffect(pagerState.currentPage) {
                scale = 1f
                offset = androidx.compose.ui.geometry.Offset.Zero
            }
            
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(Unit) {
                        val scopeSize = this.size
                        detectTransformGestures { _, pan, zoom, _ ->
                            scale = (scale * zoom).coerceIn(1f, 3f)
                            val maxPanX = (scopeSize.width * (scale - 1)) / 2
                            val maxPanY = (scopeSize.height * (scale - 1)) / 2
                            val newOffsetX = offset.x + pan.x * scale
                            val newOffsetY = offset.y + pan.y * scale
                            offset = androidx.compose.ui.geometry.Offset(
                                newOffsetX.coerceIn(-maxPanX, maxPanX),
                                newOffsetY.coerceIn(-maxPanY, maxPanY)
                            )
                        }
                    }
                    .pointerInput(Unit) {
                        val scopeSize = this.size
                        detectTapGestures(
                            onDoubleTap = { tapOffset ->
                                if (scale > 1f) {
                                    scale = 1f
                                    offset = androidx.compose.ui.geometry.Offset.Zero
                                } else {
                                    val width = scopeSize.width
                                    if (tapOffset.x > width * 0.7f) {
                                        coroutineScope.launch {
                                            if (pagerState.currentPage < 603) {
                                                pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                            }
                                        }
                                    } else if (tapOffset.x < width * 0.3f) {
                                        coroutineScope.launch {
                                            if (pagerState.currentPage > 0) {
                                                pagerState.animateScrollToPage(pagerState.currentPage - 1)
                                            }
                                        }
                                    }
                                }
                            },
                            onLongPress = {
                                onSaveHistory(actualPage)
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                val formattedPage = String.format(java.util.Locale.US, "%03d", actualPage)
                val imageUrl = "https://android.quran.com/data/width_1260/page$formattedPage.png"
                coil.compose.AsyncImage(
                    model = imageUrl,
                    contentDescription = "Halaman $actualPage",
                    modifier = Modifier
                        .fillMaxSize()
                        .graphicsLayer(
                            scaleX = scale,
                            scaleY = scale,
                            translationX = offset.x,
                            translationY = offset.y
                        ),
                    contentScale = androidx.compose.ui.layout.ContentScale.Fit
                )
                
                if (isHighlighted) {
                    Icon(
                        Icons.Default.Bookmark, 
                        contentDescription = "Bookmark", 
                        tint = Color(0xFFD9534F), 
                        modifier = Modifier.align(Alignment.TopEnd).padding(32.dp).size(64.dp)
                    )
                }
            }
        }
    }
}
