"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
exports.modifyDecimals = (assetsService, ids) => (candles) => assetsService
    .precisions({
    ids,
})
    .chain(([amountAssetPrecision, priceAssetPrecision]) => {
    let decimals = -8 - priceAssetPrecision + amountAssetPrecision;
    return task_1.of(candles.map((candle) => candle.txsCount === 0
        ? candle
        : Object.assign(Object.assign({}, candle), { low: candle.low.shiftedBy(decimals).decimalPlaces(-decimals), high: candle.high.shiftedBy(decimals).decimalPlaces(-decimals), open: candle.open === null
                ? null
                : candle.open.shiftedBy(decimals).decimalPlaces(-decimals), close: candle.close === null
                ? null
                : candle.close.shiftedBy(decimals).decimalPlaces(-decimals), volume: candle.volume
                .shiftedBy(-amountAssetPrecision)
                .decimalPlaces(amountAssetPrecision), quoteVolume: candle.quoteVolume
                .shiftedBy(-amountAssetPrecision + decimals)
                .decimalPlaces(priceAssetPrecision), weightedAveragePrice: candle.weightedAveragePrice
                .shiftedBy(decimals)
                .decimalPlaces(-decimals) })));
});
//# sourceMappingURL=modifyDecimals.js.map