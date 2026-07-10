"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const ramda_1 = require("ramda");
const types_1 = require("../../types");
const _common_1 = require("../_common");
const serialize_1 = require("../_common/serialize");
const postToGet_1 = require("../_common/postToGet");
const parse_1 = require("./parse");
const subrouter = new Router();
exports.isMgetRequest = (req) => 'pairs' in req && Array.isArray(req.pairs);
exports.pairWithData = (p) => p
    ? types_1.pair(ramda_1.omit(['amountAsset', 'priceAsset'], p), {
        amountAsset: p.amountAsset,
        priceAsset: p.priceAsset,
    })
    : types_1.pair(null, null);
const mgetOrSearchHttpHandler = (pairsService) => _common_1.createHttpHandler((req, lsnFormat) => exports.isMgetRequest(req)
    ? pairsService
        .mget(req)
        .map(serialize_1.mget(exports.pairWithData, lsnFormat))
    : pairsService
        .search(req)
        .map(serialize_1.search(exports.pairWithData, lsnFormat)), parse_1.mgetOrSearch);
exports.default = (pairsService) => subrouter
    .get('/pairs/:amountAsset/:priceAsset', _common_1.createHttpHandler((req, lsnFormat) => pairsService
    .get(req)
    .map(serialize_1.get(exports.pairWithData, lsnFormat)), parse_1.get))
    .get('/pairs', mgetOrSearchHttpHandler(pairsService))
    .post('/pairs', postToGet_1.postToGet(mgetOrSearchHttpHandler(pairsService)));
//# sourceMappingURL=index.js.map