import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MovieProps } from './MovieProps';
import { getAllMovies, newWebSocket} from './movieApi';
import {AuthContext} from "../auth";
import {Plugins} from "@capacitor/core";

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
                const index = movies.findIndex(it => it._id === movie._id);
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

let tok = '';
(async () => {
    const res = localStorage.getItem('user');
    if(res){
        tok = res;

    }
})();

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
    let {token} = useContext(AuthContext);
    if(token === ''){
        token = tok;
    }
    const [state, dispatch] = useReducer(reducer, initialState);
    const { movies, fetching, fetchingError } = state;
    useEffect(getMoviesEffect, [token]);
    useEffect(wsEffect, [token]);

    async function getMoviesCallback() {
        try {
            log('fetchMovies started');
            dispatch({type: FETCH_MOVIES_STARTED});
            const fetchedMovies = await (getAllMovies(token));
            log('fetch movies succeded');
            dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {movie: fetchedMovies}});
        } catch (error) {
            log('fetchMovies failed');
            dispatch({type: FETCH_MOVIES_FAILED, payload: {error}});
        }
    }

    const getMovies = useCallback<FetchMovieFn>(getMoviesCallback, [token]);
    const value = { movies, fetching, fetchingError, getMovies};
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
                const movies = await getAllMovies(token);
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
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const { type, payload: item } = message;
                log(`ws message, item ${type}`);
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
