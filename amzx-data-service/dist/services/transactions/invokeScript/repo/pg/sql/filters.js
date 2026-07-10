"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pointFreeKnex = require("../../../../../../utils/db/knex");
const commonFilters = require("../../../../_common/sql/filters");
const sql_1 = require("../../../../_common/sql");
const byDapp = (dappAddressOrAlias) => (q) => q
    .clone()
    .whereRaw(`dapp_address = coalesce((select sender from txs_10 where alias = '${dappAddressOrAlias}' limit 1), '${dappAddressOrAlias}')`);
const byTimeStamp = sql_1.createByTimeStamp('txs_16');
const byBlockTimeStamp = sql_1.createByBlockTimeStamp('txs_16');
exports.default = Object.assign(Object.assign({}, commonFilters), { dapp: byDapp, function: pointFreeKnex.where('function_name'), timeStart: byTimeStamp('>='), timeEnd: byTimeStamp('<='), blockTimeStart: byBlockTimeStamp('>='), blockTimeEnd: byBlockTimeStamp('<=') });
//# sourceMappingURL=filters.js.map