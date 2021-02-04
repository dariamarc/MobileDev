import React from "react";
import {IonCardContent, IonCardTitle, IonItem, IonCardSubtitle, IonBadge} from "@ionic/react";
import {MenuItemProperties} from "./MenuItemProperties";
import {OrderItemProperties} from "./OrderItemProperties";


interface OrderItemPropertiesExt extends OrderItemProperties {
    onClick: (code?: string) => void;
}

const OrderItem: React.FC<OrderItemPropertiesExt> = ({ sent,code,quantity, table, free, onClick}) => {
    return (
        //LIST ITEM
        <IonItem class={"card"}>
            <IonCardContent>
                <IonCardTitle>Item code: {code}</IonCardTitle>
                <IonCardSubtitle>Quantity: {quantity}</IonCardSubtitle>
                {!sent && <IonBadge color={"danger"} onClick={()=>onClick(code)}>Not sent</IonBadge>}
            </IonCardContent>
        </IonItem>
    );
};
export default OrderItem;