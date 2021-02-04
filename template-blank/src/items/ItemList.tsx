import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLoading,
    IonList,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonLabel,
    IonAlert
} from "@ionic/react";
import React, {useContext, useState} from "react";
import {ItemsContext} from "./ItemProvider";
import Item from "./Item";
import {useNetwork} from "../core/useNetworkState";

const log = getLogger("OrderList");

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
    const {fetchingError, fetching, items, activeItems, borrowItem, returnItem, borrowing, returning, borrowingError, returningError, saveItem, updateItem, saving, savingError, updating, updatingError} = useContext(ItemsContext);
    const [name, setName] = useState('');
    const [selectedItem, setSelectedItem] = useState(0);
    const [selectedBorrowItem, setSelectedBorrowItem] = useState(0);
    const [status, setStatus] = useState('');
    const [showAlertAdd, setShowAlertAdd] = useState(false);
    const [showAlertUpdate, setShowAlertUpdate] = useState(false);
    const [showAlertBorrow, setShowAlertBorrow] = useState(false);
    const [showAlertReturn, setShowAlertReturn] = useState(false);

    function handleSave(){
        saveItem && saveItem(name);
    }


    function handleUpdate(){
        if(selectedItem){
            updateItem && updateItem(selectedItem, status);
        }
    }

    function handleBorrow(){
        if(selectedBorrowItem){
            borrowItem && borrowItem(selectedBorrowItem);
        }
    }

    function handleReturn(){
        if(selectedBorrowItem){
            returnItem && returnItem(selectedBorrowItem);
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My assets</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={saving} message="Saving your asset" />
                <IonLoading isOpen={updating} message="Updating your asset" />
                <IonLoading isOpen={borrowing} message="Borrowing asset" />
                <IonLoading isOpen={borrowing} message="Returning asset" />
                <IonLoading isOpen={fetching} message="Fetching assets" />
                {savingError && <p onClick={() => handleSave()}>Saving failed. Click here to retry.</p>}
                {updatingError && <p onClick={() => handleUpdate()}>Updating failed. Click here to retry.</p>}
                {borrowingError && <p onClick={() => handleBorrow()}>Borrowing failed. Click here to retry.</p>}
                {returningError && <p onClick={() => handleReturn()}>Returning failed. Click here to retry.</p>}
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            {items && <IonList>
                                {items.map(item => <Item key={item.id} name={item.name} id={item.id} postBy={item.postBy} borrowers={item.borrowers} status={item.status} onClick={() =>setSelectedItem(item.id)}></Item>)}
                            </IonList>}

                            <IonInput placeholder="Enter the name of your asset" onIonChange={(e) => setName(e.detail.value!)}></IonInput>
                            <IonButton onClick={() => handleSave()}>Create</IonButton>
                            <br></br>
                            <IonLabel>Select an asset and update its status:</IonLabel>
                            <IonInput placeholder="Enter status: active/inactive" onIonChange={(e) => setStatus(e.detail.value!)}/>
                            <IonButton onClick={() => handleUpdate()}>Update status</IonButton>
                        </IonCol>
                        <IonCol>
                            {activeItems && <IonList>
                                {activeItems.map(item => <Item key={item.id} name={item.name} id={item.id} postBy={item.postBy} borrowers={item.borrowers} status={item.status} onClick={() =>setSelectedBorrowItem(item.id)}></Item>)}
                            </IonList>}
                            <IonButton onClick={() => handleBorrow()}>Borrow</IonButton>
                            <IonButton onClick={() => handleReturn()}>Return</IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

            </IonContent>
        </IonPage>
    )
}

export default ItemList;