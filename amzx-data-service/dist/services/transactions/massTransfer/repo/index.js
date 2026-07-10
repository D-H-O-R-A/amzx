"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("folktale/result");
const createResolver_1 = require("../../../_common/createResolver");
const validation_1 = require("../../../_common/presets/validation");
const transformResult_1 = require("../../../_common/presets/pg/getById/transformResult");
const transformResult_2 = require("../../../_common/presets/pg/mgetByIds/transformResult");
const transformInput_1 = require("../../../_common/presets/pg/search/transformInput");
const transformResults_1 = require("../../../_common/presets/pg/search/transformResults");
const cursor_1 = require("../../_common/cursor");
const pg_1 = require("./pg");
const schema_1 = require("./schema");
const transformTxInfo = require("./transformTxInfo");
const createServiceName = (type) => `transactions.massTransfer.${type}`;
exports.default = ({ drivers: { pg }, emitEvent, }) => {
    return {
        get: createResolver_1.get({
            transformInput: result_1.Ok,
            transformResult: transformResult_1.transformResults(transformTxInfo),
            validateResult: validation_1.validateResult(schema_1.result, createServiceName('get')),
            getData: pg_1.default.get(pg),
            emitEvent,
        }),
        mget: createResolver_1.mget({
            transformInput: result_1.Ok,
            transformResult: transformResult_2.transformResults(transformTxInfo),
            validateResult: validation_1.validateResult(schema_1.result, createServiceName('mget')),
            getData: pg_1.default.mget(pg),
            emitEvent,
        }),
        search: createResolver_1.search({
            transformInput: transformInput_1.transformInput(cursor_1.deserialize),
            transformResult: transformResults_1.transformResults(transformTxInfo, cursor_1.serialize),
            validateResult: validation_1.validateResult(schema_1.result, createServiceName('search')),
            getData: pg_1.default.search(pg),
            emitEvent,
        }),
    };
};
//# sourceMappingURL=index.js.map