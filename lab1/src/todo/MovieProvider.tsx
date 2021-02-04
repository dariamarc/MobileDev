import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MovieProps } from './MovieProps';
import { getAllMovies, newWebSocket} from './movieApi';

const log = getLogger('MovieProvider');

type FetchMovieFn = (movie: MovieProps) => Promise<any>;

export interface MoviesState {
    movies?: MovieProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    fetchMovie?: FetchMovieFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: MoviesState = {
    fetching: false,
};

const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';
const FETCH_MOVIE_STARTED = 'FETCH_MOVIE_STARTED';
const FETCH_MOVIE_SUCCEEDED = 'FETCH_MOVIE_SUCCEEDED';
const FETCH_MOVIE_FAILED = 'FETCH_MOVIE_FAILED';

const reducer: (state: MoviesState, action: ActionProps) => MoviesState =
    (state, { type, payload }) => {
        console.log(type);
        switch (type) {
            case FETCH_MOVIES_STARTED:
                console.log("Fetch movies started");
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_MOVIES_SUCCEEDED:
                return { ...state, movies: payload.movies, fetching: false };
            case FETCH_MOVIES_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case FETCH_MOVIE_STARTED:
                return { ...state, fetchingError: null, fetching: true };
            case FETCH_MOVIE_SUCCEEDED:
                const movies = [...(state.movies || [])];
                const movie = payload.movie;
                console.log(movie);
                const index = movies.findIndex(it => it.id === movie.id);
                if (index === -1) {
                    movies.splice(0, 0, movie);
                } else {
                    movies[index] = movie;
                }
                return { ...state, movies, fetching: false };
            case FETCH_MOVIE_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            default:
                return state;
        }
    };

export const MovieContext = React.createContext<MoviesState>(initialState);

interface MovieProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { movies, fetching, fetchingError } = state;
    useEffect(getMoviesEffect, []);
    useEffect(wsEffect, []);

    // async function getMoviesCallback() {
    //     try {
    //         log('fetchMovies started');
    //         dispatch({type: FETCH_MOVIES_STARTED});
    //         const fetchedMovies = await (getAllMovies());
    //         log('fetch movies succeded');
    //         dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {movie: fetchedMovies}});
    //     } catch (error) {
    //         log('fetchMovies failed');
    //         dispatch({type: FETCH_MOVIES_FAILED, payload: {error}});
    //     }
    // }

    // const getMovies = useCallback<FetchMovieFn>(getMoviesCallback, []);
    const value = { movies, fetching, fetchingError};
    log('returns');
    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );

    function getMoviesEffect() {
        let canceled = false;
        fetchMovies();
        return () => {
            canceled = true;
        }

        async function fetchMovies() {
            try {
                log('fetchMovies started');
                dispatch({ type: FETCH_MOVIES_STARTED });
                const movies = await getAllMovies();
                log('fetchMovies succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_MOVIES_SUCCEEDED, payload: { movies: movies } });
                }
            } catch (error) {
                log('fetchMovies failed');
                dispatch({ type: FETCH_MOVIES_FAILED, payload: { error } });
            }
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { movies }} = message;
            log(`ws message, movie ${event}`);
            if (event === 'movie added') {
                dispatch({ type: FETCH_MOVIES_SUCCEEDED, payload: { movies } });
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
