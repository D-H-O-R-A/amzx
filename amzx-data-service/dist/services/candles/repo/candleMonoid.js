"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_entities_1 = require("@waves/data-entities");
// common
exports.leftNotNullMonoid = {
    concat: (a, b) => a || b,
    empty: null,
};
exports.rightNotNullMonoid = {
    concat: (a, b) => b || a,
    empty: null,
};
exports.sumMonoid = {
    concat: (a, b) => a + b,
    empty: 0,
};
exports.bigNumberPlusMonoid = {
    concat: (a, b) => a.plus(b),
    empty: new data_entities_1.BigNumber(0),
};
exports.maxMonoid = {
    concat: (a, b) => Math.max(a, b),
    empty: 0,
};
exports.bigNumberMinMonoid = {
    concat: (a, b) => a.comparedTo(b) === 1 ? b : a,
    empty: new data_entities_1.BigNumber(+Infinity),
};
exports.bigNumberMaxMonoid = {
    concat: (a, b) => a.comparedTo(b) === 1 ? a : b,
    empty: new data_entities_1.BigNumber(-Infinity),
};
// individual
exports.weightedAveragePriceMonoid = {
    concat: (a, b) => a.quote_volume.plus(b.quote_volume).dividedBy(a.volume.plus(b.volume)),
    empty: new data_entities_1.BigNumber(0),
};
exports.candleMonoid = {
    concat: (a, b) => ({
        time_start: exports.leftNotNullMonoid.concat(a.time_start, b.time_start),
        open: exports.leftNotNullMonoid.concat(a.open, b.open),
        close: exports.rightNotNullMonoid.concat(a.close, b.close),
        high: exports.bigNumberMaxMonoid.concat(a.high, b.high),
        low: exports.bigNumberMinMonoid.concat(a.low, b.low),
        volume: exports.bigNumberPlusMonoid.concat(a.volume, b.volume),
        quote_volume: exports.bigNumberPlusMonoid.concat(a.quote_volume, b.quote_volume),
        weighted_average_price: exports.weightedAveragePriceMonoid.concat(a, b),
        max_height: exports.maxMonoid.concat(a.max_height, b.max_height),
        txs_count: exports.sumMonoid.concat(a.txs_count, b.txs_count),
    }),
    empty: {
        time_start: exports.leftNotNullMonoid.empty,
        open: exports.leftNotNullMonoid.empty,
        close: exports.rightNotNullMonoid.empty,
        high: exports.bigNumberMaxMonoid.empty,
        low: exports.bigNumberMinMonoid.empty,
        volume: exports.bigNumberPlusMonoid.empty,
        quote_volume: exports.bigNumberPlusMonoid.empty,
        weighted_average_price: exports.weightedAveragePriceMonoid.empty,
        max_height: exports.maxMonoid.empty,
        txs_count: exports.sumMonoid.empty,
    },
};
//# sourceMappingURL=candleMonoid.js.map