"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const types_1 = require("../../../../types");
const interval_1 = require("../../../../utils/interval");
const utils_1 = require("./utils");
const pg = knex({ client: 'pg' });
const FIELDS = {
    time_start: 'c.time_start',
    amount_asset_id: 'c.amount_asset_id',
    price_asset_id: 'c.price_asset_id',
    low: pg.raw('(c.low)::numeric'),
    high: pg.raw('(c.high)::numeric'),
    volume: pg.raw('(c.volume)::numeric'),
    quote_volume: pg.raw('(c.quote_volume)::numeric'),
    max_height: 'c.max_height',
    txs_count: 'c.txs_count',
    weighted_average_price: pg.raw('(c.weighted_average_price)::numeric'),
    open: pg.raw('(c.open)::numeric'),
    close: pg.raw('(c.close)::numeric'),
    interval: 'c.interval',
};
const DIVIDERS = [
    types_1.CandleInterval.Minute1,
    types_1.CandleInterval.Minute5,
    types_1.CandleInterval.Minute15,
    types_1.CandleInterval.Minute30,
    types_1.CandleInterval.Hour1,
    types_1.CandleInterval.Hour2,
    types_1.CandleInterval.Hour3,
    types_1.CandleInterval.Hour4,
    types_1.CandleInterval.Hour6,
    types_1.CandleInterval.Hour12,
    types_1.CandleInterval.Day1,
    types_1.CandleInterval.Week1,
    types_1.CandleInterval.Month1,
];
exports.selectCandles = ({ amountAsset, priceAsset, timeStart, timeEnd, matcher, interval, }) => pg({ c: 'candles' })
    .select(FIELDS)
    .where('amount_asset_id', amountAsset)
    .where('price_asset_id', priceAsset)
    .where('time_start', '>=', timeStart.toISOString())
    .where('time_start', '<=', timeEnd.toISOString())
    .where('matcher_address', matcher)
    .where('interval', 
// should always be valid after validation
utils_1.highestDividerLessThan(interval, interval_1.unsafeIntervalsFromStrings(DIVIDERS)).matchWith({
    Ok: ({ value: i }) => i.source,
    Error: ({ value: error }) => types_1.CandleInterval.Minute1,
}));
exports.search = ({ amountAsset, priceAsset, timeStart, timeEnd, interval, matcher, }) => pg('candles')
    .select(FIELDS)
    .from({
    c: exports.selectCandles({
        amountAsset,
        priceAsset,
        timeStart,
        timeEnd,
        interval,
        matcher,
    }),
})
    .orderBy('c.time_start', 'asc')
    .toString();
exports.selectLastCandle = ({ amountAsset, priceAsset, timeEnd, matcher, interval, }) => pg({ c: 'candles' })
    .select(FIELDS)
    .where('amount_asset_id', amountAsset)
    .where('price_asset_id', priceAsset)
    .where('time_start', '<=', timeEnd.toISOString())
    .where('matcher_address', matcher)
    .where('txs_count', '>', 0)
    .where('interval', 
// should always be valid after validation
utils_1.highestDividerLessThan(interval, interval_1.unsafeIntervalsFromStrings(DIVIDERS)).matchWith({
    Ok: ({ value: i }) => i.source,
    Error: ({ value: error }) => types_1.CandleInterval.Minute1,
}));
exports.searchLast = ({ amountAsset, priceAsset, timeStart, timeEnd, interval, matcher, }) => pg('candles')
    .select(FIELDS)
    .from({
    c: exports.selectLastCandle({
        amountAsset,
        priceAsset,
        timeStart,
        timeEnd,
        interval,
        matcher,
    }),
})
    .orderBy('c.time_start', 'desc')
    .limit(1)
    .toString();
exports.sql = {
    search: exports.search,
    searchLast: exports.searchLast
};
module.exports = {
    sql: exports.sql,
};
//# sourceMappingURL=sql.js.map