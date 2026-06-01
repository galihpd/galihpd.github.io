package com.example.aljadwal.data.api

import com.example.aljadwal.data.model.JadwalBulananResponse
import com.example.aljadwal.data.model.JadwalHarianResponse
import retrofit2.http.GET
import retrofit2.http.Path

interface MyQuranApi {
    @GET("v2/sholat/jadwal/{id_kota}/{tahun}/{bulan}/{tanggal}")
    suspend fun getJadwalHarian(
        @Path("id_kota") idKota: String,
        @Path("tahun") tahun: String,
        @Path("bulan") bulan: String,
        @Path("tanggal") tanggal: String
    ): JadwalHarianResponse

    @GET("v2/sholat/jadwal/{id_kota}/{tahun}/{bulan}")
    suspend fun getJadwalBulanan(
        @Path("id_kota") idKota: String,
        @Path("tahun") tahun: String,
        @Path("bulan") bulan: String
    ): JadwalBulananResponse

    @GET("v2/sholat/kota/semua")
    suspend fun getSemuaKota(): com.example.aljadwal.data.model.KotaResponse

    @GET("https://equran.id/api/v2/surat")
    suspend fun getListSurah(): com.example.aljadwal.data.model.EquranListResponse

    @GET("https://equran.id/api/v2/surat/{surah}")
    suspend fun getDetailSurah(
        @Path("surah") surah: Int
    ): com.example.aljadwal.data.model.EquranDetailResponse
}
