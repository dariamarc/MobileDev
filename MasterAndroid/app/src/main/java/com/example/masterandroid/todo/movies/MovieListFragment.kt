package com.example.masterandroid.todo.movies

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.observe
import androidx.navigation.fragment.findNavController
import com.example.masterandroid.R
import com.example.masterandroid.auth.data.AuthRepository
import com.example.masterandroid.core.TAG
import kotlinx.android.synthetic.main.fragment_movie_list.*

/**
 * A simple [Fragment] subclass as the default destination in the navigation.
 */
class MovieListFragment : Fragment() {

    private lateinit var movieListAdapter: MovieListAdapter
    private lateinit var moviesModel: MovieListViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.i(TAG, "onCreate")
    }
    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_movie_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        Log.i(TAG, "onActivityCreated")
        if(!AuthRepository.isLoggedIn){
            findNavController().navigate(R.id.fragment_login);
            return;
        }
        setupMovieList()
    }

    private fun setupMovieList() {
        movieListAdapter =
            MovieListAdapter(this)
        movie_list.adapter = movieListAdapter
        moviesModel = ViewModelProvider(this).get(MovieListViewModel::class.java)
        moviesModel.movies.observe(viewLifecycleOwner) { value ->
            Log.i(TAG, "update movies")
            movieListAdapter.movies = value
        }
        moviesModel.loading.observe(viewLifecycleOwner) { loading ->
            Log.i(TAG, "update loading")
            progress.visibility = if (loading) View.VISIBLE else View.GONE
        }
        moviesModel.loadingError.observe(viewLifecycleOwner) { exception ->
            if(exception != null){
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()

            }
        }
        moviesModel.refresh()
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.i(TAG, "onDestroy")
    }
}