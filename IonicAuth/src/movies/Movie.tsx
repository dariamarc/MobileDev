import React from 'react';
import {IonItem, IonImg, IonCardTitle, IonCardSubtitle, IonCardContent} from '@ionic/react';
import {MovieProps} from './MovieProps';
import {usePhotoGallery} from "../core/usePhotoGallery";

interface MoviePropsExt extends MovieProps {
    onClick: (id?: string) => void;
}

const Movie: React.FC<MoviePropsExt> = ({_id, name, director, photoURL, onClick}) => {
    const {photos} = usePhotoGallery();
    return (
        <IonItem onClick={() => onClick(_id)}>
            <IonCardContent>
                <IonCardTitle>{name}</IonCardTitle>
                <IonCardSubtitle>{director}</IonCardSubtitle>
            </IonCardContent>
            {photos.filter(photo => photo.filepath === photoURL).map((photo, index) => (
                <IonImg key={_id} slot={"end"} src={photo.webviewPath} class={"listImg"}/>
            ))}
        </IonItem>
    );
};

export default Movie;
