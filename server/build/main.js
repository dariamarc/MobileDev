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

const Koa = __webpack_require__(/*! koa */ "koa");

const app = new Koa();

const server = __webpack_require__(/*! http */ "http").createServer(app.callback());

const WebSocket = __webpack_require__(/*! ws */ "ws");

const wss = new WebSocket.Server({
  server
});

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
    year
  }) {
    this.id = id;
    this.name = name;
    this.director = director;
    this.year = year;
  }

}

const movies = [];
movies.push(new Movie({
  id: '1',
  name: 'The Shawshank Redemption',
  director: 'Frank Darabont',
  year: 1994
}));
movies.push(new Movie({
  id: '2',
  name: 'The Godfather',
  director: 'Francis Ford Coppola',
  year: 1972
}));
movies.push(new Movie({
  id: '3',
  name: 'Pulp Fiction',
  director: 'Quentin Tarantino',
  year: 1994
}));
const router = new Router();
router.get('/movies', ctx => {
  const ifModifiedSince = ctx.request.get('If-Modified-Since');

  if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
    ctx.response.status = 304; // NOT MODIFIED

    return;
  }

  ctx.response.body = movies;
  ctx.response.status = 200;
});
router.get('movies/:id', async ctx => {
  const movieID = ctx.request.params.id;
  const movie = movies.find(movie => movieID === movie.id);

  if (movie) {
    ctx.response.body = movie;
    ctx.response.status = 200;
  } else {
    ctx.response.body = {
      issue: [{
        warning: `The movie with id ${movieID} was not found!`
      }]
    };
    ctx.response.status = 404;
  }
});
let lastInsertedIdx = 0;
const moviesToAdd = [new Movie({
  id: '4',
  name: 'The Dark Night',
  director: 'Cristopher Nolan',
  year: 2008
}), new Movie({
  id: '5',
  name: '12 Angry Men',
  director: 'Sidney Lumet',
  year: 1957
}), new Movie({
  id: '6',
  name: 'Fight Club',
  director: 'David Fincher',
  year: 1999
})];

const broadcast = data => wss.clients.forEach(client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
});

setInterval(() => {
  let movie = moviesToAdd[lastInsertedIdx];
  movies.push(movie);
  lastInsertedIdx = lastInsertedIdx + 1;
  if (lastInsertedIdx >= moviesToAdd.length) lastInsertedIdx = 0;
  broadcast({
    event: 'movie added',
    payload: {
      movies: movies
    }
  });
}, 10000);
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

module.exports = __webpack_require__(/*! C:\Users\marc_\Documents\MobileDev\server\src/index.js */"./src/index.js");


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