"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("../../../_common/sql");
const commonFilters = require("../../../_common/sql/filters");
const commonFiltersOrder = require("../../../_common/sql/filtersOrder");
const byTimeStamp = sql_1.createByTimeStamp('txs');
const byBlockTimesStamp = sql_1.createByBlockTimeStamp('txs');
exports.filters = Object.assign(Object.assign({}, commonFilters), { timeStart: byTimeStamp('>='), timeEnd: byTimeStamp('<='), blockTimeStart: byBlockTimesStamp('>='), blockTimeEnd: byBlockTimesStamp('<=') });
exports.filtersOrder = [...commonFiltersOrder, 'timeStart', 'timeEnd'];
//# sourceMappingURL=filters.js.map