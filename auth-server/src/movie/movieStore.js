import dataStore from 'nedb-promise';

export class MovieStore{
    constructor({filename, autoload}){
        this.store = dataStore({filename, autoload});
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(movie) {
        let movieName = movie.name;
        if(!movieName){
            throw new Error('Missing movie name!');
        }
        return this.store.insert(movie);
    }

    async update(props, movie){
        return this.store.update(props, movie);
    }
}

export default new MovieStore({filename: './db/movies.json', autoload: true});