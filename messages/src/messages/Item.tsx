import {ItemProps} from "./ItemProps";
import React, {useContext, useEffect} from "react";
import {IonItem, IonLabel, createAnimation, CreateAnimation} from "@ionic/react";


const Item: React.FC<ItemProps> = (({id, text, sender, read, created}) => {
    let animation = function simpleAnimation() {
        const text = document.querySelector("#text_message".concat(id.toString()));
        if(text){
            const animation = createAnimation()
                .addElement(text)
                .iterations(1)
                .duration(1000)
                .keyframes([
                    {offset: 0, background: 'black'},
                    {offset: 0.5, background: 'black'},
                    {offset: 1, background: 'black'}
                ])
            animation.play();
        }
    }

    return (
        <IonItem>
            <IonLabel id={"text_message".concat(id.toString())}>{text}</IonLabel>
            {!read && <CreateAnimation ref={animation}/>}
        </IonItem>
    )
});

export default Item;