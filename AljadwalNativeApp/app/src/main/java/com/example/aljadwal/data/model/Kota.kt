package com.example.aljadwal.data.model

import kotlinx.serialization.Serializable

@Serializable
data class KotaResponse(
    val status: Boolean,
    val data: List<KotaData>
)

@Serializable
data class KotaData(
    val id: String,
    val lokasi: String
)
