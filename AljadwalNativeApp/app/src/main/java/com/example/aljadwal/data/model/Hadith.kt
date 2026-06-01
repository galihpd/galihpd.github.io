package com.example.aljadwal.data.model

import kotlinx.serialization.Serializable

@Serializable
data class HadithBooksResponse(
    val code: Int,
    val message: String,
    val data: List<HadithBook>
)

@Serializable
data class HadithBook(
    val name: String,
    val id: String,
    val available: Int
)

@Serializable
data class HadithRangeResponse(
    val code: Int,
    val message: String,
    val data: HadithRangeData
)

@Serializable
data class HadithRangeData(
    val name: String,
    val id: String,
    val available: Int,
    val requested: Int,
    val hadiths: List<HadithItem>
)

@Serializable
data class HadithItem(
    val number: Int,
    val arab: String,
    val id: String
)
