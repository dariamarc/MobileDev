import {ItemProps} from "./ItemProps";
import React, {useContext, useEffect} from "react";
import {IonItem, IonLabel, createAnimation, CreateAnimation} from "@ionic/react";

interface ItemPropsExt extends ItemProps{
    onClick: (code: number) => void;
}

const Item: React.FC<ItemPropsExt> = (({id, name, postBy, status, borrowers, onClick}) => {

    return (
        <IonItem onClick={() => onClick(id)}>
            <IonLabel>{name}</IonLabel>
            <IonLabel>Status {status}</IonLabel>
        </IonItem>
    )
});

export default Item;