"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maybe_1 = require("folktale/maybe");
const ramda_1 = require("ramda");
const db_1 = require("../../../../../utils/db");
const errorHandling_1 = require("../../../../../errorHandling");
const sql_1 = require("./sql");
const transformResult_1 = require("./transformResult");
exports.default = {
    get: (pg) => (id) => pg
        .any(sql_1.default.get(id))
        .map(transformResult_1.transformResult)
        .map(ramda_1.head)
        .map(maybe_1.fromNullable)
        .mapRejected(errorHandling_1.addMeta({
        request: 'transactions.invokeScript.get',
        params: id,
    })),
    mget: (pg) => (ids) => pg
        .any(sql_1.default.mget(ids))
        .map(transformResult_1.transformResult)
        .map(db_1.matchRequestsResults(ramda_1.propEq('id'), ids))
        .mapRejected(errorHandling_1.addMeta({
        request: 'transactions.invokeScript.mget',
        params: ids,
    })),
    search: (pg) => (filters) => pg
        .any(sql_1.default.search(filters))
        .map(transformResult_1.transformResult)
        .mapRejected(errorHandling_1.addMeta({
        request: 'transactions.invokeScript.search',
        params: filters,
    })),
};
//# sourceMappingURL=index.js.map