"use strict";
const { createByTimeStamp, createByBlockTimeStamp } = require('../../../_common/sql');
const commonFilters = require('../../../_common/sql/filters');
const commonFiltersOrder = require('../../../_common/sql/filtersOrder');
const byTimeStamp = createByTimeStamp('txs_6');
const byBlockTimeStamp = createByBlockTimeStamp('txs_6');
module.exports = {
    filters: Object.assign(Object.assign({}, commonFilters), { timeStart: byTimeStamp('>='), timeEnd: byTimeStamp('<='), blockTimeStart: byBlockTimeStamp('>='), blockTimeEnd: byBlockTimeStamp('<=') }),
    filtersOrder: [...commonFiltersOrder, 'timeStart', 'timeEnd', 'assetId'],
};
//# sourceMappingURL=filters.js.map