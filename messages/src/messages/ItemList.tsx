import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import React, {useContext, useEffect, useState} from "react";
import {ItemContext} from "./ItemProvider";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLoading,
    IonList,
    IonModal
} from "@ionic/react";
import User, {UserProps} from "./User";
import {ItemProps} from "./ItemProps";
import Item from "./Item";
import {useNetwork} from "../core/useNetworkState";

const log = getLogger("MessageList");

const ItemList: React.FC<RouteComponentProps> = ({history}) => {
    const {items, fetching, fetchingError, updateItem} = useContext(ItemContext);
    const [users, setUsers] = useState<UserProps[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [messages, setMessages] = useState<ItemProps[]>([]);


    useEffect(() => {
        const usersList: UserProps[] = [];
        items?.forEach(x => {
            const index = usersList.findIndex(it => it.name === x.sender);
            if(index === -1) {
                if(x.read === false)
                    usersList.push({name: x.sender, unread: 1, onClick: name => {}});
                else
                    usersList.push({name: x.sender, unread: 0, onClick: name => {}});
            }
            else{
                if(x.read === false)
                    usersList[index].unread += 1;
            }
        })

        setUsers(usersList);
    }, [items]);

    function showMessages(name: string){
        const userMessages: ItemProps[] = [];
        items?.forEach(x => {if(x.sender === name) userMessages.push(x);});
        userMessages.sort((x, y) => x.created - y.created);
        setMessages([]);
        setMessages(userMessages);

        setShowModal(true);

        console.log(updateItem);
        if (updateItem) {
            for(let x of userMessages){
                if(x.read === false) {
                    x.read = true;
                    updateItem(x).then(() => setMessages(userMessages));
                }
            }
        }
    }

    log("render");
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Messages</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching messages" />
                <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                    <IonContent>
                    {messages && (
                        <IonList>
                            {messages.map(message => <Item key={message.id} id={message.id} text={message.text} read={message.read} sender={message.sender} created={message.created}/>)}
                        </IonList>
                    )}
                    </IonContent>
                </IonModal>
                {users && (
                    <IonList>
                        {users.map(x =>
                            <User key={x.name} name={x.name} unread={x.unread} onClick={() => showMessages(x.name)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch messages'}</div>
                )}
            </IonContent>
        </IonPage>
    )
}

export default ItemList;