package com.example.masterandroid.todo.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "movies")
data class Movie(
    @PrimaryKey @ColumnInfo(name = "_id") val id: String,
    @ColumnInfo(name = "name") val name: String,
    @ColumnInfo(name = "director") val director: String,
    @ColumnInfo(name = "year") val year: String
) {
    override fun toString(): String = name
}