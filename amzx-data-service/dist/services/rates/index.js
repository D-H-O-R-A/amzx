"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_entities_1 = require("@waves/data-entities");
const RateEstimator_1 = require("./RateEstimator");
const types_1 = require("../types");
const task_1 = require("folktale/concurrency/task");
var RateCache_1 = require("./repo/impl/RateCache");
exports.RateCacheImpl = RateCache_1.default;
function default_1({ repo, cache, assets, pairs, baseAssetId, pairAcceptanceVolumeThreshold, thresholdAssetRateService, }) {
    const estimator = new RateEstimator_1.default(baseAssetId, cache, repo, pairs, pairAcceptanceVolumeThreshold, thresholdAssetRateService, assets);
    return (request) => estimator
        .mget(request)
        .map((data) => data.map((item) => ({
        rate: item.res.fold(() => new data_entities_1.BigNumber(0), (it) => it.rate),
        amountAsset: item.req.amountAsset.id,
        priceAsset: item.req.priceAsset.id,
    })))
        .chain((items) => request.moneyFormat === types_1.MoneyFormat.Long
        ? task_1.of(items.map((r) => (Object.assign(Object.assign({}, r), { rate: r.rate.decimalPlaces(0) }))))
        : assets
            .precisions({
            ids: items.reduce((acc, item) => acc.concat([item.amountAsset, item.priceAsset]), []),
        })
            .map((precisions) => items.map((item, idx) => (Object.assign(Object.assign({}, item), { rate: item.rate.shiftedBy(-8 - precisions[idx * 2 + 1] + precisions[idx * 2]) })))));
}
exports.default = default_1;
//# sourceMappingURL=index.js.map