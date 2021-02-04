import {getLogger} from "../core";
import React, {useCallback, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Storage} from "@capacitor/core";
import {loginApi} from "./AuthApi";

const log = getLogger("AuthProvider");

type LoginFn = (tableNo?: string) => void;

export interface AuthState{
    pendingAuthentication?: boolean,
    isAuthenticating: boolean,
    isAuthenticated: boolean,
    authenticationError: Error | null,
    login?: LoginFn,
    username?: string,
    token: string
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    pendingAuthentication: false,
    authenticationError: null,
    token: ''
}

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps{
    children: PropTypes.ReactNodeLike
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, setState] = useState(initialState);
    const {isAuthenticated, isAuthenticating, pendingAuthentication, authenticationError, token} = state;
    const login = useCallback<LoginFn>(loginCallback, []);

    useEffect(authenticationEffect, [pendingAuthentication]);

    const value = {isAuthenticated, isAuthenticating, authenticationError, login, token};
    log('returns');
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

    function loginCallback(username?: string): void {
        log('login');
        setState({...state, pendingAuthentication: true, username});
    }

    function authenticationEffect(){
        let canceled = false;
        authenticate();
        return () => {
            canceled = true;
        }

        async function authenticate() {
            var token = await Storage.get({key: 'token'});
            if(token.value){
                setState({...state, token: token.value, pendingAuthentication: false, isAuthenticated: true, isAuthenticating: false});
            }
            if(!pendingAuthentication){
                log('authenticate, !pendingAuthentication, return');
                return;
            }
            try{
                log('authenticate');
                setState({...state, isAuthenticating: true});
                const {username} = state;
                if(canceled){
                    return;
                }
                log('authenticate succeeded');

                username && await Storage.set({key: 'token', value: username});

                username && setState({...state, token: username, pendingAuthentication: false, isAuthenticating: false, isAuthenticated: true});
            }
            catch(error){
                if(canceled){
                    return;
                }
                log('authenticate failed');
                setState({...state, pendingAuthentication: false, isAuthenticating: false, authenticationError: error});
            }
        }
    }
}