package com.example.aljadwal.data.model

import kotlinx.serialization.Serializable

@Serializable
data class EquranListResponse(
    val code: Int,
    val message: String,
    val data: List<EquranSurah>
)

@Serializable
data class EquranSurah(
    val nomor: Int,
    val nama: String,
    val namaLatin: String,
    val jumlahAyat: Int,
    val tempatTurun: String,
    val arti: String,
    val deskripsi: String
)

@Serializable
data class EquranDetailResponse(
    val code: Int,
    val message: String,
    val data: EquranSurahDetail
)

@Serializable
data class EquranSurahDetail(
    val nomor: Int,
    val nama: String,
    val namaLatin: String,
    val jumlahAyat: Int,
    val tempatTurun: String,
    val arti: String,
    val deskripsi: String,
    val ayat: List<EquranAyat>
)

@Serializable
data class EquranAyat(
    val nomorAyat: Int,
    val teksArab: String,
    val teksLatin: String,
    val teksIndonesia: String
)
