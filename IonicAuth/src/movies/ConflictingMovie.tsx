import React from 'react';
import {IonItem, IonImg, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon} from '@ionic/react';
import { MovieProps } from './MovieProps';
import {usePhotoGallery} from "../core/usePhotoGallery";
import {closeCircle} from "ionicons/icons";

interface MoviePropsExt extends MovieProps {
    onClick: (id?: string) => void;
}

const ConflictingMovie: React.FC<MoviePropsExt> = ({ _id, name, director, photoURL, onClick }) => {
    const {photos} = usePhotoGallery();
    return (
        <IonItem onClick={() => onClick(_id)}>
            <IonCardContent>
                <IonCardTitle>{name}</IonCardTitle>
                <IonCardSubtitle>{director}</IonCardSubtitle>
            </IonCardContent>
            <IonIcon icon={closeCircle} color={"danger"} class={"conflictIcon"} slot={"end"}/>
            {photos.filter(photo=>photo.filepath === photoURL).map((photo, index) => (
                <IonImg key={_id} slot={"end"} src={photo.webviewPath} class={"listImg"}/>
            ))}
        </IonItem>
    );
};

export default ConflictingMovie;
