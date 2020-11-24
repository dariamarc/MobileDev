import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { MovieProps } from './MovieProps';

interface MoviePropsExt extends MovieProps {
    onClick: (id?: string) => void;
}

const Movie: React.FC<MoviePropsExt> = ({ _id, name, onClick }) => {
    return (
        <IonItem onClick={() => onClick(_id)}>
            <IonLabel>{name}</IonLabel>
        </IonItem>
    );
};

export default Movie;
