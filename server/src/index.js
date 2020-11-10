//using require to include modules
//Koa - web framework
const Koa = require('koa')
const app = new Koa();
//http module
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
//for routing
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
    constructor({id, name, director, date}) {
        this.id = id;
        this.name = name;
        this.director = director;
        this.date = date;
    }
}

const movies = []
movies.push(new Movie({id: 1, name: 'The Shawshank Redemption', director: 'Frank Darabont', date: new Date(1994, 9, 14)}));
movies.push(new Movie({id: 2, name: 'The Godfather', director: 'Francis Ford Coppola', date: new Date(1972, 2, 24)}));
movies.push(new Movie({id: 3, name: 'Pulp Fiction', director: 'Quentin Tarantino', date: new Date(1994, 9, 14)}));

let lastUpdated = movies[movies.length - 1].date;
let lastId = movies[movies.length - 1].id;
const pageSize = 10;

const broadcast = data =>
    wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/movie', ctx => {
    const ifModifiedSince = ctx.request.get('If-Modified-Since');
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
        ctx.response.status = 304; // NOT MODIFIED
        return;
    }
    const text = ctx.request.query.text;
    const page = parseInt(ctx.request.query.page) || 1;
    ctx.response.set('Last-Modified', lastUpdated.toUTCString());
    const sortedItems = movies
        //.filter(element => name ? element.name.indexOf(name) !== -1 : true)
        .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()));
    const offset = (page - 1) * pageSize;
    ctx.response.body = movies;
    ctx.response.status = 200;
});

router.get('/movie/:id', async (ctx) => {
    const elemId = ctx.request.params.id;
    const element = movies.find(elem => elemId === element.id);
    if (element) {
        ctx.response.body = element;
        ctx.response.status = 200; // ok
    } else {
        ctx.response.body = { issue: [{ warning: `movie with id ${elemId} not found` }] };
        ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createMovie = async (ctx) => {
    const element = ctx.request.body;
    if (!element.name) {
        ctx.response.body = { issue: [{ error: 'Name is missing' }] };
        ctx.response.status = 400;
        return;
    }
    element.id = `${parseInt(lastId) + 1}`;
    lastId = element.id;
    movies.push(element);
    ctx.response.body = element;
    ctx.response.status = 201;
    broadcast({ event: 'created', payload: { element } });
};

router.post('/movie', async (ctx) => {
    await createMovie(ctx);
});

router.put('/movie/:id', async (ctx) => {
    const id = ctx.params.id;
    const element = ctx.request.body;
    const elemId = element.id;
    if (elemId && id !== element.id) {
        ctx.response.body = { issue: [{ error: `Param id and body id should be the same` }] };
        ctx.response.status = 400;
        return;
    }
    if (!elemId) {
        await createMovie(ctx);
        return;
    }
    const index = movies.findIndex(element => element.id === id);
    if (index === -1) {
        ctx.response.body = { issue: [{ error: `element with id ${id} not found` }] };
        ctx.response.status = 400;
        return;
    }

    movies[index] = element;
    lastUpdated = new Date();
    ctx.response.body = element;
    ctx.response.status = 200;
    broadcast({ event: 'updated', payload: { element } });
});

router.del('/movie/:id', ctx => {
    const id = ctx.params.id;
    const index = movies.findIndex(element => id === element.id);
    if (index !== -1) {
        const element = movies[index];
        movies.splice(index, 1);
        lastUpdated = new Date();
        broadcast({ event: 'deleted', payload: { element } });
    }
    ctx.response.status = 204;
});

setInterval(() => {
    lastUpdated = new Date();
    lastId = `${parseInt(lastId) + 1}`;
    const movie = new Movie({ id: lastId, name: `movie ${lastId}`, date: lastUpdated, director: `director ${lastId}` });
    //movies.push(movie);
    //console.log(`
   //${movie.name}`);
    //broadcast({ event: 'created', payload: { movie } });
}, 15000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
