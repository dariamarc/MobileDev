package com.example.masterandroid.todo.movies

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.masterandroid.core.TAG
import com.example.masterandroid.todo.data.Movie
import com.example.masterandroid.todo.data.MovieRepository
import kotlinx.coroutines.launch
import java.lang.Exception

class MovieListViewModel : ViewModel() {

    private val mutableMovies = MutableLiveData<List<Movie>>().apply { value = emptyList() }
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val movies: LiveData<List<Movie>> = mutableMovies
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    private fun createMovie(position: Int): Unit{
        val list = mutableListOf<Movie>()
        list.addAll(mutableMovies.value!!)
        list.add(
            Movie(
                position.toString(),
                "Name " + position,
                "Director " + position,
                "1994"
            )
        )
        mutableMovies.value = list
    }

    fun loadMovies(){
        viewModelScope.launch {
            Log.v(TAG, "loadMovies")
            mutableLoading.value = true
            mutableException.value = null
            try {
                mutableMovies.value = MovieRepository.getAll()
                Log.d(TAG, "loadMovies succeeded")
                mutableLoading.value = false
            }
            catch (e: Exception){
                Log.w(TAG, "loadMovies failed", e);
                mutableException.value = e
                mutableLoading.value = false
            }
        }
    }

}