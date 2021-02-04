import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonInput,
    IonContent,
    IonFabButton,
    IonButtons,
    IonButton,
    IonFab,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonSelectOption,
    IonSelect,
    IonSearchbar,
    IonLabel, IonChip, IonAlert,
    IonToast, createAnimation, CreateAnimation
} from '@ionic/react';
import {fastFood} from 'ionicons/icons';
import {getLogger} from '../core';
import {ItemsContext} from './ItemProvider';
import {AuthContext} from "../authentication";
import {MenuItemProperties} from "./MenuItemProperties";
import MenuItem from "./MenuItem";
import OrderItem from "./OrderItem";
import {OrderItemProperties} from "./OrderItemProperties";

const log = getLogger('ItemsList');

const ItemsList: React.FC<RouteComponentProps> = ({history}) => {
    const {table, orderedItems, menuItems, fetching, fetchingError, getMenuItems, placeOrder, offer} = useContext(ItemsContext);
    const [currentOrderItem, setCurrentOrderItem] = useState<string>("")
    const [quantity, setQuantity]=useState<number>(0)
    log('render');

    async function search5MenuItems(c: string) {
        getMenuItems && await getMenuItems(c)
    }

    async function order(){
        var orderItem:OrderItemProperties={sent:true,code: currentOrderItem,quantity: quantity,table:table||'',free:false}
        placeOrder && await placeOrder(orderItem)
    }

    async function orderItemNotSent(item:OrderItemProperties){
        var orderItem:OrderItemProperties={sent:true,code: item.code,quantity: item.quantity,table:item.table||'',free:item.free}
        placeOrder && await placeOrder(orderItem)
    }

    async function orderFree(item:MenuItemProperties){
        var orderItem:OrderItemProperties={sent:true,code: item.code,quantity: 1,table:table||'',free:true}
        placeOrder && await placeOrder(orderItem)
    }

    let animation=function animation() {
        const offer = document.querySelector("#offer");
        if (offer) {
            const animation = createAnimation()
                .addElement(offer)
                .duration(3000)
                .iterations(1)
                .beforeStyles({"opacity":100})
                .fromTo("opacity",100,0)
            animation.play();
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle id={"appTitle"}>App</IonTitle>
                    {offer && <IonButtons slot={"end"}><IonButton id="offer" color={"success"} onClick={() => orderFree(offer)}>Order {offer.name} for FREE</IonButton></IonButtons>}
                </IonToolbar>

            </IonHeader>
            <IonContent>

                <IonLoading isOpen={fetching} message="Fetching"/>
                <IonSearchbar
                    placeholder="Search for a certain menu item"
                    debounce={2000}
                    onIonChange={async (e) => await search5MenuItems(e.detail.value!)}>
                </IonSearchbar>

                {menuItems && menuItems.map(({name, code}) => {
                    return <MenuItem key={code} name={name} code={code} onClick={() => {
                        setCurrentOrderItem(code || '')
                    }}/>
                })}


                <IonLoading isOpen={fetching} message="Fetching items"/>
                {fetchingError &&
                <IonAlert isOpen={true} message={"No internet connection! Using data stored locally!"}/>}


                    <br/><br/>
                    <IonTitle color={"success"}>Orders</IonTitle>
                    {orderedItems && orderedItems.map(orderIt =>{
                    return <OrderItem sent={orderIt.sent} table={orderIt.table}
                                      free={false} quantity={orderIt.quantity}
                                      code={orderIt.code} key={orderIt.code} onClick={()=>orderItemNotSent(orderIt)}/>})}

                <IonFab horizontal={"end"} slot={"fixed"} vertical={"bottom"}>
                    <IonInput type={"number"} id={"quantity"} placeholder={"quantity"} onIonChange={e=>setQuantity(parseInt(e.detail.value!))}/>
                    <IonFabButton onClick={() => order()} color={"warning"} >
                        <IonIcon icon={fastFood}/>
                    </IonFabButton>
                </IonFab>

                <CreateAnimation ref={animation}/>

            </IonContent>
        </IonPage>
    );
};

export default ItemsList;
