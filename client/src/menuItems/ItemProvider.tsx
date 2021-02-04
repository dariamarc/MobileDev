import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MenuItemProperties } from './MenuItemProperties';
import {
  sendOrder,
  getAllItems,
  newWebSocket,
} from './MenuItemApi';
import { AuthContext } from '../authentication';
import {FilesystemDirectory, Plugins} from "@capacitor/core";
import {useStorage} from "@ionic/react-hooks/storage";
import {useFilesystem} from "@ionic/react-hooks/filesystem";
import {OrderItemProperties} from "./OrderItemProperties";
import {useNetwork} from "../utils/useNetworkState";


const {Storage}=Plugins
const log = getLogger('ItemProvider');
type GetMenuItemsFunction = (c:string) =>void;
type PlaceOrderFunction = (orderItem:OrderItemProperties) =>void;

export interface ItemState {
  menuItems?: MenuItemProperties[],
  orderedItems?:OrderItemProperties[],
  fetching: boolean,
  fetchingError?: Error | null,
  ordering: boolean,
  orderingError?: Error | null,
  getMenuItems?:GetMenuItemsFunction,
  table?:string,
  placeOrder?:PlaceOrderFunction,
  offer?:MenuItemProperties
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemState = {
  fetching: false,
  ordering:false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const ORDER_ITEM_STARTED = 'ORDER_ITEM_STARTED';
const ORDER_ITEM_FAILED = 'ORDER_ITEM_FAILED';
const ORDER_ITEM_SUCCEDED = 'ORDER_ITEM_SUCCEDED';
const FETCH_LOCAL_ORDERS="FETCH_LOCAL_ORDERS"
const FREE_ITEM_RECEIVED="OFFER_RECEIVED"
const NET_STAT_CHANGED="NET_STAT_CHANGED"
const reducer: (state: ItemState, action: ActionProps) => ItemState =
    (state, { type, payload }) => {
      switch (type) {
        case FETCH_ITEMS_STARTED:
          return { ...state, fetching: true, fetchingError: null };
        case FETCH_ITEMS_SUCCEEDED:
          return { ...state, menuItems: payload.items, fetching: false };
        case FETCH_ITEMS_FAILED:
          return { ...state, fetchingError: payload.error, fetching: false };
          case ORDER_ITEM_STARTED:
          return { ...state, ordering: true, orderingError: null };
        case ORDER_ITEM_SUCCEDED:
          var orderItem=payload.item
            var orderItems=[...(state.orderedItems||[])]
            var el=orderItems.find(i=>i.code===orderItem.code)
            if(el) orderItems.splice(orderItems.indexOf(el),1,orderItem)
            else orderItems.push(orderItem)
          return { ...state, orderedItems: orderItems, ordering: false };
        case ORDER_ITEM_FAILED:
          return { ...state, orderingError: payload.error, ordering: false };
        case FETCH_LOCAL_ORDERS:
          return { ...state, orderedItems: payload.items, fetching: false };
        case FREE_ITEM_RECEIVED:
          return {...state, offer:payload.offer}
        case NET_STAT_CHANGED:
          return {...state, netStat:payload.status}
        default:
          return state;
      }
    };

export const ItemsContext = React.createContext<ItemState>(initialState);

interface AssignmentProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<AssignmentProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { menuItems, fetching, fetchingError,  orderedItems, ordering, orderingError, offer} = state;
  const getMenuItems=useCallback<GetMenuItemsFunction>(getMenuItemsCallback, [token])
  const {networkStatus}=useNetwork();
  const placeOrder=useCallback<PlaceOrderFunction>(placeOrderCallback,[networkStatus,token])
  useEffect(wsEffect, [token]);
  useEffect(getLocalOrdersEffect, [token])

  log('returns');
  return (
      <ItemsContext.Provider value={ {offer, placeOrder,fetching, fetchingError, getMenuItems, ordering, orderingError, menuItems, orderedItems, table:token} }>
        {children}
      </ItemsContext.Provider>
  );



  async function placeOrderCallback(orderItem:OrderItemProperties){
    console.log("GOES HERE")
        if(!networkStatus.connected){
          var it:OrderItemProperties={sent:false, quantity:orderItem.quantity,free:orderItem.free, code:orderItem.code, table:orderItem.table}
          var storage=await Storage.get({key:"orderedItems"})
          var storageData=JSON.parse(storage.value||'[]')
          if(storageData.find((i:OrderItemProperties)=>i.code===it.code)) storageData.splice(storageData.indexOf(it),1,it)
          else storageData.push(it)
          await Storage.set({key:"orderedItems", value:JSON.stringify(storageData)})

          dispatch({type:FETCH_LOCAL_ORDERS, payload:{items:storageData}})
        }else{
          dispatch({type:ORDER_ITEM_STARTED})
          await sendOrder(token,orderItem)
          dispatch({type:ORDER_ITEM_SUCCEDED, payload:{item:orderItem}})
        }
  }

  function getMenuItemsCallback(c:string) {
    fetchItems();
    async function fetchItems() {
      if (!token?.trim()) {
        return;
      }
        try {
         if(c){
           dispatch({ type: FETCH_ITEMS_STARTED });
           log('fetchItems started for string '+c);
           const items=await getAllItems(token,c)
           console.log(JSON.stringify(items))
           if(items.length>5) items.splice(5)
           dispatch({type:FETCH_ITEMS_SUCCEEDED, payload:{items:items}})
         }
         else{
           dispatch({type:FETCH_ITEMS_SUCCEEDED, payload:{items:[]}})
           await Storage.set({key:"menuItems",value:JSON.stringify([])})
         }
        } catch (error) {
          // await getLocalData();
        }
    }
  }

  function getLocalOrdersEffect() {
    var orderedItems:OrderItemProperties[]=JSON.parse(localStorage.getItem("_cap_orderedItems")||'[]')
    orderedItems=orderedItems.filter((i:OrderItemProperties)=>i.table===token)
    dispatch({type:FETCH_LOCAL_ORDERS, payload:{items:orderedItems}})
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        dispatch({ type: FREE_ITEM_RECEIVED, payload: { offer:message}});
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
}
