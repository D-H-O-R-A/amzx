"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withDecimalsProcessing_1 = require("../_common/transformation/withDecimalsProcessing");
const types_1 = require("../types");
const modifyDecimals_1 = require("./modifyDecimals");
exports.default = (repo, validatePairs, assetsService) => ({
    search: (req) => validatePairs(req.matcher, [
        {
            amountAsset: req.amountAsset,
            priceAsset: req.priceAsset,
        },
    ]).chain(() => withDecimalsProcessing_1.searchWithDecimalsProcessing(modifyDecimals_1.modifyDecimals(assetsService, [req.amountAsset, req.priceAsset]), repo.search)(req).map((result) => (Object.assign(Object.assign({}, result), { 
        // weightedAveragePrice can be float after candles concatenation because of dividing
        // but for long moneyFormat it should be long
        items: req.moneyFormat === types_1.MoneyFormat.Long
            ? result.items.map((candle) => (Object.assign(Object.assign({}, candle), { weightedAveragePrice: candle.txsCount > 0
                    ? candle.weightedAveragePrice.decimalPlaces(0)
                    : // in fact it will be null
                        candle.weightedAveragePrice })))
            : result.items })))),
    searchLast: (req) => validatePairs(req.matcher, [
        {
            amountAsset: req.amountAsset,
            priceAsset: req.priceAsset,
        },
    ]).chain(() => withDecimalsProcessing_1.searchWithDecimalsProcessing(modifyDecimals_1.modifyDecimals(assetsService, [req.amountAsset, req.priceAsset]), repo.searchLast)(req).map((result) => (result && Array.isArray(result.items) && result.items[0] ? Object.assign(Object.assign({}, result.items[0]), { weightedAveragePrice: result.items[0].txsCount > 0 ?
            result.items[0].weightedAveragePrice.decimalPlaces(0) : result.items[0].weightedAveragePrice }) : null)))
});
//# sourceMappingURL=index.js.map