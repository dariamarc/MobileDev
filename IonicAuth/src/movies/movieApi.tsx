import axios from 'axios';
import {authConfig, baseUrl, config, conflictConfig, getLogger, withLogs} from '../core';
import {MovieProps} from './MovieProps';
import {Storage} from "@capacitor/core";

const log = getLogger('movieApi');

const movieUrl = `http://${baseUrl}/api/movies`;


export const getAllMovies: (token: string) => Promise<MovieProps[]> = (token) => {
    let res = axios.get(movieUrl, authConfig(token));
    res.then(async function (res) {
        await Storage.set({
            key: `movies`,
            value: JSON.stringify(res.data)
        });
    });
    return withLogs(res, 'getMovies');
}

export const createMovie: (token: string, movie: MovieProps) => Promise<MovieProps[]> = (token, movie) => {
    movie.version = new Date().toUTCString();
    return withLogs(axios.post(movieUrl, movie, authConfig(token)), 'createMovie');
}

export const updateMovie: (token: string, movie: MovieProps) => Promise<MovieProps[]> = (token, movie) => {
    movie.version = new Date().toUTCString();
    return withLogs(axios.put(`${movieUrl}/${movie._id}`, movie, authConfig(token)), 'updateMovie');
}

export const getConf: (token: string, id: string, version: string) => Promise<MovieProps> = (token, id, version) => {
    let res: Promise<MovieProps> = withLogs(axios.get(`${movieUrl}/conflict/${id}`, conflictConfig(token, version)), 'getConflict');
    return res.then((resp) => {
        return resp
    }).catch((resp) => {
        return resp
    })
}

export const solveConflict: (token: string, movie: MovieProps) => Promise<MovieProps[]> = (token, movie) => {
    return withLogs(axios.put(`${movieUrl}/conflict/${movie._id}`, movie, authConfig(token)), 'solveConflict');
}

export const syncLocalData: (token: string, movies: MovieProps[]) => Promise<string[]> = (token, movies) => {
    let res: Promise<string[]> = withLogs(axios.post(`${movieUrl}/sync`, movies, authConfig(token)), 'syncLocalData');
    return res
        .then((resp) => {
            return resp
        })
        .catch((resp) => {
            return resp.response.data
        })
}

interface MessageData {
    type: string;
    payload: MovieProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}