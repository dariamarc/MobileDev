import Router from 'koa-router';
import movieStore from "./movieStore";
import {broadcast} from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
    const response = ctx.response;
    const userId = ctx.state.user._id;
    let movies = await movieStore.find({userID: userId});
    response.body = movies;
    response.status = 200;
});

const createMovie = async (ctx, movie, response) => {
    try {
        let userId = ctx.state.user._id;
        movie.userId = userId;
        let responseMovie = await movieStore.insert(movie);
        response.body = responseMovie;
        response.status = 201;
        movie._id = responseMovie._id;
        broadcast(userId, {type: 'created', payload: movie});
    } catch (error) {
        response.body = {message: error.message};
        response.status = 400;
    }
}

router.post('/', async context => {
    await (createMovie(context, context.request.body, context.response))
});

router.put('/:id', async (context) => {
    const movie = context.request.body;
    const id = context.params.id;
    const movieId = movie._id;
    const response = context.response;

    if (movieId && movieId != id) {
        response.body = {message: "Movie id and parameter id has to be the same."};
        response.status = 400;
    }

    if (!movieId) {
        await createMovie(context, movie, response);
    } else {
        movie.userId = context.state.user._id;
        const updatedCount = await movieStore.update({_id: id}, movie);
        if (updatedCount === 1) {
            response.body = movie;
            response.status = 200;
        } else {
            response.body = {message: "The movie no longer exists."};
            response.status = 405;
        }
    }
})

router.get('/conflict/:id', async (context) => {
    const response = context.response;
    let userID = context.state.user._id;
    let id = context.params.id
    let version = context.header['if-modified-since']
    let serverMovie = await movieStore.findOne({_id: id});
    if (Date.parse(serverMovie.version) >= Date.parse(version)) {
        response.status = 200
        response.body = serverMovie
    } else {
        response.status = 304
    }

});

router.put('/conflict/:id', async (context) => {
    const movie = context.request.body;
    const userID = context.state.user._id
    const id = context.params.id;
    const response = context.response;
    movie.userID = userID
    movie.version = new Date().toUTCString()
    const updatedCount = await movieStore.update({_id: id}, movie);
    if (updatedCount === 1) {
        response.body = movie;
        response.status = 200;
        broadcast(userID, {type: 'resolvedConflict', payload: movie});
    } else {
        response.body = {message: 'Movie no longer exists'};
        response.status = 405;
    }
});

router.post('/sync', async (context) => {
    const localMovies = context.request.body;
    const userID = context.state.user._id;
    const response = context.response;
    let versionConflicts = [];
    for (let i = 0; i < localMovies.length; i++) {
        let localMovie = localMovies[i];
        localMovie.userID = userID;
        let inRepo = await movieStore.findOne({_id: localMovie._id});
        if (localMovie._id.startsWith("_") && !inRepo) {
            localMovie._id = undefined;
            await movieStore.insert(localMovie)
        } else {
            if (inRepo && (inRepo.lng !== localMovie.lng || inRepo.lat !== localMovie.lat || inRepo.photoURL !== localMovie.photoURL || inRepo.description !== localMovie.description || inRepo.title !== localMovie.title || inRepo.date !== localMovie.date)) {
                let inRepoVersion = Date.parse(inRepo.version)
                let localVersion = Date.parse(localMovie.version)
                if (inRepoVersion >= localVersion) versionConflicts.push(localMovie._id)
                else await movieStore.update({_id: localMovie._id}, localMovie)
            }
        }
    }
    if (versionConflicts.length > 0) {
        response.body = versionConflicts
        response.status = 409
    } else {
        response.body = versionConflicts
        response.status = 201
    }

});

router.del('/:id', async (context) => {
    const userID = context.state.user._id;
    const movie = await movieStore.findOne({_id: context.params.id});
    if (movie && userID !== movie.userID) {
        context.response.status = 403;
    } else {
        await movieStore.remove({_id: context.params.id});
        context.response.status = 204;
    }
});