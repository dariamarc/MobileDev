import {getLogger} from "../core";
import {ItemProps} from "./ItemProps";
import React, {useCallback, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {getAllItems, newWebSocket, updateItemApi} from "./ItemApi";
import {Storage} from "@capacitor/core";
import {useNetwork} from "../core/useNetworkState";

const log = getLogger("ItemProvider")

type UpdateItemFn = (item: ItemProps) => Promise<any>;

export interface ItemState{
    items?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    updateItem?: UpdateItemFn
}

interface ActionProps{
    type: string,
    payload?: any
}

const initialState: ItemState = {
    fetching: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_MESSAGES_FAILED';
const ADDED_ITEM = 'ADDED_ITEM';
const UPDATED_ITEM = 'UPDATED_ITEM';

const reducer: (state: ItemState, action: ActionProps) => ItemState =
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
            case ADDED_ITEM:
                const items = [...(state.items || [])];
                const item = payload.item;
                console.log(item);
                const index = items.findIndex(it => it.id === item.id);
                if(index === -1){
                    items.splice(0, 0, item);
                }
                else{
                    items[index] = item;
                }
                return {...state, items}
            case UPDATED_ITEM:
                const allItems = [...(state.items || [])];
                const updatedItem = payload.item;
                console.log(updatedItem);
                const indexUp = allItems.findIndex(it => it.id === updatedItem.id);
                allItems[indexUp] = updatedItem;
                return {...state, allItems}
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemState>(initialState);

interface MessageProviderProps{
    children: PropTypes.ReactNodeLike
}

export const ItemProvider: React.FC<MessageProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {items, fetching, fetchingError} = state;
    const {networkStatus} = useNetwork();
    useEffect(getItemsEffect, []);
    useEffect(wsEffect, []);

    const updateItem = useCallback<UpdateItemFn>(updateItemCallback, []);

    async function updateItemCallback(item: ItemProps){
        console.log("UPDATE STARTED");
        try{
            console.log("Update " + item);
            if(networkStatus.connected) {
                const updatedItem = await updateItemApi(item);
                updateLocalData(updatedItem);
                dispatch({type: UPDATED_ITEM, payload: {item: updatedItem}});
            }
            else {
                await updateLocalData(item);
            }

        }
        catch(error){
            console.log(error);
        }
    }

    const value = {items, fetching, fetchingError, updateItem};
    log('returns');
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            try {
                if(networkStatus.connected) {
                    console.log("WE HAVE A CONNECTION");
                    syncLocalModifications();
                    log("fetch messages started");
                    dispatch({type: FETCH_ITEMS_STARTED});
                    const items = await getAllItems();
                    log("fetch messages succeeded");
                    if (!canceled) {
                        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}});
                    }
                }
                else{
                    console.log("WE DON'T HAVE CONNECTION");
                    const items = await Storage.keys()
                        .then(function (localStorageData) {
                            for(let i = 0; i < localStorageData.keys.length; i++)
                                if(localStorageData.keys[i].valueOf().includes('messages'))
                                    return Storage.get({key: localStorageData.keys[i]});
                        })

                    console.log(items?.value);
                    let messages = JSON.parse(items?.value || "[]");

                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: messages}});
                }
            } catch (err) {
                log("fetch messages failed");
                dispatch({type: FETCH_ITEMS_FAILED, payload: {error: err}});
            }
        }
    }

    function wsEffect(){
        let canceled = false;
        log("wsEffect - connecting");
        const closeWebSocket = newWebSocket(message => {
            if(canceled || !networkStatus.connected){
                return;
            }

        dispatch({type: ADDED_ITEM, payload: {item: message}});
        });
        return () => {
            log("ws disconnecting");
            canceled = true;
            closeWebSocket();
        }
    }

    async function updateLocalData(item: ItemProps){
        let localMessages = await Storage.keys()
            .then(function (localStorageData) {
                for(let i = 0; i < localStorageData.keys.length; i++)
                    if(localStorageData.keys[i].valueOf().includes('messages'))
                        return Storage.get({key: localStorageData.keys[i]});
            })

        console.log(localMessages?.value);
        let messages = JSON.parse(localMessages?.value || "[]");
        let found = false;
        if(item.id) {
            for (let i = 0; i < messages.length; i++) {
                if (messages[i].id === item.id) {
                    messages[i] = item;
                    found = true;
                    break;
                }
            }
        }

        if(!found){
            messages.push(item);
        }

        await Storage.set({
            key: 'messages',
            value: JSON.stringify(messages)
        });

        await Storage.set({key: 'modifiedLocal', value: 'true'});
    }

    async function syncLocalModifications(){
        const modified = await Storage.get({key: 'modifiedLocal'});
        if(modified.value === 'true') {
            let localMessages = await Storage.keys()
                .then(function (localStorageData) {
                    for (let i = 0; i < localStorageData.keys.length; i++)
                        if (localStorageData.keys[i].valueOf().includes('messages'))
                            return Storage.get({key: localStorageData.keys[i]});
                })

            console.log(localMessages?.value);
            let messages = JSON.parse(localMessages?.value || "[]");

            for (const message of messages) {
                if (message.read === true) {
                    await updateItemApi(message);
                }
            }

            await Storage.set({key: 'modifiedLocal', value: 'false'});
        }
    }

};
