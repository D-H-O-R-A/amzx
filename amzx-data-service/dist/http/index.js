"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const router = new Router();
const version_1 = require("./version");
const root_1 = require("./root");
const aliases_1 = require("./aliases");
const assets_1 = require("./assets");
const notFound_1 = require("./notFound");
const candles_1 = require("./candles");
const matchers_1 = require("./matchers");
const pairs_1 = require("./pairs");
const transactions_1 = require("./transactions");
exports.default = (serviceMesh) => router
    .use(aliases_1.default(serviceMesh.aliases).routes())
    .use(assets_1.default(serviceMesh.assets).routes())
    .use(candles_1.default(serviceMesh.candles).routes())
    .use(matchers_1.default(serviceMesh.matchers).routes())
    .use(pairs_1.default(serviceMesh.pairs).routes())
    .use(transactions_1.default(serviceMesh.transactions).routes())
    .get('/version', version_1.default)
    .get('/', root_1.default)
    .get('*', notFound_1.default);
//# sourceMappingURL=index.js.map