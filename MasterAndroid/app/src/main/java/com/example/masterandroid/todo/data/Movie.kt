package com.example.masterandroid.todo.data

data class Movie(
    val id: String,
    val name: String,
    val director: String,
    val year: String
) {
    override fun toString(): String = name
}