import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';

const authUrl = `http://${baseUrl}/api/auth/login`;

export interface AuthProps {
    token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
    const response: Promise<AuthProps> = withLogs(axios.post(authUrl, { username, password }, config), 'login');
    response.then(props => {localStorage.setItem("user", props.token);
        //console.log('Added token to local storage ' + props.token);
    });

    return response;
}
