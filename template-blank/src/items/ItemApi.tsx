import {authConfig, baseUrl, config, getLogger, withLogs} from "../core";
import {ItemProps} from "./ItemProps";
import axios from "axios";
import {Storage} from "@capacitor/core";

const log = getLogger('ItemApi');

export const getAllItems: (username: string) => Promise<ItemProps[]> = ((username) => {
    const itemUrl = "http://" + baseUrl + "/asset?postBy=" + username;
    let res = axios.get(itemUrl, config);
        res.then(async function(res) {
            await Storage.set({
                key: 'items',
                value: JSON.stringify(res.data)
            });
        });
    return withLogs(res, 'getItems');
})

export const postItem: (name: string, postBy: string) => Promise<ItemProps> = (name, postBy) => {
    console.log("In item api");
    const itemUrl = "http://" + baseUrl + "/asset";
    console.log(itemUrl);
    return withLogs(axios.post(itemUrl, {name, postBy}, config), 'postItem');
}

export const updateItemApi: (id: number, status: string) => Promise<ItemProps> = (id, status) => {
    const itemUrl = "http://" + baseUrl + "/asset/" + id;
    return withLogs(axios.patch(itemUrl, {status}, config), 'updateItem');
}

export const getActiveItems: () => Promise<ItemProps[]> = () => {
    const itemUrl = "http://" + baseUrl + "/asset?status=active";
    return withLogs(axios.get(itemUrl, config), 'getActiveItems');
}

export const updateItemBorrowers: (id: number, borrowers: object) => Promise<ItemProps> = (id, borrowers) => {
    const itemUrl = "http://" + baseUrl + "/asset/" + id;
    return withLogs(axios.patch(itemUrl, {borrowers}, config), 'updateItemBorrowers');
}

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