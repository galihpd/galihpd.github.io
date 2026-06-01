package com.example.aljadwal.data

import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

data class LastRead(
    val surahNumber: Int = 0,
    val surahName: String = "",
    val ayahNumber: Int = 0,
    val totalAyahs: Int = 0,
    val mushafPage: Int? = null,
    val isMushafMode: Boolean = false,
    val timestamp: Long = 0L
)

class HistoryRepository {
    private val db = FirebaseFirestore.getInstance()
    
    suspend fun saveLastReadText(userId: String, lastRead: LastRead) {
        try {
            db.collection("users").document(userId)
                .collection("history").document("lastReadText")
                .set(lastRead)
                .await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun saveLastReadMushaf(userId: String, lastRead: LastRead) {
        try {
            db.collection("users").document(userId)
                .collection("history").document("lastReadMushaf")
                .set(lastRead)
                .await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    
    suspend fun getLastReadText(userId: String): LastRead? {
        return try {
            val snapshot = db.collection("users").document(userId)
                .collection("history").document("lastReadText")
                .get()
                .await()
            snapshot.toObject(LastRead::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun getLastReadMushaf(userId: String): LastRead? {
        return try {
            val snapshot = db.collection("users").document(userId)
                .collection("history").document("lastReadMushaf")
                .get()
                .await()
            snapshot.toObject(LastRead::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
