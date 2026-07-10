"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const errorHandling_1 = require("../../errorHandling");
const types_1 = require("../../types");
const _common_1 = require("../_common");
const filters_1 = require("../_common/filters");
const serialize_1 = require("../_common/serialize");
const postToGet_1 = require("../_common/postToGet");
exports.isMgetRequest = (req) => typeof req === 'object' && req !== null && 'ids' in req;
exports.parseGet = ({ params, }) => {
    if (params && params.id) {
        return result_1.Ok({
            id: params.id,
        });
    }
    else {
        return result_1.Error(new errorHandling_1.ParseError(new Error('TransactionId is required')));
    }
};
exports.parseMgetOrSearch = (customFilters) => ({ query, }) => {
    if (!query) {
        return result_1.Error(new errorHandling_1.ParseError(new Error('Query is empty')));
    }
    return filters_1.parseFilterValues(customFilters)(query).map(fValues => {
        if (exports.isMgetRequest(fValues)) {
            return fValues;
        }
        else {
            return filters_1.withDefaults(fValues);
        }
    });
};
exports.createTransactionHttpHandlers = (router, prefix, service, parseRequest) => {
    const mgetOrSearchHandler = _common_1.createHttpHandler((req, lsnFormat) => exports.isMgetRequest(req)
        ? service
            .mget(req)
            .map(serialize_1.mget(types_1.transaction, lsnFormat))
        : service
            .search(req)
            .map(serialize_1.search(types_1.transaction, lsnFormat)), parseRequest.mgetOrSearch);
    return router
        .get(`${prefix}/:id`, _common_1.createHttpHandler((req, lsnFormat) => service
        .get(req)
        .map(serialize_1.get(types_1.transaction, lsnFormat)), parseRequest.get))
        .get(prefix, mgetOrSearchHandler)
        .post(prefix, postToGet_1.postToGet(mgetOrSearchHandler));
};
//# sourceMappingURL=_common.js.map