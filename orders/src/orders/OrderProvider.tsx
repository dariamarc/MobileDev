import {getLogger} from "../core";
import {Plugins} from "@capacitor/core";
import {OrderProps} from "./OrderProps";
import {ItemProps} from "./ItemProps";
import React, {useCallback, useContext, useEffect, useReducer, useState} from "react";
import PropTypes from "prop-types";
import {AuthContext} from "../auth/AuthProvider";
import {getMenuItems, newWebSocket, saveOrderItem} from "./OrderApi";
import {useNetwork} from "../core/useNetworkState";
import Order from "./Order";
import {type} from "os";

const {Storage} = Plugins
const log = getLogger('OrderProvider');

type SaveOrderFn = (menuItem: OrderProps) => Promise<any>;
type GetItemsFn = (chSeq: string) => Promise<any>;

export interface OrdersState {
    items?: ItemProps[],
    orders?: OrderProps[]
    offerItem?: number,
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveOrder?: SaveOrderFn,
    getItems?: GetItemsFn
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: OrdersState = {
    fetching: false,
    saving: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_MESSAGES_FAILED';
const OFFER_ITEM = 'OFFER_ITEM';
const ADDED_ORDER = 'ADDED_ORDER';
const LOAD_ORDERS = 'LOAD_ORDERS';

const reducer: (state: OrdersState, action: ActionProps) => OrdersState =
    (state, {type, payload}) => {
        console.log(type)
        switch(type){
            case FETCH_ITEMS_STARTED:
                console.log("Fetch messages started")
                return {...state, fetching: true, fetchingError: null};
            case FETCH_ITEMS_SUCCEEDED:
                console.log("Fetch messages succeeded")
                return {...state, items: payload.items, fetching: false}
            case FETCH_ITEMS_FAILED:
                console.log("Fetch messages failed")
                return {...state, fetching: false, fetchingError: payload.error}
            case OFFER_ITEM:
                const item = payload.item;
                console.log(item);
                return {...state, offerItem: item.code}
            case ADDED_ORDER:
                const order = payload.order;
                console.log('added order' + order);
                const allOrders = [...(state.orders || [])];
                allOrders.push(order);
                return {...state, orders: allOrders};
            case LOAD_ORDERS:
                const orders = payload.orders;
                return {...state, orders: orders};
            default:
                return state;
        }
    };

export const OrdersContext = React.createContext<OrdersState>(initialState);

interface MessageProviderProps{
    children: PropTypes.ReactNodeLike
}

export const OrderProvider: React.FC<MessageProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {token} = useContext(AuthContext);
    const {items, orders, offerItem, fetching, fetchingError, saving, savingError} = state;
    const {networkStatus} = useNetwork();
    useEffect(wsEffect, [token]);


    useEffect(() => {
        loadOrders();
    }, [token]);

    const saveOrder = useCallback<SaveOrderFn>(saveOrderCallback, [token, networkStatus]);
    const getItems = useCallback<GetItemsFn>(getItemsCallback, [token]);

    const value = {items, orders, offerItem, fetching, fetchingError, saving, savingError, saveOrder, getItems};
    log('returns');
    return (
        <OrdersContext.Provider value={value}>
            {children}
        </OrdersContext.Provider>
    );



    async function loadOrders(){
        let localOrders = await Storage.keys()
            .then(function (localStorageData) {
                for(let i = 0; i < localStorageData.keys.length; i++)
                    if(localStorageData.keys[i].valueOf().includes('orders') && !localStorageData.keys[i].valueOf().includes('Token'))
                        return Storage.get({key: localStorageData.keys[i]});
            })

        console.log(localOrders?.value);
        let ordersL = JSON.parse(localOrders?.value || "[]");

        dispatch({type: LOAD_ORDERS, payload: {orders: ordersL}});
    }


    async function getItemsCallback(chSeq: string){
        try{
            if(networkStatus.connected) {
                let isModified = await Storage.get({key: "isModified"});
                if(isModified && isModified.value === "true")
                    await syncLocalModifications();
                const items = await getMenuItems(token, chSeq);
                dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}});
            }
        }
        catch(error){
            dispatch({type: FETCH_ITEMS_FAILED, payload: {error: error}})
        }
    }

    async function saveOrderCallback(order: OrderProps){
        console.log("IN SAVE ORDER");
        try{
            if(networkStatus.connected) {
                console.log("CONNECTION");
                const savedOrder = await saveOrderItem(token, order);
                savedOrder.sent = true;
                dispatch({type: ADDED_ORDER, payload: {order: savedOrder}});
                await saveOrderLocal(savedOrder);
            }
            else{
                console.log("NO CONNECTION");
                const localOrder: OrderProps = {code: order.code, free: order.free, quantity: order.quantity, table: token, sent: false};
                await saveOrderLocal(localOrder);
            }
        }
        catch(error){
            console.log(error);
        }
    }

    async function saveOrderLocal(order: OrderProps){
        let localOrders = await Storage.keys()
            .then(function (localStorageData) {
                for(let i = 0; i < localStorageData.keys.length; i++)
                    if(localStorageData.keys[i].valueOf().includes('orders') && !localStorageData.keys[i].valueOf().includes('Token'))
                        return Storage.get({key: localStorageData.keys[i]});
            })

        console.log(localOrders?.value);
        let ordersL = JSON.parse(localOrders?.value || "[]");

        console.log(JSON.parse("[]"));
        if(order.code) {
            ordersL.push(order);
        }

        await Storage.set({
            key: 'orders',
            value: JSON.stringify(ordersL)
        });

        await Storage.set({key: 'modifiedLocal', value: 'true'});
    }

    async function syncLocalModifications(){
        const modified = await Storage.get({key: 'modifiedLocal'});
        if(modified.value === 'true') {
            let localOrders = await Storage.keys()
                .then(function (localStorageData) {
                    for (let i = 0; i < localStorageData.keys.length; i++)
                        if (localStorageData.keys[i].valueOf().includes('orders') && !localStorageData.keys[i].valueOf().includes('Token'))
                            return Storage.get({key: localStorageData.keys[i]});
                })

            console.log(localOrders?.value);
            let orders = JSON.parse(localOrders?.value || "[]");

            for (const order of orders) {
                if(!order.sent) {
                    await saveOrderCallback(order);
                    order.sent = true;
                }
            }

            await Storage.set({key: 'modifiedLocal', value: 'false'});
        }
    }

    function wsEffect(){
        let canceled = false;
        log("wsEffect - connecting");
        const closeWebSocket = newWebSocket(message => {
            if(canceled){
                return;
            }

            dispatch({type: OFFER_ITEM, payload: {item: message}});

        });
        return () => {
            log("ws disconnecting");
            canceled = true;
            closeWebSocket();
        }
    }
}