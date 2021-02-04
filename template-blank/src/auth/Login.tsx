import {getLogger} from "../core";
import React, {useContext, useState} from "react";
import {RouteComponentProps} from "react-router";
import {AuthContext} from "./AuthProvider";
import {Redirect} from "react-router-dom";
import {IonButton, IonHeader, IonPage, IonTitle, IonToolbar, IonContent, IonLoading, IonToast, IonInput} from "@ionic/react";

const log = getLogger('Login');

interface LoginState{
    username?: string
}

export const Login: React.FC<RouteComponentProps> = ({history}) => {
    const {isAuthenticated, isAuthenticating, login, authenticationError} = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const {username} = state;

    const handleLogin = () => {
        log('handleLogin');
        login?.(username);
    };

    log('render');
    if(isAuthenticated){
        return <Redirect to={{pathname: '/'}} />
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Welcome</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Enter your name:"
                    value={username}
                    onIonChange={e => setState({
                        ...state,
                        username: e.detail.value || ''
                    })}/>
                {/*<IonLoading isOpen={isAuthenticating}/>*/}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
}