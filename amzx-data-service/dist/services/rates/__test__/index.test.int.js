"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_1 = require("folktale/concurrency/task");
const maybe_1 = require("folktale/maybe");
const data_entities_1 = require("@waves/data-entities");
// common
const db_1 = require("../../../db");
const loadConfig_1 = require("../../../loadConfig");
const eventBus_1 = require("../../../eventBus");
const types_1 = require("../../types");
const maybeOps_1 = require("../../../utils/fp/maybeOps");
const _common_1 = require("../../_common");
// assets
const cache_1 = require("../../assets/repo/cache");
const index_1 = require("../../assets/repo/index");
const assets_1 = require("../../assets");
// pairs
const cache_2 = require("../../pairs/repo/cache");
const repo_1 = require("../../pairs/repo");
const pairs_1 = require("../../pairs");
// rates
const __1 = require("..");
const ThresholdAssetRateService_1 = require("../ThresholdAssetRateService");
const RateCache_1 = require("../repo/impl/RateCache");
const RemoteRateRepo_1 = require("../repo/impl/RemoteRateRepo");
const options = loadConfig_1.loadConfig();
const pgDriver = db_1.createPgDriver(options);
const eventBus = eventBus_1.default();
const emitEvent = (name) => (o) => eventBus.emit(name, o);
const commonDeps = {
    drivers: {
        pg: pgDriver,
    },
    emitEvent,
};
const ratesCache = new RateCache_1.default(200000, 60000);
const pairsCache = cache_2.create(1000, 5000);
const assetsCache = cache_1.create(10000, 60000);
const assetsRepo = index_1.default(Object.assign(Object.assign({}, commonDeps), { cache: assetsCache }));
const assets = assets_1.default(assetsRepo);
const pairsRepo = repo_1.default(Object.assign(Object.assign({}, commonDeps), { cache: pairsCache }));
const pairsNoAsyncValidation = pairs_1.default(pairsRepo, () => task_1.of(undefined), assets);
const thresholdAssetRateService = new ThresholdAssetRateService_1.ThresholdAssetRateService(options.thresholdAssetId, options.matcher.defaultMatcherAddress, pairsNoAsyncValidation, emitEvent('log'));
const rateRepo = new RemoteRateRepo_1.default(commonDeps.drivers.pg);
const ratesService = __1.default({
    emitEvent: commonDeps.emitEvent,
    repo: rateRepo,
    cache: ratesCache,
    assets,
    pairs: pairsNoAsyncValidation,
    pairAcceptanceVolumeThreshold: options.pairAcceptanceVolumeThreshold,
    thresholdAssetRateService: thresholdAssetRateService,
    baseAssetId: options.rateBaseAssetId,
});
describe('Rates', () => {
    // Test case:
    // 1. Calculate thresholdWaves in Waves using thresholdAssetRateService and acceptance volume threshold
    // 2. Find pair P with volumeWaves greater or equal to thresholdWaves
    // 3. Get rate R1 for pair P via rateRepo
    // 4. Get rate R2 for pair P via ratesService
    // 5. Compare R1 with R2, it should be equal
    it('should return direct rate', () => __awaiter(void 0, void 0, void 0, function* () {
        yield thresholdAssetRateService
            .get()
            .chain((mRate) => {
            if (maybeOps_1.isEmpty(mRate)) {
                throw new Error('Cannot calculate threshold rate');
            }
            const rate = mRate.unsafeGet();
            // 1.
            const thresholdWaves = new data_entities_1.BigNumber(options.pairAcceptanceVolumeThreshold).dividedBy(rate);
            // 2.
            return pairsNoAsyncValidation
                .search({
                limit: 10,
                sort: _common_1.SortOrder.Descending,
                matcher: options.matcher.defaultMatcherAddress,
                moneyFormat: types_1.MoneyFormat.Float,
            })
                .map((pairs) => {
                return pairs.items
                    .filter((pair) => pair.priceAsset != options.rateBaseAssetId)
                    .find((pair) => {
                    if (pair.volumeWaves == null) {
                        return false;
                    }
                    return pair.volumeWaves.isGreaterThanOrEqualTo(thresholdWaves);
                });
            });
        })
            .chain((pair) => {
            if (typeof pair === 'undefined') {
                throw new Error('Pair with volume greater then threshold not found');
            }
            const t1 = rateRepo
                .mget({
                pairs: [pair],
                matcher: options.matcher.defaultMatcherAddress,
                timestamp: maybe_1.empty(),
            })
                .map((rates) => {
                if (rates.length === 0) {
                    throw new Error(`Rate for pair ${pair.amountAsset}/${pair.priceAsset} not found`);
                }
                return rates[0].rate;
            });
            const t2 = ratesService({
                pairs: [{ amountAsset: pair.amountAsset, priceAsset: pair.priceAsset }],
                matcher: options.matcher.defaultMatcherAddress,
                timestamp: maybe_1.empty(),
                moneyFormat: types_1.MoneyFormat.Long,
            }).map((rates) => {
                if (rates.length === 0) {
                    throw new Error(`Rate for pair ${pair.amountAsset}/${pair.priceAsset} not found`);
                }
                return rates[0].rate;
            });
            return t1.and(t2).map(([r1, r2]) => {
                expect(r1).toEqual(r2);
            });
        })
            .run()
            .promise();
    }));
    // Test case:
    // 1. Calculate thresholdWaves in Waves using thresholdAssetRateService and acceptance volume threshold
    // 2. Find pair P with volumeWaves less than thresholdWaves
    // 3. Get rate R1 for pair P via rateRepo
    // 4. Get rate R2 for pair P via ratesService
    // 5. Compare R1 with R2, it should not be equal
    it('should return rate derived via specified baseAsset', () => __awaiter(void 0, void 0, void 0, function* () {
        yield thresholdAssetRateService
            .get()
            .chain((mRate) => {
            if (maybeOps_1.isEmpty(mRate)) {
                throw new Error('Cannot calculate threshold rate');
            }
            const rate = mRate.unsafeGet();
            // 1.
            const thresholdWaves = new data_entities_1.BigNumber(options.pairAcceptanceVolumeThreshold).dividedBy(rate);
            // 2.
            return pairsNoAsyncValidation
                .search({
                limit: 10,
                sort: _common_1.SortOrder.Descending,
                matcher: options.matcher.defaultMatcherAddress,
                moneyFormat: types_1.MoneyFormat.Float,
            })
                .map((pairs) => {
                return pairs.items
                    .filter((pair) => pair.priceAsset != options.rateBaseAssetId)
                    .find((pair) => {
                    if (pair.volumeWaves == null) {
                        return false;
                    }
                    return pair.volumeWaves.isLessThan(thresholdWaves);
                });
            });
        })
            .chain((pair) => {
            if (typeof pair === 'undefined') {
                throw new Error('Pair with volume less then threshold not found');
            }
            // 3.
            const t1 = rateRepo
                .mget({
                pairs: [pair],
                matcher: options.matcher.defaultMatcherAddress,
                timestamp: maybe_1.empty(),
            })
                .map((rates) => {
                if (rates.length === 0) {
                    throw new Error(`Rate for pair ${pair.amountAsset}/${pair.priceAsset} not found`);
                }
                return rates[0].rate;
            });
            // 4.
            const t2 = ratesService({
                pairs: [pair],
                matcher: options.matcher.defaultMatcherAddress,
                timestamp: maybe_1.empty(),
                moneyFormat: types_1.MoneyFormat.Long,
            }).map((rates) => {
                if (rates.length === 0) {
                    throw new Error(`Rate for pair ${pair.amountAsset}/${pair.priceAsset} not found`);
                }
                return rates[0].rate;
            });
            return t1.and(t2).map(([r1, r2]) => {
                expect(r1).not.toEqual(r2);
            });
        })
            .run()
            .promise();
    }));
});
//# sourceMappingURL=index.test.int.js.map