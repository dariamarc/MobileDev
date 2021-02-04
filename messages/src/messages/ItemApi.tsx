import axios from 'axios'
import {getLogger} from '../core'
import {ItemProps} from "./ItemProps";
import {Storage} from "@capacitor/core";

const log = getLogger('MessageApi');

const baseUrl = "localhost:3000";
const messageUrl = `http://${baseUrl}/message`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getAllItems: () => Promise<ItemProps[]> = () => {
    let res = axios.get(messageUrl, config);
    res.then(async function(res) {
        await Storage.set({
            key: 'messages',
            value: JSON.stringify(res.data)
        });
    });

    return withLogs(res, 'getItems');
}

export const updateItemApi: (item: ItemProps) => Promise<ItemProps> = (item) => {
    const url = messageUrl + "/" + item.id;
    return withLogs(axios.put(url, item, config), 'updateItem');
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
        updateLocalData(JSON.parse(messageEvent.data));
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}

async function updateLocalData(item: ItemProps){
    let localMessages = await Storage.keys()
        .then(function (localStorageData) {
            for(let i = 0; i < localStorageData.keys.length; i++)
                if(localStorageData.keys[i].valueOf().includes('messages'))
                    return Storage.get({key: localStorageData.keys[i]});
        })

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