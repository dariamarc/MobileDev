import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Movie from './Movie';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';

const log = getLogger('MovieList');

const MovieList: React.FC<RouteComponentProps> = ({ history }) => {
    const { movies, fetching, fetchingError } = useContext(MovieContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Movies</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching movies" />
                {movies && (
                    <IonList>
                        {movies.map(({ id, name, director, year}) =>
                            <Movie key={id} id={id} name={name} director={director} year={year} onClick={id => history.push(`/movies/${id}`)} />)}
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