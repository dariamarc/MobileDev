import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {MovieProps} from './MovieProps';
import {
    createMovie,
    getAllMovies, getConf,
    newWebSocket,
    solveConflict,
    syncLocalData,
    updateMovie
} from './movieApi';
import {AuthContext} from "../auth";
import {useNetwork} from "../core/useNetworkState";
import {Plugins} from "@capacitor/core";

const log = getLogger('MovieProvider');
const {Storage} = Plugins

// type FetchMoviesFn = () => Promise<any>;
type SaveMovieFn = (movie: MovieProps) => Promise<any>;
type GetConflictFunction = (id: string, version: string) => Promise<any>;
type ResolveConflictFunction = (movie: MovieProps) => Promise<any>;

export let conflicts: string[] = [];

export interface MoviesState {
    movies?: MovieProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    // fetchNextMovies?: FetchMoviesFn,
    saveMovie?: SaveMovieFn,
    getConflict?: GetConflictFunction,
    resolveConflict?: ResolveConflictFunction
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: MoviesState = {
    fetching: false,
    saving: false
};


const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';
const SAVE_MOVIE_STARTED = 'SAVE_MOVIE_STARTED';
const SAVE_MOVIE_SUCCEEDED = 'SAVE_MOVIE_SUCCEEDED';
const SAVE_MOVIE_FAILED = 'SAVE_MOVIE_FAILED';
const UPDATED_MOVIE_ON_SERVER = 'UPDATED_MOVIE_ON_SERVER';


const reducer: (state: MoviesState, action: ActionProps) => MoviesState =
    (state, {type, payload}) => {
        console.log(type);
        switch (type) {
            case FETCH_MOVIES_STARTED:
                console.log("Fetch movies started");
                return {...state, fetching: true, fetchingError: null};
            case FETCH_MOVIES_SUCCEEDED:
                return {...state, movies: payload.movies, fetching: false};
            case FETCH_MOVIES_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_MOVIE_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_MOVIE_SUCCEEDED:
                const movies = [...(state.movies || [])];
                const movie = payload.movie;
                const index = movies.findIndex(it => it._id === movie._id);
                if (index === -1) {
                    movies.splice(0, 0, movie);
                } else {
                    movies[index] = movie;
                }
                return {...state, movies: movies, saving: false};
            case SAVE_MOVIE_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case UPDATED_MOVIE_ON_SERVER:
                const elems = [...(state.movies || [])];
                const elem = payload.movie;
                const ind = elems.findIndex(it => it._id === elem._id);
                elems[ind] = elem;
                return {...state, movies: elems};
            default:
                return state;
        }
    };

export const MovieContext = React.createContext<MoviesState>(initialState);

interface MovieProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const MovieProvider: React.FC<MovieProviderProps> = ({children}) => {
    let {token} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {movies, fetching, fetchingError, saving, savingError} = state;
    const {networkStatus} = useNetwork()
    useEffect(getMoviesEffect, [token]);
    useEffect(wsEffect, [token]);

    //const fetchNextMovies = useCallback<FetchMoviesFn>(getMoviesCallback, [token]);
    const saveMovie = useCallback<SaveMovieFn>(saveMovieCallback, [token]);
    const getConflict = useCallback<GetConflictFunction>(getConflictCallback, [token]);
    const resolveConflict = useCallback<ResolveConflictFunction>(resolveConflictCallback, [token]);

    const value = {movies, fetching, fetchingError, saving, savingError, saveMovie, getConflict, resolveConflict};
    log('returns');
    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );

    function getMoviesEffect() {
        let canceled = false;
        fetchMovies().catch(() => { getLocalData();});
        return () => {
            canceled = true;
        }

        async function fetchMovies() {
            if(!token?.trim()){
                return;
            }
            if (!networkStatus.connected) {
                await getLocalData();
            }
            else {
                try {
                    let isModified = await Storage.get({key: "isModified"});
                    if(isModified && isModified.value === "true")
                        await syncLocalModif();
                    log('fetchMovies started');
                    dispatch({type: FETCH_MOVIES_STARTED});
                    let conf = await Storage.get({key: "conflictingData"});
                    conflicts = JSON.parse(conf.value || "[]");
                    if(!conflicts || conflicts.length === 0){
                            const movies = await getAllMovies(token);
                            log('fetchMovies succeeded');
                            if (!canceled) {
                                dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {movies: movies}});
                            }
                    }
                    else await getLocalData();
                } catch (error) {
                    log('fetchMovies failed');
                    await getLocalData();
                }
            }
            //setPhotosToLocalStorage();
        }
    }

    async function getLocalData() {
        let localMovies = await Storage.keys()
            .then(function (localStorageData) {
                for (let i = 0; i < localStorageData.keys.length; i++)
                    if (localStorageData.keys[i].valueOf().includes('movies'))
                        return Storage.get({key: localStorageData.keys[i]});

            });
        dispatch({type: FETCH_MOVIES_SUCCEEDED, payload: {items: JSON.parse( localMovies?.value || '{}')}})
    }

    async function saveLocalData(movie: MovieProps){
        let localMovies = await Storage.keys()
            .then(function (localStorageData){
                for(let i = 0; i < localStorageData.keys.length; i++)
                    if(localStorageData.keys[i].valueOf().includes('movies'))
                        return Storage.get({key:localStorageData.keys[i]});
            });

        let movies = JSON.parse(localMovies?.value || "[]");
        if(movie._id){
            for(let i = 0; i < movies.length; i++)
                if(movies[i]._id === movie._id){
                    movies[i] = movie;
                    break;
                }
            await Storage.set({
                key: `movies`,
                value: JSON.stringify(movies)
            });
        }
        else{
            movie._id = '_' + Math.random().toString(36).substr(2, 9);
            movies?.push(movie);
            await Storage.set({
                key: `movies`,
                value: JSON.stringify(movies)
            });
        }

        await Storage.set({key: `isModified`, value: `true`});
        dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {movie: movie}});
    }

    async function saveMovieCallback(movie: MovieProps) {
        try {
            log('saveMovie started');
            dispatch({type: SAVE_MOVIE_STARTED});
            const savedMovie = await (movie._id ? updateMovie(token, movie) : createMovie(token, movie));
            log('saveMovie succeded');
            dispatch({type: SAVE_MOVIE_SUCCEEDED, payload: {movie: savedMovie}});
        } catch (error) {
            console.log(error);
            await saveLocalData(movie);
        }
        let modified = await Storage.get({key: `isModified`})
        if(modified.value === 'false') window.history.go(0);
    }

    async function getConflictCallback(id: string, version: string){
        return await getConf(token, id, version);

    }

    async function resolveConflictCallback(movie: MovieProps){
        dispatch({type: SAVE_MOVIE_STARTED});
        await (movie._id && solveConflict(token, movie));
    }

    async function syncLocalModif(){
        let localMovies = await Storage.keys()
            .then(function (localStorageData){
                for(let i = 0; i < localStorageData.keys.length; i++)
                    if(localStorageData.keys[i].valueOf().includes('movies'))
                        return Storage.get({key: localStorageData.keys[i]});
            });

        let res = await syncLocalData(token, JSON.parse(localMovies?.value || "[]"));
        if(res.length === 0){
            await Storage.set({key: `isModified`, value: `false`});
        }
        else{
            await Storage.set({key: `conflictingData`, value: JSON.stringify(res)});
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
                const {type, payload: item} = message;
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
