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

const log = getLogger('MovieEdit');

interface MovieEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const MovieEdit: React.FC<MovieEditProps> = ({ history, match }) => {
    const { movies, saving, savingError, saveMovie } = useContext(MovieContext);
    const [name, setName] = useState('');
    const [movie, setMovie] = useState<MovieProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const movie = movies?.find(it => it.id === routeId);
        setMovie(movie);
        if (movie) {
            setName(movie.name);
        }
    }, [match.params.id, movies]);
    const handleSave = () => {
        const editedMovie = movie ? { ...movie, name } : { name };
        saveMovie && saveMovie(editedMovie).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLabel>Numele filmului:</IonLabel>
                <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save movie'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default MovieEdit;
