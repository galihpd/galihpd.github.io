package com.example.aljadwal.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.automirrored.filled.LibraryBooks
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.example.aljadwal.ui.home.HomeScreen
import com.example.aljadwal.ui.qibla.QiblaScreen
import com.example.aljadwal.ui.quran.QuranScreen
import com.example.aljadwal.ui.hadith.HadithScreen

@Composable
fun MainScreen() {
    var selectedItem by remember { mutableIntStateOf(0) }
    val items = listOf("Beranda", "Al-Quran", "Hadist", "Kiblat")
    val icons = listOf(
        Icons.Default.Home, 
        Icons.Default.List, 
        Icons.AutoMirrored.Filled.LibraryBooks, 
        Icons.Default.LocationOn
    )

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF02080A)) {
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(icons[index], contentDescription = item) },
                        label = { Text(item) },
                        selected = selectedItem == index,
                        onClick = { selectedItem = index },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF2DD4BF),
                            unselectedIconColor = Color.Gray,
                            selectedTextColor = Color(0xFF2DD4BF),
                            unselectedTextColor = Color.Gray,
                            indicatorColor = Color.White.copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        Modifier.padding(paddingValues)
        when (selectedItem) {
            0 -> HomeScreen(
                onNavigateToQibla = { selectedItem = 3 },
                onNavigateToQuran = { selectedItem = 1 }
            )
            1 -> QuranScreen()
            2 -> HadithScreen()
            3 -> QiblaScreen()
        }
    }
}
