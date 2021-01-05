import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';

const authUrl = `http://${baseUrl}/api/auth/login`;

export interface AuthProps {
    token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = ((username, password) => {
    let response = axios.post(authUrl, { username, password }, config);
    return withLogs(response, 'login');
})
