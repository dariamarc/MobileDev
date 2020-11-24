import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add, reload} from 'ionicons/icons';
import Movie from './Movie';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';
import {Plugins} from "@capacitor/core";
import {AuthContext} from "../auth";

const log = getLogger('MovieList');

const MovieList: React.FC<RouteComponentProps> = ({ history }) => {
    const { movies, fetching, fetchingError } = useContext(MovieContext);
    const {logout} = useContext(AuthContext);
    log('render');

    const handleLogout = () => {
        log('handleLogout');
        logout?.();
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Movies</IonTitle>
                    <IonButton onClick={handleLogout}>Logout</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching movies" />
                {movies && (
                    <IonList>
                        {movies.map(({ _id, name, director, year,userId}) =>
                            <Movie key={_id} _id={_id} name={name} director={director} year={year} userId={userId} onClick={id => history.push(`/movies/${id}`)} />)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch movies'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};


export default MovieList;