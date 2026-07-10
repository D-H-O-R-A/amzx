"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const getById_1 = require("../../_common/presets/pg/getById");
const mgetByIds_1 = require("../../_common/presets/pg/mgetByIds");
const search_1 = require("../../_common/presets/pg/search");
const cursor_1 = require("./cursor");
const sql_1 = require("./data/sql");
const transformResult_1 = require("./data/transformResult");
const schema_1 = require("./schema");
exports.default = ({ drivers, emitEvent, }) => {
    return {
        get: getById_1.getByIdPreset({
            name: 'aliases.get',
            sql: sql_1.default.get,
            resultSchema: schema_1.output,
            transformResult: transformResult_1.transformDbResponse,
        })({
            pg: drivers.pg,
            emitEvent: emitEvent,
        }),
        mget: mgetByIds_1.mgetByIdsPreset({
            name: 'aliases.mget',
            sql: sql_1.default.mget,
            resultSchema: schema_1.output,
            transformResult: transformResult_1.transformDbResponse,
            matchRequestResult: ramda_1.propEq('alias'),
        })({
            pg: drivers.pg,
            emitEvent: emitEvent,
        }),
        search: search_1.searchPreset({
            name: 'aliases.search',
            sql: sql_1.default.search,
            resultSchema: schema_1.output,
            transformResult: transformResult_1.transformDbResponse,
            cursorSerialization: {
                serialize: cursor_1.serialize,
                deserialize: cursor_1.deserialize,
            },
        })({
            pg: drivers.pg,
            emitEvent: emitEvent,
        }),
    };
};
//# sourceMappingURL=index.js.map