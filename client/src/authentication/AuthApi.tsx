import axios from "axios";
import {baseUrl, config, withLogs} from '../core';

const loginUrl=`http://${baseUrl}/auth`;

export interface AuthProps{
    token:string;
}

export const login:(table?:string)=> Promise<AuthProps> =((table) => {
    let res = axios.post(loginUrl, {table}, config);
    return withLogs(res, 'login');
})