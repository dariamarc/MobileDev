import {getLogger} from "../core";
import React, {useContext, useState} from "react";
import {RouteComponentProps} from "react-router";
import {AuthContext} from "./AuthProvider";
import {Redirect} from "react-router-dom";
import {IonButton, IonHeader, IonPage, IonTitle, IonToolbar, IonContent, IonLoading, IonToast, IonInput} from "@ionic/react";

const log = getLogger('Login');

interface LoginState{
    tableNo?: string
}

export const Login: React.FC<RouteComponentProps> = ({history}) => {
    const {isAuthenticated, isAuthenticating, login, authenticationError} = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const {tableNo} = state;

    const handleLogin = () => {
        log('handleLogin');
        login?.(tableNo);
    };

    log('render');
    if(isAuthenticated){
        return <Redirect to={{pathname: '/'}} />
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Enter table number"
                    value={tableNo}
                    onIonChange={e => setState({
                        ...state,
                        tableNo: e.detail.value || ''
                    })}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError
                && <IonToast isOpen={true} message={"Utilizator deja logat la aceasta masa! Alegeti alta masa!"} duration={1500}/>}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
}