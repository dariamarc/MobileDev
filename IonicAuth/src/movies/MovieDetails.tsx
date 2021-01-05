import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonChip, IonIcon,
    IonItem,
    IonModal,
    IonCard,
    IonImg,
    IonFab,
    IonFabButton,
    IonActionSheet, createAnimation, CreateAnimation
} from '@ionic/react';
import {getLogger} from '../core';
import {conflicts, MovieContext} from './MovieProvider';
import {RouteComponentProps} from 'react-router';
import {MovieProps} from './MovieProps';
import {useNetwork} from "../core/useNetworkState";
import {camera, cloud, cloudOffline, save, trash, close} from "ionicons/icons";
import {Photo, usePhotoGallery} from "../core/usePhotoGallery";
import {useLocation} from "../maps/useLocation";
import {Map} from "../maps/Map";
import {Storage} from "@capacitor/core";

const log = getLogger('MovieDetails');

interface MovieDetailsProps extends RouteComponentProps<{
    _id?: string;
}> {
}

const MovieDetails: React.FC<MovieDetailsProps> = ({history, match}) => {
    const {
        movies,
        fetching,
        fetchingError,
        saving,
        savingError,
        saveMovie,
        getConflict,
        resolveConflict
    } = useContext(MovieContext);
    const [name, setName] = useState('');
    const [director, setDirector] = useState('');
    const [year, setYear] = useState('');
    const [version, setVersion] = useState('');
    const [id, setId] = useState('');
    const [userId] = useState('');
    const [item, setItem] = useState<MovieProps>();
    const [photoURL, setPhotoURL] = useState('');
    const [showConflict, setShowConflict] = useState(true);
    const [currentConflict, setCurrentConflict] = useState<MovieProps>();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();
    const [openModal, setOpenModal] = useState(false)
    const [openMapModal, setOpenMapModal] = useState(false)
    const [lat, setLat] = useState<number>();
    const [lng, setLng] = useState<number>();
    const {networkStatus} = useNetwork()
    const {photos, takePhoto, deletePhoto} = usePhotoGallery();
    const myLocation = useLocation();
    const {latitude: currentLat, longitude: currentLong} = myLocation.position?.coords || {}

    useEffect(() => {
        log('useEffect');
        const routeId = match.params._id || '';
        const movie = movies?.find(it => it._id === routeId);
        setItem(movie);
        if (movie) {
            setName(movie.name);
            setDirector(movie.director);
            setYear(movie.year);
            setId(movie._id || '');
            setVersion(movie.version);
            setLat(movie.lat);
            setLng(movie.lng);
        }
    }, [match.params._id, movies]);

    useEffect(() => {
        console.log("CHECKING CONFLICT!!!!!!!!!!!!!");
    console.log(getConflict);
        if (getConflict && !currentConflict) {
            console.log("HERE");
            let elem = getConflict(id, version);
            elem.then(res => {
                setCurrentConflict(res)
            })
        }
    }, [currentConflict, getConflict, id, version]);

    const handleSave = () => {
        console.log("IN HANDLE SAVE");
        const editedMovie = item ? {...item, name, director, year, userId, version, photoURL, lat, lng} : {
            name: name,
            director: director,
            year: year,
            userID: userId,
            version: version,
            photoURL: photoURL,
            lat: lat,
            lng: lng
        };
        saveMovie && saveMovie(editedMovie).then(() => history.push('/movies'));
    }

    const keepDataOnServer = async () => {
        let localData = await Storage.get({key: "movies"});
        let localMovies = JSON.parse(localData.value || "[]");
        if (currentConflict) {
            for (let i = 0; i < localMovies.length; i++) {
                if (currentConflict._id && localMovies[i]._id === currentConflict._id) {
                    localMovies[i] = currentConflict;
                    conflicts.splice(conflicts.indexOf(currentConflict._id), 1);
                    await Storage.set({key: `conflictingData`, value: JSON.stringify(conflicts)});
                    await Storage.set({key: `movies`, value: JSON.stringify(localMovies)});
                    history.push("/movies");
                    history.go(0);
                    break;
                }
            }
        }
    }

    const changeDataOnServer = async () => {
        const myMovie = item ?
            {...item, name, director, year, userId, version, photoURL, lat, lng} : {
                name: name,
                director: director,
                year: year,
                userID: userId,
                version: version,
                photoURL: photoURL,
                lat: lat,
                lng: lng
            };

        resolveConflict && resolveConflict(myMovie).then(async () => {
            if (currentConflict && currentConflict._id) {
                conflicts.splice(conflicts.indexOf(currentConflict._id), 1);
                await Storage.set({key: `conflictingData`, value: JSON.stringify(conflicts)});
            }
            history.push("/movies");
            history.go(0);
        })
    }

    const handleTakePhoto = () => {
        let url = takePhoto();
        url.then(value => setPhotoURL(value))
            .catch(err => setPhotoURL(''));
    }

    function chainedAnimations(){
        const name = document.querySelector("#name");
        const director = document.querySelector("#director");
        const year = document.querySelector("#year");
        if(name && director && year){
            const animationName = createAnimation()
                .addElement(name)
                .fromTo('border', 'solid dodgerblue 2px', 'solid red 4px')
                .duration(1000)
                .iterations(1);
            const animationDirector = createAnimation()
                .addElement(director)
                .fromTo('border', 'solid dodgerblue 2px', 'solid green 1px')
                .duration(1000)
                .iterations(1);
            const animationYear = createAnimation()
                .addElement(year)
                .fromTo('border', 'solid dodgerblue 2px', 'dotted dodgerblue 2px')
                .duration(1000)
                .iterations(1);

            (async () => {
                await animationName.play();
                await animationDirector.play();
                await animationYear.play();
            })();
        }
    }

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Details</IonTitle>
                    <IonChip class={"netChip"}>
                        {networkStatus.connected && <IonIcon icon={cloud}/>}
                        {!networkStatus.connected && <IonIcon icon={cloudOffline}/>}
                        <IonLabel>{networkStatus.connectionType}</IonLabel>
                    </IonChip>
                    <IonButton onClick={handleSave}>Save</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <CreateAnimation ref={chainedAnimations}/>
                <IonItem>
                    <IonLabel>Name: </IonLabel>
                    <IonInput id={"name"} value={name} onIonChange={e => {
                        setShowConflict(false);
                        setName(e.detail.value || '')
                    }}/>
                </IonItem>
                <IonItem>
                    <IonLabel>Director: </IonLabel>
                    <IonInput id={"director"} value={director} onIonChange={e => {
                        setShowConflict(false);
                        setDirector(e.detail.value || '')
                    }}/>
                </IonItem>
                <IonItem>
                    <IonLabel>Year: </IonLabel>
                    <IonInput id={"year"} value={year} onIonChange={e => {
                        setShowConflict(false);
                        setYear(e.detail.value || '')
                    }}/>
                </IonItem>
                <IonLoading isOpen={saving}/>

                {/*CONFLICTS*/}
                {showConflict && currentConflict && currentConflict._id && (currentConflict.name != name || currentConflict.director != director || currentConflict.year != year) &&
                <>
                    <IonButton color={"danger"} class={"conflictingName"} onClick={() => setOpenModal(true)}>CONFLICTING
                        MOVIE</IonButton>
                    <IonModal
                        isOpen={openModal}
                        onDidDismiss={() => setOpenModal(false)}>
                        <IonContent>
                            <IonItem>
                                <IonLabel>Title:</IonLabel>
                                <IonInput value={currentConflict.name} readonly/>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Content:</IonLabel>
                                <IonInput value={currentConflict.director} readonly/>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Date:</IonLabel>
                                <IonInput value={currentConflict.year} readonly/>
                            </IonItem>
                            {photos.filter(photo => photo.filepath === currentConflict.photoURL).map((photo, index) => (
                                <IonCard class={"photoCard"}>
                                    <IonImg src={photo.webviewPath}/>
                                </IonCard>
                            ))}
                        </IonContent>
                        <IonFab vertical="bottom" horizontal="start" slot="fixed">
                            <IonLabel>Save your data</IonLabel>
                            <IonFabButton color={"success"} onClick={changeDataOnServer}>
                                <IonIcon icon={save}/>
                            </IonFabButton>
                        </IonFab>
                        <IonFab vertical="bottom" horizontal="end" slot="fixed">
                            <IonLabel>Drop your data</IonLabel>
                            <IonFabButton color={"danger"} onClick={keepDataOnServer}>
                                <IonIcon icon={trash}/>
                            </IonFabButton>
                        </IonFab>
                    </IonModal>
                </>
                }

                {/*PHOTO*/}
                <div>
                    <IonCard class={"photoCard"}>
                        {photos.filter(photo => {
                            return photo.filepath === photoURL || photo.filepath === item?.photoURL
                        }).map((photo, index) => (
                            <IonImg onClick={() => setPhotoToDelete(photo)}
                                    src={photo.webviewPath}/>
                        ))}
                    </IonCard>
                    <IonFab>
                        <IonFabButton onClick={handleTakePhoto} color={"dark"}>
                            <IonIcon icon={camera}/>
                        </IonFabButton>
                    </IonFab>
                    <IonActionSheet
                        isOpen={!!photoToDelete}
                        buttons={[{
                            text: 'Delete',
                            role: 'destructive',
                            icon: trash,
                            handler: () => {
                                if (photoToDelete) {
                                    setPhotoURL('')
                                    deletePhoto(photoToDelete);
                                    setPhotoToDelete(undefined);
                                }
                            }
                        }, {
                            text: 'Cancel',
                            icon: close,
                            role: 'cancel'
                        }]}
                        onDidDismiss={() => setPhotoToDelete(undefined)}
                    />
                </div>

                {/*MAPS*/}
                <>
                    <IonButton color={"success"} class={"mapBtn"} onClick={() => setOpenMapModal(true)}>OPEN
                        MAP</IonButton>
                    <IonModal isOpen={openMapModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation} onDidDismiss={() => setOpenMapModal(false)}>
                        {(lat && lng &&
                            <>
                                <IonButton onClick={() => setOpenModal(false)}>Back</IonButton>
                                <div color={"white"}>The location where the movie was filmed is</div>
                                <div color={"white"}>latitude: {lat}</div>
                                <div color={"white"}>longitude: {lng}</div>
                                <Map
                                    visibleMarker={true}
                                    onMapClick={(e: any) => {
                                        setLat(e.latLng.lat());
                                        setLng(e.latLng.lng())
                                    }}
                                    lat={lat}
                                    lng={lng}
                                    onMarkerClick={log('onMarker')}
                                />
                            </>) ||
                        <>
                            <div color={"primary"}>SELECT A LOCATION FROM WHERE THE MOVIE WAS FILMED</div>
                            <Map
                                lat={currentLat}
                                lng={currentLong}
                                onMapClick={(e: any) => {
                                    setLat(e.latLng.lat());
                                    setLng(e.latLng.lng())
                                }}
                                onMarkerClick={log('onMarker')}
                            />
                        </>
                        }
                    </IonModal>
                </>
                {savingError && (
                    <div>{savingError.message || 'Failed to save movie details'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default MovieDetails;
