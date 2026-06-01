package com.example.aljadwal.data.api

import com.example.aljadwal.data.model.HadithBooksResponse
import com.example.aljadwal.data.model.HadithRangeResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface HadithApi {
    @GET("books")
    suspend fun getBooks(): HadithBooksResponse

    @GET("books/{name}")
    suspend fun getHadithsRange(
        @Path("name") name: String,
        @Query("range") range: String // e.g. "1-50"
    ): HadithRangeResponse
}
