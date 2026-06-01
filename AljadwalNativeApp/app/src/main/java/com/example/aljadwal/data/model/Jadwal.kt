package com.example.aljadwal.data.model

import kotlinx.serialization.Serializable

@Serializable
data class JadwalHarianResponse(
    val status: Boolean,
    val data: JadwalData
)

@Serializable
data class JadwalData(
    val id: Int,
    val lokasi: String,
    val daerah: String,
    val jadwal: JadwalDetail
)

@Serializable
data class JadwalDetail(
    val tanggal: String,
    val imsak: String,
    val subuh: String,
    val terbit: String,
    val dhuha: String,
    val dzuhur: String,
    val ashar: String,
    val maghrib: String,
    val isya: String,
    val date: String
)

@Serializable
data class JadwalBulananResponse(
    val status: Boolean,
    val data: JadwalBulananData
)

@Serializable
data class JadwalBulananData(
    val id: Int,
    val lokasi: String,
    val daerah: String,
    val jadwal: List<JadwalDetail>
)
