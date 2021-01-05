package com.example.masterandroid.todo.data

import android.util.Log
import androidx.lifecycle.LiveData
import com.example.masterandroid.core.TAG
import com.example.masterandroid.todo.data.local.MovieDao
import com.example.masterandroid.todo.data.remote.movieApi
import com.example.masterandroid.core.Result

class MovieRepository(private val movieDao: MovieDao){

    val movies = movieDao.getAll()

    suspend fun refresh(): Result<Boolean> {
        try {
            val items = movieApi.service.find()
            for (item in items) {
                movieDao.insert(item)
            }
            return Result.Success(true)
        } catch(e: Exception) {
            return Result.Error(e)
        }
    }

    fun getById(itemId: String): LiveData<Movie> {
        return movieDao.getById(itemId)
    }


}