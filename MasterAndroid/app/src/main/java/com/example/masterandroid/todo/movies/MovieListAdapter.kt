package com.example.masterandroid.todo.movies

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.masterandroid.R
import com.example.masterandroid.core.TAG
import com.example.masterandroid.todo.data.Movie
import com.example.masterandroid.todo.movie.MovieDetailsFragment
import kotlinx.android.synthetic.main.view_movie.view.*

class MovieListAdapter(
    private val fragment: Fragment

) : RecyclerView.Adapter<MovieListAdapter.ViewHolder>() {

    var movies = emptyList<Movie>()
    set(value) {
        field = value
        notifyDataSetChanged()
    }

    private var onItemClick: View.OnClickListener
    init {
        onItemClick = View.OnClickListener { view ->
            val movie = view.tag as Movie
            fragment.findNavController().navigate(R.id.MovieDetailsFragment, Bundle().apply {
                putString(MovieDetailsFragment.MOVIE_ID, movie.id)
            }
            )
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_movie, parent, false)
        Log.v(TAG, "onCreateViewHolder")

        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")
        val movie = movies[position]
        holder.textView.text = movie.name
        holder.itemView.tag = movie
        holder.itemView.setOnClickListener(onItemClick)
    }

    override fun getItemCount(): Int = movies.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view){
        val textView: TextView = view.name
    }
}