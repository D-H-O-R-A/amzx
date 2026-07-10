"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Maybe = require("folktale/maybe");
const ramda_1 = require("ramda");
const errorHandling_1 = require("../../../../../errorHandling");
const index_1 = require("../../../../../utils/db/index");
const transformResult = require("./transformResult");
const sql_1 = require("./sql");
exports.pg = {
    get: (pg) => (id) => pg
        .any(sql_1.default.get(id))
        .map(transformResult)
        .map(ramda_1.head)
        .map(Maybe.fromNullable)
        .mapRejected(errorHandling_1.addMeta({ request: 'transactions.data.get', params: id })),
    mget: (pg) => (ids) => pg
        .any(sql_1.default.mget(ids))
        .map(transformResult)
        .map(index_1.matchRequestsResults(ramda_1.propEq('id'), ids))
        .mapRejected(errorHandling_1.addMeta({ request: 'transactions.data.mget', params: ids })),
    search: (pg) => (filters) => pg
        .any(sql_1.default.search(filters))
        .map(transformResult)
        .mapRejected(errorHandling_1.addMeta({
        request: 'transactions.data.search',
        params: filters,
    })),
};
//# sourceMappingURL=index.js.map