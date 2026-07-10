"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const getById_1 = require("../../../_common/presets/pg/getById");
const mgetByIds_1 = require("../../../_common/presets/pg/mgetByIds");
const search_1 = require("../../../_common/presets/pg/search");
const cursor_1 = require("../../_common/cursor");
const transformTxInfo_1 = require("./transformTxInfo");
const schema_1 = require("./schema");
const sql = require("./sql");
exports.default = ({ drivers: { pg }, emitEvent, }) => {
    return {
        get: getById_1.getByIdPreset({
            name: 'transactions.updateAssetInfo.get',
            sql: sql.get,
            resultSchema: schema_1.result,
            transformResult: transformTxInfo_1.default,
        })({
            pg,
            emitEvent,
        }),
        mget: mgetByIds_1.mgetByIdsPreset({
            name: 'transactions.updateAssetInfo.mget',
            matchRequestResult: ramda_1.propEq('id'),
            sql: sql.mget,
            resultSchema: schema_1.result,
            transformResult: transformTxInfo_1.default,
        })({
            pg,
            emitEvent,
        }),
        search: search_1.searchPreset({
            name: 'transactions.updateAssetInfo.search',
            sql: sql.search,
            resultSchema: schema_1.result,
            transformResult: transformTxInfo_1.default,
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