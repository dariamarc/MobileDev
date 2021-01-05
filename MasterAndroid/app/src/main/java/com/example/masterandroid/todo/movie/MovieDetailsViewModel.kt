package com.example.masterandroid.todo.movie

import android.app.Application
import android.util.Log
import androidx.lifecycle.*
import com.example.masterandroid.core.TAG
import com.example.masterandroid.todo.data.Movie
import com.example.masterandroid.todo.data.MovieRepository
import com.example.masterandroid.todo.data.local.MovieDatabase
import kotlinx.coroutines.launch

class MovieDetailsViewModel(application: Application) : AndroidViewModel(application){
    private val mutableMovie = MutableLiveData<Movie>().apply { value =
        Movie("", "", "", "")
    }
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    val movieRepository: MovieRepository

    init {
        val movieDao = MovieDatabase.getDatabase(application, viewModelScope).movieDao()
        movieRepository = MovieRepository(movieDao)
    }

    fun getMovieById(movieId: String): LiveData<Movie> {
        return movieRepository.getById(movieId)
    }
}