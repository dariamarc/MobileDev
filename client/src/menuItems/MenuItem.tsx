import React from 'react';
import {IonCardSubtitle, IonIcon, IonCardContent, IonCard, IonItem, IonImg} from '@ionic/react';
import { MenuItemProperties } from './MenuItemProperties';
import {book, pencil} from "ionicons/icons";
import {IonCardTitle} from "@ionic/react";

interface MenuItemPropertiesExt extends MenuItemProperties {
    onClick: (_id?: string) => void;
}

const MenuItem: React.FC<MenuItemPropertiesExt> = ({ code,name, onClick }) => {
    return (
        //LIST ITEM
        <IonItem class={"card"} onClick={() => onClick(code)}>
            <IonCardContent>
                <IonCardTitle>{name}</IonCardTitle>
            </IonCardContent>
        </IonItem>
    );
};
export default MenuItem;
