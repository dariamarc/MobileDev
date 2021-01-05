package com.example.masterandroid.todo.movies

import android.app.Application
import android.util.Log
import androidx.lifecycle.*
import com.example.masterandroid.core.TAG
import com.example.masterandroid.todo.data.Movie
import com.example.masterandroid.core.Result
import com.example.masterandroid.todo.data.MovieRepository
import com.example.masterandroid.todo.data.local.MovieDatabase
import kotlinx.coroutines.launch
import java.lang.Exception

class MovieListViewModel(application: Application) : AndroidViewModel(application) {

    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val movies: LiveData<List<Movie>>
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    val movieRepository: MovieRepository

    init {
        val movieDao = MovieDatabase.getDatabase(application, viewModelScope).movieDao()
        movieRepository = MovieRepository(movieDao)
        movies = movieRepository.movies
    }

    fun refresh() {
        viewModelScope.launch {
            Log.v(TAG, "refresh...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = movieRepository.refresh()) {
                is Result.Success -> {
                    Log.d(TAG, "refresh succeeded");
                }
                is Result.Error -> {
                    Log.w(TAG, "refresh failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }



}