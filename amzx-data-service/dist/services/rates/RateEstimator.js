"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const ramda_1 = require("ramda");
const data_entities_1 = require("@waves/data-entities");
const errorHandling_1 = require("../../errorHandling");
const collection_1 = require("../../utils/collection");
const tap_1 = require("../../utils/tap");
const maybeOps_1 = require("../../utils/fp/maybeOps");
const types_1 = require("../types");
const repo_1 = require("./repo");
const RateInfoLookup_1 = require("./repo/impl/RateInfoLookup");
class RateEstimator {
    constructor(baseAssetId, cache, remoteGet, pairs, pairAcceptanceVolumeThreshold, thresholdAssetRateService, assetsService) {
        this.baseAssetId = baseAssetId;
        this.cache = cache;
        this.remoteGet = remoteGet;
        this.pairs = pairs;
        this.pairAcceptanceVolumeThreshold = pairAcceptanceVolumeThreshold;
        this.thresholdAssetRateService = thresholdAssetRateService;
        this.assetsService = assetsService;
    }
    mget(request) {
        const { pairs, timestamp, matcher } = request;
        const shouldCache = maybeOps_1.isEmpty(timestamp);
        const getCacheKey = (pair) => ({
            pair,
            matcher,
        });
        const cacheUnlessCached = (item) => {
            const key = getCacheKey(item);
            if (!this.cache.has(key)) {
                this.cache.set(key, item);
            }
        };
        const cacheAllUnlessCached = (items) => items.forEach((it) => cacheUnlessCached(it));
        let ids = pairs.reduce((acc, cur) => {
            acc.push(cur.amountAsset, cur.priceAsset);
            return acc;
        }, new Array());
        ids.push(this.baseAssetId);
        return this.assetsService.mget({ ids }).chain((ms) => ramda_1.sequence(maybe_1.of, ms).matchWith({
            Nothing: () => task_1.rejected(errorHandling_1.AppError.Validation('Some of the assets of specified pairs do not exist in the blockchain', {
                ids: collection_1.collect((m, idx) => maybeOps_1.isEmpty(m) ? idx : undefined)(ms).map((idx) => ids[idx]),
            })),
            Just: ({ value: assets }) => {
                let baseAsset = assets.pop();
                let pairsWithAssets = ramda_1.splitEvery(2, assets).map(([amountAsset, priceAsset]) => ({
                    amountAsset,
                    priceAsset,
                }));
                let assetsMap = {};
                assetsMap[this.baseAssetId] = baseAsset;
                assets.forEach((asset) => {
                    assetsMap[asset.id] = asset;
                });
                const { preComputed, toBeRequested } = repo_1.partitionByPreComputed(this.cache, pairsWithAssets, getCacheKey, shouldCache, baseAsset);
                return this.remoteGet
                    .mget({
                    pairs: toBeRequested.map((pair) => ({
                        amountAsset: pair.amountAsset.id,
                        priceAsset: pair.priceAsset.id,
                    })),
                    matcher,
                    timestamp,
                })
                    .chain((pairsWithRates) => this.pairs
                    .mget({
                    pairs: pairsWithRates,
                    matcher: request.matcher,
                    // NB: affect volumeWaves, that is compared with threshold in RateInfoLookup
                    // should be float mutually with mPairAcceptanceVolumeThreshold, passed to RateInfoLookup
                    moneyFormat: types_1.MoneyFormat.Float,
                })
                    .map((foundPairs) => foundPairs.map((itm, idx) => itm
                    .map((pair) => ({
                    amountAsset: assetsMap[pair.amountAsset],
                    priceAsset: assetsMap[pair.priceAsset],
                    volumeWaves: pair.volumeWaves,
                    rate: pairsWithRates[idx].rate,
                }))
                    .getOrElse({
                    amountAsset: assetsMap[pairsWithRates[idx].amountAsset],
                    priceAsset: assetsMap[pairsWithRates[idx].priceAsset],
                    rate: pairsWithRates[idx].rate,
                    volumeWaves: new data_entities_1.BigNumber(0),
                }))))
                    .map(tap_1.tap((results) => {
                    if (shouldCache)
                        cacheAllUnlessCached(results);
                }))
                    .chain((data) => this.thresholdAssetRateService.get().map((mThresholdAssetRate) => new RateInfoLookup_1.default(data.concat(preComputed), mThresholdAssetRate.map((thresholdAssetRate) => new data_entities_1.BigNumber(this.pairAcceptanceVolumeThreshold).dividedBy(thresholdAssetRate)), baseAsset)))
                    .map((lookup) => pairsWithAssets.map((pair) => ({
                    req: pair,
                    res: lookup.get(Object.assign(Object.assign({}, pair), { moneyFormat: types_1.MoneyFormat.Long })),
                })))
                    .map(tap_1.tap((data) => {
                    data.forEach((reqAndRes) => reqAndRes.res.map(tap_1.tap((res) => {
                        if (shouldCache) {
                            cacheUnlessCached(res);
                        }
                    })));
                }))
                    .map((rs) => rs.map((reqAndRes) => (Object.assign(Object.assign({}, reqAndRes), { res: reqAndRes.res.map((res) => (Object.assign(Object.assign({}, res), { amountAsset: res.amountAsset.id, priceAsset: res.priceAsset.id }))) }))));
            },
        }));
    }
}
exports.default = RateEstimator;
//# sourceMappingURL=RateEstimator.js.map