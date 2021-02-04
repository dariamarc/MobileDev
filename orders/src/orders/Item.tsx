import {ItemProps} from "./ItemProps";
import React, {useContext, useEffect} from "react";
import {IonItem, IonLabel, createAnimation, CreateAnimation} from "@ionic/react";

interface ItemPropsExt extends ItemProps{
    onClick: (code: number) => void;
}

const Item: React.FC<ItemPropsExt> = (({code, name, onClick}) => {

    return (
        <IonItem onClick={() => onClick(code)}>
            <IonLabel>{name}</IonLabel>
        </IonItem>
    )
});

export default Item;