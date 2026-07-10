"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const types_1 = require("../../types");
const _common_1 = require("../_common");
const postToGet_1 = require("../_common/postToGet");
const serialize_1 = require("../_common/serialize");
const parse_1 = require("./parse");
const subrouter = new Router();
const isMgetRequest = (req) => 'ids' in req && Array.isArray(req.ids);
const mgetOrSearchHandler = (assetsService) => _common_1.createHttpHandler((req, lsnFormat) => isMgetRequest(req)
    ? assetsService.mget(req).map(serialize_1.mget(types_1.asset, lsnFormat))
    : assetsService.search(req).map(serialize_1.search(types_1.asset, lsnFormat)), parse_1.mgetOrSearch);
exports.default = (assetsService) => {
    return subrouter
        .get('/assets/:id', _common_1.createHttpHandler((req, lsnFormat) => assetsService.get(req).map(serialize_1.get(types_1.asset, lsnFormat)), parse_1.get))
        .get('/assets', mgetOrSearchHandler(assetsService))
        .post('/assets', postToGet_1.postToGet(mgetOrSearchHandler(assetsService)));
};
//# sourceMappingURL=index.js.map