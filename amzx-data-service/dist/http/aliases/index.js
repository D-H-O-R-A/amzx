"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const types_1 = require("../../types");
const _common_1 = require("../_common");
const postToGet_1 = require("../_common/postToGet");
const serialize_1 = require("../_common/serialize");
const parse_1 = require("./parse");
const subrouter = new Router();
const isMgetRequest = (req) => 'aliases' in req && Array.isArray(req.aliases);
const mgetOrSearchHandler = (aliasesService) => _common_1.createHttpHandler(req => isMgetRequest(req)
    ? aliasesService.mget(req).map(serialize_1.mget(types_1.alias))
    : aliasesService.search(req).map(serialize_1.search(types_1.alias)), parse_1.mgetOrSearch);
exports.default = (aliasesService) => {
    return subrouter
        .get('/aliases/:id', _common_1.createHttpHandler(req => aliasesService.get(req).map(serialize_1.get(types_1.alias)), parse_1.get))
        .get('/aliases', mgetOrSearchHandler(aliasesService))
        .post('/aliases', postToGet_1.postToGet(mgetOrSearchHandler(aliasesService)));
};
//# sourceMappingURL=index.js.map