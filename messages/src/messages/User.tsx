import React from "react";
import {IonItem, IonLabel} from "@ionic/react";

export interface UserProps{
    name: string,
    unread: number,
    onClick: (name: string) => void;
}

const User: React.FC<UserProps> = (({name, unread,onClick}) => {
    return (
        <IonItem onClick={() => onClick(name)}>
            {unread > 0 &&
                <IonLabel>{name + " [" + unread + "]"}</IonLabel>
            }
            {unread === 0 &&
                <IonLabel>{name}</IonLabel>}

        </IonItem>
    )
})

export default User;