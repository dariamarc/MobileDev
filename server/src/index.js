const Koa = require('koa')
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
    try{
        await next();
    }
    catch(err){
        ctx.response.body = {issue: [{error: err.message || 'Unexpected error'}]};
        ctx.response.status = 500;
    }
});

class Movie {
    constructor({id, name, director, year}) {
        this.id = id;
        this.name = name;
        this.director = director;
        this.year = year;
    }
}

const movies = []
movies.push(new Movie({id: '1', name: 'The Shawshank Redemption', director: 'Frank Darabont', year: 1994}));
movies.push(new Movie({id: '2', name: 'The Godfather', director: 'Francis Ford Coppola', year: 1972}));
movies.push(new Movie({id: '3', name: 'Pulp Fiction', director: 'Quentin Tarantino', year: 1994}));

const router = new Router();

router.get('/movies', ctx => {
    const ifModifiedSince = ctx.request.get('If-Modified-Since');
    if(ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()){
        ctx.response.status = 304; // NOT MODIFIED
        return;
    }

    ctx.response.body = movies;
    ctx.response.status = 200;
});

router.get('movies/:id', async (ctx) => {
    const movieID = ctx.request.params.id;
    const movie = movies.find(movie => movieID === movie.id);
    if(movie) {
        ctx.response.body = movie;
        ctx.response.status = 200;
    }
    else {
        ctx.response.body = {issue: [{warning: `The movie with id ${movieID} was not found!`}]};
        ctx.response.status = 404;
    }
});

let lastInsertedIdx = 0;

const moviesToAdd = [
    new Movie({id: '4', name: 'The Dark Night', director: 'Cristopher Nolan', year: 2008}),
    new Movie({id: '5', name: '12 Angry Men', director: 'Sidney Lumet', year: 1957}),
    new Movie({id: '6', name: 'Fight Club', director: 'David Fincher', year: 1999})
];

const broadcast = data =>
    wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

setInterval(() => {
    let movie = moviesToAdd[lastInsertedIdx];
    movies.push(movie);
    lastInsertedIdx = lastInsertedIdx + 1;
    if(lastInsertedIdx >= moviesToAdd.length)
        lastInsertedIdx = 0;
    broadcast({event: 'movie added', payload: {movies: movies}});
}, 10000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);