package com.example.aljadwal.ui.qibla

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.viewmodel.compose.viewModel
import java.util.Locale

@Composable
fun QiblaScreen(viewModel: QiblaViewModel = viewModel()) {
    val azimuth by viewModel.azimuth.collectAsState()
    val qiblaBearing by viewModel.qiblaBearing.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current
    val context = LocalContext.current

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            viewModel.fetchLocation(context)
        }
    }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.startSensors()
                if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    viewModel.fetchLocation(context)
                } else {
                    permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                }
            } else if (event == Lifecycle.Event.ON_PAUSE) {
                viewModel.stopSensors()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            viewModel.stopSensors()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF061817))
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.verticalScroll(androidx.compose.foundation.rememberScrollState())
        ) {
            Text("Arah Kiblat \uD83D\uDD4B", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Berputarlah hingga ikon Ka'bah sejajar dengan panah atas.", color = Color.Gray, textAlign = TextAlign.Center)
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Icon(
                imageVector = Icons.Default.KeyboardArrowUp,
                contentDescription = "Depan",
                tint = Color(0xFF2DD4BF),
                modifier = Modifier.size(48.dp)
            )

            Card(
                modifier = Modifier.size(300.dp),
                shape = RoundedCornerShape(150.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
                border = androidx.compose.foundation.BorderStroke(2.dp, Color(0xFF1B403B))
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize().rotate(-azimuth)) {
                    Text("U", color = Color.Red, fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.TopCenter).padding(16.dp))
                    Text("S", color = Color.White, fontSize = 24.sp, modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp))
                    Text("T", color = Color.White, fontSize = 24.sp, modifier = Modifier.align(Alignment.CenterEnd).padding(16.dp))
                    Text("B", color = Color.White, fontSize = 24.sp, modifier = Modifier.align(Alignment.CenterStart).padding(16.dp))
                    
                    Box(modifier = Modifier.fillMaxSize().rotate(qiblaBearing)) {
                        Text(
                            "🕋",
                            fontSize = 64.sp,
                            modifier = Modifier.align(Alignment.TopCenter).padding(top = 40.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(48.dp))
            val bearingFormat = String.format(Locale.getDefault(), "%.1f°", qiblaBearing)
            val locationStr by viewModel.userLocationStr.collectAsState()
            Text("Derajat Kiblat: $bearingFormat", color = Color(0xFF2DD4BF), fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("(Terkalibrasi)", color = Color.LightGray, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(locationStr, color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
