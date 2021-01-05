import React, {useContext, useEffect, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonContent,
    IonButton,
    IonHeader,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSelectOption,
    IonSelect,
    IonSearchbar,
    IonChip,
    IonIcon,
    IonLabel,
    IonFab,
    IonToast,
    IonFabButton, createAnimation, CreateAnimation
} from '@ionic/react';
import Movie from './Movie';
import {conflictConfig, getLogger} from '../core';
import {conflicts, MovieContext} from './MovieProvider';
import {MovieProps} from './MovieProps';
import {AuthContext} from "../auth";
import {useNetwork} from "../core/useNetworkState";
import {add, cloud, cloudOffline} from "ionicons/icons";
import ConflictingMovie from "./ConflictingMovie";

const log = getLogger('MovieList');

const MovieList: React.FC<RouteComponentProps> = ({ history }) => {
    const { movies, fetching, fetchingError } = useContext(MovieContext);
    const [loadedMovies, setLoadedMovies] = useState<MovieProps[]>([]);
    const {logout} = useContext(AuthContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [searchMovie, setSearchMovie] = useState<string>('');
    const [loadedMoviesNo, setLoadedMoviesNo] = useState(6);
    const {networkStatus} = useNetwork()
    log('render');

    useEffect(() => {
        if(movies?.length)
            setLoadedMovies(movies);
    }, [movies])

    const handleLogout = () => {
        log('handleLogout');
        logout?.();
    }

    function getIonOptions() {
        var options:string[] = [""]
        movies?.forEach(movie => {
            if(options.indexOf(movie.director) === -1)
                options.push(movie.director)
        })
        return options
    }

    useEffect(() => {
        if(movies?.length)
            setLoadedMovies(movies?.slice(0, 11));
    }, [movies]);


    const getNext = async ($event: CustomEvent<void>) => {
        if (movies && loadedMoviesNo < movies.length) {
            if(filter)
                console.log('filter: ' + filter);
            setLoadedMovies([...loadedMovies, ...movies.slice(loadedMoviesNo, loadedMoviesNo + 10)]);
            setLoadedMoviesNo(loadedMoviesNo + 10);
        } else setDisableInfiniteScroll(true);
        await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    function groupedAnimations() {
        const title = document.querySelector('#mainTitle');
        const chip = document.querySelector('#networkChip');
        if(title && chip) {
            const animationChip = createAnimation()
                .addElement(chip)
                .keyframes([
                    {offset: 0, transform: 'scale(1) rotate(0)'},
                    {offset: 0.5, transform: 'scale(1.2) rotate(45deg)'},
                    {offset: 1, transform: 'scale(1) rotate(45deg)'}
                ]);

            const animationTitle = createAnimation()
                .addElement(title)
                .keyframes([
                    {offset: 0, transform: 'scale(1))', opacity: '1'},
                    {offset: 0.5, transform: 'scale(1.2)', opacity: '0.3'},
                    {offset: 1, transform: 'scale(1)', opacity: '1'}
                ]);

            const parent = createAnimation()
                .duration(2000)
                .iterations(Infinity)
                .addAnimation([animationTitle, animationChip]);

            parent.play();
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <CreateAnimation ref={groupedAnimations}/>
                    <IonTitle id={"mainTitle"}>My Movies</IonTitle>
                    <IonChip id={"networkChip"} slot="primary" class={"netChip"}>
                        {networkStatus.connected && <IonIcon icon={cloud}/>}
                        {!networkStatus.connected && <IonIcon icon={cloudOffline}/>}
                        <IonLabel>{networkStatus.connectionType}</IonLabel>
                    </IonChip>
                    <IonButton id={"logoutButton"} slot="primary" onClick={handleLogout}>Logout</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSelect value={filter} placeholder="Select Director" onIonChange={e => setFilter(e.detail.value)}>
                    {movies && getIonOptions().map(director => <IonSelectOption key={director} value={director}>{director}</IonSelectOption>)}
                </IonSelect>
                <IonSearchbar
                    placeholder="Search for movie by name"
                    value={searchMovie}
                    debounce={200}
                    onIonChange={e => setSearchMovie(e.detail.value!)}>
                </IonSearchbar>
                {<IonToast isOpen={!networkStatus.connected} duration={2000} message={"No connection! Using local data"}/>}
                {loadedMovies && loadedMovies.filter(movie => { if(filter === "" || filter == undefined) return true; else return movie.director === filter; })
                    .filter(movie => movie.name.indexOf(searchMovie) >= 0)
                    .map(({ _id, name, director, year,userID, version, photoURL}) =>{
                        let movie = conflicts.filter(m => m === _id).length
                        if(movie === 1)
                            return <ConflictingMovie key={_id} onClick={id => history.push(`'movie/${id}`)} name={name} director={director} year={year} userID={userID} version={version} photoURL={photoURL}/>
                        else return <Movie key={_id} _id={_id} name={name} director={director} year={year} userID={userID} version={version} photoURL={photoURL} onClick={id => history.push(`/movies/${id}`)} />

                })}
                <IonLoading isOpen={fetching} message="Fetching movies" />
                {fetchingError && (
                    <div>{'Failed to fetch movies from server. Trying again when connection is established.'}</div>
                )}
                <IonInfiniteScroll loading-spinner="bubbles" threshold="30px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => getNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more of your movies...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/movie')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};


export default MovieList;