package com.example.masterandroid.todo.data

import android.util.Log
import com.example.masterandroid.core.TAG
import com.example.masterandroid.todo.data.remote.movieApi

object MovieRepository {

    private var cachedMovies: MutableList<Movie>? = null;

    suspend fun getAll(): List<Movie> {
        Log.i(TAG, "getAll")
        if (cachedMovies != null) {
            return cachedMovies as List<Movie>;
        }
        cachedMovies = mutableListOf()
        val movies = movieApi.service.find()
        cachedMovies?.addAll(movies)
        return cachedMovies as List<Movie>
    }

    suspend fun load(movieId: String): Movie {
        Log.i(TAG, "load")
        val movie = cachedMovies?.find { it.id == movieId }
        if (movie != null) {
            return movie
        }
        return movieApi.service.read(movieId)
    }
}