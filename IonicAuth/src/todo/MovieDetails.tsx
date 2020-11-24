import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel
} from '@ionic/react';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';
import { RouteComponentProps } from 'react-router';
import { MovieProps } from './MovieProps';

const log = getLogger('MovieDetails');

interface MovieDetailsProps extends RouteComponentProps<{
    _id?: string;
}> {}

const MovieDetails: React.FC<MovieDetailsProps> = ({ history, match }) => {
    const { movies, fetching, fetchingError, fetchMovie } = useContext(MovieContext);
    const [text, setText] = useState('');
    const [item, setItem] = useState<MovieProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params._id || '';
        log('movie id' + routeId);
        const movie = movies?.find(it => it._id === routeId);
        setItem(movie);
        if (movie) {
            setText(movie.name);
        }
    }, [match.params._id, movies]);

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Details</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={"Movie: " + item?.name} readonly/>
                <IonInput value={"Director: " + item?.director} readonly/>
                <IonInput value={"Year: " + item?.year} readonly/>
                <IonLoading isOpen={fetching} />
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to get movie details'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default MovieDetails;
