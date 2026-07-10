"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const getById_1 = require("../../../_common/presets/pg/getById");
const mgetByIds_1 = require("../../../_common/presets/pg/mgetByIds");
const search_1 = require("../../../_common/presets/pg/search");
const cursor_1 = require("../../_common/cursor");
const schema_1 = require("./schema");
const sql_1 = require("./sql");
const transformTxInfo_1 = require("./transformTxInfo");
exports.default = ({ drivers: { pg }, emitEvent, }) => {
    return {
        get: getById_1.getByIdPreset({
            name: 'transactions.all.commonData.get',
            sql: sql_1.default.get,
            resultSchema: schema_1.result,
            transformResult: transformTxInfo_1.transformTxInfo,
        })({
            pg,
            emitEvent,
        }),
        mget: mgetByIds_1.mgetByIdsPreset({
            name: 'transactions.all.commonData.mget',
            matchRequestResult: ramda_1.propEq('id'),
            sql: sql_1.default.mget,
            resultSchema: schema_1.result,
            transformResult: transformTxInfo_1.transformTxInfo,
        })({
            pg,
            emitEvent,
        }),
        search: search_1.searchPreset({
            name: 'transactions.all.commonData.search',
            sql: sql_1.default.search,
            resultSchema: schema_1.result,
            transformResult: transformTxInfo_1.transformTxInfo,
            cursorSerialization: {
                serialize: cursor_1.serialize,
                deserialize: cursor_1.deserialize,
            },
        })({
            pg,
            emitEvent,
        }),
    };
};
//# sourceMappingURL=index.js.map