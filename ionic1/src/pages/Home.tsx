import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home: React.FC = () => {
  return (
      <IonPage>
          <IonHeader>
              <IonToolbar>
                  <IonTitle>My first Ionic App</IonTitle>
              </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
              <p>Hello World! This is my first Ionic React App :)</p>
          </IonContent>
      </IonPage>
  );
};

export default Home;
