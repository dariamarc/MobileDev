import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLoading,
    IonList,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar,
    IonButton,
    IonLabel, createAnimation, CreateAnimation
} from "@ionic/react";
import React, {useContext, useState} from "react";
import {OrdersContext} from "./OrderProvider";
import Item from "./Item";
import {OrderProps} from "./OrderProps";
import Order from "./Order";
import {useNetwork} from "../core/useNetworkState";

const log = getLogger("OrderList");

const OrderList: React.FC<RouteComponentProps> = ({ history }) => {
    const {fetchingError, items, orders, offerItem, getItems, saveOrder} = useContext(OrdersContext);
    const [selectedItem, setSelectedItem] = useState(0);
    const [quantity, setQuantity] = useState(0);
    function search5MenuItems(chSeq: string){
        getItems && getItems(chSeq);
    }

    function selectItem(code: number){
        setSelectedItem(code);
    }

    function handleSave(){
        const order: OrderProps = {sent: false, code: selectedItem, free: false, quantity: quantity, table: ''}
        saveOrder && saveOrder(order);
    }

    function handleSaveOffer(){
        if(offerItem) {
            console.log(offerItem);
            console.log("I AM LOSING MY MIND");
            const order: OrderProps = {sent: false, code: offerItem, free: true, quantity: 1, table: ''};
            saveOrder && saveOrder(order);
        }

    }

    let animation = function simpleAnimation() {
        const text = document.querySelector("#offerLabel");
        if(text){
            const animation = createAnimation()
                .addElement(text)
                .iterations(1)
                .duration(3000)
                .fromTo('visibility', 'visible', 'hidden')
            animation.play();
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Orders</IonTitle>
                    <IonLabel id="offerLabel" slot="primary" onClick={() => handleSaveOffer()}>FREE OFFER {offerItem}</IonLabel>
                    <CreateAnimation ref={animation}/>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonSearchbar placeholder="Search for menu item"
                            debounce={2000}
                            onIonChange={async (e) => await search5MenuItems(e.detail.value!)}></IonSearchbar>
                            {items && <IonList>
                                {items.map(item => <Item key={item.code} name={item.name} code={item.code} onClick={() => selectItem(item.code)}></Item>)}
                            </IonList>}
                            <IonInput placeholder="Enter quantity" onIonChange={(e) => setQuantity(parseInt(e.detail.value!))}></IonInput>
                            <IonButton onClick={() => handleSave()}>Place order</IonButton>
                        </IonCol>
                        <IonCol>
                            <IonLabel>My Orders</IonLabel>
                            {orders && <IonList>
                                {orders.map(order => <Order key={order.code} sent={order.sent} code={order.code} quantity={order.quantity} free={order.free} table={order.table}></Order>)}
                            </IonList>}
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    )
}

export default OrderList;