import {baseUrl, config, withLogs} from "../core";
import axios from "axios";

const authUrl = `http://${baseUrl}/auth`;

export interface AuthProps{
    token: string
}

export const loginApi: (table?: string) => Promise<AuthProps> = ((table) => {
    return withLogs((axios.post(authUrl, {table}, config)), 'login');
})