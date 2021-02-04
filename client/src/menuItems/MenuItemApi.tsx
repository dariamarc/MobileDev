import axios from 'axios';
import {authConfig, baseUrl, getLogger, withLogs} from '../core';
import {MenuItemProperties} from './MenuItemProperties';
import {Storage} from "@capacitor/core";
import {OrderItemProperties} from "./OrderItemProperties";

const menuURL = `http://${baseUrl}/`;

export const getAllItems: (token: string, c:string) => Promise<MenuItemProperties[]> = (token,c) => {
  let res = axios.get(menuURL+'MenuItem?q='+c, authConfig(token));
  res.then(async function (res) {
    await Storage.set({
            key: `menuItems`,
            value: JSON.stringify(res.data)
          });
  })
  return withLogs(res, 'getAssignments');
}

export const sendOrder: (token: string, item: OrderItemProperties) => Promise<OrderItemProperties[]> = (token, item) => {
  var res=axios.post(menuURL+'OrderItem', item, authConfig(token));
  res.then(async (r)=>{
    var storage=await Storage.get({key:"orderedItems"})
    var storageData=JSON.parse(storage.value||'[]')

    var el=storageData.find((i:OrderItemProperties)=>i.code===item.code)
    if(el) storageData.splice(storageData.indexOf(el),1,item)
    else storageData.push(item)
    await Storage.set({key:"orderedItems", value:JSON.stringify(storageData)})
  })
  return withLogs(res, 'orderItem');
}

interface MessageData {
  type: string;
  payload: MenuItemProperties;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage '+messageEvent.data);
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}