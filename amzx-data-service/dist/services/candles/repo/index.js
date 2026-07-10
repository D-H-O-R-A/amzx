"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const sql_1 = require("./sql");
const schema_1 = require("./schema");
const transformResults_1 = require("./transformResults");
const validation_1 = require("../../_common/presets/validation");
const pg_1 = require("../../_common/presets/pg/search/pg");
const createResolver_1 = require("../../_common/createResolver");
exports.default = ({ drivers: { pg }, emitEvent }) => {
    const SERVICE__SEARCH__NAME = 'candles.search';
    const SERVICE__SEARCH_LAST__NAME = 'candles.search_last';
    return {
        search: createResolver_1.search({
            transformInput: result_1.Ok,
            transformResult: transformResults_1.transformResults,
            validateResult: validation_1.validateResult(schema_1.output, SERVICE__SEARCH__NAME),
            getData: pg_1.getData({
                name: SERVICE__SEARCH__NAME,
                sql: sql_1.sql.search,
                pg,
            }),
            emitEvent,
        }),
        searchLast: createResolver_1.search({
            transformInput: result_1.Ok,
            transformResult: transformResults_1.transformLastResult,
            validateResult: validation_1.validateResult(schema_1.output, SERVICE__SEARCH_LAST__NAME),
            getData: pg_1.getData({
                name: SERVICE__SEARCH_LAST__NAME,
                sql: sql_1.sql.searchLast,
                pg,
            }),
            emitEvent,
        }),
    };
};
//# sourceMappingURL=index.js.map