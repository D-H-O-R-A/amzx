"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const _common_1 = require("../../_common");
const serialize_1 = require("../../_common/serialize");
const pairs_1 = require("../../pairs");
const parse_1 = require("./parse");
const postToGet_1 = require("../../_common/postToGet");
const subrouter = new Router();
const mgetOrSearchHttpHandler = (pairsService) => _common_1.createHttpHandler((req, lsnFormat) => pairs_1.isMgetRequest(req)
    ? pairsService
        .mget(req)
        .map(serialize_1.mget(pairs_1.pairWithData, lsnFormat))
    : pairsService
        .search(req)
        .map(serialize_1.search(pairs_1.pairWithData, lsnFormat)), parse_1.mgetOrSearch);
exports.default = (pairsService) => subrouter
    .get('/pairs/:amountAsset/:priceAsset', _common_1.createHttpHandler((req, lsnFormat) => pairsService
    .get(req)
    .map(serialize_1.get(pairs_1.pairWithData, lsnFormat)), parse_1.get))
    .get('/pairs', mgetOrSearchHttpHandler(pairsService))
    .post('/pairs', postToGet_1.postToGet(mgetOrSearchHttpHandler(pairsService)));
//# sourceMappingURL=index.js.map