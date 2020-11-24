import axios from 'axios';
import {authConfig, config, getLogger} from '../core';
import { MovieProps } from './MovieProps';
import {Plugins} from "@capacitor/core";
import {AuthProps} from "../auth/authApi";

const log = getLogger('movieApi');

const baseUrl = 'localhost:3000';
const movieUrl = `http://${baseUrl}/api/movies`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}


export const getAllMovies: (token: string) => Promise<MovieProps[]> = (token) => {
    const response: Promise<MovieProps[]> = withLogs(axios.get(movieUrl, authConfig(token)), 'getMovies');
    response.then(props => {localStorage.setItem('movies', JSON.stringify(props));
    });

    return response;
}

export const getMovie: (id:string, token: string) => Promise<MovieProps[]> = (id, token) => {
    const url = movieUrl.concat("/" + id);
    return withLogs(axios.get(url, authConfig(token)), 'getMovie');
}

interface MessageData {
    type: string;
    payload: MovieProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
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