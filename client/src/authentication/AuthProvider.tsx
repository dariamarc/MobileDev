import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {login as loginApi} from './AuthApi'
import {Storage} from "@capacitor/core";

const log=getLogger('AuthProvider');

type LoginFunction = (username?:string, password?:string)=> void;

export interface AuthState{
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFunction;
    pendingAuthentication?:boolean;
    table?:string;
    token:string;
}

const initialState: AuthState={
    isAuthenticated:false,
    isAuthenticating:false,
    authenticationError:null,
    pendingAuthentication: false,
    token:'',
}

export const AuthContext=React.createContext<AuthState>(initialState);

interface AuthProviderProps{
    children: PropTypes.ReactNodeLike
}

export const AuthProvider: React.FC<AuthProviderProps>=
    ({children})=>{
    const [state, setState]=useState(initialState);
    const {isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token}=state;
    const login=useCallback(loginCallback, []);
    // const logout=useCallback(logoutCallback, []);
    useEffect(authenticationEffect, [pendingAuthentication]);
    const value={isAuthenticated, login, isAuthenticating, authenticationError, token};
    log('render');

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function loginCallback(table?:string):
    void{
        log('login');
        setState({
            ...state,
            pendingAuthentication:true,
            table
        });
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();
        return () => {
            canceled = true;
        }

        async function authenticate() {
            var token = await Storage.get({key: 'token'});
            if (token.value) {
                setState({
                    ...state,
                    token: token.value,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            }
            if (!pendingAuthentication) {
                log('authenticate, !pendingAuth, return');
                return;
            }
            try {
                log('auth...');
                setState({
                    ...state,
                    isAuthenticating: true,
                });
                const {table} = state;
                const {token} = await loginApi(table);
                if (canceled) {
                    return;
                }
                log('auth succeeded');

                await Storage.set({
                    key: 'token',
                    value: token
                });

                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (err) {
                if (canceled) {
                    return;
                }
                log('auth failed');
                setState({
                    ...state,
                    authenticationError: err,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                });
            }
        }
    }
};