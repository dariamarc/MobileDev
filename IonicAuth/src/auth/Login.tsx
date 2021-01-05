import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { CreateAnimation, IonToast, createAnimation, IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const [authError, setAuthError] = useState<boolean>(false);
    const { username, password } = state;
    const handleLogin = () => {
        log('handleLogin...');
        setAuthError(false)
        login?.(username, password);
    };
    log('render');
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }

    let animation = function simpleAnimation() {
        const username = document.querySelector("#username");
        const password = document.querySelector("#password");
        if(username && password){
            const animation = createAnimation()
                .addElement(username)
                .addElement(password)
                .duration(150)
                .direction('alternate')
                .iterations(1)
                .keyframes([
                    {offset: 0, transform: 'translateX(0px)'},
                    {offset: 0.2, transform: 'translateX(10px)'},
                    {offset: 0.4, transform: 'translateX(0px)'},
                    {offset: 0.6, transform: 'translateX(-10px)'},
                    {offset: 1, transform: 'translateX(0px)'}
                ])
                .onFinish(() => setAuthError(true))
            animation.play();
        }
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
                    id={"username"}
                    placeholder="Username"
                    value={username}
                    onIonChange={e => setState({
                        ...state,
                        username: e.detail.value || ''
                    })}/>
                <IonInput
                    id={"password"}
                    placeholder="Password"
                    value={password}
                    onIonChange={e => setState({
                        ...state,
                        password: e.detail.value || ''
                    })}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError
                && (<IonToast isOpen={true} message={"Login error!"} duration={200}/>)
                && !authError
                && (<CreateAnimation ref={animation}/>)}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
};
