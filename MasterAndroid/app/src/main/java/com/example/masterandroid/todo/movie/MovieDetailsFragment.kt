package com.example.masterandroid.todo.movie

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.observe
import androidx.navigation.fragment.findNavController
import com.example.masterandroid.R
import com.example.masterandroid.core.TAG
import kotlinx.android.synthetic.main.fragment_movie_details.*

/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class MovieDetailsFragment : Fragment() {
    companion object{
        const val MOVIE_ID = "MOVIE_ID"
    }

    private lateinit var viewModel: MovieDetailsViewModel
    private var movieId: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.v(TAG, "onCreate")
        arguments?.let {
            if(it.containsKey(MOVIE_ID)){
                movieId = it.getString(MOVIE_ID).toString()
            }
        }
    }

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_movie_details, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

//        view.findViewById<Button>(R.id.button_back).setOnClickListener {
//            findNavController().navigate(R.id.action_MovieDetailsFragment_to_MovieListFragment)
//        }
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        Log.v(TAG, "onActivityCreated")
        setupViewModel()
        button_back.setOnClickListener {
            Log.v(TAG, "go to list")
            findNavController().navigateUp()
        }
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(MovieDetailsViewModel::class.java)
        viewModel.movie.observe(viewLifecycleOwner) { movie ->
            Log.v(TAG, "update movies")
            textview_name.text = movie.name
            textview_director.text = movie.director
            textview_year.text = movie.year
        }
        viewModel.fetching.observe(viewLifecycleOwner) { fetching ->
            Log.v(TAG, "update fetching")
            progress.visibility = if (fetching) View.VISIBLE else View.GONE
        }
        viewModel.fetchingError.observe(viewLifecycleOwner
        ) { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        }
        viewModel.completed.observe(viewLifecycleOwner, Observer { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigateUp()
            }
        })
        val id = movieId
        if (id != null) {
            viewModel.loadMovie(id)
        }
    }
}