import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext, AuthState } from './AuthProvider';
import { getLogger } from '../core';
import {Plugins} from "@capacitor/core";

const log = getLogger('Login');

export interface PrivateRouteProps {
    component: PropTypes.ReactNodeLike;
    path: string;
    exact?: boolean;
}

let hasToken = false;
(async () => {
    let res = localStorage.getItem('user');
    if(res){
        //console.log('FOund token in local');
        hasToken =  true;
    }

    console.log('Has token ' + hasToken);
})();

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
    const { isAuthenticated } = useContext<AuthState>(AuthContext);
    log('render, isAuthenticated', isAuthenticated);
    return (
        <Route {...rest} render={props => {
            if (isAuthenticated || hasToken) {
                console.log("user is authenticated...");
                // @ts-ignore
                return <Component {...props} />;
            }
            console.log("Redirecting route...");
            return <Redirect to={{ pathname: '/login' }}/>
        }}/>
    );
}
