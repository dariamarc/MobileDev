import {authConfig, baseUrl, getLogger, withLogs} from "../core";
import axios from "axios";
import {ItemProps} from "./ItemProps";
import {OrderProps} from "./OrderProps";

const log = getLogger('OrderApi');

export const getMenuItems: (token: string, charSeq: string) => Promise<ItemProps[]> = ((token, charSeq) => {
    const itemUrl = "http://" + baseUrl + "/MenuItem?q=" + charSeq;
    return withLogs(axios.get(itemUrl, authConfig(token)), 'getMenuItems');
})

export const saveOrderItem: (token: string, order: OrderProps) => Promise<OrderProps> = ((token, order) => {
    const orderUrl = "http://" + baseUrl + "/OrderItem";
    console.log("HERE IN API");
    return withLogs(axios.post(orderUrl, JSON.stringify(order), authConfig(token)), 'saveOrderItem');
})

interface MessageData {
    event: string;
    payload: {
        item: ItemProps,
        items: any
    }
};

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}