"use strict";
const { without, omit } = require('ramda');
const { createByTimeStamp, createByBlockTimeStamp } = require('../../../_common/sql');
const commonFilters = require('../../../_common/sql/filters');
const commonFiltersOrder = require('../../../_common/sql/filtersOrder');
const byTimeStamp = createByTimeStamp('txs_1');
const byBlockTimeStamp = createByBlockTimeStamp('txs_1');
module.exports = {
    filters: omit(['sender'], Object.assign(Object.assign({}, commonFilters), { timeStart: byTimeStamp('>='), timeEnd: byTimeStamp('<='), blockTimeStart: byBlockTimeStamp('>='), blockTimeEnd: byBlockTimeStamp('<=') })),
    filtersOrder: without('sender', [
        ...commonFiltersOrder,
        'timeStart',
        'timeEnd',
        'recipient',
    ]),
};
//# sourceMappingURL=filters.js.map