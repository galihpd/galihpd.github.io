package com.example.aljadwal.ui.quran

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aljadwal.data.api.RetrofitClient
import com.example.aljadwal.data.model.EquranSurah
import com.example.aljadwal.data.model.EquranSurahDetail
import com.example.aljadwal.data.AuthRepository
import com.example.aljadwal.data.HistoryRepository
import com.example.aljadwal.data.LastRead
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class QuranState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val listSurah: List<EquranSurah> = emptyList(),
    val selectedSurah: EquranSurahDetail? = null,
    val user: FirebaseUser? = null,
    val lastReadText: LastRead? = null,
    val lastReadMushaf: LastRead? = null
)

class QuranViewModel : ViewModel() {

    private val historyRepo = HistoryRepository()

    private val _uiState = MutableStateFlow(QuranState(user = AuthRepository.getCurrentUser()))
    val uiState: StateFlow<QuranState> = _uiState.asStateFlow()

    init {
        fetchListSurah()
    }

    fun fetchListSurah() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                val response = RetrofitClient.myQuranApi.getListSurah()
                if (response.code == 200) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        listSurah = response.data
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Gagal mengambil daftar surah"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.localizedMessage ?: "Terjadi kesalahan jaringan"
                )
            }
        }
    }

    fun fetchDetailSurah(surahNumber: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null, selectedSurah = null)
            try {
                val response = RetrofitClient.myQuranApi.getDetailSurah(surahNumber)
                if (response.code == 200) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        selectedSurah = response.data
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Gagal mengambil detail surah"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.localizedMessage ?: "Terjadi kesalahan jaringan"
                )
            }
        }
    }

    fun clearSelectedSurah() {
        _uiState.value = _uiState.value.copy(selectedSurah = null)
    }

    fun updateUser(user: FirebaseUser?) {
        _uiState.value = _uiState.value.copy(user = user)
        if (user != null) {
            loadHistory()
        } else {
            _uiState.value = _uiState.value.copy(lastReadText = null, lastReadMushaf = null)
        }
    }

    fun loadHistory() {
        val user = _uiState.value.user ?: return
        viewModelScope.launch {
            val textHistory = historyRepo.getLastReadText(user.uid)
            val mushafHistory = historyRepo.getLastReadMushaf(user.uid)
            _uiState.value = _uiState.value.copy(lastReadText = textHistory, lastReadMushaf = mushafHistory)
        }
    }

    fun saveHistory(surahNumber: Int, surahName: String, ayahNumber: Int, totalAyahs: Int) {
        val user = _uiState.value.user ?: return
        val lastRead = LastRead(
            surahNumber = surahNumber,
            surahName = surahName,
            ayahNumber = ayahNumber,
            totalAyahs = totalAyahs,
            mushafPage = null,
            isMushafMode = false,
            timestamp = System.currentTimeMillis()
        )
        _uiState.value = _uiState.value.copy(lastReadText = lastRead)
        viewModelScope.launch {
            historyRepo.saveLastReadText(user.uid, lastRead)
        }
    }

    fun saveMushafHistory(page: Int) {
        val user = _uiState.value.user ?: return
        val surah = com.example.aljadwal.data.model.MushafIndex.surahList.lastOrNull { it.startPage <= page }
        val lastRead = LastRead(
            surahNumber = surah?.number ?: 0,
            surahName = surah?.name ?: "Mushaf",
            ayahNumber = 0,
            totalAyahs = 0,
            mushafPage = page,
            isMushafMode = true,
            timestamp = System.currentTimeMillis()
        )
        _uiState.value = _uiState.value.copy(lastReadMushaf = lastRead)
        viewModelScope.launch {
            historyRepo.saveLastReadMushaf(user.uid, lastRead)
        }
    }
}
