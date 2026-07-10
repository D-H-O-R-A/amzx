"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createResolver_1 = require("../../../createResolver");
const validation_1 = require("../../validation");
const transformInput_1 = require("./transformInput");
const transformResults_1 = require("./transformResults");
const pg_1 = require("./pg");
exports.searchPreset = ({ name, sql, resultSchema, transformResult, cursorSerialization, }) => ({ pg, emitEvent, }) => createResolver_1.search({
    transformInput: transformInput_1.transformInput(cursorSerialization.deserialize),
    transformResult: transformResults_1.transformResults(transformResult, cursorSerialization.serialize),
    validateResult: validation_1.validateResult(resultSchema, name),
    getData: pg_1.getData({
        name,
        sql,
        pg,
    }),
    emitEvent,
});
//# sourceMappingURL=index.js.map