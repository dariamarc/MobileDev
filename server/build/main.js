require('source-map-support/register');
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

//using require to include modules
//Koa - web framework
const Koa = __webpack_require__(/*! koa */ "koa");

const app = new Koa(); //http module

const server = __webpack_require__(/*! http */ "http").createServer(app.callback());

const WebSocket = __webpack_require__(/*! ws */ "ws");

const wss = new WebSocket.Server({
  server
}); //for routing

const Router = __webpack_require__(/*! koa-router */ "koa-router");

const cors = __webpack_require__(/*! koa-cors */ "koa-cors");

const bodyparser = __webpack_require__(/*! koa-bodyparser */ "koa-bodyparser");

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = {
      issue: [{
        error: err.message || 'Unexpected error'
      }]
    };
    ctx.response.status = 500;
  }
});

class Movie {
  constructor({
    id,
    name,
    director,
    date
  }) {
    this.id = id;
    this.name = name;
    this.director = director;
    this.date = date;
  }

}

const movies = [];
movies.push(new Movie({
  id: 1,
  name: 'The Shawshank Redemption',
  director: 'Frank Darabont',
  date: new Date(1994, 9, 14)
}));
movies.push(new Movie({
  id: 2,
  name: 'The Godfather',
  director: 'Francis Ford Coppola',
  date: new Date(1972, 2, 24)
}));
movies.push(new Movie({
  id: 3,
  name: 'Pulp Fiction',
  director: 'Quentin Tarantino',
  date: new Date(1994, 9, 14)
}));
let lastUpdated = movies[movies.length - 1].date;
let lastId = movies[movies.length - 1].id;
const pageSize = 10;

const broadcast = data => wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
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
  const sortedItems = movies //.filter(element => name ? element.name.indexOf(name) !== -1 : true)
  .sort((n1, n2) => -(n1.date.getTime() - n2.date.getTime()));
  const offset = (page - 1) * pageSize;
  ctx.response.body = movies;
  ctx.response.status = 200;
});
router.get('/movie/:id', async ctx => {
  const elemId = ctx.request.params.id;
  const element = movies.find(elem => elemId === element.id);

  if (element) {
    ctx.response.body = element;
    ctx.response.status = 200; // ok
  } else {
    ctx.response.body = {
      issue: [{
        warning: `movie with id ${elemId} not found`
      }]
    };
    ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
  }
});

const createMovie = async ctx => {
  const element = ctx.request.body;

  if (!element.name) {
    ctx.response.body = {
      issue: [{
        error: 'Name is missing'
      }]
    };
    ctx.response.status = 400;
    return;
  }

  element.id = `${parseInt(lastId) + 1}`;
  lastId = element.id;
  movies.push(element);
  ctx.response.body = element;
  ctx.response.status = 201;
  broadcast({
    event: 'created',
    payload: {
      element
    }
  });
};

router.post('/movie', async ctx => {
  await createMovie(ctx);
});
router.put('/movie/:id', async ctx => {
  const id = ctx.params.id;
  const element = ctx.request.body;
  const elemId = element.id;

  if (elemId && id !== element.id) {
    ctx.response.body = {
      issue: [{
        error: `Param id and body id should be the same`
      }]
    };
    ctx.response.status = 400;
    return;
  }

  if (!elemId) {
    await createMovie(ctx);
    return;
  }

  const index = movies.findIndex(element => element.id === id);

  if (index === -1) {
    ctx.response.body = {
      issue: [{
        error: `element with id ${id} not found`
      }]
    };
    ctx.response.status = 400;
    return;
  }

  movies[index] = element;
  lastUpdated = new Date();
  ctx.response.body = element;
  ctx.response.status = 200;
  broadcast({
    event: 'updated',
    payload: {
      element
    }
  });
});
router.del('/movie/:id', ctx => {
  const id = ctx.params.id;
  const index = movies.findIndex(element => id === element.id);

  if (index !== -1) {
    const element = movies[index];
    movies.splice(index, 1);
    lastUpdated = new Date();
    broadcast({
      event: 'deleted',
      payload: {
        element
      }
    });
  }

  ctx.response.status = 204;
});
setInterval(() => {
  lastUpdated = new Date();
  lastId = `${parseInt(lastId) + 1}`;
  const movie = new Movie({
    id: lastId,
    name: `movie ${lastId}`,
    date: lastUpdated,
    director: `director ${lastId}`
  }); //movies.push(movie);
  //console.log(`
  //${movie.name}`);
  //broadcast({ event: 'created', payload: { movie } });
}, 15000);
app.use(router.routes());
app.use(router.allowedMethods());
server.listen(3000);

/***/ }),

/***/ 0:
/*!****************************!*\
  !*** multi ./src/index.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\marc_\Documents\Mobile dev\server\src/index.js */"./src/index.js");


/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),

/***/ "koa":
/*!**********************!*\
  !*** external "koa" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa");

/***/ }),

/***/ "koa-bodyparser":
/*!*********************************!*\
  !*** external "koa-bodyparser" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa-bodyparser");

/***/ }),

/***/ "koa-cors":
/*!***************************!*\
  !*** external "koa-cors" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa-cors");

/***/ }),

/***/ "koa-router":
/*!*****************************!*\
  !*** external "koa-router" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("koa-router");

/***/ }),

/***/ "ws":
/*!*********************!*\
  !*** external "ws" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ws");

/***/ })

/******/ });
//# sourceMappingURL=main.map