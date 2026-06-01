package com.example.aljadwal.data.api

import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

object RetrofitClient {
    private const val BASE_URL = "https://api.myquran.com/"
    private const val HADITH_BASE_URL = "https://api.hadith.gading.dev/"

    private val json = Json { ignoreUnknownKeys = true }

    val myQuranApi: MyQuranApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(MyQuranApi::class.java)
    }

    val hadithApi: HadithApi by lazy {
        Retrofit.Builder()
            .baseUrl(HADITH_BASE_URL)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(HadithApi::class.java)
    }
}
