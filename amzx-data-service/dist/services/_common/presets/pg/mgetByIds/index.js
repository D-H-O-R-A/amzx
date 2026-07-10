"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const createResolver_1 = require("../../../createResolver");
const validation_1 = require("../../validation");
const transformResult_1 = require("./transformResult");
const pg_1 = require("./pg");
exports.mgetByIdsPreset = ({ name, sql, resultSchema, matchRequestResult, transformResult, }) => ({ pg, emitEvent }) => createResolver_1.mget({
    transformInput: result_1.Ok,
    transformResult: transformResult_1.transformResults(transformResult),
    validateResult: validation_1.validateResult(resultSchema, name),
    getData: pg_1.getData({
        name,
        sql,
        matchRequestResult,
        pg,
    }),
    emitEvent,
});
//# sourceMappingURL=index.js.map