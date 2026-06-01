package com.example.aljadwal.ui.hadith

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aljadwal.data.api.RetrofitClient
import com.example.aljadwal.data.model.HadithBook
import com.example.aljadwal.data.model.HadithItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class HadithUiState {
    object Loading : HadithUiState()
    data class Success(
        val books: List<HadithBook>,
        val selectedBookId: String,
        val hadiths: List<HadithItem>,
        val page: Int,
        val isLoadingMore: Boolean
    ) : HadithUiState()
    data class Error(val message: String) : HadithUiState()
}

class HadithViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<HadithUiState>(HadithUiState.Loading)
    val uiState: StateFlow<HadithUiState> = _uiState

    init {
        loadBooks()
    }

    private fun loadBooks() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.hadithApi.getBooks()
                if (response.data.isNotEmpty()) {
                    val defaultBook = response.data[0].id
                    loadHadithsForBook(response.data, defaultBook, 1)
                } else {
                    _uiState.value = HadithUiState.Error("Tidak ada data kitab")
                }
            } catch (e: Exception) {
                _uiState.value = HadithUiState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun selectBook(bookId: String) {
        val currentState = _uiState.value as? HadithUiState.Success ?: return
        if (currentState.selectedBookId == bookId) return
        
        _uiState.value = HadithUiState.Loading
        viewModelScope.launch {
            try {
                loadHadithsForBook(currentState.books, bookId, 1)
            } catch (e: Exception) {
                _uiState.value = HadithUiState.Error(e.message ?: "Terjadi kesalahan")
            }
        }
    }

    private suspend fun loadHadithsForBook(books: List<HadithBook>, bookId: String, page: Int) {
        val start = (page - 1) * 50 + 1
        val end = page * 50
        val range = "$start-$end"
        
        val response = RetrofitClient.hadithApi.getHadithsRange(bookId, range)
        _uiState.value = HadithUiState.Success(
            books = books,
            selectedBookId = bookId,
            hadiths = response.data.hadiths,
            page = page,
            isLoadingMore = false
        )
    }

    fun loadMore() {
        val currentState = _uiState.value as? HadithUiState.Success ?: return
        if (currentState.isLoadingMore) return
        
        val nextPage = currentState.page + 1
        val start = (nextPage - 1) * 50 + 1
        val end = nextPage * 50
        val range = "$start-$end"

        _uiState.value = currentState.copy(isLoadingMore = true)
        
        viewModelScope.launch {
            try {
                val response = RetrofitClient.hadithApi.getHadithsRange(currentState.selectedBookId, range)
                _uiState.value = currentState.copy(
                    hadiths = currentState.hadiths + response.data.hadiths,
                    page = nextPage,
                    isLoadingMore = false
                )
            } catch (e: Exception) {
                _uiState.value = currentState.copy(isLoadingMore = false)
            }
        }
    }
}
