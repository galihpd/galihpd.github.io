package com.example.aljadwal.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.example.aljadwal.R

val PlusJakartaSans = FontFamily(
    Font(R.font.plusjakartasans_regular, FontWeight.Normal),
    Font(R.font.plusjakartasans_medium, FontWeight.Medium),
    Font(R.font.plusjakartasans_semibold, FontWeight.SemiBold),
    Font(R.font.plusjakartasans_bold, FontWeight.Bold)
)

private val defaultTypography = Typography()
val Typography = Typography(
    displayLarge = defaultTypography.displayLarge.copy(fontFamily = PlusJakartaSans),
    displayMedium = defaultTypography.displayMedium.copy(fontFamily = PlusJakartaSans),
    displaySmall = defaultTypography.displaySmall.copy(fontFamily = PlusJakartaSans),
    headlineLarge = defaultTypography.headlineLarge.copy(fontFamily = PlusJakartaSans),
    headlineMedium = defaultTypography.headlineMedium.copy(fontFamily = PlusJakartaSans),
    headlineSmall = defaultTypography.headlineSmall.copy(fontFamily = PlusJakartaSans),
    titleLarge = defaultTypography.titleLarge.copy(fontFamily = PlusJakartaSans),
    titleMedium = defaultTypography.titleMedium.copy(fontFamily = PlusJakartaSans),
    titleSmall = defaultTypography.titleSmall.copy(fontFamily = PlusJakartaSans),
    bodyLarge = defaultTypography.bodyLarge.copy(fontFamily = PlusJakartaSans),
    bodyMedium = defaultTypography.bodyMedium.copy(fontFamily = PlusJakartaSans),
    bodySmall = defaultTypography.bodySmall.copy(fontFamily = PlusJakartaSans),
    labelLarge = defaultTypography.labelLarge.copy(fontFamily = PlusJakartaSans),
    labelMedium = defaultTypography.labelMedium.copy(fontFamily = PlusJakartaSans),
    labelSmall = defaultTypography.labelSmall.copy(fontFamily = PlusJakartaSans)
)
