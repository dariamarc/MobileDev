import React, {useContext, useEffect} from "react";
import {IonItem, IonLabel, createAnimation, CreateAnimation, IonIcon} from "@ionic/react";
import {OrderProps} from "./OrderProps";
import {alert} from "ionicons/icons";

const Item: React.FC<OrderProps> = (({code, quantity, free,table, sent}) => {

    return (
        <IonItem>
            <IonLabel>{code}</IonLabel>
            <IonLabel>{quantity}</IonLabel>
            {!sent && <IonIcon icon={alert}/>}
        </IonItem>
    )
});

export default Item;