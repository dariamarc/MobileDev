import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { MovieProps } from './MovieProps';

interface MoviePropsExt extends MovieProps {
    onEdit: (id?: string) => void;
}

const Movie: React.FC<MoviePropsExt> = ({ id, name, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{name}</IonLabel>
        </IonItem>
    );
};

export default Movie;
