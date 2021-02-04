import {getLogger} from "../core";
import {Plugins} from "@capacitor/core";
import {ItemProps} from "./ItemProps";
import React, {useCallback, useContext, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {AuthContext} from "../auth/AuthProvider";
import {getActiveItems, getAllItems, newWebSocket, postItem, updateItemApi, updateItemBorrowers} from "./ItemApi";
import {useNetwork} from "../core/useNetworkState";

const {Storage} = Plugins
const log = getLogger('OrderProvider');

//type GetItemsFn = () => Promise<any>;
type SaveItemFn = (name: string) => Promise<any>;
type UpdateItemFn = (id: number, status: string) => Promise<any>
type BorrowItemFn = (id: number) => Promise<any>;
type ReturnItemFn = (id: number) => Promise<any>;

export interface ItemsState {
    items?: ItemProps[],
    activeItems?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    updating: boolean,
    updatingError?: Error | null,
    saveItem?: SaveItemFn,
    updateItem?: UpdateItemFn,
    borrowItem?: BorrowItemFn,
    returnItem?: ReturnItemFn,
    borrowing: boolean,
    borrowingError?: Error | null,
    returning: boolean,
    returningError?: Error | null,
    //getActiveItems?: GetItemsFn
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
    updating: false,
    borrowing: false,
    returning: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const FETCH_ACTIVE_ITEMS_STARTED = 'FETCH_ACTIVE_ITEMS_STARTED';
const FETCH_ACTIVE_ITEMS_SUCCEEDED = 'FETCH_ACTIVE_ITEMS_SUCCEEDED';
const FETCH_ACTIVE_ITEMS_FAILED = 'FETCH_ACTIVE_ITEMS_FAILED';
const SAVED_ITEM_STARTED = 'SAVED_ITEM_STARTED';
const SAVED_ITEM_SUCCEEDED = 'SAVED_ITEM_SUCCEEDED';
const SAVED_ITEM_FAILED = 'SAVED_ITEM_FAILED';
const UPDATE_ITEM_STARTED = 'UPDATE_ITEM_STARTED';
const UPDATE_ITEM_SUCCEEDED = 'UPDATE_ITEM_SUCCEEDED';
const UPDATE_ITEM_FAILED = 'UPDATE_ITEM_FAILED';
const BORROW_ITEM_STARTED = 'BORROW_ITEM_STARTED';
const BORROW_ITEM_SUCCEEDED = 'BORROW_ITEM_SUCCEEDED';
const BORROW_ITEM_FAILED = 'BORROW_ITEM_FAILED';
const RETURN_ITEM_STARTED = 'RETURN_ITEM_STARTED';
const RETURN_ITEM_SUCCEEDED = 'RETURN_ITEM_SUCCEEDED';
const RETURN_ITEM_FAILED = 'RETURN_ITEM_FAILED';
const CHANGED_ITEM = 'CHANGED_ITEM';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, {type, payload}) => {
        console.log(type)
        switch(type){
            case FETCH_ITEMS_STARTED:
                console.log("Fetch items started")
                return {...state, fetching: true, fetchingError: null};
            case FETCH_ITEMS_SUCCEEDED:
                console.log("Fetch items succeeded");
                return {...state, items: payload.items, fetching: false}
            case FETCH_ITEMS_FAILED:
                console.log("Fetch items failed")
                return {...state, fetching: false, fetchingError: payload.error}
            case FETCH_ACTIVE_ITEMS_STARTED:
                console.log("Fetch items started")
                return {...state, fetching: true, fetchingError: null};
            case FETCH_ACTIVE_ITEMS_SUCCEEDED:
                console.log("Fetch items succeeded")
                return {...state, activeItems: payload.items, fetching: false}
            case FETCH_ACTIVE_ITEMS_FAILED:
                console.log("Fetch items failed")
                return {...state, fetching: false, fetchingError: payload.error}
            case SAVED_ITEM_STARTED:
                console.log("Save item started");
                return {...state, saving: true, savingError: null}
            case SAVED_ITEM_SUCCEEDED:
                console.log("Save item succeeded");
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
                return {...state, items, saving: false, savingError: null}
            case SAVED_ITEM_FAILED:
                console.log("Save item failed");
                return {...state, saving: false, savingError: payload.error}
            case UPDATE_ITEM_STARTED:
                console.log("Update item started");
                return {...state, updating: true, updatingError: null}
            case UPDATE_ITEM_SUCCEEDED:
                console.log("Update item succeeded");
                const allItems = [...(state.items || [])];
                const updatedItem = payload.item;
                console.log(updatedItem);
                const indexUp = allItems.findIndex(it => it.id === updatedItem.id);
                if(indexUp === -1){
                    allItems.splice(0, 0, updatedItem);
                }
                else{
                    allItems[indexUp].status = updatedItem.status;
                }
                return {...state, allItems, updating: false, updatingError: null}
            case UPDATE_ITEM_FAILED:
                console.log("Update item failed");
                return {...state, updating: false, updatingError: payload.error}
            case CHANGED_ITEM:
                console.log("Item changed");
                let activeItems = [...(state.activeItems || [])];
                const changedItem = payload.item;
                console.log(changedItem);
                const indexCh = activeItems.findIndex(it => it.id === changedItem.id);
                if(activeItems.length === 0){
                    activeItems.push(changedItem);
                }
                if(indexCh === -1){
                    console.log("HERE");
                    if(changedItem.status === 'active') {
                        activeItems.push(changedItem);
                    }
                }
                else{
                    if(changedItem.status === 'inactive')
                    {
                        activeItems.splice(indexCh, 1);
                    }
                }
                console.log(activeItems);
                return {...state, activeItems: activeItems}
            case BORROW_ITEM_STARTED:
                return {...state, borrowing: true, borrowingError: null};
            case BORROW_ITEM_SUCCEEDED:
                const borrowactiveItems = [...(state.activeItems || [])];
                const borrowedItem = payload.item;
                const indexBr = borrowactiveItems.findIndex(it => it.id === borrowedItem.id);
                if(indexBr === -1){
                        borrowactiveItems.splice(0, 0, borrowedItem);
                }
                else{
                    borrowactiveItems[indexBr].borrowers = borrowedItem.borrowers;
                }

                return {...state, activeItems: borrowactiveItems, borrowing: false, borrowingError: null};
            case BORROW_ITEM_FAILED:
                return {...state, borrowingError: payload.error};
            case RETURN_ITEM_STARTED:
                return {...state, returning: true, returningError: null};
            case RETURN_ITEM_SUCCEEDED:
                const returnactiveItems = [...(state.activeItems || [])];
                const returnedItem = payload.item;
                const indexRe = returnactiveItems.findIndex(it => it.id === returnedItem.id);
                if(indexRe === -1){
                    returnactiveItems.splice(0, 0, returnedItem);
                }
                else{
                    returnactiveItems[indexRe].borrowers = returnedItem.borrowers;
                }

                return {...state, activeItems: returnactiveItems, returning: false, returningError: null};
            case RETURN_ITEM_FAILED:
                return {...state, returningError: payload.error};
            default:
                return state;
        }
    };

export const ItemsContext = React.createContext<ItemsState>(initialState);

interface MessageProviderProps{
    children: PropTypes.ReactNodeLike
}

export const ItemProvider: React.FC<MessageProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {token} = useContext(AuthContext);
    const {items, activeItems, fetching, borrowing, returning, borrowingError, returningError, fetchingError, saving, savingError, updating, updatingError} = state;
    const {networkStatus} = useNetwork();
    useEffect(wsEffect, [token]);
    useEffect(getItemsEffect, [token]);
    useEffect(getActiveItemsEffect, []);


    const saveItem = useCallback<SaveItemFn>(saveItemCallback, []);
    const updateItem = useCallback<UpdateItemFn>(updateItemCallback, []);
    const borrowItem = useCallback<BorrowItemFn>(borrowItemCallback, []);
    const returnItem = useCallback<ReturnItemFn>(returnItemCallback, []);

    const value = {items, fetching, borrowing, borrowingError, returningError, returning, activeItems,fetchingError, borrowItem, returnItem, saveItem, updateItem, saving, savingError, updating, updatingError};
    log('returns');
    return (
        <ItemsContext.Provider value={value}>
            {children}
        </ItemsContext.Provider>
    );


    async function saveItemCallback(name: string){
        try{
            console.log("IN save Callback");
            dispatch({type: SAVED_ITEM_STARTED});
            const savedItem = await postItem(name, token);
            dispatch({type: SAVED_ITEM_SUCCEEDED, payload: {item: savedItem}});
            await saveItemLocal(savedItem);
        }
        catch(err){
            dispatch({type: SAVED_ITEM_FAILED, payload: {error: err}});
        }
    }


    async function updateItemCallback(id: number, status: string){
        try{
            console.log("In update item callback");
            dispatch({type: UPDATE_ITEM_STARTED});
            const updatedItem = await updateItemApi(id, status);
            dispatch({type: UPDATE_ITEM_SUCCEEDED, payload:{item: updatedItem}});
        }
        catch (err){
            dispatch({type: UPDATE_ITEM_FAILED, payload: {error: err}});
        }
    }

    async function borrowItemCallback(id: number){
        try{
            console.log("Borrow item callback");
            console.log(activeItems);
            if(activeItems) {
                console.log("We have items");
                const index = activeItems.findIndex(it => it.id === id);
                if (index === -1) {
                    dispatch({type: BORROW_ITEM_FAILED, payload: {error: "Item does not exist anymore"}});
                } else {
                    console.log("borrowing");
                    let borrowers = Object.values(activeItems[index].borrowers);
                    borrowers.push(token);
                    const borrowedItem = await updateItemBorrowers(id, borrowers);
                    dispatch({type: BORROW_ITEM_SUCCEEDED, payload: {item: borrowedItem}});
                }
            }
        }
        catch(err){
            dispatch({type: BORROW_ITEM_FAILED, payload: {error: err.message}});
        }
    }

    async function returnItemCallback(id: number){
        try{
            console.log("Return item callback");
            if(activeItems) {
                const index = activeItems.findIndex(it => it.id === id);

                if (index === -1) {
                    console.log("Return failed");
                    dispatch({type: RETURN_ITEM_FAILED, payload: {error: "Item does not exist anymore"}});
                } else {
                    let borrowers = Object.values(activeItems[index].borrowers);
                    const userIdx = borrowers.findIndex(it => it === token);
                    console.log(borrowers);
                    console.log("found at " + userIdx);
                    if(userIdx === 0){
                        borrowers.splice(0, 1);
                        const returnedItem = await updateItemBorrowers(id, borrowers);
                        dispatch({type: RETURN_ITEM_SUCCEEDED, payload: {item: returnedItem}});
                    }
                    else{
                        dispatch({type: RETURN_ITEM_FAILED, payload: {error: "You didn't borrow this asset"}});
                    }
                }
            }
        }
        catch(err){
            dispatch({type: RETURN_ITEM_FAILED, payload: {error: err.message}});
        }
    }

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            try {
                    log("fetch items started");
                    dispatch({type: FETCH_ITEMS_STARTED});
                    const items = await getAllItems(token);
                    log("fetch items succeeded");
                    if (!canceled) {
                        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}});
                    }
            } catch (err) {
                log("fetch messages failed");
                const items = await Storage.keys()
                        .then(function (localStorageData) {
                            for(let i = 0; i < localStorageData.keys.length; i++)
                                if(localStorageData.keys[i].valueOf().includes('items'))
                                    return Storage.get({key: localStorageData.keys[i]});
                        })

                    console.log(items?.value);
                    let localItems = JSON.parse(items?.value || "[]");
                dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: localItems}});
            }
        }
    }

    function getActiveItemsEffect() {
        let canceled = false;
        fetchActiveItems();
        return () => {
            canceled = true;
        }

        async function fetchActiveItems() {
            try {
                log("fetch items started");
                dispatch({type: FETCH_ITEMS_STARTED});
                const items = await getActiveItems();
                log("fetch items succeeded");
                if (!canceled) {
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}});
                }
            } catch (err) {
                log("fetch items failed");
                dispatch({type: FETCH_ITEMS_FAILED, payload: {error: err}});
            }
        }
    }

    async function saveItemLocal(item: ItemProps){
        let localItems = await Storage.keys()
            .then(function (localStorageData) {
                for(let i = 0; i < localStorageData.keys.length; i++)
                    if(localStorageData.keys[i].valueOf().includes('items'))
                        return Storage.get({key: localStorageData.keys[i]});
            })

        console.log(localItems?.value);
        let itemsL = JSON.parse(localItems?.value || "[]");

        if(item.id) {
            itemsL.push(item);
        }

        await Storage.set({
            key: 'items',
            value: JSON.stringify(itemsL)
        });

    }

    function wsEffect(){
        let canceled = false;
        log("wsEffect - connecting");
        const closeWebSocket = newWebSocket(message => {
            if(canceled){
                return;
            }

            dispatch({type: CHANGED_ITEM, payload: {item: message}});

        });
        return () => {
            log("ws disconnecting");
            canceled = true;
            closeWebSocket();
        }
    }
}