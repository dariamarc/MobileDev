package com.example.masterandroid.todo.movie

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.masterandroid.core.TAG
import com.example.masterandroid.todo.data.Movie
import com.example.masterandroid.todo.data.MovieRepository
import kotlinx.coroutines.launch

class MovieDetailsViewModel : ViewModel(){
    private val mutableMovie = MutableLiveData<Movie>().apply { value =
        Movie("", "", "", "")
    }
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val movie: LiveData<Movie> = mutableMovie
    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    fun loadMovie(movieId: String) {
        viewModelScope.launch {
            Log.i(TAG, "loadMovie...")
            mutableFetching.value = true
            mutableException.value = null
            try {
                mutableMovie.value = MovieRepository.load(movieId)
                Log.i(TAG, "loadMovie succeeded")
                mutableFetching.value = false
            } catch (e: Exception) {
                Log.w(TAG, "loadMovie failed", e)
                mutableException.value = e
                mutableFetching.value = false
            }
        }
    }
}