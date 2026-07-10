"use strict";
const { createByTimeStamp, createByBlockTimeStamp } = require('../../../_common/sql');
const commonFilters = require('../../../_common/sql/filters');
const commonFiltersOrder = require('../../../_common/sql/filtersOrder');
const byTimeStamp = createByTimeStamp('txs_3');
const byBlockTimeStamp = createByBlockTimeStamp('txs_3');
module.exports = {
    filters: Object.assign(Object.assign({}, commonFilters), { timeStart: byTimeStamp('>='), timeEnd: byTimeStamp('<='), blockTimeStart: byBlockTimeStamp('>='), blockTimeEnd: byBlockTimeStamp('<=') }),
    filtersOrder: [...commonFiltersOrder, 'timeStart', 'timeEnd', 'script', 'assetId'],
};
//# sourceMappingURL=filters.js.map