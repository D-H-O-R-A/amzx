"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const types_1 = require("../../../types");
const concatAll_1 = require("../../../utils/fp/concatAll");
const date_1 = require("../../../utils/date");
const candleMonoid_1 = require("./candleMonoid");
const truncToMinutes = date_1.trunc(types_1.Unit.Minute);
exports.transformCandle = (candleInterval) => ([time, c]) => {
    const timeClose = new Date(new Date(time).valueOf() + candleInterval.length - 1);
    return Object.assign(Object.assign({}, ramda_1.map((v) => (c.txs_count === 0 ? null : v), {
        maxHeight: c.max_height,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        quoteVolume: c.quote_volume,
        weightedAveragePrice: c.weighted_average_price,
    })), { time: new Date(time), timeClose, txsCount: c.txs_count });
};
/** addMissingCandles :: Interval -> Date -> Date
 * -> Map String CandleDbResponse[]-> Map String CandleDbResponse[] */
exports.addMissingCandles = ramda_1.curry((interval, timeStart, timeEnd) => (candlesGroupedByTime) => {
    const end = timeEnd;
    const res = ramda_1.merge({}, candlesGroupedByTime);
    for (let it = date_1.ceil(interval, timeStart); it <= end; it = date_1.floor(interval, date_1.add(interval, it))) {
        const cur = truncToMinutes(it);
        if (!res[cur]) {
            res[cur] = [];
        }
    }
    return res;
});
exports.transformResults = (result, request) => ramda_1.compose((items) => ({
    items: items,
    isLastPage: false,
}), ramda_1.map(exports.transformCandle(request.interval)), ramda_1.sort((a, b) => new Date(a[0]).valueOf() - new Date(b[0]).valueOf()), ramda_1.toPairs, ramda_1.map(concatAll_1.concatAll(candleMonoid_1.candleMonoid)), exports.addMissingCandles(request.interval, request.timeStart, request.timeEnd), ramda_1.groupBy((candle) => truncToMinutes(date_1.floor(request.interval, candle.time_start))))(result);
exports.transformLastResult = (result, request) => ramda_1.compose((items) => ({
    items: items,
    isLastPage: false,
}), ramda_1.map(exports.transformCandle(request.interval)), ramda_1.toPairs, ramda_1.map(concatAll_1.concatAll(candleMonoid_1.candleMonoid)), ramda_1.groupBy((candle) => truncToMinutes(date_1.floor(request.interval, candle.time_start))))(result);
//# sourceMappingURL=transformResults.js.map