import React, {useContext, useState} from 'react';
import {Redirect} from 'react-router-dom';
import {RouteComponentProps} from "react-router-dom";
import {
    IonToast,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import {AuthContext} from "./AuthProvider";
import {getLogger} from '../core';


const log=getLogger("Login");

interface LoginState{
    table?:string;
}

export const Login: React.FC<RouteComponentProps>=({history})=>{
    const {isAuthenticated, isAuthenticating, login, authenticationError, pendingAuthentication}=useContext(AuthContext);
    const [loginState, setState]=useState<LoginState>({});

    const [authError, setAuthError]=useState<boolean>(false)
    const {table}=loginState;
    const handleLogin=()=>{
        setAuthError(false)
        log('handleLogin...');
        login?.(table);
    };
    log('render');
    if(isAuthenticated){
        return <Redirect to={{pathname:'/'}}/>
    }

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Welcome! Please choose a table!</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    id={"table"}
                    placeholder="Table"
                    value={table}
                    onIonChange={e=>setState({...loginState, table:e.detail.value||''})}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError
                && (<IonToast isOpen={true} message={"Login error! Busy table! Try another one!"} duration={1000}/>)}
                <IonButton onClick={handleLogin} id={"loginBtn"}>Login</IonButton>
            </IonContent>
        </IonPage>
    )
}