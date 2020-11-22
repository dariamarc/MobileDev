package com.example.masterandroid.todo.data.remote

import com.example.masterandroid.todo.data.Movie
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path

object movieApi {

    private const val URL = "http://192.168.56.1:3000/"

    interface Service {
        @GET("/movies")
        suspend fun find(): List<Movie>

        @GET("/movies/{id}")
        suspend fun read(@Path("id") movieId: String): Movie

    }

    private val client: OkHttpClient = OkHttpClient.Builder().build()

    private var gson = GsonBuilder()
        .setLenient()
        .create()

    private val retrofit = Retrofit.Builder()
        .baseUrl(URL)
        .addConverterFactory(GsonConverterFactory.create(gson))
        .client(client)
        .build()

    val service: Service = retrofit.create(
        Service::class.java) // withContext cu dispatcher IO
}