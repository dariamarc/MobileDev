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
    tableNo?: string,
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

    function loginCallback(tableNo?: string): void {
        log('login');
        setState({...state, pendingAuthentication: true, tableNo});
    }

    function authenticationEffect(){
        let canceled = false;
        authenticate();
        return () => {
            canceled = true;
        }

        async function authenticate() {
            var token = await Storage.get({key: 'ordersToken'});
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
                const {tableNo} = state;
                const {token} = await loginApi(tableNo);
                console.log(token);
                if(canceled){
                    return;
                }
                log('authenticate succeeded');

                await Storage.set({key: 'ordersToken', value: token});

                setState({...state, token, pendingAuthentication: false, isAuthenticating: false, isAuthenticated: true});
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