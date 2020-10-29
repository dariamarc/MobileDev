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

class Element {
    constructor({id, name, value, date}) {
        this.id = id;
        this.name = name;
        this.value = value;
        this.date = date;
    }
}

const elements = []
for(let i = 0; i < 5; i++){
    elements.push(new Element({id: `${i}`, name: `Name${i}`, value: 10.5 + i, date: new Date(Date.now() + i)}));
}
let lastUpdated = elements[elements.length - 1].date;
let lastId = elements[elements.length - 1].id;
const pageSize = 10;

const broadcast = data =>
    wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/element', ctx => {
    const ifModifiedSince = ctx.request.get('If-Modified-Since');
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
        ctx.response.status = 304; // NOT MODIFIED
        return;
    }
    const text = ctx.request.query.text;
    const page = parseInt(ctx.request.query.page) || 1;
    ctx.response.set('Last-Modified', lastUpdated.toUTCString());
    const sortedItems = elements
        //.filter(element => name ? element.name.indexOf(name) !== -1 : true)
        .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()));
    const offset = (page - 1) * pageSize;
    // ctx.response.body = {
    //   page,
    //   items: sortedItems.slice(offset, offset + pageSize),
    //   more: offset + pageSize < sortedItems.length
    // };
    ctx.response.body = elements;
    ctx.response.status = 200;
});

router.get('/element/:id', async (ctx) => {
    const elemId = ctx.request.params.id;
    const element = elements.find(elem => elemId === element.id);
    if (element) {
        ctx.response.body = element;
        ctx.response.status = 200; // ok
    } else {
        ctx.response.body = { issue: [{ warning: `element with id ${elemId} not found` }] };
        ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createElement = async (ctx) => {
    const element = ctx.request.body;
    if (!element.name) {
        ctx.response.body = { issue: [{ error: 'Name is missing' }] };
        ctx.response.status = 400;
        return;
    }
    element.id = `${parseInt(lastId) + 1}`;
    lastId = element.id;
    element.date = Date.now();
    element.value = 10;
    elements.push(element);
    ctx.response.body = element;
    ctx.response.status = 201;
    broadcast({ event: 'created', payload: { element } });
};

router.post('/element', async (ctx) => {
    await createElement(ctx);
});

router.put('/element/:id', async (ctx) => {
    const id = ctx.params.id;
    const element = ctx.request.body;
    const elemId = element.id;
    if (elemId && id !== element.id) {
        ctx.response.body = { issue: [{ error: `Param id and body id should be the same` }] };
        ctx.response.status = 400;
        return;
    }
    if (!elemId) {
        await createElement(ctx);
        return;
    }
    const index = elements.findIndex(element => element.id === id);
    if (index === -1) {
        ctx.response.body = { issue: [{ error: `element with id ${id} not found` }] };
        ctx.response.status = 400;
        return;
    }
    const elemValue = parseInt(ctx.request.get('ETag')) || element.value;
    elements[index] = element;
    lastUpdated = new Date();
    ctx.response.body = element;
    ctx.response.status = 200;
    broadcast({ event: 'updated', payload: { element } });
});

router.del('/element/:id', ctx => {
    const id = ctx.params.id;
    const index = elements.findIndex(element => id === element.id);
    if (index !== -1) {
        const element = elements[index];
        elements.splice(index, 1);
        lastUpdated = new Date();
        broadcast({ event: 'deleted', payload: { element } });
    }
    ctx.response.status = 204;
});

// setInterval(() => {
//     lastUpdated = new Date();
//     lastId = `${parseInt(lastId) + 1}`;
//     const element = new Element({ id: lastId, name: `element ${lastId}`, date: lastUpdated, value: 10 });
//     //elements.push(element);
//     console.log(`
//    ${element.name}`);
//     broadcast({ event: 'created', payload: { element } });
// }, 15000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
